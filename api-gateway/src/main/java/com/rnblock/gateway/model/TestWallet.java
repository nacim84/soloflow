package com.rnblock.gateway.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

/**
 * TestWallet entity representing the test_wallets table in PostgreSQL.
 * Stores test credit balance linked to a user (not org).
 * Provides 100 free credits per month for testing with sk_test_* keys.
 */
@Entity
@Table(name = "test_wallets")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TestWallet {

    @Id
    @Column(name = "id", nullable = false)
    private String id; // UUID as Text

    /**
     * User ID (UUID as Text) - owner of test credits
     */
    @Column(name = "userId", nullable = false, unique = true)
    private String userId;

    /**
     * Current test credit balance (default: 100)
     */
    @Column(name = "balance", nullable = false)
    private Integer balance = 100;

    /**
     * Next reset timestamp (monthly reset)
     */
    @Column(name = "resetAt", nullable = false)
    private LocalDateTime resetAt;

    @Column(name = "createdAt", nullable = false, updatable = false)
    @CreationTimestamp
    private LocalDateTime createdAt;
}
