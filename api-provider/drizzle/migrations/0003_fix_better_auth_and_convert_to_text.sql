-- Migration: Fix Better Auth schema and convert all UUIDs to TEXT
-- This migration addresses the Better Auth error and type consistency issues

-- Step 1: Drop all foreign key constraints that reference uuid columns
ALTER TABLE "api_usage_logs" DROP CONSTRAINT IF EXISTS "api_usage_logs_apiKeyId_api_keys_id_fk";
ALTER TABLE "api_usage_logs" DROP CONSTRAINT IF EXISTS "api_usage_logs_userId_user_id_fk";
ALTER TABLE "api_usage_logs" DROP CONSTRAINT IF EXISTS "api_usage_logs_serviceId_supported_services_id_fk";
ALTER TABLE "api_usage_logs" DROP CONSTRAINT IF EXISTS "api_usage_logs_orgId_organisations_id_fk";
ALTER TABLE "api_keys" DROP CONSTRAINT IF EXISTS "api_keys_userId_user_id_fk";
ALTER TABLE "api_keys" DROP CONSTRAINT IF EXISTS "api_keys_serviceId_supported_services_id_fk";
ALTER TABLE "api_keys" DROP CONSTRAINT IF EXISTS "api_keys_orgId_organisations_id_fk";
ALTER TABLE "api_keys" DROP CONSTRAINT IF EXISTS "api_keys_createdBy_user_id_fk";
ALTER TABLE "session" DROP CONSTRAINT IF EXISTS "session_userId_user_id_fk";
ALTER TABLE "account" DROP CONSTRAINT IF EXISTS "account_userId_user_id_fk";
ALTER TABLE "premium_users" DROP CONSTRAINT IF EXISTS "premium_users_userId_user_id_fk";
ALTER TABLE "auth_log" DROP CONSTRAINT IF EXISTS "auth_log_userId_user_id_fk";
ALTER TABLE "organisation_members" DROP CONSTRAINT IF EXISTS "organisation_members_orgId_organisations_id_fk";
ALTER TABLE "organisation_members" DROP CONSTRAINT IF EXISTS "organisation_members_userId_user_id_fk";
ALTER TABLE "organisations" DROP CONSTRAINT IF EXISTS "organisations_ownerId_user_id_fk";
ALTER TABLE "wallets" DROP CONSTRAINT IF EXISTS "wallets_orgId_organisations_id_fk";
ALTER TABLE "test_wallets" DROP CONSTRAINT IF EXISTS "test_wallets_userId_user_id_fk";
ALTER TABLE "daily_stats" DROP CONSTRAINT IF EXISTS "daily_stats_orgId_organisations_id_fk";
ALTER TABLE "user_credits" DROP CONSTRAINT IF EXISTS "user_credits_userId_user_id_fk";

-- Step 2: Drop backup table if exists
DROP TABLE IF EXISTS "api_keys_backup" CASCADE;

-- Step 3: Drop unused indexes
DROP INDEX IF EXISTS "idx_usage_apiKeyId";

-- Step 4: Convert all ID columns from UUID to TEXT
-- Users table (primary key)
ALTER TABLE "user" ALTER COLUMN "id" TYPE text USING "id"::text;

-- Tables with foreign keys to user
ALTER TABLE "session" ALTER COLUMN "userId" TYPE text USING "userId"::text;
ALTER TABLE "account" ALTER COLUMN "userId" TYPE text USING "userId"::text;
ALTER TABLE "premium_users" ALTER COLUMN "userId" TYPE text USING "userId"::text;
ALTER TABLE "auth_log" ALTER COLUMN "userId" TYPE text USING "userId"::text;
ALTER TABLE "organisation_members" ALTER COLUMN "userId" TYPE text USING "userId"::text;
ALTER TABLE "test_wallets" ALTER COLUMN "userId" TYPE text USING "userId"::text;
ALTER TABLE "user_credits" ALTER COLUMN "userId" TYPE text USING "userId"::text;

-- Organisations table
ALTER TABLE "organisations" ALTER COLUMN "id" TYPE text USING "id"::text;
ALTER TABLE "organisations" ALTER COLUMN "ownerId" TYPE text USING "ownerId"::text;
ALTER TABLE "organisation_members" ALTER COLUMN "orgId" TYPE text USING "orgId"::text;
ALTER TABLE "wallets" ALTER COLUMN "orgId" TYPE text USING "orgId"::text;
ALTER TABLE "daily_stats" ALTER COLUMN "orgId" TYPE text USING "orgId"::text;

-- API Keys table
ALTER TABLE "api_keys" ALTER COLUMN "id" TYPE text USING "id"::text;
ALTER TABLE "api_keys" ALTER COLUMN "orgId" TYPE text USING COALESCE("orgId"::text, NULL);
ALTER TABLE "api_keys" ALTER COLUMN "createdBy" TYPE text USING COALESCE("createdBy"::text, NULL);

-- Services table
ALTER TABLE "supported_services" ALTER COLUMN "id" TYPE text USING "id"::text;
ALTER TABLE "services" ALTER COLUMN "id" TYPE text USING "id"::text;

-- API Usage Logs
ALTER TABLE "api_usage_logs" ALTER COLUMN "id" TYPE text USING "id"::text;
ALTER TABLE "api_usage_logs" ALTER COLUMN "apiKeyId" TYPE text USING "apiKeyId"::text;
ALTER TABLE "api_usage_logs" ALTER COLUMN "serviceId" TYPE text USING "serviceId"::text;
ALTER TABLE "api_usage_logs" ALTER COLUMN "orgId" TYPE text USING COALESCE("orgId"::text, NULL);

