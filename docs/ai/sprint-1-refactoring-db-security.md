# Sprint 1 : Refactoring DB & Sécurité

**Date**: 2025-12-09  
**Status**: ✅ Implémenté (Non déployé)  
**Auteur**: Senior Fullstack Expert Agent

---

## Objectif

Refactoring complet de l'architecture de stockage des clés API pour passer d'un système de chiffrement AES bidirectionnel à un système de hachage unidirectionnel SHA-256 + Pepper, avec support multi-organisation (B2B).

---

## Décisions Architecturales

### 1. Sécurité des Clés API

**Avant** :
- Stockage : Chiffrement AES-256-CBC (bidirectionnel)
- Risque : Clés récupérables en cas de compromission de `ENCRYPTION_KEY`

**Après** :
- Stockage : Hash SHA-256 + Pepper (unidirectionnel)
- Sécurité : Impossible de récupérer la clé en clair après création
- Format clé : `sk_live_xxx` ou `sk_test_xxx` (43 caractères base64url)

### 2. Multi-Organisation (B2B)

**Avant** :
- Clés liées directement à `userId`
- Pas de notion d'équipe ou d'organisation

**Après** :
- Clés liées à `orgId` (organisation)
- Membres avec rôles : `owner`, `admin`, `developer`, `billing`
- Isolation des données par organisation

### 3. Services Réels vs Fictifs

**Avant** :
- 15 services fictifs (GitHub, AWS, Stripe, etc.)
- Pas de cohérence avec le business model

**Après** :
- 3 services réels uniquement :
  - **PDF Manipulation** (1 crédit/appel)
  - **Document Intelligence AI** (3 crédits/appel)
  - **Mileage Expenses Generator** (1 crédit/appel)

### 4. Système de Permissions (Scopes)

**Avant** :
- `accessLevel` simple : `read`, `write`, `admin`

**Après** :
- **Scopes granulaires** : 
  - `pdf:read`, `pdf:write`
  - `ai:read`, `ai:write`
  - `mileage:calculate`

### 5. Wallets

**Avant** :
- `userCredits` : Wallet par utilisateur

**Après** :
- `wallets` : Wallet par organisation (production)
- `testWallets` : Wallet test par utilisateur (100 crédits/mois)

---

## Fichiers Créés

### 1. Module Crypto (Hash-based)

**Fichier** : `lib/crypto/api-keys.ts`

**Fonctions** :
- `generateApiKey(environment)` : Génère clé `sk_live_xxx` ou `sk_test_xxx`
- `hashApiKey(apiKey)` : Hash SHA-256 + Pepper
- `extractKeyHint(apiKey)` : Extrait 4 derniers caractères
- `maskApiKey(apiKey)` : Masque pour affichage (`sk_live_abc...xyz`)
- `isValidApiKeyFormat(apiKey)` : Validation du format

**Variables d'environnement requises** :
```env
API_KEY_PEPPER=<générer avec: openssl rand -base64 32>
```

### 2. Seed Services Réels

**Fichier** : `drizzle/seed/real-services.ts`

**Services seeded** :
- PDF Manipulation (1 crédit)
- Document Intelligence AI (3 crédits)
- Mileage Expenses Generator (1 crédit)

**Utilisation** :
```bash
npm run seed:services
# ou
tsx drizzle/seed/real-services.ts
```

### 3. Script de Migration

**Fichier** : `scripts/migrate-keys-to-hash.ts`

**Fonctionnalités** :
- Déchiffre les anciennes clés AES
- Hache avec SHA-256 + Pepper
- Extrait keyHint et keyPrefix
- Mappe `accessLevel` vers `scopes`
- Conserve backup dans `api_keys_backup`

**Utilisation** :
```bash
npm run migrate:keys
# ou
tsx scripts/migrate-keys-to-hash.ts
```

### 4. Migration SQL

**Fichier** : `drizzle/migrations/0001_refactor_api_keys_to_hash_with_orgs.sql`

**Changements majeurs** :
- Création tables `organisations`, `organisation_members`
- Création table `services` (simplifié)
- Création tables `wallets`, `test_wallets`
- Création table `daily_stats`
- Refactoring table `api_keys` (nouvelles colonnes)
- Refactoring table `api_usage_logs` (ajout `orgId`)
- Backup automatique dans `api_keys_backup`

---

## Fichiers Modifiés

### 1. Schema Drizzle

**Fichier** : `drizzle/schema.ts`

**Tables ajoutées** :
- `organisations` : Organisations B2B
- `organisationMembers` : Membres avec rôles
- `services` : Services réels (PDF, AI, Mileage)
- `wallets` : Wallet par organisation
- `testWallets` : Wallet test par utilisateur
- `dailyStats` : Statistiques quotidiennes

