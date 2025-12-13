package com.rnblock.gateway.service;

import com.rnblock.gateway.exception.InsufficientCreditsException;
import com.rnblock.gateway.exception.InvalidApiKeyException;
import com.rnblock.gateway.exception.RateLimitExceededException;
import com.rnblock.gateway.model.ApiKey;
import com.rnblock.gateway.model.Wallet;
import com.rnblock.gateway.repository.ApiKeyRepository;
import com.rnblock.gateway.repository.WalletRepository;
import io.github.bucket4j.Bandwidth;
import io.github.bucket4j.Bucket;
import io.github.bucket4j.Refill;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cache.Cache;
import org.springframework.cache.CacheManager;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.Duration;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Service for API key validation, credit management (via Wallet), and rate limiting.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class ApiKeyValidationService {

    private final ApiKeyRepository apiKeyRepository;
    private final WalletRepository walletRepository;
    private final CacheManager cacheManager;
    private final Map<String, Bucket> rateLimitBuckets = new ConcurrentHashMap<>();

    @Value("${api.key.pepper}")
    private String apiKeyPepper;

    // Default rate limit since column is deprecated/managed elsewhere
    private static final int DEFAULT_RATE_LIMIT = 10;

    /**
     * Validates API key, checks rate limit, deducts credits from Wallet atomically.
     */
    @Transactional
    public ApiKeyDetails validateApiKey(String plainApiKey) {
        if (plainApiKey == null || plainApiKey.trim().isEmpty()) {
            throw new InvalidApiKeyException("API key is missing");
        }
        
        if (apiKeyPepper == null || apiKeyPepper.isEmpty()) {
            log.error("API_KEY_PEPPER is not configured!");
            throw new RuntimeException("Server configuration error: Pepper missing");
        }

        String plainKey = plainApiKey.trim();
        // SHA-256(key + pepper)
        String keyHash = hashApiKey(plainKey + apiKeyPepper);

        Cache cache = cacheManager.getCache("api-keys");
        // Cache lookup or DB
        ApiKey apiKey = cache.get(keyHash, () ->
            apiKeyRepository.findByKeyHash(keyHash).orElse(null));

        if (apiKey == null || !apiKey.getIsActive()) {
            log.warn("Invalid or inactive API key attempted: {}", keyHash);
            throw new InvalidApiKeyException("API key is invalid or inactive");
        }

        // Rate limiting with Bucket4j (using Key Hash as identifier)
        Bucket bucket = rateLimitBuckets.computeIfAbsent(keyHash, k -> Bucket.builder()
                .addLimit(Bandwidth.classic(DEFAULT_RATE_LIMIT,
                    Refill.intervally(DEFAULT_RATE_LIMIT, Duration.ofSeconds(1))))
                .build());

        if (!bucket.tryConsume(1)) {
            log.warn("Rate limit exceeded for key: {}", keyHash);
            throw new RateLimitExceededException("Rate limit exceeded");
        }

        // Atomic credit deduction on Wallet
        int rowsUpdated = walletRepository.decrementBalanceIfPositive(apiKey.getOrgId());
        if (rowsUpdated == 0) {
            log.warn("Insufficient credits for org: {}", apiKey.getOrgId());
            throw new InsufficientCreditsException("Insufficient credits");
        }

        // Get current balance for details (optional, requires extra query or just return -1 if lazy)
        // For performance, we might skip fetching the exact balance if not strictly needed by downstream
        // But let's fetch it to be nice.
        Wallet wallet = walletRepository.findByOrgId(apiKey.getOrgId())
                .orElseThrow(() -> new RuntimeException("Wallet not found for org: " + apiKey.getOrgId()));

        log.debug("API key validated successfully: {}, org: {}, credits: {}", keyHash, apiKey.getOrgId(), wallet.getBalance());

        return new ApiKeyDetails(keyHash, apiKey.getOrgId(), wallet.getBalance());
    }

    private String hashApiKey(String input) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hashBytes = digest.digest(input.getBytes(StandardCharsets.UTF_8));
            StringBuilder hexString = new StringBuilder();
            for (byte b : hashBytes) {
                String hex = Integer.toHexString(0xff & b);
                if (hex.length() == 1) {
                    hexString.append('0');
                }
                hexString.append(hex);
            }
            return hexString.toString();
        } catch (NoSuchAlgorithmException e) {
            throw new RuntimeException("SHA-256 algorithm not available", e);
        }
    }

    /**
     * Details returned after successful validation.
     */
    public record ApiKeyDetails(String keyHash, String orgId, int remainingCredits) {}
}
