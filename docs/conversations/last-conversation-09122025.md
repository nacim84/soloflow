## User

continue last conversation please

## Assistant

Je vais consulter l'historique de conversation pour comprendre le contexte de la dernière discussion.

**Tool Call: View recent git commits**
Status: Completed

Terminal:
```
6173611 (HEAD -> feature/migration-to-api-provider, origin/feature/migration-to-api-provider) Prepare migration to Api Provider
519f583 (origin/feature/saas-improvements, origin/feature/improvements, feature/saas-improvements, feature/improvements) refactor: finalize Todos cleanup, rebuild Drizzle schema, fix TypeScript errors
93993ba feat: am├®liorations UI/UX avec animations et micro-interactions
ec08dea (origin/main, origin/HEAD, main) Initial commit

```


**Tool Call: Read D:\Auto_AI\Worspace\key-api-manager-bis\SPRINT-1-CHECKLIST.md**
Status: Completed

````
# Sprint 1 - Checklist de Migration

**Date**: 2025-12-09  
**Status**: ⏳ En attente d'exécution

---

## Préparation (10 min)

- [ ] 1. Lire la documentation complète
  - [ ] `docs/ai/sprint-1-execution-guide.md`
  - [ ] `docs/ai/sprint-1-refactoring-db-security.md`

- [ ] 2. Backup de la base de données
  ```bash
  pg_dump -U postgres key_api_manager_db > backup_$(date +%Y%m%d_%H%M%S).sql
  ```

- [ ] 3. Générer le pepper
  ```bash
  openssl rand -base64 32
  ```

- [ ] 4. Ajouter dans `.env.local`
  ```env
  API_KEY_PEPPER=<votre_pepper_généré>
  ```

- [ ] 5. Installer les dépendances manquantes
  ```bash
  npm install
  ```

---

## Migration DB (15 min)

- [ ] 6. Appliquer la migration SQL
  ```bash
  npx drizzle-kit push
  # OU
  psql -U postgres -d key_api_manager_db -f drizzle/migrations/0001_refactor_api_keys_to_hash_with_orgs.sql
  ```

- [ ] 7. Migrer les clés existantes (AES → SHA-256)
  ```bash
  npm run migrate:keys
  ```
  **Vérifier la sortie** : Nombre de clés migrées avec succès

- [ ] 8. Seed des services réels
  ```bash
  npm run seed:services
  ```
  **Vérifier** : 3 services créés (PDF, AI, Mileage)

- [ ] 9. Créer organisations par défaut
  - [ ] Créer script `scripts/create-default-orgs.ts` (voir guide)
  - [ ] Exécuter le script
  - [ ] Vérifier en DB que chaque user a une org

---

## Tests (20 min)

- [ ] 10. Test création de clé API
  ```bash
  npm run dev
  ```
  - [ ] Se connecter au dashboard
  - [ ] Créer une nouvelle clé API test
  - [ ] Vérifier que la clé commence par `sk_test_`
  - [ ] Vérifier que la clé n'est affichée qu'une fois

- [ ] 11. Test authentification avec hash
  - [ ] Copier une clé générée
  - [ ] Vérifier en DB que seul le hash est stocké
  ```sql
  SELECT "keyHash", "keyHint", "keyPrefix" FROM api_keys ORDER BY "createdAt" DESC LIMIT 1;
  ```

- [ ] 12. Test révocation
  - [ ] Révoquer une clé depuis le dashboard
  - [ ] Vérifier que `isActive = false`

- [ ] 13. Test quotas (si implémenté dans UI)
  - [ ] Créer une clé avec quota journalier
  - [ ] Vérifier l'incrémentation après usage

---

## Nettoyage (5 min)

**⚠️ ATTENTION : Faire seulement après validation complète**

- [ ] 14. Supprimer colonnes obsolètes
  ```sql
  ALTER TABLE api_keys DROP COLUMN "serviceId";
  ALTER TABLE api_keys DROP COLUMN "encryptedKey";
  ALTER TABLE api_keys DROP COLUMN "accessLevel";
  ALTER TABLE api_keys DROP COLUMN "userId";
  ALTER TABLE api_usage_logs DROP COLUMN "userId";
  ```

- [ ] 15. Ajouter contraintes
  ```sql
  ALTER TABLE api_keys ALTER COLUMN "keyHash" SET NOT NULL;
  ALTER TABLE api_keys ALTER COLUMN "orgId" SET NOT NULL;
  ALTER TABLE api_keys ADD CONSTRAINT api_keys_keyHash_unique UNIQUE("keyHash");
  ```