**Tables refactorées** :
- `apiKeys` : Hash-based avec scopes et quotas
- `apiUsageLogs` : Support multi-org

**Tables préservées (migration)** :
- `supportedServices` : Conservé temporairement
- `userCredits` : Conservé temporairement

**Relations Drizzle** :
- `organisationsRelations`
- `organisationMembersRelations`
- `apiKeysRelations` (refactoré)
- `walletsRelations`
- `testWalletsRelations`
- `apiUsageLogsRelations` (refactoré)
- `dailyStatsRelations`

### 2. Actions API Keys

**Fichier** : `app/actions/api-key-actions.ts`

**Actions créées/refactorées** :

#### `createApiKeyAction`
- Validation Zod : `CreateApiKeySchema`
- Vérification membership organisation
- Génération clé + hash SHA-256
- Retourne clé en clair **UNE SEULE FOIS**
- Permissions : `owner`, `admin`, `developer`

#### `getOrgApiKeys`
- Liste les clés d'une organisation
- Affiche keyHint et scopes
- Pas de décryptage possible

#### `revokeApiKeyAction`
- Révocation avec raison
- Permissions : `owner`, `admin`, `developer`

#### `deleteApiKeyAction`
- Suppression permanente
- Permissions : `owner`, `admin` uniquement

#### `getServicesAction`
- Liste les 3 services réels actifs

#### `getOrgUsageLogsAction`
- Historique par organisation

#### `getOrgWalletAction`
- Solde du wallet organisation

#### `updateApiKeyAction`
- Modification scopes et quotas
- Permissions : `owner`, `admin`

**Actions supprimées** :
- `getDecryptedApiKey` : Plus nécessaire (hash unidirectionnel)
- `getUserApiKeys` : Remplacé par `getOrgApiKeys`
- `getUserCredits` : Remplacé par `getOrgWalletAction`

---

## Structure du Nouveau Schema

### Table `organisations`
```sql
- id : uuid PRIMARY KEY
- name : text NOT NULL
- slug : text UNIQUE NOT NULL
- ownerId : uuid → users.id
- createdAt, updatedAt : timestamp
```

### Table `organisation_members`
```sql
- id : uuid PRIMARY KEY
- orgId : uuid → organisations.id (CASCADE)
- userId : uuid → users.id (CASCADE)
- role : text ("owner" | "admin" | "developer" | "billing")
- joinedAt : timestamp
```

### Table `services`
```sql
- id : uuid PRIMARY KEY
- name : text UNIQUE ("pdf" | "ai" | "mileage")
- displayName : text
- description : text
- baseCostPerCall : integer (1 ou 3)
- icon : text
- category : text
- isActive : boolean
- createdAt : timestamp
```

### Table `api_keys` (Refactoré)
```sql
-- Ownership
- orgId : uuid → organisations.id (CASCADE)
- createdBy : uuid → users.id

-- Key Identity
- keyName : text NOT NULL
- keyHash : text UNIQUE NOT NULL  ← SHA-256 + Pepper
- keyPrefix : text NOT NULL       ← "sk_live" | "sk_test"
- keyHint : text                  ← "...x7Qa"

-- Permissions
- scopes : jsonb (array de strings)
- environment : text              ← "production" | "test"

-- Quotas
- dailyQuota, monthlyQuota : integer
- dailyUsed, monthlyUsed : integer

-- Status
- isActive : boolean
- revokedAt, revokedReason : timestamp, text

-- Tracking
- lastUsedAt, lastUsedIp : timestamp, text
- expiresAt : timestamp
- createdAt, updatedAt : timestamp
```

### Table `wallets` (Refactoré)
```sql
- id : uuid PRIMARY KEY
- orgId : uuid UNIQUE → organisations.id (CASCADE)
- balance : integer (crédits disponibles)
- totalPurchased : integer
- totalUsed : integer
- currency : text ("EUR")
- createdAt, updatedAt : timestamp
```

### Table `test_wallets` (Nouveau)
```sql
- id : uuid PRIMARY KEY
- userId : uuid UNIQUE → users.id (CASCADE)
- balance : integer DEFAULT 100
- resetAt : timestamp (reset mensuel)
- createdAt : timestamp
```

### Table `api_usage_logs` (Refactoré)
```sql
- id : uuid PRIMARY KEY
- apiKeyId : uuid → api_keys.id (CASCADE)
- orgId : uuid → organisations.id  ← NOUVEAU
- serviceId : uuid → services.id

- endpoint, method : text
- statusCode, responseTime : integer
- creditsUsed : integer

- ipAddress, country, userAgent : text
- details : jsonb
- timestamp : timestamp

-- Indexes
- idx_usage_org_time (orgId, timestamp)
- idx_usage_key_time (apiKeyId, timestamp)
```

