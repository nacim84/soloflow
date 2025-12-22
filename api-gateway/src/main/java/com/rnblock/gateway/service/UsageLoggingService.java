package com.rnblock.gateway.service;

import com.rnblock.gateway.model.ApiUsageLog;
import com.rnblock.gateway.model.ServiceDefinition;
import com.rnblock.gateway.repository.ApiUsageLogRepository;
import com.rnblock.gateway.repository.ServiceDefinitionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

@Service
@RequiredArgsConstructor
@Slf4j
public class UsageLoggingService {

    private final ApiUsageLogRepository apiUsageLogRepository;
    private final ServiceDefinitionRepository serviceDefinitionRepository;
    
    // Cache service IDs by name to avoid DB lookups on every request
    private final Map<String, String> serviceIdCache = new ConcurrentHashMap<>();

    @Async
    public void logRequest(String apiKeyId, String orgId, String path, String method, 
                           int statusCode, long responseTime, int creditsUsed, 
                           String ipAddress, String userAgent) {
        try {
            String serviceName = determineServiceName(path);
            String serviceId = getServiceId(serviceName);
            
            if (serviceId == null) {
                log.warn("Could not determine service ID for name: {}", serviceName);
                // Fallback to a default or skip? 
                // We'll try to find a 'general' service or just log the error.
                // For now, let's assume we can't log if service is missing (FK constraint).
                return;
            }

            ApiUsageLog usageLog = ApiUsageLog.builder()
                    .id(UUID.randomUUID().toString())
                    .apiKeyId(apiKeyId)
                    .orgId(orgId)
                    .serviceId(serviceId)
                    .endpoint(path)
                    .method(method)
                    .statusCode(statusCode)
                    .responseTime((int) responseTime)
                    .creditsUsed(creditsUsed)
                    .ipAddress(ipAddress)
                    .userAgent(userAgent)
                    // .country() - could be resolved from IP later
                    .build();

            apiUsageLogRepository.save(usageLog);
            log.debug("Logged usage for key {} on service {}", apiKeyId, serviceName);

        } catch (Exception e) {
            log.error("Failed to log API usage", e);
        }
    }

    private String getServiceId(String serviceName) {
        return serviceIdCache.computeIfAbsent(serviceName, name -> {
            return serviceDefinitionRepository.findByName(name)
                    .map(ServiceDefinition::getId)
                    .orElseGet(() -> {
                        // Try to find by 'general' or similar if specific service not found?
                        // For now, return null if not found
                        log.warn("Service not found in DB: {}", name);
                        return null;
                    });
        });
    }

    private String determineServiceName(String path) {
        if (path == null) return "unknown";
        
        // Simple mapping based on known routes
        if (path.startsWith("/api/v1/pdf")) return "api-pdf";
        if (path.startsWith("/api/v1/template")) return "api-template";
        if (path.startsWith("/api/v1/docling")) return "api-docling";
        
        // Fallback: extract second segment /api/v1/SERVICE_NAME/...
        String[] parts = path.split("/");
        if (parts.length > 3 && "api".equals(parts[1]) && "v1".equals(parts[2])) {
            return parts[3];
        }
        
        return "general";
    }
}