- [ ] 16. Supprimer tables backup
  ```sql
  DROP TABLE IF EXISTS api_keys_backup;
  DROP TABLE IF EXISTS supported_services;
  DROP TABLE IF EXISTS user_credits;
  ```

---

## Post-Migration (10 min)

- [ ] 17. Update Frontend (si nécessaire)
  - [ ] Modal "Copy API Key" lors de création
  - [ ] Formulaire avec scopes (checkboxes)
  - [ ] Affichage keyPrefix + keyHint

- [ ] 18. Documentation
  - [ ] Mettre à jour README principal
  - [ ] Documenter les nouvelles variables d'environnement

- [ ] 19. Git Commit
  ```bash
  git add .
  git commit -m "feat: Sprint 1 - Refactoring DB & Sécurité (AES → SHA-256 + Multi-org)"
  git push origin feature/migration-to-api-provider
  ```

---

## Déploiement Production

- [ ] 20. Configuration secrets
  - [ ] Ajouter `API_KEY_PEPPER` dans GitHub Secrets
  - [ ] Ou AWS Secrets Manager
  - [ ] Ou Vercel Environment Variables

- [ ] 21. CI/CD
  - [ ] Pipeline de tests automatisés
  - [ ] Smoke tests post-déploiement

- [ ] 22. Monitoring
  - [ ] Alertes sur erreurs de hash
  - [ ] Alertes sur création massive de clés

---

## Troubleshooting

### Erreur : "API_KEY_PEPPER environment variable is not set"
**Solution** :
```bash
openssl rand -base64 32
echo "API_KEY_PEPPER=<pepper>" >> .env.local
npm run dev
```

### Erreur : "Failed to decrypt API key"
**Solution** :
- Vérifier que `ENCRYPTION_KEY` est correcte
- Vérifier le format des données `encryptedKey` en DB

### Erreur : "Organisation not found"
**Solution** :
```sql
-- Vérifier clés sans org
SELECT COUNT(*) FROM api_keys WHERE "orgId" IS NULL;
-- Créer orgs et assigner (voir Étape 9)
```

---

## Rollback (Si Problème Majeur)

```bash
# Restaurer depuis backup
psql -U postgres -d key_api_manager_db < backup_YYYYMMDD_HHMMSS.sql

# Revenir au commit précédent
git reset --hard HEAD~1

# Redémarrer
npm run dev
```

---

## Validation Finale

### Critères de Succès
- ✅ Toutes les anciennes clés migrées avec succès
- ✅ Nouvelles clés générées au format `sk_live_` ou `sk_test_`
- ✅ Hash stocké en DB, pas la clé en clair
- ✅ Organisations créées pour tous les utilisateurs
- ✅ Services réels seeded (3 services)
- ✅ Tests de création/révocation passent
- ✅ Aucune régression sur l'authentification

---

## Support

**En cas de problème** :
- Consulter `docs/ai/sprint-1-execution-guide.md` (section Troubleshooting)
- Vérifier les logs : `npm run dev` (console)
- Rollback si bloqué (voir section Rollback ci-dessus)

**Contact** : Ouvrir une issue sur le repo avec :
- Message d'erreur complet
- Étape où l'erreur s'est produite
- Output du script de migration

---

**Temps Estimé Total** : 1h - 1h30  
**Bon courage !** 🚀
````

**Tool Call: Read D:\Auto_AI\Worspace\key-api-manager-bis\docs\ai\implementation-plan-api-provider.md**
Status: Completed

````
# 📋 Plan d'Implémentation - Migration vers API Provider SaaS

**Date de création** : 2025-12-09  
**Projet** : key-api-manager-bis  
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
L'équipe Key API Manager
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
# 1. Backend (key-api-manager-bis)
cd D:\Auto_AI\Worspace\key-api-manager-bis
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
````

**Tool Call: Read D:\Auto_AI\Worspace\key-api-manager-bis\docs\ai\sprint-1-summary.md**
Status: Completed

````
# Sprint 1 - Résumé d'Implémentation

**Date**: 2025-12-09  
**Agent**: Senior Fullstack Expert  
**Durée**: ~2 heures  
**Status**: ✅ Implémentation complète

---

## Objectif Atteint

Migration réussie d'un système de stockage de clés API basé sur du chiffrement AES bidirectionnel vers un système de hachage SHA-256 unidirectionnel avec support multi-organisation (B2B).

---

## Fichiers Créés

### 1. Module Crypto (Hash-based)
**`lib/crypto/api-keys.ts`**
- `generateApiKey()` - Génération de clés `sk_live_` ou `sk_test_`
- `hashApiKey()` - Hachage SHA-256 + Pepper
- `extractKeyHint()` - Extraction des 4 derniers caractères
- `maskApiKey()` - Masquage pour affichage
- `isValidApiKeyFormat()` - Validation du format

