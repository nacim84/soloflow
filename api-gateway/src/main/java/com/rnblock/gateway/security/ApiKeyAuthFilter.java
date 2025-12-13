package com.rnblock.gateway.security;

import com.rnblock.gateway.exception.InvalidApiKeyException;
import com.rnblock.gateway.service.ApiKeyValidationService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

/**
 * Security filter that validates API key before routing to backend services.
 * Extracts key from Authorization Bearer or X-API-Key header.
 * Calls validation service - exceptions are handled by GlobalExceptionHandler.
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class ApiKeyAuthFilter extends OncePerRequestFilter {

    private final ApiKeyValidationService validationService;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {
        String apiKey = extractApiKey(request);
        if (apiKey == null) {
            throw new InvalidApiKeyException("API key header is missing or invalid");
        }

        try {
            validationService.validateApiKey(apiKey);
            log.debug("API key validated for path: {}", request.getRequestURI());
        } catch (Exception e) {
            log.warn("API key validation failed for path {}: {}", request.getRequestURI(), e.getMessage());
            throw e; // Let GlobalExceptionHandler handle
        }

        filterChain.doFilter(request, response);
    }

    private String extractApiKey(HttpServletRequest request) {
        // Prefer Authorization Bearer
        String authHeader = request.getHeader("Authorization");
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            return authHeader.substring(7).trim();
        }

        // Fallback to X-API-Key
        String xApiKey = request.getHeader("X-API-Key");
        if (xApiKey != null) {
            return xApiKey.trim();
        }

        return null;
    }

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        String path = request.getRequestURI();
        // Only apply to /api/** paths
        return !path.startsWith("/api/");
    }
}