-- ============================================
-- MIGRATION: Sprint 1 - Refactoring DB & Sécurité
-- Description: Migration vers hash-based API keys avec support multi-organisation
-- Date: 2025-12-09
-- ============================================

-- ============================================
-- STEP 1: Create new organisations tables
-- ============================================

CREATE TABLE "organisations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"ownerId" uuid,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "organisations_slug_unique" UNIQUE("slug")
);

--> statement-breakpoint
CREATE TABLE "organisation_members" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"orgId" uuid NOT NULL,
	"userId" uuid NOT NULL,
	"role" text NOT NULL,
	"joinedAt" timestamp DEFAULT now() NOT NULL
);

--> statement-breakpoint
ALTER TABLE "organisations" ADD CONSTRAINT "organisations_ownerId_user_id_fk" FOREIGN KEY ("ownerId") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;

--> statement-breakpoint
ALTER TABLE "organisation_members" ADD CONSTRAINT "organisation_members_orgId_organisations_id_fk" FOREIGN KEY ("orgId") REFERENCES "public"."organisations"("id") ON DELETE cascade ON UPDATE no action;

--> statement-breakpoint
ALTER TABLE "organisation_members" ADD CONSTRAINT "organisation_members_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;

--> statement-breakpoint
CREATE INDEX "idx_org_members_org_user" ON "organisation_members" USING btree ("orgId","userId");

-- ============================================
-- STEP 2: Create new services table (simplified)
-- ============================================

CREATE TABLE "services" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"displayName" text NOT NULL,
	"description" text,
	"baseCostPerCall" integer DEFAULT 1 NOT NULL,
	"icon" text,
	"category" text DEFAULT 'general' NOT NULL,
	"isActive" boolean DEFAULT true NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "services_name_unique" UNIQUE("name")
);

-- ============================================
-- STEP 3: Create new wallets table (org-based)
-- ============================================

CREATE TABLE "wallets" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"orgId" uuid,
	"balance" integer DEFAULT 0 NOT NULL,
	"totalPurchased" integer DEFAULT 0 NOT NULL,
	"totalUsed" integer DEFAULT 0 NOT NULL,
	"currency" text DEFAULT 'EUR' NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "wallets_orgId_unique" UNIQUE("orgId")
);

--> statement-breakpoint
ALTER TABLE "wallets" ADD CONSTRAINT "wallets_orgId_organisations_id_fk" FOREIGN KEY ("orgId") REFERENCES "public"."organisations"("id") ON DELETE cascade ON UPDATE no action;

--> statement-breakpoint
CREATE INDEX "idx_wallets_org" ON "wallets" USING btree ("orgId");

-- ============================================
-- STEP 4: Create test wallets table
-- ============================================

CREATE TABLE "test_wallets" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"userId" uuid,
	"balance" integer DEFAULT 100 NOT NULL,
	"resetAt" timestamp NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "test_wallets_userId_unique" UNIQUE("userId")
);

--> statement-breakpoint
ALTER TABLE "test_wallets" ADD CONSTRAINT "test_wallets_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;

-- ============================================
-- STEP 5: Create daily stats table
-- ============================================

CREATE TABLE "daily_stats" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"orgId" uuid,
	"date" timestamp NOT NULL,
	"totalRequests" integer DEFAULT 0,
	"totalCredits" integer DEFAULT 0,
	"successRate" integer,
	"servicesBreakdown" jsonb,
	"createdAt" timestamp DEFAULT now() NOT NULL
);

--> statement-breakpoint
ALTER TABLE "daily_stats" ADD CONSTRAINT "daily_stats_orgId_organisations_id_fk" FOREIGN KEY ("orgId") REFERENCES "public"."organisations"("id") ON DELETE no action ON UPDATE no action;

--> statement-breakpoint
CREATE INDEX "idx_stats_org_date" ON "daily_stats" USING btree ("orgId","date");

-- ============================================
-- STEP 6: Backup existing api_keys data
-- ============================================

-- Create temporary backup table
CREATE TABLE "api_keys_backup" AS SELECT * FROM "api_keys";

-- ============================================
-- STEP 7: Refactor api_keys table
-- ============================================

-- Drop old indexes
DROP INDEX IF EXISTS "idx_apikeys_userId";
DROP INDEX IF EXISTS "idx_apikeys_serviceId";

-- Add new columns
ALTER TABLE "api_keys" ADD COLUMN "orgId" uuid;
ALTER TABLE "api_keys" ADD COLUMN "createdBy" uuid;
ALTER TABLE "api_keys" ADD COLUMN "keyHash" text;
ALTER TABLE "api_keys" ADD COLUMN "keyPrefix" text DEFAULT 'sk_live' NOT NULL;
ALTER TABLE "api_keys" ADD COLUMN "keyHint" text;
ALTER TABLE "api_keys" ADD COLUMN "scopes" jsonb DEFAULT '[]'::jsonb NOT NULL;
ALTER TABLE "api_keys" ADD COLUMN "environment" text DEFAULT 'production' NOT NULL;
ALTER TABLE "api_keys" ADD COLUMN "dailyQuota" integer;
ALTER TABLE "api_keys" ADD COLUMN "monthlyQuota" integer;
ALTER TABLE "api_keys" ADD COLUMN "dailyUsed" integer DEFAULT 0;
ALTER TABLE "api_keys" ADD COLUMN "monthlyUsed" integer DEFAULT 0;
ALTER TABLE "api_keys" ADD COLUMN "revokedAt" timestamp;
ALTER TABLE "api_keys" ADD COLUMN "revokedReason" text;
ALTER TABLE "api_keys" ADD COLUMN "lastUsedIp" text;