### 2. Seed Services Réels
**`drizzle/seed/real-services.ts`**
- Seed de 3 services réels : PDF (1 crédit), AI (3 crédits), Mileage (1 crédit)
- Remplace les 15 services fictifs (GitHub, AWS, etc.)

### 3. Script de Migration
**`scripts/migrate-keys-to-hash.ts`**
- Déchiffre les anciennes clés AES
- Hache avec SHA-256 + Pepper
- Mappe `accessLevel` → `scopes`
- Conserve backup dans `api_keys_backup`

### 4. Migration SQL
**`drizzle/migrations/0001_refactor_api_keys_to_hash_with_orgs.sql`**
- Création de 5 nouvelles tables (organisations, services, wallets, test_wallets, daily_stats)
- Refactoring complet des tables `api_keys` et `api_usage_logs`
- Backup automatique des données existantes

### 5. Documentation
**`docs/ai/sprint-1-refactoring-db-security.md`**
- Documentation technique complète (architecture, décisions, flux)

**`docs/ai/sprint-1-execution-guide.md`**
- Guide pas à pas pour appliquer la migration

**`docs/ai/sprint-1-summary.md`**
- Ce fichier (résumé exécutif)

### 6. Configuration
**`.env.example`**
- Documentation de toutes les variables d'environnement
- Inclut `API_KEY_PEPPER` (nouvelle variable critique)

---

## Fichiers Modifiés

### 1. Schema Drizzle
**`drizzle/schema.ts`**

**Tables ajoutées** :
- `organisations` - Organisations B2B
- `organisationMembers` - Membres avec rôles
- `services` - Services réels (simplifié)
- `wallets` - Wallet par organisation
- `testWallets` - Wallet test par utilisateur
- `dailyStats` - Statistiques quotidiennes

**Tables refactorées** :
- `apiKeys` - Nouvelles colonnes : `orgId`, `keyHash`, `keyPrefix`, `keyHint`, `scopes`, `environment`, quotas
- `apiUsageLogs` - Ajout de `orgId`, `responseTime`, `country`, `userAgent`, `details`

**Relations Drizzle** :
- 7 nouvelles relations ajoutées pour supporter les jointures ORM

### 2. Actions API Keys
**`app/actions/api-key-actions.ts`**

**Actions créées/refactorées** :
- `createApiKeyAction()` - Validation Zod, hash SHA-256, retourne clé UNE fois
- `getOrgApiKeys()` - Liste par organisation
- `revokeApiKeyAction()` - Révocation avec raison
- `deleteApiKeyAction()` - Suppression permanente (owner/admin uniquement)
- `getServicesAction()` - Liste des 3 services réels
- `getOrgUsageLogsAction()` - Historique par organisation
- `getOrgWalletAction()` - Solde du wallet
- `updateApiKeyAction()` - Modification scopes et quotas

**Actions supprimées** :
- `getDecryptedApiKey()` - Plus nécessaire (hash unidirectionnel)
- `getUserApiKeys()` - Remplacé par organisation-based
- `getUserCredits()` - Remplacé par wallet organisation

### 3. Package.json
**`package.json`**
- Ajout de `tsx` dans devDependencies
- Ajout de scripts npm :
  - `npm run seed:services`
  - `npm run migrate:keys`

### 4. README
**`README.md`**
- Section Sprint 1 ajoutée en haut
- Liens vers documentation complète
- Badges mis à jour (Next.js 16.0.7, Drizzle 0.45.0)

---

## Architecture Avant/Après

### Avant (AES Encryption)
```
User → Dashboard → CREATE KEY (manual entry)
                 → ENCRYPT with AES-256-CBC
                 → STORE encryptedKey
                 → CAN DECRYPT later
```

### Après (SHA-256 Hash)
```
User → Dashboard → GENERATE KEY (sk_live_xxx)
                 → HASH with SHA-256 + Pepper
                 → STORE keyHash
                 → SHOW key ONCE
                 → LOST FOREVER after
```

---

## Nouvelles Tables (Schema)

### `organisations`
- Multi-tenancy B2B
- Chaque org a un owner et des membres

### `organisation_members`
- Rôles : `owner`, `admin`, `developer`, `billing`
- Jointure many-to-many avec users

### `services`
- Seulement 3 services : `pdf`, `ai`, `mileage`
- Coûts : 1, 3, 1 crédits respectivement

