package com.rnblock.gateway.exception;

import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.Map;

/**
 * Global exception handler for API gateway errors.
 * Returns consistent JSON error responses with appropriate HTTP status codes.
 */
@RestControllerAdvice
@Slf4j
public class GlobalExceptionHandler {

    @ExceptionHandler(InvalidApiKeyException.class)
    public ResponseEntity<Map<String, String>> handleInvalidApiKey(InvalidApiKeyException e) {
        log.warn("Invalid API key: {}", e.getMessage());
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(Map.of(
                    "error", "Unauthorized",
                    "message", e.getMessage(),
                    "timestamp", java.time.Instant.now().toString()
                ));
    }

    @ExceptionHandler(InsufficientCreditsException.class)
    public ResponseEntity<Map<String, String>> handleInsufficientCredits(InsufficientCreditsException e) {
        log.warn("Insufficient credits: {}", e.getMessage());
        return ResponseEntity.status(HttpStatus.PAYMENT_REQUIRED)
                .body(Map.of(
                    "error", "Payment Required",
                    "message", e.getMessage(),
                    "timestamp", java.time.Instant.now().toString()
                ));
    }

    @ExceptionHandler(RateLimitExceededException.class)
    public ResponseEntity<Map<String, String>> handleRateLimitExceeded(RateLimitExceededException e) {
        log.warn("Rate limit exceeded: {}", e.getMessage());
        return ResponseEntity.status(HttpStatus.TOO_MANY_REQUESTS)
                .body(Map.of(
                    "error", "Too Many Requests",
                    "message", e.getMessage(),
                    "retryAfter", "1",
                    "timestamp", java.time.Instant.now().toString()
                ));
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, String>> handleGenericException(Exception e) {
        log.error("Unexpected error in gateway", e);
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of(
                    "error", "Internal Server Error",
                    "message", "An unexpected error occurred. Please try again later.",
                    "timestamp", java.time.Instant.now().toString()
                ));
    }
}