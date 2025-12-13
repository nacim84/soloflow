# Sprint 1 - Guide d'Exécution

**Date**: 2025-12-09  
**Sprint**: Refactoring DB & Sécurité  
**Durée estimée**: 1-2 heures

---

## Vue d'Ensemble

Ce guide vous accompagne pas à pas pour appliquer le refactoring complet de l'architecture de stockage des clés API.

**Changements majeurs** :
- Migration AES → SHA-256 + Pepper
- Support multi-organisation (B2B)
- 3 services réels au lieu de 15 fictifs
- Scopes granulaires au lieu de simples access levels

---

## Prérequis

### 1. Backup de la Base de Données

```bash
# PostgreSQL local
pg_dump -U postgres key_api_manager_db > backup_$(date +%Y%m%d_%H%M%S).sql

# Docker (si applicable)
docker exec -t key-api-manager-postgres pg_dump -U postgres key_api_manager_db > backup_$(date +%Y%m%d_%H%M%S).sql
```

### 2. Vérifier les Variables d'Environnement Existantes

```bash
# Vérifier que ENCRYPTION_KEY existe (nécessaire pour migration)
grep ENCRYPTION_KEY .env.local

# Si absent, générer :
openssl rand -base64 32
```

### 3. Générer le Nouveau Pepper

```bash
openssl rand -base64 32
```

**Sortie exemple** :
```
xK9mP4vL2wQ8nR5tY7uI3oA1sD6fG9hJ0kZ4cV8bN2mX5
```

### 4. Ajouter dans `.env.local`

```env
# Ancienne clé (nécessaire pour migration uniquement)
ENCRYPTION_KEY=<votre_clé_existante>

# Nouvelle clé (GARDER SECRET)
API_KEY_PEPPER=xK9mP4vL2wQ8nR5tY7uI3oA1sD6fG9hJ0kZ4cV8bN2mX5
```

---

## Étape 1 : Vérification de l'Implémentation

Tous les fichiers ont été créés/modifiés par l'agent. Vérifiez leur présence :

```bash
# Fichiers créés
ls -la lib/crypto/api-keys.ts
ls -la drizzle/seed/real-services.ts
ls -la scripts/migrate-keys-to-hash.ts
ls -la drizzle/migrations/0001_refactor_api_keys_to_hash_with_orgs.sql

# Fichiers modifiés
ls -la drizzle/schema.ts
ls -la app/actions/api-key-actions.ts
```

**Tous les fichiers doivent être présents.**

---

## Étape 2 : Application de la Migration SQL

### Option A : Via Drizzle Kit (Recommandé)

```bash
# Générer la migration (si pas déjà fait)
npx drizzle-kit generate --name refactor_api_keys_to_hash_with_orgs

# Appliquer sur la DB
npx drizzle-kit push
```

**Attention** : Si Drizzle Kit pose des questions interactives, répondez :
- `stripeCustomerId` → **create column**
- `stripeSubscriptionId` → **create column**

### Option B : Application Manuelle via psql

```bash
# Local
psql -U postgres -d key_api_manager_db -f drizzle/migrations/0001_refactor_api_keys_to_hash_with_orgs.sql

# Docker
docker exec -i key-api-manager-postgres psql -U postgres -d key_api_manager_db < drizzle/migrations/0001_refactor_api_keys_to_hash_with_orgs.sql
```

**Vérification** :
```sql
-- Vérifier que les nouvelles tables existent
\dt organisations
\dt services
\dt wallets
\dt test_wallets
\dt daily_stats

-- Vérifier que api_keys a les nouvelles colonnes
\d api_keys
-- Doit afficher : orgId, keyHash, keyPrefix, keyHint, scopes, environment, etc.
```

---

## Étape 3 : Migration des Clés Existantes

Ce script va déchiffrer les anciennes clés AES et les ré-hasher en SHA-256.

```bash
# Vérifier que les variables d'environnement sont présentes
echo $ENCRYPTION_KEY
echo $API_KEY_PEPPER

# Exécuter le script de migration
npm run migrate:keys

# OU directement avec tsx
tsx scripts/migrate-keys-to-hash.ts
```