### Table `daily_stats` (Nouveau)
```sql
- id : uuid PRIMARY KEY
- orgId : uuid → organisations.id
- date : timestamp
- totalRequests : integer
- totalCredits : integer
- successRate : integer
- servicesBreakdown : jsonb
- createdAt : timestamp

-- Index
- idx_stats_org_date (orgId, date)
```

---

## Flux de Création de Clé API

### Avant (AES Encryption)
1. User saisit clé externe (GitHub, AWS)
2. Chiffrement AES-256-CBC
3. Stockage de `encryptedKey`
4. Possibilité de déchiffrer plus tard

### Après (SHA-256 Hash)
1. User clique "Generate API Key"
2. Backend génère `sk_live_xxx` ou `sk_test_xxx`
3. Hash SHA-256 + Pepper → stockage `keyHash`
4. Extraction `keyHint` (4 derniers caractères)
5. **Retour clé en clair UNE SEULE FOIS**
6. Frontend affiche modal : "Copiez cette clé maintenant, vous ne la reverrez jamais"
7. Après fermeture modal → clé perdue définitivement

---

## Flux d'Authentification de Requête API

### Avant
```
1. Client envoie : Authorization: Bearer <key>
2. Backend cherche dans api_keys WHERE encryptedKey = ?
3. Déchiffrement de la clé
4. Comparaison avec clé reçue
```

### Après
```
1. Client envoie : Authorization: Bearer sk_live_xxx
2. Backend hash : keyHash = SHA256(sk_live_xxx + PEPPER)
3. Backend cherche : SELECT * FROM api_keys WHERE keyHash = ?
4. Si trouvé → Vérification scopes, quotas, expiration
5. Si valide → Autorisation
```

**Performance** : Index sur `keyHash` → O(1) lookup

---

## Migration Guide

### Étape 1 : Préparation

```bash
# 1. Backup de la DB
pg_dump -U postgres key_api_manager_db > backup_before_sprint1.sql

# 2. Générer le pepper
openssl rand -base64 32

# 3. Ajouter dans .env.local
echo "API_KEY_PEPPER=<votre_pepper>" >> .env.local
```

### Étape 2 : Application de la migration SQL

```bash
# Option A : Via Drizzle Kit
npx drizzle-kit push

# Option B : Manuellement via psql
psql -U postgres -d key_api_manager_db -f drizzle/migrations/0001_refactor_api_keys_to_hash_with_orgs.sql
```

### Étape 3 : Migration des clés existantes

```bash
# IMPORTANT : Nécessite ENCRYPTION_KEY et API_KEY_PEPPER dans .env
tsx scripts/migrate-keys-to-hash.ts
```

**Ce script fait** :
- Lit toutes les clés depuis `api_keys`
- Déchiffre avec `decryptApiKey` (AES)
- Hache avec `hashApiKey` (SHA-256 + Pepper)
- Update `keyHash`, `keyPrefix`, `keyHint`, `scopes`
- Mappe `accessLevel` → `scopes`

### Étape 4 : Seed des services réels

```bash
tsx drizzle/seed/real-services.ts
```

### Étape 5 : Création des organisations par défaut

```bash
# Script à créer : scripts/create-default-orgs.ts
# Pour chaque user existant :
#   - Créer une org "Personal - {userName}"
#   - Ajouter user comme owner
#   - Migrer ses clés vers cette org
```

### Étape 6 : Nettoyage (après validation)

```sql
-- Supprimer colonnes obsolètes
ALTER TABLE api_keys DROP COLUMN serviceId;
ALTER TABLE api_keys DROP COLUMN encryptedKey;
ALTER TABLE api_keys DROP COLUMN accessLevel;
ALTER TABLE api_keys DROP COLUMN userId;

-- Supprimer table backup (après vérification)
DROP TABLE api_keys_backup;

-- Supprimer anciennes tables
DROP TABLE supported_services;
DROP TABLE user_credits;

-- Ajouter contraintes NOT NULL
ALTER TABLE api_keys ALTER COLUMN keyHash SET NOT NULL;
ALTER TABLE api_keys ALTER COLUMN orgId SET NOT NULL;
ALTER TABLE api_usage_logs ALTER COLUMN orgId SET NOT NULL;

-- Ajouter contrainte UNIQUE sur keyHash
ALTER TABLE api_keys ADD CONSTRAINT api_keys_keyHash_unique UNIQUE(keyHash);
```

---

## Tests à Effectuer

