package com.rnblock.gateway.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

/**
 * Service entity representing the services table in PostgreSQL.
 */
@Entity
@Table(name = "services")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ServiceDefinition {

    @Id
    @Column(name = "id", nullable = false)
    private String id; // UUID

    @Column(name = "name", nullable = false, unique = true)
    private String name;

    @Column(name = "displayName", nullable = false)
    private String displayName;

    @Column(name = "description")
    private String description;

    @Column(name = "baseCostPerCall", nullable = false)
    private Integer baseCostPerCall = 1;

    @Column(name = "icon")
    private String icon;

    @Column(name = "category", nullable = false)
    private String category = "general";

    @Column(name = "isActive", nullable = false)
    private Boolean isActive = true;

    @Column(name = "createdAt", nullable = false, updatable = false)
    @CreationTimestamp
    private LocalDateTime createdAt;
}