**Sortie attendue** :
```
🔄 Starting key migration from AES encryption to SHA-256 hash...

Found 5 keys to migrate

✓ Migrated key: Production Key (sk_live)
✓ Migrated key: Test Key (sk_test)
✓ Migrated key: GitHub API (sk_live)
✓ Migrated key: AWS Access (sk_live)
✓ Migrated key: Stripe Secret (sk_live)

✅ Migration complete!
   Success: 5
   Errors: 0

✅ Migration script completed successfully
```

**En cas d'erreur** :
- Vérifier que `ENCRYPTION_KEY` est correcte
- Vérifier que `API_KEY_PEPPER` est défini
- Vérifier que la migration SQL a été appliquée

---

## Étape 4 : Seed des Services Réels

```bash
# Exécuter le seed
npm run seed:services

# OU directement avec tsx
tsx drizzle/seed/real-services.ts
```

**Sortie attendue** :
```
🌱 Seeding real services...
  ✓ PDF Manipulation
  ✓ Document Intelligence AI
  ✓ Mileage Expenses Generator

✅ Successfully seeded 3 services!
```

**Vérification en DB** :
```sql
SELECT * FROM services;
```

**Résultat attendu** :
```
| id   | name    | displayName                 | baseCostPerCall | category  |
|------|---------|-----------------------------|-----------------|-----------|
| uuid | pdf     | PDF Manipulation            | 1               | document  |
| uuid | ai      | Document Intelligence AI    | 3               | ai        |
| uuid | mileage | Mileage Expenses Generator  | 1               | finance   |
```

---

## Étape 5 : Création des Organisations par Défaut

**IMPORTANT** : Ce script n'a pas été créé automatiquement. Vous devez le créer manuellement ou migrer les clés vers des orgs existantes.

### Option A : Script Automatisé (À créer)

Créez `scripts/create-default-orgs.ts` :

```typescript
import { db } from '@/drizzle/db';
import { users, organisations, organisationMembers, apiKeys } from '@/drizzle/schema';
import { eq } from 'drizzle-orm';

async function createDefaultOrgs() {
  const allUsers = await db.select().from(users);

  for (const user of allUsers) {
    // Créer organisation "Personal - {userName}"
    const [org] = await db.insert(organisations).values({
      name: `Personal - ${user.name}`,
      slug: `personal-${user.id.slice(0, 8)}`,
      ownerId: user.id,
    }).returning();

    // Ajouter user comme owner
    await db.insert(organisationMembers).values({
      orgId: org.id,
      userId: user.id,
      role: 'owner',
    });

    // Migrer les clés de l'utilisateur vers cette org
    await db.update(apiKeys)
      .set({ orgId: org.id })
      .where(eq(apiKeys.userId, user.id));

    console.log(`✓ Created org for ${user.name}: ${org.name}`);
  }
}
```

Puis exécutez :
```bash
tsx scripts/create-default-orgs.ts
```

### Option B : Manuellement via SQL

```sql
-- Pour chaque utilisateur, créer une org personnelle
INSERT INTO organisations (name, slug, "ownerId")
VALUES 
  ('Personal - John Doe', 'personal-john-doe', '<userId>');

-- Ajouter l'utilisateur comme owner
INSERT INTO organisation_members ("orgId", "userId", role)
VALUES ('<orgId>', '<userId>', 'owner');

-- Migrer les clés
UPDATE api_keys 
SET "orgId" = '<orgId>' 
WHERE "userId" = '<userId>';
```

---

## Étape 6 : Tests de Vérification

### Test 1 : Création de Clé API

```bash
# Dans votre console Next.js dev ou via test unitaire
npm run dev
```

**Frontend** : Créer une nouvelle clé via l'interface

**Ou via test** :
```typescript
import { createApiKeyAction } from '@/app/actions/api-key-actions';

const result = await createApiKeyAction({
  keyName: "Test Sprint 1",
  scopes: ["pdf:read", "pdf:write"],
  environment: "test",
  orgId: "<votre_orgId>",
});

console.log(result);
// Vérifier :
// - result.success === true
// - result.data.apiKey commence par "sk_test_"
```

