# 📋 Plan d'Implémentation - Migration vers API Provider SaaS

**Date de création** : 2025-12-09  
**Projet** : api-key-provider  
**Branche** : feature/migration-to-api-provider  
**Statut** : ✅ Validé par l'utilisateur

---

## 🎯 Objectif de la Migration

Transformer le projet d'un système de stockage de clés API externes vers un **Developer Portal SaaS** permettant de :

1. Générer des API Keys pour consommer **VOS propres services** (PDF, AI, Mileage)
2. Gérer un système de crédits avec Wallet unifié par Organisation
3. Acheter des crédits via Stripe
4. Suivre la consommation en temps réel via Analytics
5. Tester les services via un Playground interactif

---

## ✅ Décisions Architecturales Validées

### 1. Multi-Organisation (B2B)
- ✅ Tables `organisations` + `organisationMembers`
- ✅ Wallet lié à l'organisation (plusieurs users partagent le même wallet)
- ✅ Rôles : `owner`, `admin`, `developer`, `billing`

### 2. Wallet Test Limité
- ✅ 100 crédits test par user
- ✅ Reset tous les 30 jours
- ✅ Empêche l'abus

### 3. Migration des Clés Existantes
- ✅ Période de transition : 30 jours
- ✅ Banner dashboard + Email J-7
- ✅ Révocation automatique après deadline

### 4. API Gateway
- ✅ Repo séparé : `api-gateway-app`
- ✅ DB PostgreSQL partagée
- ✅ Cache Redis pour vérification de clés

---

## 🏗️ Architecture Finale

### Schema DB (Drizzle ORM)

