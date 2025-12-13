# Sprint 1 - Plan d'Action Consolidé

**Date**: 2025-12-10
**Branche**: feature/sprint-1-execution
**Orchestrateur**: EPCT Workflow

---

## 📋 Résumé Exécutif

**État actuel** : ✅ Infrastructure complète (migrations, schema, actions, crypto)
**Problème critique** : ⚠️ Utilisateurs non liés aux organisations (0 members)
**Objectif** : Finaliser le Sprint 1 avec tests complets et commit propre

**Temps estimé total** : 1h30 - 2h

---

## 🎯 Phases d'Exécution

### PHASE 1 : Correction Critique (15 min) 🚨

#### Problème
- 4 utilisateurs existent
- 1 organisation par défaut existe
- **0 membres d'organisation** → Les users ne peuvent pas créer de clés API

#### Solution
**Exécuter le script de création d'organisations par défaut**

```bash
tsx scripts/create-default-orgs.ts
```

**Ce que fait ce script** :
1. ✅ Pour chaque utilisateur existant :
   - Vérifie si une organisation existe déjà
   - Crée une organisation personnelle : `{email}'s Organization`
   - Ajoute l'utilisateur comme membre `owner`
   - Crée un `wallet` pour l'organisation (0 crédits)
   - Crée un `test_wallet` pour l'utilisateur (100 crédits)

**Vérification post-exécution** :
```bash
# Via Docker
docker exec key-api-manager-postgres psql -U postgres -d key_api_manager_db -c "
SELECT
  COUNT(DISTINCT om.\"userId\") as users_with_membership,
  COUNT(*) as total_memberships
FROM organisation_members om;
"

# Résultat attendu : users_with_membership = 4, total_memberships >= 4
```

**Critères de succès** :
- [ ] Script s'exécute sans erreur
- [ ] `organisation_members` contient 4+ lignes
- [ ] Tous les utilisateurs ont au moins 1 organisation
- [ ] Chaque organisation a un wallet
- [ ] Chaque utilisateur a un test_wallet

---

### PHASE 2 : Tests Fonctionnels (30 min) ✅

#### 2.1 Démarrage du Serveur
```bash
npm run dev
```

**Vérifications** :
- [ ] Serveur démarre sans erreur sur http://localhost:3000
- [ ] Pas d'erreurs dans la console
- [ ] Connexion à la DB réussie

---

#### 2.2 Test Authentification Utilisateur
**Actions** :
1. Ouvrir http://localhost:3000
2. Se connecter avec un compte existant
3. Vérifier accès au dashboard

**Critères de succès** :
- [ ] Connexion réussie
- [ ] Session créée correctement
- [ ] Dashboard accessible

---

#### 2.3 Test Création de Clé API (CRITIQUE)
**Actions** :
1. Naviguer vers la page de gestion des clés API
2. Cliquer sur "Create API Key" ou équivalent
3. Remplir le formulaire :
   - Nom : "Test Key Sprint 1"
   - Environment : "test"
   - Scopes : ["pdf:read", "pdf:write"]
4. Soumettre le formulaire

**Résultat attendu** :
- [ ] Modal affichant la clé générée : `sk_test_XXXXXXXXXXXXXXXXXXXXXXX` (43 caractères)
- [ ] Message : "Copy this key now, you will never see it again"
- [ ] Bouton "Copy to Clipboard"
- [ ] La clé est copiable

**⚠️ IMPORTANT** : Copier la clé quelque part (Notepad) pour le test suivant

---

#### 2.4 Vérification en Base de Données
```bash
docker exec key-api-manager-postgres psql -U postgres -d key_api_manager_db -c "
SELECT
  \"keyName\",
  \"keyPrefix\",
  \"keyHint\",
  scopes,
  environment,
  \"isActive\",
  \"createdAt\"
FROM api_keys
ORDER BY \"createdAt\" DESC
LIMIT 1;
"
```

**Résultat attendu** :
```
    keyName     | keyPrefix | keyHint |          scopes           | environment | isActive
-----------------+-----------+---------+---------------------------+-------------+----------
 Test Key Sprint | sk_test   | ...xyz  | ["pdf:read","pdf:write"]  |    test     |    t
```