### Test 2 : Authentification avec Hash

```typescript
import { hashApiKey } from '@/lib/crypto/api-keys';
import { db } from '@/drizzle/db';
import { apiKeys } from '@/drizzle/schema';
import { eq } from 'drizzle-orm';

// Simuler authentification
const clientApiKey = "sk_test_xxx"; // Clé générée précédemment
const keyHash = hashApiKey(clientApiKey);

const key = await db.query.apiKeys.findFirst({
  where: eq(apiKeys.keyHash, keyHash),
});

console.log("Key found:", key ? "✅" : "❌");
console.log("Is active:", key?.isActive);
console.log("Scopes:", key?.scopes);
```

### Test 3 : Vérification des Quotas

```sql
-- Vérifier qu'une clé a des quotas
SELECT 
  "keyName",
  "dailyQuota",
  "dailyUsed",
  "monthlyQuota",
  "monthlyUsed"
FROM api_keys
WHERE "keyName" = 'Test Sprint 1';
```

### Test 4 : Révocation

```typescript
import { revokeApiKeyAction } from '@/app/actions/api-key-actions';

const result = await revokeApiKeyAction("<keyId>", "Test révocation");
console.log("Revoked:", result.success);
```

---

## Étape 7 : Nettoyage (Après Validation Complète)

**⚠️ ATTENTION** : Ne faites ceci qu'après avoir VÉRIFIÉ que tout fonctionne !

```sql
-- 1. Supprimer colonnes obsolètes de api_keys
ALTER TABLE api_keys DROP COLUMN IF EXISTS "serviceId";
ALTER TABLE api_keys DROP COLUMN IF EXISTS "encryptedKey";
ALTER TABLE api_keys DROP COLUMN IF EXISTS "accessLevel";
ALTER TABLE api_keys DROP COLUMN IF EXISTS "userId";

-- 2. Supprimer colonnes obsolètes de api_usage_logs
ALTER TABLE api_usage_logs DROP COLUMN IF EXISTS "userId";

-- 3. Ajouter contraintes NOT NULL
ALTER TABLE api_keys ALTER COLUMN "keyHash" SET NOT NULL;
ALTER TABLE api_keys ALTER COLUMN "orgId" SET NOT NULL;
ALTER TABLE api_usage_logs ALTER COLUMN "orgId" SET NOT NULL;

-- 4. Ajouter contrainte UNIQUE sur keyHash
ALTER TABLE api_keys ADD CONSTRAINT api_keys_keyHash_unique UNIQUE("keyHash");

-- 5. Supprimer table backup (après vérification)
DROP TABLE IF EXISTS api_keys_backup;

-- 6. Supprimer anciennes tables
DROP TABLE IF EXISTS supported_services;
DROP TABLE IF EXISTS user_credits;
```

---

## Étape 8 : Update Frontend (Si Nécessaire)

### Composants à Mettre à Jour

1. **Page de gestion des clés** : `/app/(dashboard)/keys/page.tsx`
   - Utiliser `getOrgApiKeys` au lieu de `getUserApiKeys`
   - Afficher `keyPrefix` et `keyHint` au lieu de la clé complète
   - Ajouter modal "Copy Key" lors de la création

2. **Formulaire de création** :
   - Remplacer "Service" par "Scopes" (checkboxes)
   - Ajouter sélecteur "Environment" (production/test)
   - Ajouter champs optionnels "Daily Quota", "Monthly Quota"

3. **Modal de confirmation** (nouveau) :
   ```tsx
   <Dialog>
     <DialogContent>
       <DialogTitle>⚠️ Copiez votre clé API maintenant</DialogTitle>
       <DialogDescription>
         Cette clé ne sera plus jamais affichée. Copiez-la dans un endroit sûr.
       </DialogDescription>
       <Input value={apiKey} readOnly />
       <Button onClick={copyToClipboard}>Copier</Button>
     </DialogContent>
   </Dialog>
   ```

