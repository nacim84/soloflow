package com.rnblock.gateway.repository;

import com.rnblock.gateway.model.TestWallet;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface TestWalletRepository extends JpaRepository<TestWallet, String> {

    Optional<TestWallet> findByUserId(String userId);

    /**
     * Atomically decrement test wallet balance if positive.
     * Returns number of rows affected (1 if successful, 0 if insufficient balance).
     */
    @Modifying
    @Query("UPDATE TestWallet tw SET tw.balance = tw.balance - 1 " +
           "WHERE tw.userId = :userId AND tw.balance > 0")
    int decrementBalanceIfPositive(@Param("userId") String userId);
}