```typescript
// ============================================
// ORGANISATIONS (Multi-tenancy B2B)
// ============================================

export const organisations = pgTable("organisations", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  ownerId: uuid("ownerId").references(() => users.id),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  updatedAt: timestamp("updatedAt").notNull().defaultNow(),
});

export const organisationMembers = pgTable("organisation_members", {
  id: uuid("id").primaryKey().defaultRandom(),
  orgId: uuid("orgId").notNull().references(() => organisations.id, { onDelete: "cascade" }),
  userId: uuid("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  role: text("role").notNull(), // "owner" | "admin" | "developer" | "billing"
  joinedAt: timestamp("joinedAt").notNull().defaultNow(),
}, (table) => ({
  orgUserIdx: index("idx_org_members_org_user").on(table.orgId, table.userId),
}));

// ============================================
// WALLETS (Lié à l'organisation)
// ============================================

export const wallets = pgTable("wallets", {
  id: uuid("id").primaryKey().defaultRandom(),
  orgId: uuid("orgId").unique().references(() => organisations.id, { onDelete: "cascade" }),
  balance: integer("balance").notNull().default(0),
  totalPurchased: integer("totalPurchased").notNull().default(0),
  totalUsed: integer("totalUsed").notNull().default(0),
  currency: text("currency").notNull().default("EUR"),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  updatedAt: timestamp("updatedAt").notNull().defaultNow(),
}, (table) => ({
  orgIdx: index("idx_wallets_org").on(table.orgId),
}));

export const testWallets = pgTable("test_wallets", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("userId").unique().references(() => users.id, { onDelete: "cascade" }),
  balance: integer("balance").notNull().default(100), // 100 crédits test
  resetAt: timestamp("resetAt").notNull(), // Reset mensuel
  createdAt: timestamp("createdAt").notNull().defaultNow(),
});

// ============================================
// SERVICES (VOS 3 services : PDF, AI, Mileage)
// ============================================

export const services = pgTable("services", {
  id: uuid("id").primaryKey().defaultRandom(),
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
// API KEYS (REFACTORÉES - HACHAGE SHA-256)
// ============================================

export const apiKeys = pgTable("api_keys", {
  id: uuid("id").primaryKey().defaultRandom(),
  
  // Ownership
  orgId: uuid("orgId").references(() => organisations.id, { onDelete: "cascade" }),
  createdBy: uuid("createdBy").references(() => users.id), // Traçabilité
  
  // Key Identity
  keyName: text("keyName").notNull(), // "Production API", "Mobile App"
  keyHash: text("keyHash").notNull().unique(), // ✅ SHA-256 + Pepper
  keyPrefix: text("keyPrefix").notNull(), // "sk_live" | "sk_test"
  keyHint: text("keyHint"), // 4 derniers chars : "...x7Qa"
  
  // Permissions & Scopes
  scopes: jsonb("scopes").$type<string[]>().notNull().default([]), 
  // ["pdf:read", "pdf:write", "ai:read", "mileage:calculate"]
  environment: text("environment").notNull(), // "production" | "test"
  
  // Limits & Quotas
  dailyQuota: integer("dailyQuota"), // null = illimité
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
}, (table) => ({
  keyHashIdx: index("idx_apikeys_keyHash").on(table.keyHash), // CRITIQUE
  orgIdx: index("idx_apikeys_org").on(table.orgId),
}));

// ============================================
// USAGE LOGS
// ============================================

export const apiUsageLogs = pgTable("api_usage_logs", {
  id: uuid("id").primaryKey().defaultRandom(),
  
  apiKeyId: uuid("apiKeyId").notNull().references(() => apiKeys.id, { onDelete: "cascade" }),
  orgId: uuid("orgId").notNull().references(() => organisations.id),
  serviceId: uuid("serviceId").notNull().references(() => services.id),
  
  // Request Details
  endpoint: text("endpoint").notNull(),
  method: text("method").notNull(),
  statusCode: integer("statusCode").notNull(),
  responseTime: integer("responseTime"), // ms
  
  // Business Metrics
  creditsUsed: integer("creditsUsed").notNull(),
  details: jsonb("details"), // { "pages_processed": 5, "tokens": 1500 }
  
  // Security
  ipAddress: text("ipAddress"),
  country: text("country"),
  userAgent: text("userAgent"),
  
  timestamp: timestamp("timestamp").notNull().defaultNow(),
}, (table) => ({
  orgTimeIdx: index("idx_usage_org_time").on(table.orgId, table.timestamp),
  keyTimeIdx: index("idx_usage_key_time").on(table.apiKeyId, table.timestamp),
}));

// ============================================
// DAILY STATS (Pré-agrégation pour analytics)
// ============================================

export const dailyStats = pgTable("daily_stats", {
  id: uuid("id").primaryKey().defaultRandom(),
  orgId: uuid("orgId").references(() => organisations.id),
  date: timestamp("date").notNull(),
  totalRequests: integer("totalRequests").default(0),
  totalCredits: integer("totalCredits").default(0),
  successRate: integer("successRate"), // Pourcentage
  servicesBreakdown: jsonb("servicesBreakdown"), // { "pdf": 150, "ai": 50 }
  createdAt: timestamp("createdAt").notNull().defaultNow(),
}, (table) => ({
  orgDateIdx: index("idx_stats_org_date").on(table.orgId, table.date),
}));
```

---

## 🔐 Sécurité - Hachage de Clés

### Génération de Clé (Server Action)

```typescript
// lib/crypto/api-keys.ts
import crypto from 'crypto';

export function generateApiKey(environment: 'production' | 'test'): string {
  const prefix = environment === 'production' ? 'sk_live' : 'sk_test';
  const randomBytes = crypto.randomBytes(32);
  return `${prefix}_${randomBytes.toString('base64url')}`;
}

export function hashApiKey(apiKey: string): string {
  const pepper = process.env.API_KEY_PEPPER;
  if (!pepper) throw new Error('API_KEY_PEPPER non configuré');
  
  return crypto
    .createHash('sha256')
    .update(apiKey + pepper)
    .digest('hex');
}
```

### Vérification (API Gateway)

