package com.rnblock.gateway.repository;

import com.rnblock.gateway.model.ServiceDefinition;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ServiceDefinitionRepository extends JpaRepository<ServiceDefinition, String> {
    Optional<ServiceDefinition> findByName(String name);
}
