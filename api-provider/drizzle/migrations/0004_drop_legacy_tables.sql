-- Migration: Drop legacy tables supported_services and user_credits
-- Description: Clean up old tables no longer used after the multi-org and hash-based API key refactoring.
-- Date: 2025-12-10

DROP TABLE IF EXISTS "supported_services" CASCADE;
DROP TABLE IF EXISTS "user_credits" CASCADE;
