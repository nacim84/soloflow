package com.rnblock.gateway.repository;

import com.rnblock.gateway.model.ApiKey;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/**
 * Repository for API Key lookup.
 * Credit management is now handled by WalletRepository.
 */
@Repository
public interface ApiKeyRepository extends JpaRepository<ApiKey, String> {

    /**
     * Find API key by its hash (SHA-256 + Pepper).
     */
    Optional<ApiKey> findByKeyHash(String keyHash);
}
