package com.rnblock.gateway.service;

import com.rnblock.gateway.exception.InsufficientCreditsException;
import com.rnblock.gateway.exception.InvalidApiKeyException;
import com.rnblock.gateway.exception.RateLimitExceededException;
import com.rnblock.gateway.model.ApiKey;
import com.rnblock.gateway.model.TestWallet;
import com.rnblock.gateway.model.Wallet;
import com.rnblock.gateway.repository.ApiKeyRepository;
import com.rnblock.gateway.repository.TestWalletRepository;
import com.rnblock.gateway.repository.WalletRepository;
import io.github.bucket4j.Bandwidth;
import io.github.bucket4j.BucketConfiguration;
import io.github.bucket4j.Refill;
import io.github.bucket4j.distributed.BucketProxy;
import io.github.bucket4j.redis.lettuce.cas.LettuceBasedProxyManager;
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
import java.util.function.Supplier;

/**
 * Service for API key validation, credit management (via Wallet), and rate limiting.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class ApiKeyValidationService {

    private final ApiKeyRepository apiKeyRepository;
    private final WalletRepository walletRepository;
    private final TestWalletRepository testWalletRepository;
    private final CacheManager cacheManager;
    private final LettuceBasedProxyManager<String> rateLimitProxyManager;

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

        // Distributed rate limiting with Bucket4j + Redis
        String bucketKey = "rate-limit:" + keyHash;
        Supplier<BucketConfiguration> configSupplier = () -> BucketConfiguration.builder()
                .addLimit(Bandwidth.classic(DEFAULT_RATE_LIMIT,
                        Refill.intervally(DEFAULT_RATE_LIMIT, Duration.ofSeconds(1))))
                .build();

        BucketProxy bucket = rateLimitProxyManager.builder()
                .build(bucketKey, configSupplier);

        if (!bucket.tryConsume(1)) {
            log.warn("Rate limit exceeded for key: {}", keyHash);
            throw new RateLimitExceededException("Rate limit exceeded");
        }

        // Atomic credit deduction based on environment (test vs production)
        int remainingCredits;
        boolean isTestEnvironment = "test".equalsIgnoreCase(apiKey.getEnvironment());

        if (isTestEnvironment) {
            // Test environment: use test_wallets (linked to userId/createdBy)
            String userId = apiKey.getCreatedBy();
            if (userId == null) {
                log.error("Test API key has no createdBy userId: {}", keyHash);
                throw new InvalidApiKeyException("Test API key configuration error");
            }

            int rowsUpdated = testWalletRepository.decrementBalanceIfPositive(userId);
            if (rowsUpdated == 0) {
                log.warn("Insufficient test credits for user: {}", userId);
                throw new InsufficientCreditsException("Insufficient test credits");
            }

            TestWallet testWallet = testWalletRepository.findByUserId(userId)
                    .orElseThrow(() -> new RuntimeException("Test wallet not found for user: " + userId));

            remainingCredits = testWallet.getBalance();
            log.debug("Test API key validated: {}, user: {}, credits: {}", keyHash, userId, remainingCredits);
        } else {
            // Production environment: use wallets (linked to orgId)
            int rowsUpdated = walletRepository.decrementBalanceIfPositive(apiKey.getOrgId());
            if (rowsUpdated == 0) {
                log.warn("Insufficient credits for org: {}", apiKey.getOrgId());
                throw new InsufficientCreditsException("Insufficient credits");
            }

            Wallet wallet = walletRepository.findByOrgId(apiKey.getOrgId())
                    .orElseThrow(() -> new RuntimeException("Wallet not found for org: " + apiKey.getOrgId()));

            remainingCredits = wallet.getBalance();
            log.debug("API key validated successfully: {}, org: {}, credits: {}", keyHash, apiKey.getOrgId(), remainingCredits);
        }

        return new ApiKeyDetails(apiKey.getId(), keyHash, apiKey.getOrgId(), remainingCredits);
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
    public record ApiKeyDetails(String apiKeyId, String keyHash, String orgId, int remainingCredits) {}
}