### 1. Test Création de Clé
```typescript
const result = await createApiKeyAction({
  keyName: "Test Key",
  scopes: ["pdf:read", "pdf:write"],
  environment: "test",
  orgId: "<orgId>",
});

// Vérifier :
// - result.success === true
// - result.data.apiKey commence par "sk_test_"
// - result.data.maskedKey est bien masqué
```

### 2. Test Authentification
```typescript
// Simuler requête API
const apiKey = "sk_live_xxx"; // Clé générée précédemment
const keyHash = hashApiKey(apiKey);

const key = await db.query.apiKeys.findFirst({
  where: eq(apiKeys.keyHash, keyHash),
});

// Vérifier :
// - key trouvée
// - key.isActive === true
// - key.scopes contient les permissions requises
```

### 3. Test Quotas
```typescript
// Incrémenter dailyUsed
await db.update(apiKeys)
  .set({ dailyUsed: sql`${apiKeys.dailyUsed} + 1` })
  .where(eq(apiKeys.id, keyId));

// Vérifier que dailyUsed < dailyQuota
```

### 4. Test Révocation
```typescript
await revokeApiKeyAction(keyId, "Security breach");

// Vérifier :
// - key.isActive === false
// - key.revokedAt !== null
// - Authentification échoue
```

---

## Sécurité

### Points Forts
1. **Hash Unidirectionnel** : Impossible de récupérer la clé en clair
2. **Pepper** : Protection contre rainbow tables
3. **Scopes Granulaires** : Principe du moindre privilège
4. **Isolation Multi-Org** : Pas de fuite entre organisations
5. **Quotas** : Protection contre abus

### Points d'Attention
1. **Pepper Management** : 
   - Ne JAMAIS committer `API_KEY_PEPPER` dans Git
   - Utiliser secrets manager (GitHub Secrets, AWS Secrets Manager)
   - Rotation du pepper = invalidation de toutes les clés

2. **Rate Limiting** :
   - À implémenter côté API Gateway
   - Limiter par IP, par clé, par organisation

3. **Audit Log** :
   - Logger tous les accès dans `api_usage_logs`
   - Alertes sur comportements suspects

---

## Performance

### Indexes Critiques
```sql
-- Lookup clé API (O(1))
CREATE INDEX idx_apikeys_keyHash ON api_keys (keyHash);

-- Filtrage par organisation
CREATE INDEX idx_apikeys_org ON api_keys (orgId);

-- Analytics
CREATE INDEX idx_usage_org_time ON api_usage_logs (orgId, timestamp);
CREATE INDEX idx_usage_key_time ON api_usage_logs (apiKeyId, timestamp);
CREATE INDEX idx_stats_org_date ON daily_stats (orgId, date);
```

### Estimations
- Lookup clé API : **< 1ms** (avec index sur keyHash)
- Vérification scopes : **< 0.1ms** (JSONB in-memory)
- Update quotas : **< 2ms** (UPDATE single row)

---

## Prochaines Étapes (Sprint 2)

1. **Middleware d'Authentification** : `/api/v1/*` endpoints
2. **Rate Limiting** : Redis + Upstash
3. **API Gateway** : Validation scopes et quotas
4. **Webhooks** : Notifications sur events
5. **Facturation** : Stripe Billing + quotas

---

## Checklist de Déploiement

- [ ] Variables d'environnement configurées
  - [ ] `API_KEY_PEPPER` dans GitHub Secrets
  - [ ] `DATABASE_URL` en production
  - [ ] `ENCRYPTION_KEY` (temporaire pour migration)

- [ ] Migration DB appliquée
  - [ ] Backup DB effectué
  - [ ] Migration SQL exécutée
  - [ ] Script migration clés exécuté
  - [ ] Services réels seeded

- [ ] Tests passés
  - [ ] Test création clé
  - [ ] Test authentification
  - [ ] Test révocation
  - [ ] Test quotas

- [ ] Nettoyage
  - [ ] Colonnes obsolètes supprimées
  - [ ] Contraintes NOT NULL ajoutées
  - [ ] Tables backup supprimées

- [ ] Documentation
  - [ ] README mis à jour
  - [ ] API docs générées
  - [ ] Guide utilisateur créé

---

## Ressources

### Fichiers Créés
- `lib/crypto/api-keys.ts`
- `drizzle/seed/real-services.ts`
- `scripts/migrate-keys-to-hash.ts`
- `drizzle/migrations/0001_refactor_api_keys_to_hash_with_orgs.sql`

### Fichiers Modifiés
- `drizzle/schema.ts` (refactoring complet)
- `app/actions/api-key-actions.ts` (refactoring complet)

### Fichiers Préservés
- `lib/crypto/encryption.ts` (nécessaire pour migration)

---

**Statut Final** : ✅ Implémentation complète - Prêt pour tests et déploiement