**Critères de succès** :
- [ ] Clé créée avec `keyPrefix = "sk_test"`
- [ ] `keyHint` contient 4 derniers caractères
- [ ] `scopes` contient les permissions sélectionnées
- [ ] `environment = "test"`
- [ ] `isActive = true`
- [ ] **PAS de colonne `encryptedKey`** (supprimée)
- [ ] **SEULEMENT `keyHash`** stocké

---

#### 2.5 Test Authentification avec la Clé API
**Méthode 1 : Via Actions Drizzle**

Créer un fichier temporaire `test-api-key.ts` :
```typescript
import { db } from "@/drizzle/db";
import { apiKeys } from "@/drizzle/schema";
import { eq } from "drizzle-orm";
import { hashApiKey } from "@/lib/crypto/api-keys";

const testKey = "sk_test_VOTRE_CLE_COPIEE"; // ⚠️ Remplacer
const hashedKey = hashApiKey(testKey);

const result = await db.query.apiKeys.findFirst({
  where: eq(apiKeys.keyHash, hashedKey),
});

console.log("✅ Key found:", result ? "YES" : "NO");
console.log("Key details:", result);
```

Exécuter :
```bash
tsx test-api-key.ts
```

**Résultat attendu** :
```
✅ Key found: YES
Key details: {
  keyName: 'Test Key Sprint 1',
  keyHash: '...',
  isActive: true,
  ...
}
```

**Critères de succès** :
- [ ] Clé trouvée via hash
- [ ] `isActive = true`
- [ ] Scopes corrects

---

#### 2.6 Test Révocation de Clé
**Actions** :
1. Depuis le dashboard, sélectionner la clé créée
2. Cliquer sur "Revoke" ou équivalent
3. Entrer une raison : "Test de révocation Sprint 1"
4. Confirmer

**Vérification en DB** :
```sql
SELECT
  \"keyName\",
  \"isActive\",
  \"revokedAt\",
  \"revokedReason\"
FROM api_keys
WHERE \"keyName\" = 'Test Key Sprint 1';
```

**Résultat attendu** :
```
    keyName     | isActive |      revokedAt      |       revokedReason
-----------------+----------+---------------------+---------------------------
 Test Key Sprint |    f     | 2025-12-10 10:30:00 | Test de révocation Sprint 1
```

**Critères de succès** :
- [ ] `isActive = false`
- [ ] `revokedAt` rempli
- [ ] `revokedReason` contient le texte saisi

**Test d'authentification après révocation** :
- Relancer le script `test-api-key.ts`
- **Résultat attendu** : Clé trouvée MAIS `isActive = false` → authentification REFUSÉE

---

#### 2.7 Test Quotas (Si UI existe)
**Actions** :
1. Créer une nouvelle clé avec quotas :
   - Daily Quota : 10
   - Monthly Quota : 100
2. Simuler plusieurs appels API

**Vérification** :
```sql
SELECT \"keyName\", \"dailyQuota\", \"dailyUsed\", \"monthlyQuota\", \"monthlyUsed\"
FROM api_keys
WHERE \"keyName\" = 'Test Quota Key';
```

**Résultat attendu** :
- `dailyUsed` et `monthlyUsed` s'incrémentent correctement

---

### PHASE 3 : Audit Frontend (20 min) 🎨

#### 3.1 Vérifier l'UI de Création de Clés
**Fichiers à analyser** :
```bash
# Chercher les composants de création de clés
grep -r "createApiKeyAction" app/
grep -r "CreateApiKey" app/
grep -r "sk_live\|sk_test" app/
```

**Points à vérifier** :
- [ ] Formulaire de création avec :
  - [ ] Champ "Key Name"
  - [ ] Sélecteur "Environment" (test/production)
  - [ ] Checkboxes ou select multiple pour "Scopes"
  - [ ] Champs optionnels "Daily Quota" / "Monthly Quota"
