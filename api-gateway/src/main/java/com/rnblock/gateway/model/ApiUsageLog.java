package com.rnblock.gateway.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.LocalDateTime;
import java.util.Map;

/**
 * Entity for tracking API usage logs.
 */
@Entity
@Table(name = "api_usage_logs")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ApiUsageLog {

    @Id
    @Column(name = "id", nullable = false)
    private String id; // UUID

    @Column(name = "apiKeyId", nullable = false)
    private String apiKeyId;

    @Column(name = "orgId", nullable = false)
    private String orgId;

    @Column(name = "serviceId", nullable = false)
    private String serviceId;

    @Column(name = "endpoint")
    private String endpoint;

    @Column(name = "method")
    private String method;

    @Column(name = "statusCode")
    private Integer statusCode;

    @Column(name = "responseTime")
    private Integer responseTime;

    @Column(name = "creditsUsed", nullable = false)
    private Integer creditsUsed = 1;

    @Column(name = "details", columnDefinition = "jsonb")
    @JdbcTypeCode(SqlTypes.JSON)
    private Map<String, Object> details;

    @Column(name = "ipAddress")
    private String ipAddress;

    @Column(name = "country")
    private String country;

    @Column(name = "userAgent")
    private String userAgent;

    @Column(name = "timestamp", nullable = false, updatable = false)
    @CreationTimestamp
    private LocalDateTime timestamp;
}
