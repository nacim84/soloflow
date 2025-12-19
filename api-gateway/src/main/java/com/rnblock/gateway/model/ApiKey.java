package com.rnblock.gateway.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.LocalDateTime;
import java.util.List;

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
    @Column(name = "orgId")
    private String orgId;

    /**
     * User who created this API key
     */
    @Column(name = "createdBy")
    private String createdBy;

    /**
     * Human-readable name for the API key
     */
    @Column(name = "keyName", nullable = false)
    private String keyName;

    /**
     * Key prefix (sk_live_ or sk_test_)
     */
    @Column(name = "keyPrefix", nullable = false)
    private String keyPrefix;

    /**
     * Last 4 characters of the key for display (e.g., "...x7Qa")
     */
    @Column(name = "keyHint")
    private String keyHint;

    /**
     * API scopes/permissions (stored as JSONB array)
     */
    @Column(name = "scopes", columnDefinition = "jsonb")
    @JdbcTypeCode(SqlTypes.JSON)
    private List<String> scopes;

    /**
     * Environment (production or test)
     */
    @Column(name = "environment", nullable = false)
    private String environment;

    /**
     * Daily request quota (optional)
     */
    @Column(name = "dailyQuota")
    private Integer dailyQuota;

    /**
     * Monthly request quota (optional)
     */
    @Column(name = "monthlyQuota")
    private Integer monthlyQuota;

    /**
     * Daily usage counter
     */
    @Column(name = "dailyUsed")
    private Integer dailyUsed = 0;

    /**
     * Monthly usage counter
     */
    @Column(name = "monthlyUsed")
    private Integer monthlyUsed = 0;

    /**
     * Activation status
     */
    @Column(name = "isActive", nullable = false)
    private Boolean isActive = true;

    /**
     * Timestamp when key was revoked
     */
    @Column(name = "revokedAt")
    private LocalDateTime revokedAt;

    /**
     * Reason for revocation
     */
    @Column(name = "revokedReason")
    private String revokedReason;

    /**
     * Last time this key was used
     */
    @Column(name = "lastUsedAt")
    private LocalDateTime lastUsedAt;

    /**
     * Last IP address that used this key
     */
    @Column(name = "lastUsedIp")
    private String lastUsedIp;

    /**
     * Expiration timestamp (optional)
     */
    @Column(name = "expiresAt")
    private LocalDateTime expiresAt;

    @Column(name = "createdAt", nullable = false, updatable = false)
    @CreationTimestamp
    private LocalDateTime createdAt;

    @Column(name = "updatedAt", nullable = false)
    @UpdateTimestamp
    private LocalDateTime updatedAt;
}