- [ ] Modal de confirmation affichant :
  - [ ] La clé complète `sk_test_xxx` ou `sk_live_xxx`
  - [ ] Message d'avertissement : "Copy now, won't see again"
  - [ ] Bouton "Copy to Clipboard"
  - [ ] Bouton "I've copied it" pour fermer
- [ ] Liste des clés existantes affichant :
  - [ ] `keyPrefix` + `keyHint` (ex: "sk_test_...x7Qa")
  - [ ] Scopes sous forme de badges
  - [ ] Environment (Test / Production)
  - [ ] Status (Active / Revoked)
  - [ ] Actions : Revoke, Delete

**Si manquant** : Créer issues ou TODOs pour les améliorations UI

---

#### 3.2 Vérifier la Gestion des Organisations
**Fichiers à analyser** :
```bash
grep -r "organisation" app/
```

**Points à vérifier** :
- [ ] Sélecteur d'organisation (si multi-org supporté)
- [ ] Affichage du nom de l'organisation courante
- [ ] Gestion des membres (inviter, supprimer)

**Si manquant** : Documenter pour Sprint 2

---

### PHASE 4 : Build & Lint (15 min) 🔧

#### 4.1 Lint
```bash
npm run lint
```

**Critères de succès** :
- [ ] Aucune erreur ESLint
- [ ] Aucun warning critique
- [ ] Si warnings : documenter et créer issues si nécessaire

**En cas d'erreur** :
- Corriger les erreurs bloquantes
- Documenter les warnings non critiques

---

#### 4.2 Build
```bash
npm run build
```

**Critères de succès** :
- [ ] Build réussit sans erreur
- [ ] Aucune erreur TypeScript
- [ ] Aucune erreur de compilation Next.js
- [ ] Output indique "Compiled successfully"

**En cas d'erreur** :
- Analyser l'erreur
- Corriger immédiatement si critique
- Documenter si nécessite investigation approfondie

---

### PHASE 5 : Nettoyage & Documentation (10 min) 📝

#### 5.1 Mettre à Jour le README Principal
**Fichier** : `README.md`

**Sections à ajouter/modifier** :
```markdown
## ✨ Sprint 1 - Sécurité & Multi-Organisation (Complété)

### Changements Majeurs
- ✅ Migration de chiffrement AES → Hash SHA-256 + Pepper (unidirectionnel)
- ✅ Support multi-organisation (B2B)
- ✅ Système de permissions granulaires (scopes)
- ✅ Wallets par organisation (production + test)
- ✅ Quotas quotidiens et mensuels

### Migration
Pour les nouveaux utilisateurs : Aucune action requise.
Pour les utilisateurs existants : Exécuter `tsx scripts/create-default-orgs.ts`

### Variables d'Environnement Critiques
```env
API_KEY_PEPPER=<générer-avec-openssl-rand-base64-32>
DATABASE_URL=postgresql://...
```

Voir `.env.example` pour la liste complète.

### Documentation Complète
- [Refactoring Technique](./docs/ai/sprint-1-refactoring-db-security.md)
- [Guide d'Exécution](./docs/ai/sprint-1-execution-guide.md)
- [Revue d'État](./docs/ai/sprint-1-status-review.md)
```

---

#### 5.2 Créer un Document de Synthèse des Tests
**Fichier** : `docs/ai/sprint-1-test-results.md`

**Contenu** :
```markdown
# Sprint 1 - Résultats des Tests

**Date** : 2025-12-10
**Branche** : feature/sprint-1-execution

## Tests Effectués

### ✅ Test 1 : Création de Clé API
- Résultat : [SUCCESS/FAILED]
- Clé générée : sk_test_xxx...
- Détails : [...]

### ✅ Test 2 : Authentification avec Hash
- Résultat : [SUCCESS/FAILED]
- Détails : [...]

### ✅ Test 3 : Révocation
- Résultat : [SUCCESS/FAILED]
- Détails : [...]

### ✅ Test 4 : Build & Lint
- Lint : [PASSED/FAILED]
- Build : [PASSED/FAILED]
- Warnings : [liste]
```

---

### PHASE 6 : Commit & Push (10 min) 🚀

#### 6.1 Vérifier les Changements
```bash
git status
```