---

## Checklist Finale

### Migration DB
- [ ] Backup DB effectué
- [ ] Variables d'environnement configurées (ENCRYPTION_KEY + API_KEY_PEPPER)
- [ ] Migration SQL appliquée (`0001_refactor_api_keys_to_hash_with_orgs.sql`)
- [ ] Script migration clés exécuté (`migrate-keys-to-hash.ts`)
- [ ] Services réels seeded (`real-services.ts`)
- [ ] Organisations créées pour utilisateurs existants

### Tests
- [ ] Test création de clé API
- [ ] Test authentification avec hash
- [ ] Test révocation de clé
- [ ] Test quotas journaliers/mensuels
- [ ] Test isolation multi-org (user A ne voit pas clés de org B)

### Nettoyage
- [ ] Colonnes obsolètes supprimées
- [ ] Contraintes NOT NULL ajoutées
- [ ] Contrainte UNIQUE sur keyHash ajoutée
- [ ] Tables backup supprimées

### Frontend
- [ ] Formulaire création clé mis à jour (scopes, environment)
- [ ] Modal "Copy Key" implémenté
- [ ] Liste des clés affiche keyPrefix et keyHint
- [ ] Sélecteur d'organisation ajouté (si multi-org)

### Documentation
- [ ] README principal mis à jour
- [ ] Guide migration documenté
- [ ] Variables d'environnement documentées

---

## Rollback en Cas de Problème

### Si migration échoue AVANT nettoyage

```sql
-- 1. Restaurer depuis backup
psql -U postgres -d key_api_manager_db < backup_YYYYMMDD_HHMMSS.sql

-- 2. Supprimer nouvelles tables
DROP TABLE IF EXISTS organisations CASCADE;
DROP TABLE IF EXISTS organisation_members CASCADE;
DROP TABLE IF EXISTS services CASCADE;
DROP TABLE IF EXISTS wallets CASCADE;
DROP TABLE IF EXISTS test_wallets CASCADE;
DROP TABLE IF EXISTS daily_stats CASCADE;

-- 3. Restaurer colonnes api_keys (si modifiées)
-- Vérifier le dump SQL pour récréer structure originale
```

### Si migration échoue APRÈS nettoyage

```sql
-- Restauration complète depuis backup
DROP DATABASE key_api_manager_db;
CREATE DATABASE key_api_manager_db;
psql -U postgres -d key_api_manager_db < backup_YYYYMMDD_HHMMSS.sql
```

---

## Support & Troubleshooting

### Erreur : "API_KEY_PEPPER environment variable is not set"

**Cause** : Variable d'environnement manquante

**Solution** :
```bash
# Générer pepper
openssl rand -base64 32

# Ajouter dans .env.local
echo "API_KEY_PEPPER=<pepper_généré>" >> .env.local

# Redémarrer le serveur
npm run dev
```

### Erreur : "Failed to decrypt API key"

**Cause** : ENCRYPTION_KEY incorrecte ou clé corrompue

**Solution** :
- Vérifier que ENCRYPTION_KEY correspond à celle utilisée pour chiffrer
- Vérifier que la colonne `encryptedKey` contient bien le format `salt:iv:data`

### Erreur : "Organisation not found"

**Cause** : Clés API migrées mais pas d'organisation assignée

**Solution** :
```sql
-- Vérifier clés sans org
SELECT COUNT(*) FROM api_keys WHERE "orgId" IS NULL;

-- Créer org et assigner
-- (voir Étape 5 - Option B)
```

---

## Prochaines Étapes (Sprint 2)

Une fois Sprint 1 validé et déployé :

1. **API Gateway** : Middleware d'authentification `/api/v1/*`
2. **Rate Limiting** : Redis + Upstash
3. **Quotas Réactifs** : Reset quotas journaliers (CRON)
4. **Dashboard Analytics** : Utiliser `daily_stats`
5. **Facturation Stripe** : Achat de crédits

---

**Bon courage ! En cas de problème, consulter la documentation complète dans `docs/ai/sprint-1-refactoring-db-security.md`**
