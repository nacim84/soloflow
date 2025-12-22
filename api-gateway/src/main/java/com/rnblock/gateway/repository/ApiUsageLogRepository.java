package com.rnblock.gateway.repository;

import com.rnblock.gateway.model.ApiUsageLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ApiUsageLogRepository extends JpaRepository<ApiUsageLog, String> {
}
