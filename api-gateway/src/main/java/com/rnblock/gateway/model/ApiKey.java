package com.rnblock.gateway.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

/**
 * API Key entity representing the api_keys table in PostgreSQL.
 * Stores hashed API keys. Credits are now in Wallet.
 */
@Entity
@Table(name = "api_keys")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ApiKey {

    @Id
    @Column(name = "id", nullable = false)
    private String id; // UUID as Text

    /**
     * SHA-256 + Pepper hash of the API key
     */
    @Column(name = "keyHash", unique = true, nullable = false)
    private String keyHash;

    /**
     * Organization ID (Link to Wallet)
     */
    @Column(name = "orgId", nullable = false)
    private String orgId;

    /**
     * Activation status
     */
    @Column(name = "isActive", nullable = false)
    private Boolean isActive = true;

    // Rate limit is managed via default or future 'quotas' columns. 
    // Removed legacy rate_limit column mapping to avoid errors if dropped.
    
    @Column(name = "createdAt", nullable = false, updatable = false)
    @CreationTimestamp
    private LocalDateTime createdAt;

    @Column(name = "updatedAt", nullable = false)
    @UpdateTimestamp
    private LocalDateTime updatedAt;
}