```typescript
// api-gateway-app/lib/verify-key.ts
import { db } from './db';
import { apiKeys } from './schema';
import { hashApiKey } from './crypto';
import { redis } from './redis';

export async function verifyApiKeyWithCache(providedKey: string) {
  const hash = hashApiKey(providedKey);
  
  // 1. Chercher dans Redis (TTL 1 heure)
  const cached = await redis.get(`apikey:${hash}`);
  if (cached) return JSON.parse(cached);
  
  // 2. Si pas en cache, requête DB
  const keyRecord = await db.query.apiKeys.findFirst({
    where: eq(apiKeys.keyHash, hash),
  });
  
  if (keyRecord && keyRecord.isActive) {
    // 3. Stocker dans Redis
    await redis.setex(`apikey:${hash}`, 3600, JSON.stringify(keyRecord));
  }
  
  return keyRecord;
}
```

---

## 📅 Planning des Sprints

### Sprint 1 : Refactoring DB & Sécurité (2 semaines)

**Objectifs** :
- Refonte schema DB (organisations, wallets, apiKeys avec hachage)
- Nouveau module crypto (SHA-256 + Pepper)
- Migration des clés existantes
- Seed des 3 vrais services (PDF, AI, Mileage)

**Fichiers impactés** :
- `drizzle/schema.ts`
- `lib/crypto/api-keys.ts` (nouveau)
- `lib/crypto/encryption.ts` (à supprimer après migration)
- `drizzle/seed/real-services.ts` (nouveau)
- `app/actions/api-key-actions.ts` (refactoring)

**Variables d'environnement** :
```env
API_KEY_PEPPER=<générer avec: openssl rand -base64 32>
```

**Migration DB** :
```bash
npx drizzle-kit generate --name refactor_api_keys_to_hash_with_orgs
npx drizzle-kit push
```

---

### Sprint 2 : UI/UX Génération de Clés (1 semaine)

**Objectifs** :
- Modal création de clé (design UI Designer)
- Affichage unique de la clé générée
- Liste des clés avec badges (scopes, env)
- Gestion des organisations (création, invitation membres)

**Fichiers à créer** :
- `app/keys/create-key-dialog.tsx`
- `app/keys/api-key-created-modal.tsx`
- `app/organisations/page.tsx`
- `app/organisations/create-org-dialog.tsx`
- `app/organisations/invite-member-dialog.tsx`

**Composants Shadcn** :
```bash
npx shadcn@latest add dialog checkbox select badge tabs
```

**Design System** :
- Palette : zinc-950/900/800
- Primary : blue-600
- Services : PDF=blue-600, AI=violet-600, Mileage=orange-600

---

### Sprint 3 : Analytics & Playground (1.5 semaines)

**Objectifs** :
- Dashboard analytics avec Recharts
- Pré-agrégation quotidienne (CRON job)
- Playground interactif pour tester services
- Page pricing avec 3 tiers

**Fichiers à créer** :
- `app/usage/page.tsx` (Recharts)
- `app/playground/page.tsx` (Tabs pour chaque service)
- `app/api/cron/aggregate-stats/route.ts`
- `app/pricing/page.tsx`

**Dépendances** :
```bash
npm install recharts
```

**CRON Vercel** :
```json
// vercel.json
{
  "crons": [{
    "path": "/api/cron/aggregate-stats",
    "schedule": "0 3 * * *"
  }]
}
```

---

### Sprint 4 : API Gateway & Production (2 semaines)

**Objectifs** :
- Créer projet séparé `api-gateway-app`
- Middleware vérification de clé + cache Redis
- Débit de crédits avec transaction atomique
- Détection d'anomalies (>10 pays en 1h)
- Load testing

**Nouveau projet** :
```bash
cd ..
npx create-next-app@latest api-gateway-app
cd api-gateway-app
npm install drizzle-orm pg ioredis
```

**Fichiers à créer** :
- `middleware.ts` (vérification clé)
- `lib/verify-key.ts` (avec cache Redis)
- `lib/debit-credits.ts` (transaction atomique)
- `app/api/cron/detect-anomalies/route.ts`

**Docker Redis** :
```bash
docker-compose up -d redis
```

---

## 🔄 Migration des Clés Existantes

### Étape 1 : Script de Migration

