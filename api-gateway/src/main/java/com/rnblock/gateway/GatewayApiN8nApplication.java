package com.rnblock.gateway;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.annotation.EnableScheduling;

/**
 * Main application class for the API Gateway
 * 
 * This class serves as the entry point for the Spring Boot application.
 * It enables caching, async processing, and scheduling capabilities.
 * 
 * @author RNBlock
 * @version 0.0.1
 * @since 2025-11-13
 */
@SpringBootApplication
@EnableCaching
@EnableAsync
@EnableScheduling
public class GatewayApiN8nApplication {

    /**
     * Main method to start the Spring Boot application
     * 
     * @param args Command line arguments
     */
    public static void main(String[] args) {
        SpringApplication.run(GatewayApiN8nApplication.class, args);
    }
}
