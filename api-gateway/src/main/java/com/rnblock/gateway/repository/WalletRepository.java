package com.rnblock.gateway.repository;

import com.rnblock.gateway.model.Wallet;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface WalletRepository extends JpaRepository<Wallet, String> {

    Optional<Wallet> findByOrgId(String orgId);

    /**
     * Atomically decrement wallet balance if positive and increment totalUsed.
     * Returns number of rows affected (1 if successful, 0 if insufficient balance).
     */
    @Modifying
    @Query("UPDATE Wallet w SET w.balance = w.balance - 1, w.totalUsed = w.totalUsed + 1, w.updatedAt = CURRENT_TIMESTAMP " +
           "WHERE w.orgId = :orgId AND w.balance > 0")
    int decrementBalanceIfPositive(@Param("orgId") String orgId);
}