```typescript
// scripts/migrate-keys-to-hash.ts
import { db } from '@/drizzle/db';
import { apiKeys } from '@/drizzle/schema';
import { decryptApiKey } from '@/lib/crypto/encryption'; // Ancienne fonction
import { hashApiKey } from '@/lib/crypto/api-keys'; // Nouvelle fonction

async function migrate() {
  const oldKeys = await db.select().from(apiKeys);
  
  for (const key of oldKeys) {
    // 1. Déchiffrer
    const plainKey = decryptApiKey(key.encryptedKey);
    
    // 2. Hasher
    const keyHash = hashApiKey(plainKey);
    
    // 3. Extraire hint
    const keyHint = plainKey.slice(-4);
    
    // 4. Update
    await db.update(apiKeys).set({
      keyHash,
      keyHint,
      keyPrefix: plainKey.startsWith('sk_') ? plainKey.split('_')[1] : 'live',
      scopes: ['pdf', 'ai', 'mileage'], // Tous les scopes par défaut
      environment: 'production',
    }).where(eq(apiKeys.id, key.id));
  }
  
  console.log(`✅ ${oldKeys.length} clés migrées avec succès`);
}

migrate();
```

### Étape 2 : Communication Utilisateurs

**Email J-0 (Début migration)** :
```
Objet : Migration de sécurité - Régénérez vos clés API

Bonjour,

Nous migrons vers un système de sécurité renforcé pour vos clés API.

Action requise avant le [DATE+30j] :
1. Connectez-vous à votre dashboard
2. Régénérez vos clés API
3. Remplacez les anciennes clés dans vos applications

Les clés non régénérées seront révoquées automatiquement.

Merci,
L'équipe API Key Provider
```

**Email J-23 (Rappel)** :
```
Objet : [Rappel] 7 jours restants pour migrer vos clés API

Il vous reste 7 jours pour régénérer vos clés API.
Clés concernées : [LISTE]
```

### Étape 3 : Banner Dashboard

```tsx
// components/migration-banner.tsx
export function MigrationBanner() {
  const daysLeft = calculateDaysUntilDeadline();
  
  if (daysLeft <= 0) return null;
  
  return (
    <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-4 mb-6">
      <div className="flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-amber-500 mt-0.5" />
        <div>
          <p className="font-medium text-amber-200">
            Migration de sécurité en cours
          </p>
          <p className="text-sm text-amber-300/80 mt-1">
            Régénérez vos clés API avant le [DATE]. Il reste {daysLeft} jours.
          </p>
          <Button size="sm" className="mt-3" variant="outline">
            Régénérer mes clés maintenant
          </Button>
        </div>
      </div>
    </div>
  );
}
```

---

## 📊 Métriques de Succès

### Technique
- ✅ 100% des clés stockées en hash SHA-256 (aucune en clair ou chiffré)
- ✅ Hit rate cache Redis > 95%
- ✅ Temps de vérification de clé < 50ms (P95)
- ✅ 0 erreur de migration

### Business
- ✅ 80%+ des users migrent avant deadline
- ✅ 0 plainte sécurité
- ✅ Dashboard analytics utilisé par 60%+ des users

---

## 🚀 Commandes de Démarrage

### Développement Local

```bash
# 1. Backend (api-key-provider)
cd D:\Auto_AI\Worspace\api-key-provider
npm run dev

# 2. API Gateway (après Sprint 4)
cd D:\Auto_AI\Worspace\api-gateway-app
npm run dev

# 3. Database (Docker)
docker-compose up -d postgres redis

# 4. Drizzle Studio
npm run db:studio
```

### Production

```bash
# Build
npm run build

# Migration DB
npx drizzle-kit push

# Seed services
npx tsx drizzle/seed/real-services.ts

# Start
npm start
```

---

## 📚 Références

- [Rapport SaaS Architect](./saas-architect-validation.md)
- [Rapport UI Designer](./ui-design-system.md)
- [Specs Migration](./migration-to-api-provide.md)
- [Schema DB Final](../drizzle/schema.ts)

---

**Statut** : ✅ Prêt pour implémentation  
**Prochaine étape** : Sprint 1 - Refactoring DB & Sécurité