-- Other tables
ALTER TABLE "auth_log" ALTER COLUMN "id" TYPE text USING "id"::text;
ALTER TABLE "premium_users" ALTER COLUMN "id" TYPE text USING "id"::text;
ALTER TABLE "session" ALTER COLUMN "id" TYPE text USING "id"::text;
ALTER TABLE "user_credits" ALTER COLUMN "id" TYPE text USING "id"::text;
ALTER TABLE "stripe_events" ALTER COLUMN "id" TYPE text USING "id"::text;
ALTER TABLE "account" ALTER COLUMN "id" TYPE text USING "id"::text;
ALTER TABLE "organisation_members" ALTER COLUMN "id" TYPE text USING "id"::text;
ALTER TABLE "test_wallets" ALTER COLUMN "id" TYPE text USING "id"::text;
ALTER TABLE "wallets" ALTER COLUMN "id" TYPE text USING "id"::text;
ALTER TABLE "daily_stats" ALTER COLUMN "id" TYPE text USING "id"::text;

-- Step 5: Add missing Better Auth fields to accounts table
ALTER TABLE "account" ADD COLUMN IF NOT EXISTS "idToken" text;
ALTER TABLE "account" ADD COLUMN IF NOT EXISTS "accessTokenExpiresAt" timestamp;
ALTER TABLE "account" ADD COLUMN IF NOT EXISTS "refreshTokenExpiresAt" timestamp;
ALTER TABLE "account" ADD COLUMN IF NOT EXISTS "scope" text;
ALTER TABLE "account" ADD COLUMN IF NOT EXISTS "password" text;

-- Step 6: Make orgId NOT NULL in api_usage_logs (if not already)
ALTER TABLE "api_usage_logs" ALTER COLUMN "orgId" SET NOT NULL;

-- Step 7: Make keyHash NOT NULL in api_keys
ALTER TABLE "api_keys" ALTER COLUMN "keyHash" SET NOT NULL;

-- Step 8: Drop old columns from api_keys
ALTER TABLE "api_keys" DROP COLUMN IF EXISTS "userId";
ALTER TABLE "api_keys" DROP COLUMN IF EXISTS "serviceId";
ALTER TABLE "api_keys" DROP COLUMN IF EXISTS "encryptedKey";
ALTER TABLE "api_keys" DROP COLUMN IF EXISTS "accessLevel";

-- Step 9: Drop userId from api_usage_logs (replaced by orgId)
ALTER TABLE "api_usage_logs" DROP COLUMN IF EXISTS "userId";

-- Step 10: Add unique constraint on keyHash
ALTER TABLE "api_keys" ADD CONSTRAINT "api_keys_keyHash_unique" UNIQUE("keyHash");

-- Step 11: Recreate all foreign key constraints
ALTER TABLE "session" ADD CONSTRAINT "session_userId_user_id_fk"
  FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE;

ALTER TABLE "account" ADD CONSTRAINT "account_userId_user_id_fk"
  FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE;

ALTER TABLE "premium_users" ADD CONSTRAINT "premium_users_userId_user_id_fk"
  FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE;

ALTER TABLE "auth_log" ADD CONSTRAINT "auth_log_userId_user_id_fk"
  FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE SET NULL;

ALTER TABLE "test_wallets" ADD CONSTRAINT "test_wallets_userId_user_id_fk"
  FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE;

ALTER TABLE "user_credits" ADD CONSTRAINT "user_credits_userId_user_id_fk"
  FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE;

ALTER TABLE "organisations" ADD CONSTRAINT "organisations_ownerId_user_id_fk"
  FOREIGN KEY ("ownerId") REFERENCES "user"("id");

ALTER TABLE "organisation_members" ADD CONSTRAINT "organisation_members_orgId_organisations_id_fk"
  FOREIGN KEY ("orgId") REFERENCES "organisations"("id") ON DELETE CASCADE;

ALTER TABLE "organisation_members" ADD CONSTRAINT "organisation_members_userId_user_id_fk"
  FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE;

ALTER TABLE "wallets" ADD CONSTRAINT "wallets_orgId_organisations_id_fk"
  FOREIGN KEY ("orgId") REFERENCES "organisations"("id") ON DELETE CASCADE;

ALTER TABLE "daily_stats" ADD CONSTRAINT "daily_stats_orgId_organisations_id_fk"
  FOREIGN KEY ("orgId") REFERENCES "organisations"("id");

ALTER TABLE "api_keys" ADD CONSTRAINT "api_keys_orgId_organisations_id_fk"
  FOREIGN KEY ("orgId") REFERENCES "organisations"("id") ON DELETE CASCADE;

ALTER TABLE "api_keys" ADD CONSTRAINT "api_keys_createdBy_user_id_fk"
  FOREIGN KEY ("createdBy") REFERENCES "user"("id");

ALTER TABLE "api_usage_logs" ADD CONSTRAINT "api_usage_logs_apiKeyId_api_keys_id_fk"
  FOREIGN KEY ("apiKeyId") REFERENCES "api_keys"("id") ON DELETE CASCADE;

ALTER TABLE "api_usage_logs" ADD CONSTRAINT "api_usage_logs_orgId_organisations_id_fk"
  FOREIGN KEY ("orgId") REFERENCES "organisations"("id");

ALTER TABLE "api_usage_logs" ADD CONSTRAINT "api_usage_logs_serviceId_services_id_fk"
  FOREIGN KEY ("serviceId") REFERENCES "services"("id");