### `wallets`
- Un wallet par organisation (pas par utilisateur)
- Champs : balance, totalPurchased, totalUsed, currency

### `test_wallets`
- Wallet test par utilisateur
- 100 crédits/mois par défaut
- Reset automatique mensuel

### `daily_stats`
- Pré-agrégation des statistiques quotidiennes
- Améliore performance des dashboards analytics

---

## Nouveaux Champs (api_keys)

### Identity
- `keyHash` : Hash SHA-256 + Pepper (UNIQUE, INDEXED)
- `keyPrefix` : "sk_live" ou "sk_test"
- `keyHint` : 4 derniers caractères (ex: "...x7Qa")

### Permissions
- `scopes` : JSONB array (ex: `["pdf:read", "ai:write"]`)
- `environment` : "production" ou "test"

### Quotas
- `dailyQuota`, `monthlyQuota` : Limites configurables
- `dailyUsed`, `monthlyUsed` : Compteurs incrémentés à chaque appel

### Tracking
- `lastUsedIp` : IP de dernière utilisation
- `revokedAt`, `revokedReason` : Audit de révocation

---

## Sécurité Améliorée

### Points Forts
1. **Hash Unidirectionnel** : Impossible de récupérer la clé en clair (même avec accès DB)
2. **Pepper** : Protection contre rainbow tables et brute-force
3. **Scopes Granulaires** : Principe du moindre privilège (une clé peut être limitée à `pdf:read` uniquement)
4. **Isolation Multi-Org** : Pas de fuite de données entre organisations
5. **Quotas Configurables** : Protection contre abus (daily/monthly limits)

### Variables Critiques
```env
API_KEY_PEPPER=<générer-avec-openssl>  # À JAMAIS commiter dans Git
```

**⚠️ Rotation du Pepper = Invalidation de toutes les clés**

---

## Performance

### Indexes Critiques Ajoutés
```sql
CREATE INDEX idx_apikeys_keyHash ON api_keys (keyHash);        -- O(1) lookup
CREATE INDEX idx_apikeys_org ON api_keys (orgId);              -- Filtrage org
CREATE INDEX idx_usage_org_time ON api_usage_logs (orgId, timestamp);
CREATE INDEX idx_usage_key_time ON api_usage_logs (apiKeyId, timestamp);
```

### Estimations
- Lookup clé API : **< 1ms** (index sur keyHash)
- Vérification scopes : **< 0.1ms** (JSONB in-memory)
- Update quotas : **< 2ms** (UPDATE single row)

---

## Prochaines Étapes (Non Implémentées)

### Frontend (UI)
- [ ] Modal "Copy API Key" lors de la création
- [ ] Formulaire de création avec scopes (checkboxes)
- [ ] Sélecteur d'organisation
- [ ] Affichage keyPrefix + keyHint au lieu de clé complète

### Backend
- [ ] Middleware d'authentification `/api/v1/*`
- [ ] Rate limiting avec Upstash Redis
- [ ] Reset quotas journaliers (CRON job)
- [ ] Agrégation `daily_stats` (CRON job)

### Organisations
- [ ] Script `create-default-orgs.ts` pour migration
- [ ] Invitation de membres (envoi email)
- [ ] Dashboard d'administration des rôles

---

## Checklist de Déploiement

### Avant Migration
- [ ] Backup DB complet (`pg_dump`)
- [ ] Vérifier que `ENCRYPTION_KEY` existe (nécessaire pour migration)
- [ ] Générer et configurer `API_KEY_PEPPER`
- [ ] Installer `tsx` : `npm install tsx --save-dev`

### Migration
- [ ] Appliquer migration SQL (`0001_refactor_api_keys_to_hash_with_orgs.sql`)
- [ ] Exécuter `npm run migrate:keys` (déchiffrement → hachage)
- [ ] Exécuter `npm run seed:services` (seed 3 services réels)
- [ ] Créer organisations par défaut (script à créer)

### Après Migration
- [ ] Tests de création de clé API
- [ ] Tests d'authentification avec hash
- [ ] Tests de révocation
- [ ] Tests de quotas

### Nettoyage (Après Validation)
- [ ] Supprimer colonnes obsolètes (serviceId, encryptedKey, accessLevel, userId)
- [ ] Ajouter contraintes NOT NULL
- [ ] Supprimer tables backup (api_keys_backup, supported_services, user_credits)

### Production
- [ ] Configurer `API_KEY_PEPPER` dans secrets manager (GitHub Secrets, AWS Secrets Manager)
- [ ] Mettre à jour documentation API
- [ ] Informer utilisateurs existants (email de notification)

---

## Métriques d'Implémentation