-- Drop old columns (will be done after migration script runs)
-- ALTER TABLE "api_keys" DROP COLUMN "serviceId";
-- ALTER TABLE "api_keys" DROP COLUMN "encryptedKey";
-- ALTER TABLE "api_keys" DROP COLUMN "accessLevel";

-- Add foreign keys
ALTER TABLE "api_keys" ADD CONSTRAINT "api_keys_orgId_organisations_id_fk" FOREIGN KEY ("orgId") REFERENCES "public"."organisations"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "api_keys" ADD CONSTRAINT "api_keys_createdBy_user_id_fk" FOREIGN KEY ("createdBy") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;

-- Create new indexes
CREATE INDEX "idx_apikeys_keyHash" ON "api_keys" USING btree ("keyHash");
CREATE INDEX "idx_apikeys_org" ON "api_keys" USING btree ("orgId");

-- Make keyHash unique (will be enforced after migration)
-- ALTER TABLE "api_keys" ADD CONSTRAINT "api_keys_keyHash_unique" UNIQUE("keyHash");

-- ============================================
-- STEP 8: Refactor api_usage_logs table
-- ============================================

-- Add orgId column
ALTER TABLE "api_usage_logs" ADD COLUMN "orgId" uuid;
ALTER TABLE "api_usage_logs" ADD COLUMN "responseTime" integer;
ALTER TABLE "api_usage_logs" ADD COLUMN "country" text;
ALTER TABLE "api_usage_logs" ADD COLUMN "userAgent" text;
ALTER TABLE "api_usage_logs" ADD COLUMN "details" jsonb;

-- Add foreign key
ALTER TABLE "api_usage_logs" ADD CONSTRAINT "api_usage_logs_orgId_organisations_id_fk" FOREIGN KEY ("orgId") REFERENCES "public"."organisations"("id") ON DELETE no action ON UPDATE no action;

-- Drop old index
DROP INDEX IF EXISTS "idx_usage_userId";

-- Create new indexes
CREATE INDEX "idx_usage_org_time" ON "api_usage_logs" USING btree ("orgId","timestamp");
CREATE INDEX "idx_usage_key_time" ON "api_usage_logs" USING btree ("apiKeyId","timestamp");

-- ============================================
-- STEP 9: Update premium_users table
-- ============================================

-- Add missing columns for Stripe integration
ALTER TABLE "premium_users" ADD COLUMN IF NOT EXISTS "stripeCustomerId" text;
ALTER TABLE "premium_users" ADD COLUMN IF NOT EXISTS "stripeSubscriptionId" text;
ALTER TABLE "premium_users" ADD COLUMN IF NOT EXISTS "subscriptionStatus" text DEFAULT 'active' NOT NULL;
ALTER TABLE "premium_users" ADD COLUMN IF NOT EXISTS "currentPeriodEnd" timestamp;
ALTER TABLE "premium_users" ADD COLUMN IF NOT EXISTS "canceledAt" timestamp;

-- Update constraints
ALTER TABLE "premium_users" DROP CONSTRAINT IF EXISTS "premium_users_stripePaymentId_unique";
ALTER TABLE "premium_users" ADD CONSTRAINT "premium_users_stripeSubscriptionId_unique" UNIQUE("stripeSubscriptionId");

-- ============================================
-- NOTES FOR MANUAL STEPS:
-- ============================================

-- IMPORTANT: After running this migration, you MUST:
-- 1. Run the migration script: npm run migrate:keys
--    This will decrypt old keys and re-hash them with SHA-256
--
-- 2. Manually create default organisations for existing users
--
-- 3. After verification, drop old columns:
--    ALTER TABLE "api_keys" DROP COLUMN "serviceId";
--    ALTER TABLE "api_keys" DROP COLUMN "encryptedKey";
--    ALTER TABLE "api_keys" DROP COLUMN "accessLevel";
--    ALTER TABLE "api_keys" DROP COLUMN "userId";
--    ALTER TABLE "api_usage_logs" DROP COLUMN "userId";
--
-- 4. Add NOT NULL constraints after data migration:
--    ALTER TABLE "api_keys" ALTER COLUMN "keyHash" SET NOT NULL;
--    ALTER TABLE "api_keys" ALTER COLUMN "orgId" SET NOT NULL;
--    ALTER TABLE "api_usage_logs" ALTER COLUMN "orgId" SET NOT NULL;