**Fichiers attendus** :
- `docs/ai/sprint-1-status-review.md` (nouveau)
- `docs/ai/sprint-1-action-plan.md` (nouveau)
- `docs/ai/sprint-1-test-results.md` (nouveau si créé)
- `README.md` (modifié si mis à jour)

---

#### 6.2 Commit
```bash
git add .

git commit -m "$(cat <<'EOF'
feat(sprint-1): finalize Sprint 1 execution with tests and documentation

## Changes
- ✅ Created default organizations for all existing users (4 users)
- ✅ Linked users to organizations as owners
- ✅ Created wallets (production + test) for all organizations
- ✅ Tested API key creation (hash-based, SHA-256 + Pepper)
- ✅ Tested API key authentication and revocation
- ✅ Verified build and lint pass successfully
- ✅ Updated documentation (status review, action plan)

## Tests
- [x] Organization creation script executed successfully
- [x] API key creation with scopes (test environment)
- [x] Hash-based authentication works correctly
- [x] Revocation mechanism tested
- [x] Build passes without errors
- [x] Lint passes without critical warnings

## Sprint 1 Status
**Infrastructure**: ✅ Complete (migrations, schema, actions, crypto)
**Database**: ✅ All tables created with proper indexes and constraints
**Security**: ✅ Hash-based storage (SHA-256 + Pepper)
**Multi-Org**: ✅ Organizations, members, wallets functional
**Testing**: ✅ All critical paths tested

## Documentation
- docs/ai/sprint-1-status-review.md
- docs/ai/sprint-1-action-plan.md
- docs/ai/sprint-1-refactoring-db-security.md
- docs/ai/sprint-1-execution-guide.md
- docs/ai/sprint-1-summary.md

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>
EOF
)"
```

---

#### 6.3 Push vers Remote
```bash
git push -u origin feature/sprint-1-execution
```

**Vérification** :
```bash
git log -1 --oneline
git branch -vv
```

**Critères de succès** :
- [ ] Commit créé avec message détaillé
- [ ] Push réussi vers `origin/feature/sprint-1-execution`
- [ ] Branche trackée correctement

---

#### 6.4 Créer une Pull Request (Optionnel)
**Si GitHub CLI installé** :
```bash
gh pr create --title "feat(sprint-1): Sprint 1 - Refactoring DB & Sécurité Complete" --body "$(cat <<'EOF'
## Summary
Sprint 1 complete: Migration from AES encryption to SHA-256 hash-based API key storage with multi-organization support.

## What's Changed
- ✅ Hash-based API key storage (SHA-256 + Pepper, unidirectional)
- ✅ Multi-organization architecture (B2B support)
- ✅ Granular permissions system (scopes-based)
- ✅ Organization wallets (production + test)
- ✅ Daily/Monthly quotas per API key
- ✅ 3 real services seeded (PDF, AI, Mileage)
- ✅ All users linked to default organizations

## Test Plan
- [x] Organization creation for 4 existing users
- [x] API key creation (test environment)
- [x] Hash-based authentication
- [x] Key revocation
- [x] Build & Lint validation

## Database Changes
- New tables: organisations, organisation_members, services, wallets, test_wallets, daily_stats
- Refactored tables: api_keys (hash-based), api_usage_logs (multi-org)
- Indexes: 6+ new indexes for performance

## Documentation
- [Technical Details](./docs/ai/sprint-1-refactoring-db-security.md)
- [Execution Guide](./docs/ai/sprint-1-execution-guide.md)
- [Status Review](./docs/ai/sprint-1-status-review.md)
- [Action Plan](./docs/ai/sprint-1-action-plan.md)

## Breaking Changes
⚠️ **MIGRATION REQUIRED**: Existing users must run `tsx scripts/create-default-orgs.ts`

## Security
🔒 Critical: `API_KEY_PEPPER` environment variable must be set (see `.env.example`)

🤖 Generated with [Claude Code](https://claude.com/claude-code)
EOF
)"
```

**Ou manuellement** :
1. Aller sur GitHub
2. Créer une Pull Request depuis `feature/sprint-1-execution` vers `main`
3. Copier le template ci-dessus

