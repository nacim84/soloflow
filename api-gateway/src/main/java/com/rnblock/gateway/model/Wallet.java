package com.rnblock.gateway.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

/**
 * Wallet entity representing the wallets table in PostgreSQL.
 * Stores credit balance linked to an organization.
 */
@Entity
@Table(name = "wallets")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Wallet {

    @Id
    @Column(name = "id", nullable = false)
    private String id; // UUID as Text

    /**
     * Organization ID (UUID as Text)
     */
    @Column(name = "orgId", nullable = false, unique = true)
    private String orgId;

    /**
     * Current credit balance
     */
    @Column(name = "balance", nullable = false)
    private Integer balance = 0;

    /**
     * Total credits purchased (lifetime)
     */
    @Column(name = "totalPurchased", nullable = false)
    private Integer totalPurchased = 0;

    /**
     * Total credits used (lifetime)
     */
    @Column(name = "totalUsed", nullable = false)
    private Integer totalUsed = 0;

    /**
     * Currency code (e.g., EUR, USD)
     */
    @Column(name = "currency", nullable = false)
    private String currency = "EUR";

    @Column(name = "createdAt", nullable = false, updatable = false)
    @CreationTimestamp
    private LocalDateTime createdAt;

    @Column(name = "updatedAt", nullable = false)
    @UpdateTimestamp
    private LocalDateTime updatedAt;
}