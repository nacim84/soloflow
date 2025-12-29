import {
  pgTable,
  text,
  timestamp,
  boolean,
  jsonb,
  index,
  integer,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// ============================================
// BETTER AUTH TABLES
// ============================================

export const users = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("emailVerified").notNull().default(false),
  image: text("image"),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  updatedAt: timestamp("updatedAt").notNull().defaultNow(),
});

export const sessions = pgTable(
  "session",
  {
    id: text("id").primaryKey(),
    userId: text("userId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    expiresAt: timestamp("expiresAt").notNull(),
    token: text("token").notNull().unique(),
    ipAddress: text("ipAddress"),
    userAgent: text("userAgent"),
    createdAt: timestamp("createdAt").notNull().defaultNow(),
    updatedAt: timestamp("updatedAt").notNull().defaultNow(),
  },
  (table) => ({
    tokenIdx: index("idx_session_token").on(table.token),
    userIdIdx: index("idx_session_userId").on(table.userId),
    expiresAtIdx: index("idx_session_expiresAt").on(table.expiresAt),
  }),
);

export const accounts = pgTable(
  "account",
  {
    id: text("id").primaryKey(),
    userId: text("userId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    accountId: text("accountId").notNull(),
    providerId: text("providerId").notNull(),
    accessToken: text("accessToken"),
    refreshToken: text("refreshToken"),
    idToken: text("idToken"),
    accessTokenExpiresAt: timestamp("accessTokenExpiresAt"),
    refreshTokenExpiresAt: timestamp("refreshTokenExpiresAt"),
    scope: text("scope"),
    password: text("password"),
    expiresAt: timestamp("expiresAt"),
    createdAt: timestamp("createdAt").notNull().defaultNow(),
    updatedAt: timestamp("updatedAt").notNull().defaultNow(),
  },
  (table) => ({
    userIdIdx: index("idx_account_userId").on(table.userId),
    providerIdx: index("idx_account_provider").on(
      table.providerId,
      table.accountId,
    ),
  }),
);

export const verifications = pgTable(
  "verifications",
  {
    id: text("id").primaryKey(),
    identifier: text("identifier").notNull(),
    value: text("value").notNull(),
    expiresAt: timestamp("expiresAt").notNull(),
    createdAt: timestamp("createdAt").notNull().defaultNow(),
    updatedAt: timestamp("updatedAt").notNull().defaultNow(),
  },
  (table) => ({
    identifierIdx: index("idx_verification_identifier").on(table.identifier),
  }),
);

// ============================================
// AUTH LOG TABLE
// ============================================

export const authLog = pgTable("auth_log", {
  id: text("id").primaryKey(),
  userId: text("userId").references(() => users.id, { onDelete: "set null" }),
  event: text("event").notNull(),
  provider: text("provider"),
  ipAddress: text("ipAddress"),
  userAgent: text("userAgent"),
  success: boolean("success").notNull(),
  errorMessage: text("errorMessage"),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
});

// ============================================
// STRIPE / PREMIUM TABLES
// ============================================

export const premiumUsers = pgTable("premium_users", {
  id: text("id").primaryKey(),
  userId: text("userId")
    .notNull()
    .unique()
    .references(() => users.id, { onDelete: "cascade" }),
  stripeCustomerId: text("stripeCustomerId").notNull(),
  stripeSubscriptionId: text("stripeSubscriptionId").notNull().unique(),
  subscriptionStatus: text("subscriptionStatus").notNull(),
  currentPeriodEnd: timestamp("currentPeriodEnd").notNull(),
  canceledAt: timestamp("canceledAt"),
  upgradedAt: timestamp("upgradedAt").notNull().defaultNow(),
});

export const stripeEvents = pgTable("stripe_events", {
  id: text("id").primaryKey(),
  eventId: text("event_id").notNull().unique(),
  type: text("type").notNull(),
  payload: jsonb("payload").notNull(),
  processed: boolean("processed").default(false),
  receivedAt: timestamp("received_at").notNull().defaultNow(),
  processedAt: timestamp("processed_at"),
});

// ============================================
// ORGANISATIONS (NEW - Multi-tenancy)
// ============================================

export const organisations = pgTable("organisations", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  ownerId: text("ownerId").references(() => users.id),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  updatedAt: timestamp("updatedAt").notNull().defaultNow(),
});

export const organisationMembers = pgTable(
  "organisation_members",
  {
    id: text("id").primaryKey(),
    orgId: text("orgId")
      .notNull()
      .references(() => organisations.id, { onDelete: "cascade" }),
    userId: text("userId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    role: text("role").notNull(), // "owner" | "admin" | "developer" | "billing"
    joinedAt: timestamp("joinedAt").notNull().defaultNow(),
  },
  (table) => ({
    orgUserIdx: index("idx_org_members_org_user").on(table.orgId, table.userId),
  }),
);

// ============================================
// SERVICES (REFACTORED FROM supportedServices)
// ============================================

export const services = pgTable("services", {
  id: text("id").primaryKey(),
  name: text("name").notNull().unique(), // "pdf", "ai", "mileage"
  displayName: text("displayName").notNull(),
  description: text("description"),
  baseCostPerCall: integer("baseCostPerCall").notNull().default(1),
  icon: text("icon"),
  category: text("category").notNull().default("general"),
  isActive: boolean("isActive").notNull().default(true),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
});

// ============================================
// API KEYS (REFACTORED - Hash-based with Scopes)
// ============================================

export const apiKeys = pgTable(
  "api_keys",
  {
    id: text("id").primaryKey(),

    // Ownership
    orgId: text("orgId").references(() => organisations.id, {
      onDelete: "cascade",
    }),
    createdBy: text("createdBy").references(() => users.id),

    // Key Identity
    keyName: text("keyName").notNull(),
    keyHash: text("keyHash").notNull().unique(), // SHA-256 + Pepper
    keyPrefix: text("keyPrefix").notNull(), // "sk_live" | "sk_test"
    keyHint: text("keyHint"), // "...x7Qa"

    // Permissions & Scopes
    scopes: jsonb("scopes").$type<string[]>().notNull().default([]),
    environment: text("environment").notNull(), // "production" | "test"

    // Limits & Quotas
    dailyQuota: integer("dailyQuota"),
    monthlyQuota: integer("monthlyQuota"),
    dailyUsed: integer("dailyUsed").default(0),
    monthlyUsed: integer("monthlyUsed").default(0),

    // Status
    isActive: boolean("isActive").notNull().default(true),
    revokedAt: timestamp("revokedAt"),
    revokedReason: text("revokedReason"),

    // Tracking
    lastUsedAt: timestamp("lastUsedAt"),
    lastUsedIp: text("lastUsedIp"),
    expiresAt: timestamp("expiresAt"),

    createdAt: timestamp("createdAt").notNull().defaultNow(),
    updatedAt: timestamp("updatedAt").notNull().defaultNow(),
  },
  (table) => ({
    keyHashIdx: index("idx_apikeys_keyHash").on(table.keyHash), // CRITICAL
    orgIdx: index("idx_apikeys_org").on(table.orgId),
  }),
);

// ============================================
// WALLETS (REFACTORED - Org-based)
// ============================================

export const wallets = pgTable(
  "wallets",
  {
    id: text("id").primaryKey(),
    orgId: text("orgId")
      .unique()
      .references(() => organisations.id, { onDelete: "cascade" }),
    balance: integer("balance").notNull().default(0),
    totalPurchased: integer("totalPurchased").notNull().default(0),
    totalUsed: integer("totalUsed").notNull().default(0),
    currency: text("currency").notNull().default("EUR"),
    createdAt: timestamp("createdAt").notNull().defaultNow(),
    updatedAt: timestamp("updatedAt").notNull().defaultNow(),
  },
  (table) => ({
    orgIdx: index("idx_wallets_org").on(table.orgId),
  }),
);

// ============================================
// TEST WALLETS (NEW)
// ============================================

export const testWallets = pgTable("test_wallets", {
  id: text("id").primaryKey(),
  userId: text("userId")
    .unique()
    .references(() => users.id, { onDelete: "cascade" }),
  balance: integer("balance").notNull().default(100), // 100 crédits test
  resetAt: timestamp("resetAt").notNull(),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
});

// ============================================
// API USAGE LOGS (REFACTORED)
// ============================================

export const apiUsageLogs = pgTable(
  "api_usage_logs",
  {
    id: text("id").primaryKey(),

    apiKeyId: text("apiKeyId")
      .notNull()
      .references(() => apiKeys.id, { onDelete: "cascade" }),
    orgId: text("orgId")
      .notNull()
      .references(() => organisations.id), // NEW
    serviceId: text("serviceId")
      .notNull()
      .references(() => services.id),

    endpoint: text("endpoint"),
    method: text("method"),
    statusCode: integer("statusCode"),
    responseTime: integer("responseTime"),

    creditsUsed: integer("creditsUsed").notNull().default(1),
    details: jsonb("details"),

    ipAddress: text("ipAddress"),
    country: text("country"),
    userAgent: text("userAgent"),

    timestamp: timestamp("timestamp").notNull().defaultNow(),
  },
  (table) => ({
    orgTimeIdx: index("idx_usage_org_time").on(table.orgId, table.timestamp),
    keyTimeIdx: index("idx_usage_key_time").on(table.apiKeyId, table.timestamp),
    timestampIdx: index("idx_usage_timestamp").on(table.timestamp),
  }),
);

// ============================================
// DAILY STATS (NEW)
// ============================================

export const dailyStats = pgTable(
  "daily_stats",
  {
    id: text("id").primaryKey(),
    orgId: text("orgId").references(() => organisations.id),
    date: timestamp("date").notNull(),
    totalRequests: integer("totalRequests").default(0),
    totalCredits: integer("totalCredits").default(0),
    successRate: integer("successRate"),
    servicesBreakdown: jsonb("servicesBreakdown"),
    createdAt: timestamp("createdAt").notNull().defaultNow(),
  },
  (table) => ({
    orgDateIdx: index("idx_stats_org_date").on(table.orgId, table.date),
  }),
);

// ============================================
// RELATIONS
// ============================================

export const usersRelations = relations(users, ({ many }) => ({
  organisationMemberships: many(organisationMembers),
  ownedOrganisations: many(organisations),
  testWallet: many(testWallets),
}));

export const organisationsRelations = relations(
  organisations,
  ({ one, many }) => ({
    owner: one(users, {
      fields: [organisations.ownerId],
      references: [users.id],
    }),
    members: many(organisationMembers),
    wallet: one(wallets),
    apiKeys: many(apiKeys),
    usageLogs: many(apiUsageLogs),
    dailyStats: many(dailyStats),
  }),
);

export const organisationMembersRelations = relations(
  organisationMembers,
  ({ one }) => ({
    organisation: one(organisations, {
      fields: [organisationMembers.orgId],
      references: [organisations.id],
    }),
    user: one(users, {
      fields: [organisationMembers.userId],
      references: [users.id],
    }),
  }),
);

export const servicesRelations = relations(services, ({ many }) => ({
  usageLogs: many(apiUsageLogs),
}));

export const apiKeysRelations = relations(apiKeys, ({ one, many }) => ({
  organisation: one(organisations, {
    fields: [apiKeys.orgId],
    references: [organisations.id],
  }),
  creator: one(users, {
    fields: [apiKeys.createdBy],
    references: [users.id],
  }),
  usageLogs: many(apiUsageLogs),
}));

export const walletsRelations = relations(wallets, ({ one }) => ({
  organisation: one(organisations, {
    fields: [wallets.orgId],
    references: [organisations.id],
  }),
}));

export const testWalletsRelations = relations(testWallets, ({ one }) => ({
  user: one(users, {
    fields: [testWallets.userId],
    references: [users.id],
  }),
}));

export const apiUsageLogsRelations = relations(apiUsageLogs, ({ one }) => ({
  apiKey: one(apiKeys, {
    fields: [apiUsageLogs.apiKeyId],
    references: [apiKeys.id],
  }),
  organisation: one(organisations, {
    fields: [apiUsageLogs.orgId],
    references: [organisations.id],
  }),
  service: one(services, {
    fields: [apiUsageLogs.serviceId],
    references: [services.id],
  }),
}));

export const dailyStatsRelations = relations(dailyStats, ({ one }) => ({
  organisation: one(organisations, {
    fields: [dailyStats.orgId],
    references: [organisations.id],
  }),
}));