### Code Créé
- **5 fichiers TypeScript** : 850 lignes
- **1 migration SQL** : 250 lignes
- **3 fichiers documentation** : 1500 lignes
- **Total** : ~2600 lignes

### Temps d'Implémentation
- Setup & Analyse : 20 min
- Module crypto : 15 min
- Refactoring schema : 30 min
- Actions refactoring : 40 min
- Migration SQL : 25 min
- Documentation : 30 min
- **Total** : ~2h40

### Fichiers Impactés
- Créés : 9 fichiers
- Modifiés : 4 fichiers
- Supprimés : 0 fichier (conservation pour migration)

---

## Liens Utiles

### Documentation Complète
- [Refactoring DB & Sécurité (Technique)](./sprint-1-refactoring-db-security.md)
- [Guide d'Exécution (Pratique)](./sprint-1-execution-guide.md)

### Fichiers Critiques
- Schema : `drizzle/schema.ts`
- Actions : `app/actions/api-key-actions.ts`
- Crypto : `lib/crypto/api-keys.ts`
- Migration : `drizzle/migrations/0001_refactor_api_keys_to_hash_with_orgs.sql`

### Variables d'Environnement
- `.env.example` - Template complet

---

## Validation Finale

### Tests Unitaires à Créer
```typescript
// tests/crypto/api-keys.test.ts
describe('API Keys Crypto', () => {
  test('generateApiKey returns valid format', () => {
    const key = generateApiKey('production');
    expect(key).toMatch(/^sk_live_[A-Za-z0-9_-]{43}$/);
  });

  test('hashApiKey is deterministic', () => {
    const key = 'sk_live_test123';
    const hash1 = hashApiKey(key);
    const hash2 = hashApiKey(key);
    expect(hash1).toBe(hash2);
  });

  test('different keys produce different hashes', () => {
    const hash1 = hashApiKey('sk_live_test1');
    const hash2 = hashApiKey('sk_live_test2');
    expect(hash1).not.toBe(hash2);
  });
});
```

### Tests d'Intégration
```typescript
// tests/actions/api-key-actions.test.ts
describe('API Key Actions', () => {
  test('createApiKeyAction returns key only once', async () => {
    const result = await createApiKeyAction({
      keyName: 'Test',
      scopes: ['pdf:read'],
      environment: 'test',
      orgId: testOrgId,
    });
    
    expect(result.success).toBe(true);
    expect(result.data?.apiKey).toMatch(/^sk_test_/);
    
    // Vérifier qu'on ne peut plus récupérer la clé
    const key = await db.query.apiKeys.findFirst({
      where: eq(apiKeys.id, result.data!.keyId),
    });
    expect(key?.keyHash).toBeDefined();
    expect(key?.encryptedKey).toBeUndefined(); // Colonne supprimée
  });
});
```

---

## Notes Finales

### Points d'Attention
1. **Rotation du Pepper** : Prévoir un système de double-pepper pour rotation sans downtime
2. **Backup Réguliers** : Automatiser les backups avant toute modification de schema
3. **Monitoring** : Ajouter alertes sur création massive de clés (détection abus)

### Améliorations Futures (Hors Sprint 1)
- Clés à durée de vie limitée (expiration automatique)
- Système de webhooks (notifier sur seuil de crédits)
- 2FA obligatoire pour création de clés production
- Audit log complet (qui a créé/révoqué quelle clé, quand)

---

**Status Final** : ✅ Sprint 1 Complété avec Succès

**Prochaine Action** : Exécuter le guide de migration puis tester en local avant déploiement production.
````

## Assistant

Parfait ! Je comprends le contexte. Vous êtes en plein milieu du **Sprint 1 de la migration vers API Provider SaaS**. 

D'après les documents que j'ai lus, voici où nous en sommes :

## 📊 État Actuel

**Sprint 1** : ✅ Implémentation complète du code (terminée)
- ✅ Module crypto (hachage SHA-256)
- ✅ Schema DB refactoré
- ✅ Actions API Keys refactorées
- ✅ Scripts de migration créés
- ✅ Documentation complète

**Ce qui reste à faire** : **Exécution de la migration** (la checklist `SPRINT-1-CHECKLIST.md`)

## 🎯 Prochaines Étapes

Vous devez maintenant **appliquer physiquement** la migration en suivant la checklist. Voulez-vous que je :

1. **Lance la migration complète** en suivant le `SPRINT-1-CHECKLIST.md` ?
2. **Vérifie l'état actuel** de la DB avant de commencer ?
3. **Exécute étape par étape** avec validation entre chaque phase ?

Quelle approche préférez-vous ? 🚀

## User

ok