---

## 📊 Checklist Complète

### Phase 1 : Correction Critique
- [ ] Exécuter `tsx scripts/create-default-orgs.ts`
- [ ] Vérifier 4+ membres d'organisations créés
- [ ] Vérifier wallets créés (production + test)

### Phase 2 : Tests Fonctionnels
- [ ] Serveur démarre sans erreur
- [ ] Authentification utilisateur fonctionne
- [ ] Création de clé API test réussie
- [ ] Clé affichée UNE FOIS avec modal
- [ ] Vérification DB : keyHash stocké, pas de encryptedKey
- [ ] Authentification avec clé API réussie
- [ ] Révocation de clé fonctionne
- [ ] Test quotas (si applicable)

### Phase 3 : Audit Frontend
- [ ] Formulaire de création analysé
- [ ] Modal de copie de clé analysé
- [ ] Liste des clés analysée
- [ ] Issues créées pour améliorations UI (si nécessaire)

### Phase 4 : Build & Lint
- [ ] `npm run lint` passe sans erreur
- [ ] `npm run build` passe sans erreur

### Phase 5 : Documentation
- [ ] README.md mis à jour (section Sprint 1)
- [ ] sprint-1-test-results.md créé
- [ ] Tous les documents consolidés

### Phase 6 : Commit & Push
- [ ] Git status vérifié
- [ ] Commit créé avec message détaillé
- [ ] Push vers origin/feature/sprint-1-execution
- [ ] PR créée vers main (optionnel)

---

## ⚠️ Points d'Attention

### Variables d'Environnement
- ✅ `API_KEY_PEPPER` configuré (vérifié)
- ✅ `DATABASE_URL` configuré
- ⚠️ `ENCRYPTION_KEY` : Optionnel (nécessaire seulement si migration de clés AES anciennes)

### Scripts NPM
- ✅ `npm run seed:services` (déjà exécuté)
- ⚠️ Ajouter `npm run create:orgs` dans package.json (optionnel)

### Base de Données
- ✅ 15 tables créées
- ✅ Indexes critiques créés
- ✅ Foreign Keys configurées
- ⚠️ Backup recommandé avant chaque modification

---

## 🚀 Après le Sprint 1

### Sprint 2 (Propositions)
1. **Middleware d'Authentification** : Endpoint `/api/v1/*` avec validation automatique de clés
2. **Rate Limiting** : Upstash Redis pour limiter les abus
3. **API Gateway** : Validation scopes + quotas centralisée
4. **Webhooks** : Notifications sur événements (quota atteint, clé compromise)
5. **Facturation Stripe** : Achat de crédits avec quotas personnalisés
6. **Dashboard Analytics** : Graphiques d'utilisation en temps réel

### Améliorations UI/UX
1. Modal "Copy API Key" avec animation
2. Formulaire scopes avec catégories (PDF, AI, Mileage)
3. Sélecteur d'organisation dans la navbar
4. Gestion des membres (inviter par email)
5. Affichage graphique des quotas (progress bars)

---

## 📞 Support & Troubleshooting

### Erreur : "Organisation not found"
**Solution** : Exécuter `tsx scripts/create-default-orgs.ts`

### Erreur : "API_KEY_PEPPER environment variable is not set"
**Solution** :
```bash
openssl rand -base64 32
echo "API_KEY_PEPPER=<pepper>" >> .env.local
npm run dev
```

### Build échoue avec erreurs TypeScript
**Solution** :
1. Vérifier que tous les imports sont corrects
2. Vérifier que `drizzle/schema.ts` compile
3. Vérifier que `lib/crypto/api-keys.ts` n'a pas d'erreurs de type

### Tests échouent
**Solution** :
1. Vérifier que la DB est accessible (Docker up)
2. Vérifier que les migrations sont appliquées
3. Vérifier que `create-default-orgs.ts` a été exécuté

---

**Status** : 📋 Plan d'Action Prêt à Exécuter
**Temps Estimé** : 1h30 - 2h
**Prochaine Étape** : Exécuter Phase 1 (Correction Critique)
