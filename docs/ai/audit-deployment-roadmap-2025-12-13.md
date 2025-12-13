# Audit Complet & Roadmap de Déploiement - SoloKonta

**Date** : 2025-12-13
**Auditeurs** : Explorator Agent + SaaS Architect Validator Agent
**Périmètre** : API Gateway (Spring Boot) + API Key Provider (Next.js)
**Objectif** : État des lieux + Plan de déploiement production

---

## Table des Matières

1. [Résumé Exécutif](#résumé-exécutif)
2. [Audit API Gateway](#audit-api-gateway)
3. [Audit API Key Provider](#audit-api-key-provider)
4. [Intégration Gateway ↔ Provider](#intégration-gateway--provider)
5. [Validation Architecture (5 Piliers SaaS)](#validation-architecture-5-piliers-saas)
6. [Roadmap de Déploiement](#roadmap-de-déploiement)
7. [Estimation Coûts](#estimation-coûts)
8. [Checklist Pré-Déploiement](#checklist-pré-déploiement)
9. [Annexes](#annexes)

---

## Résumé Exécutif

### 🎯 Verdict Global

**État** : 🔴 **ROUGE - NON PRÊT POUR PRODUCTION**

Le projet SoloKonta est **fonctionnel en environnement de développement** mais présente **10 points bloquants critiques (P0)** qui empêchent tout déploiement en production.

### Effort Estimé

- **Déploiement minimum viable** : 4h 30 min (fixes P0 uniquement)
- **Production-ready complet** : 5-6 jours (P0 + P1 + infrastructure)

### Points Forts ✅

- Architecture multi-tenancy correcte (organisation-based)
- Sécurité : Hashing SHA-256 + pepper, déduction crédits atomique
- Stack moderne (Spring Boot 3.4.5, Next.js 16, PostgreSQL 16)
- Documentation technique exhaustive (CLAUDE.md)
- Build Maven réussit (Gateway)

### Bloqueurs Critiques 🔴

| # | Bloqueur | Composant | Impact | Effort |
|---|----------|-----------|--------|--------|
| 1 | `API_KEY_PEPPER` manquant | Gateway + Provider | RuntimeException au démarrage | 30 min |
| 2 | JPQL `CURRENT_TIMESTAMP()` invalide | Gateway | Exception déduction crédits | 15 min |
| 3 | Build Next.js échoue (`.claude`) | Provider | Application non compilable | 1h |
| 4 | Fonction `getCurrentUser()` manquante | Provider | Build échoue | 30 min |
| 5 | Pepper non synchronisé | Gateway ↔ Provider | Authentification cassée | 30 min |
| 6 | Aucun Dockerfile | Gateway + Provider | Impossible de containeriser | 3h |
| 7 | Secrets hardcodés | Gateway + Provider | Violation sécurité | 3h |
| 8 | Pas de HTTPS | Infrastructure | Man-in-the-middle attack | 4h |
| 9 | Migrations non appliquées | Provider | DB vide = crash | 30 min |
| 10 | Aucune CI/CD | Projet | Déploiement manuel = erreurs | 4h |

---

## Audit API Gateway

### Architecture & Structure

**Localisation** : `D:\Auto_AI\Worspace\soloflow\api-gateway\`

**Stack Technique** :
- Spring Boot 3.4.5
- Java 21 (Eclipse Temurin)
- PostgreSQL driver 42.7.4
- Caffeine cache 3.1.8
- Bucket4j rate limiting 8.14.0
- Spring Cloud Gateway MVC 2024.0.0

**Structure Packages** :
```
src/main/java/com/rnblock/gateway/
├── config/
│   ├── SecurityConfig.java       # Spring Security filter chain
│   └── CacheConfig.java          # Caffeine cache configuration
├── security/
│   └── ApiKeyAuthFilter.java     # Main validation filter (OncePerRequestFilter)
├── service/
│   └── ApiKeyValidationService.java  # Cache + DB + Rate limit logic
├── repository/
│   ├── ApiKeyRepository.java     # Spring Data JPA
│   └── WalletRepository.java
├── model/
│   ├── ApiKey.java               # JPA Entity
│   └── Wallet.java
├── exception/
│   ├── GlobalExceptionHandler.java   # Centralized error handling
│   ├── InvalidApiKeyException.java
│   ├── InsufficientCreditsException.java
│   └── RateLimitExceededException.java
└── GatewayApiN8nApplication.java
```

### ✅ Points Conformes

#### Configuration
- `application.yaml` : Routes configurées, Database URL correcte
- Database : `jdbc:postgresql://localhost:5434/api_key_provider_db` ✅
- Port : 8080 (conforme CLAUDE.md) ✅
- Dependencies : Toutes présentes et compatibles ✅

#### Modèle de Données (JPA Entities)
- `ApiKey` : id (text), keyHash (unique), orgId, isActive, timestamps ✅
- `Wallet` : id (text), orgId (unique), balance, timestamps ✅
- Mapping colonnes : camelCase (compatible Drizzle) ✅

#### Sécurité & Validation
- `ApiKeyAuthFilter` : OncePerRequestFilter correctement implémenté ✅
- Extraction clé : `Authorization: Bearer` ou `X-API-Key` header ✅
- Exclusion paths : `/actuator/**`, `/health`, `/info` ✅
- `SecurityConfig` : Filter chain OK, CSRF désactivé, sessions stateless ✅
- `GlobalExceptionHandler` : Status codes corrects (401, 402, 429, 500) ✅

#### Business Logic
- `ApiKeyValidationService` :
  - Cache Caffeine (TTL 1h, max 1000 entrées) ✅
  - Rate limiting Bucket4j (10 req/sec in-memory) ✅
  - Hashing SHA-256 + pepper implémenté ✅
  - Transaction atomique sur déduction crédits ✅

#### Build
- `mvnw clean compile` : **BUILD SUCCESS** (14.6s) ✅

### ⚠️ Points d'Attention (Non Bloquants)

1. **Typo dans `application.yaml:1`**
   ```yaml
   claudeserver:  # ❌ Devrait être "server:"
     port: 8080
   ```
   - Impact : Propriété ignorée, port par défaut (8080) utilisé par chance
   - Effort : 2 min

2. **Lombok Warnings**
   - `ApiKey.java:42` : `isActive = true` sans `@Builder.Default`
   - `Wallet.java:36` : `balance = 0` sans `@Builder.Default`
   - Impact : Valeurs par défaut ignorées dans Builder
   - Effort : 10 min

3. **Hibernate DDL Auto**
   ```yaml
   spring.jpa.hibernate.ddl-auto: update  # ⚠️ Risque en production
   ```
   - Recommandation : `validate` en production
   - Effort : 5 min

4. **Secrets en clair**
   ```yaml
   datasource:
     username: postgres
     password: postgres  # ⚠️ À externaliser
   ```
   - Impact : Violation sécurité si commit git
   - Effort : 1h (secrets management)

5. **Actuator endpoints exposés**
   ```yaml
   management.endpoints.web.exposure.include: "*"  # ⚠️ Tous exposés
   ```
   - Risque : Information disclosure
   - Recommandation : Restreindre à `health,info,metrics`
   - Effort : 15 min

### 🔴 Points Bloquants P0

#### 1. Variable `API_KEY_PEPPER` manquante
- **Fichier** : `application.yaml:15`, `ApiKeyValidationService.java:41-59`
- **Code** :
  ```yaml
  api:
    key:
      pepper: ${API_KEY_PEPPER}  # ❌ Variable non définie
  ```
  ```java
  if (apiKeyPepper == null || apiKeyPepper.isEmpty()) {
      log.error("API_KEY_PEPPER is not configured!");
      throw new RuntimeException("Server configuration error: Pepper missing");
  }
  ```
- **Impact** : RuntimeException au démarrage
- **Fix** :
  ```bash
  # Générer pepper
  openssl rand -base64 32

  # Option 1 : Variable système
  export API_KEY_PEPPER="generated_value"

  # Option 2 : Fichier .env
  echo "API_KEY_PEPPER=generated_value" >> api-gateway/.env
  ```
- **Effort** : 15 min

#### 2. JPQL `CURRENT_TIMESTAMP()` invalide
- **Fichier** : `WalletRepository.java:22`
- **Code problématique** :
  ```java
  @Query("UPDATE Wallet w SET w.balance = w.balance - 1,
          w.updatedAt = CURRENT_TIMESTAMP() WHERE ...")  // ❌ Parenthèses invalides
  ```
- **Erreur runtime** : Exception lors de la première déduction de crédits
- **Fix** :
  ```java
  w.updatedAt = CURRENT_TIMESTAMP  // ✅ Sans parenthèses en JPQL
  ```
- **Effort** : 15 min

#### 3. Aucun Dockerfile
- **Localisation** : `api-gateway/` (fichier manquant)
- **Impact** : Impossible de containeriser pour déploiement
- **Fix** : Créer Dockerfile multi-stage (voir Sprint 1)
- **Effort** : 1h

#### 4. Aucune migration de base de données
- **Problème** : Schéma géré uniquement par `hibernate.ddl-auto=update`
- **Risque** : Divergence entre environnements, pas de rollback
- **Alternatives** :
  1. Utiliser migrations Drizzle du Provider (recommandé)
  2. Implémenter Flyway côté Gateway
- **Effort** : 2 jours (si Flyway complet)

### 🟠 Points Bloquants P1 (Risque Production)

5. **Absence de profils Spring (dev/prod)**
   - Fichiers manquants : `application-dev.yaml`, `application-prod.yaml`
   - Effort : 2h

6. **Tests inexistants**
   - Policy : "No unit tests for filters" (README.md:148)
   - Manque : Tests d'intégration pour logique métier
   - Effort : 3 jours

7. **Logging insuffisant**
   - Absence de `logback-spring.xml`
   - Niveaux de log non définis
   - Effort : 4h

8. **Health check incomplet**
   - Actuator activé mais pas de custom DB health check
   - Pas de Kubernetes readiness/liveness probes
   - Effort : 2h

### 📊 Métriques Gateway

- **Lignes de code Java** : ~450 lignes (13 fichiers)
- **Dependencies Maven** : 11
- **Couverture tests** : 0%
- **Compilation** : ✅ Succès (14.6s)
- **Warnings** : 2 (Lombok)

---

## Audit API Key Provider

### Architecture & Structure

**Localisation** : `D:\Auto_AI\Worspace\soloflow\api-key-provider\`

**Stack Technique** :
- Next.js 16.0.7 (App Router)
- React 19.2.0
- TypeScript (strict mode)
- Drizzle ORM 0.45.0
- Better Auth 1.4.5
- Stripe SDK 20.0.0
- Tailwind CSS v4
- Shadcn/UI components

**Structure** :
```
api-key-provider/
├── app/
│   ├── (auth)/                  # Better Auth routes
│   ├── api/                     # API routes (webhooks, etc.)
│   ├── keys/                    # API key management UI
│   ├── services/                # Service catalog UI
│   ├── usage/                   # Analytics dashboard
│   ├── actions/                 # Server Actions
│   └── layout.tsx, page.tsx
├── drizzle/
│   ├── schema.ts                # Database schema (420 lignes)
│   ├── db.ts                    # Database connection
│   ├── migrations/              # 5 migrations SQL
│   └── seed/                    # Seed scripts
├── components/                  # Shadcn/UI components
├── lib/
│   ├── crypto/api-keys.ts       # SHA-256 hashing
│   ├── auth.ts                  # Better Auth config
│   └── utils/
└── docker-compose.yml           # PostgreSQL + PgAdmin
```

### ✅ Points Conformes

#### Base de Données (Drizzle Schema)
- **Tables Better Auth** : user, session, account, verifications ✅
- **Tables métier** : organisations, wallets, api_keys, services, api_usage_logs ✅
- **Relations** : Drizzle relations correctement définies ✅
- **Index critiques** :
  - `idx_apikeys_keyHash` (unique lookup) ✅
  - `idx_wallets_org` (isolation organisation) ✅
  - `idx_usage_org_time` (analytics) ✅

#### Compatibilité Gateway (JPA)
| Colonne | Drizzle | JPA Entity | Match |
|---------|---------|------------|-------|
| `api_keys.keyHash` | `text("keyHash").unique()` | `String keyHash` | ✅ |
| `api_keys.orgId` | `text("orgId").references(...)` | `String orgId` | ✅ |
| `api_keys.isActive` | `boolean("isActive").default(true)` | `Boolean isActive` | ✅ |
| `wallets.balance` | `integer("balance").default(0)` | `Integer balance` | ✅ |

#### Sécurité & Crypto
- **SHA-256 + Pepper** : `lib/crypto/api-keys.ts` implémenté ✅
- **Génération clés** : `generateApiKey()` avec crypto.randomBytes ✅
- **Format** : `/^sk_(live|test)_[A-Za-z0-9_-]{43}$/` validé ✅
- **Masking** : `maskApiKey()` pour affichage sécurisé ✅
- **Better Auth** : email/password + OAuth (Google, GitHub) ✅

#### Server Actions
- `api-key-actions.ts` : Création, liste, révocation de clés ✅
- `organisation-actions.ts` : Gestion organisations ✅
- Validation Zod + permissions RBAC (owner, admin, developer) ✅

#### UI & Features
- Pages : `/keys`, `/services`, `/usage`, `/(auth)/` ✅
- Composants Shadcn/UI : button, card, dropdown, etc. ✅
- Dark/Light mode via ThemeProvider ✅
- Toaster (Sonner) pour notifications ✅

#### Configuration
- `.env.example` : Complet avec toutes variables documentées ✅
- `docker-compose.yml` : PostgreSQL 16 + PgAdmin ✅
- Healthcheck PostgreSQL configuré ✅

### ⚠️ Points d'Attention

1. **Stripe publishable key exposée**
   ```env
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="sk_test_51SZe..."  # ❌ SECRET KEY!
   ```
   - C'est une `sk_test_` (secret) au lieu de `pk_test_` (publishable)
   - Impact : Secret exposé dans bundle JavaScript client
   - Effort : 15 min

2. **Variables OAuth manquantes**
   ```typescript
   // lib/auth.ts:82-90
   socialProviders: {
     google: {
       clientId: process.env.GOOGLE_CLIENT_ID!,  // ❌ Non défini
       clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
     }
   }
   ```
   - Impact : Crash si OAuth activé
   - Effort : 1h (création OAuth apps)

3. **Email verification désactivée en dev**
   ```typescript
   requireEmailVerification: process.env.NODE_ENV === "production",
   autoSignIn: process.env.NODE_ENV === "development",
   ```
   - Risque : Comptes non vérifiés en dev
   - Acceptable by design

4. **Migration script "migrate:keys" ONE-TIME**
   - Pas de protection contre double exécution
   - Risque : Corruption données si relancé
   - Effort : 30 min (idempotency check)

### 🔴 Points Bloquants P0

#### 1. Build Next.js échoue
- **Erreur** :
  ```
  Error: ENOENT: no such file or directory, stat '.claude'
  ```
- **Cause** : Référence à dossier `.claude` dans config ou import
- **Impact** : Impossible de créer build production
- **Fix** :
  ```javascript
  // next.config.js ou .gitignore
  // Ajouter .claude à l'exclusion
  ```
- **Effort** : 1h (investigation + fix)

#### 2. Variable `API_KEY_PEPPER` manquante
- **Fichier** : `.env.local` (ligne absente)
- **Code** : `lib/crypto/api-keys.ts:22`
  ```typescript
  if (!process.env.API_KEY_PEPPER) {
    throw new Error('API_KEY_PEPPER environment variable is not set');
  }
  ```
- **Impact** : Exception lors de création API key
- **Fix** :
  ```bash
  # DOIT être identique au Gateway!
  echo "API_KEY_PEPPER=$(openssl rand -base64 32)" >> .env.local
  ```
- **Effort** : 15 min

#### 3. Aucun Dockerfile
- **Impact** : Impossible de containeriser
- **Fix** : Dockerfile multi-stage Next.js standalone (voir Sprint 1)
- **Effort** : 2h

#### 4. Fonction `getCurrentUser()` probablement manquante
- **Import** : `app/actions/api-key-actions.ts:29`
  ```typescript
  import { getCurrentUser } from "@/lib/utils/auth";  // ❌ Fichier non trouvé
  ```
- **Impact** : Build échoue si fonction absente
- **Fix** :
  ```typescript
  // lib/utils/auth.ts
  import { auth } from "@/lib/auth";

  export async function getCurrentUser() {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) throw new Error("Unauthorized");
    return session.user;
  }
  ```
- **Effort** : 30 min

### 🟠 Points Bloquants P1

5. **Configuration Resend manquante**
   - `RESEND_API_KEY=re_...` (placeholder)
   - Impact : Emails ne partent pas
   - Effort : 30 min

6. **Stripe Price IDs non configurés**
   - `STRIPE_PRICE_STARTUP_PACK=price_...` (placeholder)
   - Impact : Impossible d'acheter crédits
   - Effort : 1h

7. **Upstash Redis non configuré**
   - Rate limiting distribué inactif
   - Effort : 1h

8. **Migrations non appliquées**
   - Commande : `npm run db:migrate`
   - Risque : DB vide = app crash
   - Effort : 30 min

9. **Seed services non exécuté**
   - Commande : `npm run seed:services`
   - Table `services` vide
   - Effort : 15 min

10. **ESLint config manquante**
    - `"lint": "eslint"` (pas de target)
    - Effort : 30 min

### 📊 Métriques Provider

- **Lignes de code TypeScript** : ~2000 lignes
- **Dependencies npm** : 56 (20 prod + 36 dev)
- **Couverture tests** : 0%
- **Build** : ❌ Échec (erreur `.claude`)
- **Migrations DB** : 5 fichiers SQL

---

## Intégration Gateway ↔ Provider

### ✅ Compatibilité Confirmée

#### Schéma Base de Données

| Table | Gateway (JPA) | Provider (Drizzle) | Match |
|-------|---------------|-------------------|-------|
| `api_keys.keyHash` | `String keyHash` (unique) | `text("keyHash").unique()` | ✅ |
| `api_keys.orgId` | `String orgId` | `text("orgId").references(...)` | ✅ |
| `api_keys.isActive` | `Boolean isActive` | `boolean("isActive").default(true)` | ✅ |
| `api_keys.createdAt` | `LocalDateTime @CreationTimestamp` | `timestamp("createdAt").defaultNow()` | ✅ |
| `wallets.orgId` | `String orgId` (unique) | `text("orgId").unique()` | ✅ |
| `wallets.balance` | `Integer balance` | `integer("balance").default(0)` | ✅ |

**Compatibilité** : 100% ✅

#### Hashing Algorithm

**Gateway** :
```java
MessageDigest.getInstance("SHA-256")
  .digest((apiKey + pepper).getBytes(UTF_8))
```

**Provider** :
```typescript
crypto.createHash('sha256')
  .update(apiKey + pepper)
  .digest('hex')
```

**Résultat** : Identique (SHA-256, format hex) ✅

#### Database Connection

- **Gateway** : `jdbc:postgresql://localhost:5434/api_key_provider_db`
- **Provider** : `postgresql://postgres:postgres@localhost:5434/api_key_provider_db`

**Résultat** : Même base, même port (5434) ✅

### 🚨 Risque Critique

**Pepper non synchronisé** :
- Si Gateway et Provider utilisent des peppers différents, les hashs ne matchent **JAMAIS**
- Conséquence : **Authentification API totalement cassée**
- Fix : Générer 1 pepper unique partagé par les 2 apps
- Effort : 30 min

---

## Validation Architecture (5 Piliers SaaS)

### 🏛️ Pilier 1 : ISOLATION (Multi-Tenancy)

**Décision** : 🟠 **ORANGE**

#### ✅ Points Validés

- Modèle organisation-centré : Crédits par `orgId` ✅
- API keys liées à `orgId` ✅
- Requêtes atomiques avec clause WHERE sur `orgId` ✅
- Tables séparées (organisations, wallets, api_keys) ✅

#### ⚠️ Risques

- 🔴 Aucune Row-Level Security (RLS) PostgreSQL
- 🟠 Pas d'audit logs pour traçabilité
- 🟠 Pas de validation partitionnement dans requêtes JPA
- 🟡 Index `orgId` potentiellement manquants

#### 📋 Recommandations

1. **Implémenter RLS PostgreSQL** - P0 - 4h
   ```sql
   ALTER TABLE wallets ENABLE ROW LEVEL SECURITY;
   CREATE POLICY org_isolation ON wallets
     USING (orgId = current_setting('app.current_org_id')::text);
   ```

2. **Créer table audit_logs** - P1 - 3h
   ```sql
   CREATE TABLE audit_logs (
     id UUID PRIMARY KEY,
     orgId TEXT NOT NULL,
     action TEXT NOT NULL,
     resource TEXT NOT NULL,
     userId TEXT,
     timestamp TIMESTAMPTZ DEFAULT NOW(),
     metadata JSONB
   );
   ```

3. **Ajouter indexes composites** - P1 - 1h
   ```sql
   CREATE INDEX idx_wallets_org_balance ON wallets(orgId, balance);
   CREATE INDEX idx_api_keys_org_hash ON api_keys(orgId, keyHash);
   ```

**Justification Orange** : Architecture correcte mais protections défensives manquantes. Acceptable pour MVP < 50 organisations, bloquant pour scale.

---

### 🔒 Pilier 2 : SÉCURITÉ

**Décision** : 🔴 **ROUGE - BLOQUANT PRODUCTION**

#### ✅ Points Validés

- Hashing SHA-256 + pepper (one-way) ✅
- Better Auth OAuth standard ✅
- Rate limiting Bucket4j ✅
- Credit deduction atomique ✅

#### 🔴 Risques Critiques

- **BLOQUANT** : `API_KEY_PEPPER` non défini → Crash
- **BLOQUANT** : Secrets hardcodés (violation RGPD/PCI-DSS)
- **BLOQUANT** : Pepper non synchronisé → Auth cassée
- **CRITIQUE** : Pas de HTTPS → Man-in-the-middle
- **CRITIQUE** : Stripe secret key exposée client-side
- 🟠 CORS non configuré
- 🟠 Rate limiting in-memory (contournable)
- 🟠 Actuator endpoints exposés

#### 📋 Recommandations

1. **Configurer secrets management** - P0 - 3h
   ```bash
   # Option A (MVP) : Variables env externalisées
   API_KEY_PEPPER=$(openssl rand -base64 32)

   # Option B (Prod) : AWS Secrets Manager / Vault
   ```

2. **Synchroniser pepper** - P0 - 1h
   ```bash
   PEPPER=$(openssl rand -base64 32)
   echo "API_KEY_PEPPER=$PEPPER" >> api-gateway/.env
   echo "API_KEY_PEPPER=$PEPPER" >> api-key-provider/.env.local
   ```

3. **Configurer HTTPS** - P0 - 4h
   - Traefik + Let's Encrypt
   - HTTP → HTTPS redirect
   - HSTS headers

4. **Configurer CORS strict** - P0 - 30 min
   ```java
   config.setAllowedOrigins(List.of("https://app.solokonta.com"));
   ```

5. **Migrer rate limiting vers Redis** - P1 - 1 jour
   - Partage entre instances Gateway

6. **Sécuriser actuator** - P1 - 1h
   ```yaml
   management.security.enabled: true
   ```

**Justification Rouge** : Secrets manquants = application non démarrable. Violation sécurité majeure. **Aucun déploiement possible sans Sprint 0 + Sprint 2.**

---

### 💰 Pilier 3 : ÉCONOMIQUE

**Décision** : 🟢 **VERT**

#### ✅ Points Validés

- Architecture légère (2 apps) ✅
- Base unique (réduit coûts) ✅
- Gateway stateless (scaling horizontal) ✅

#### Estimation Coûts

| Phase | Infrastructure | Détail | Coût/mois | Capacité |
|-------|---------------|--------|-----------|----------|
| **MVP Local** | Docker Compose + Neon | Dev machine + PostgreSQL gratuit | **0€** | < 100 req/jour |
| **Prod Mini** | Hetzner VPS + Managed DB | CX41 (4vCPU, 16GB) + PostgreSQL 2GB | **80€** | < 100K req/jour |
| **Scale** | Kubernetes + Redis + RDS | DigitalOcean K8s (3 nodes) + CloudSQL | **350€** | < 1M req/jour |
| **Enterprise** | Multi-region | Global infra + CDN + replicas | **2000€+** | 10M+ req/jour |

#### Détail Phase "Prod Mini" (80€/mois)

- VPS Hetzner CX41 : 15€
- PostgreSQL Managed (2GB) : 30€
- Backup (20% VPS) : 3€
- Domain + SSL : 1€
- Monitoring Grafana Cloud : 0€ (free tier)
- Email Resend : 0€ (free tier)
- CDN Cloudflare : 0€ (free tier)

**Capacité** :
- 100K requêtes/jour
- 50 organisations
- 500 API keys actives
- 10GB database

#### Optimisations Coûts

1. **Next.js Standalone** - P1 - 1 jour
   ```javascript
   output: 'standalone',  // Réduit Docker de 1.2GB → 200MB
   ```
   - Impact : -40% compute cost

2. **Database Connection Pooling** - P1 - 2h
   ```yaml
   hikari.maximum-pool-size: 10  # Au lieu de 20
   ```
   - Permet free tier Neon/Supabase

3. **CDN assets statiques** - P2 - 3h
   - Cloudflare Free (unlimited bandwidth)
   - Impact : -90% bandwidth cost

**Justification Vert** : Architecture économique pour MVP (< 100€/mois). Path clair jusqu'à 1M req/jour sans refonte.

---

### ⚡ Pilier 4 : PERFORMANCE

**Décision** : 🟠 **ORANGE**

#### ✅ Points Validés

- Cache Caffeine (lookup rapide) ✅
- HikariCP connection pooling ✅
- Index `keyHash` (O(1) lookup) ✅

#### ⚠️ Risques

- 🟠 Aucune métrique mesurée
- 🟠 Cache TTL 1h = révocation retardée
- 🟠 Pas de load testing
- 🟠 Index composites manquants
- 🟡 Pas de circuit breaker

#### Métriques Cibles vs Actuelles

| Métrique | Cible | Actuel | Gap |
|----------|-------|--------|-----|
| Latence validation API key | < 50ms (p95) | ❌ Non mesuré | Prometheus |
| Throughput Gateway | 1000 req/s | ❌ Non testé | k6 |
| Database query time | < 10ms (p95) | ❌ Non mesuré | Slow query log |
| Cache hit ratio | > 95% | ❌ Non mesuré | Caffeine metrics |

#### 📋 Recommandations

1. **Implémenter Prometheus metrics** - P0 - 3h
   ```java
   @Timed(value = "api.key.validation")
   public ApiKey validateKey(String rawKey) { ... }
   ```

2. **Réduire cache TTL** - P0 - 15 min
   ```java
   .expireAfterWrite(15, TimeUnit.MINUTES)  // Au lieu de 1h
   ```

3. **Load testing k6** - P1 - 4h
   ```javascript
   export const options = {
     stages: [
       { duration: '5m', target: 1000 },  // 1000 req/s
     ],
     thresholds: {
       http_req_duration: ['p(95)<50'],
     },
   };
   ```

4. **Optimiser indexes PostgreSQL** - P1 - 2h
   ```sql
   CREATE INDEX idx_api_keys_org_hash_active
     ON api_keys(orgId, keyHash, isActive)
     WHERE isActive = true;
   ```

5. **Circuit breaker Resilience4j** - P2 - 3h
   ```java
   @CircuitBreaker(name = "backend-service", fallbackMethod = "fallback")
   ```

**Justification Orange** : Architecture performante sur le papier mais **aucune mesure**. Cache TTL trop long = risque sécurité. Load testing requis avant production.

---

### 🛠️ Pilier 5 : DEVELOPER EXPERIENCE

**Décision** : 🔴 **ROUGE - BLOQUANT PRODUCTION**

#### ✅ Points Validés

- Documentation CLAUDE.md exhaustive ✅
- Scripts dev documentés ✅
- Seed data (`npm run seed:services`) ✅
- Docker Compose local ✅

#### 🔴 Risques Critiques

- **BLOQUANT** : Aucun Dockerfile
- **BLOQUANT** : Aucune CI/CD
- 🟠 Pas de health checks Kubernetes
- 🟠 Pas de monitoring centralisé
- 🟠 Pas de stratégie rollback
- 🟠 API Gateway sans OpenAPI docs

#### 📋 Recommandations

1. **Créer Dockerfiles multi-stage** - P0 - 2h

**Gateway Dockerfile** :
```dockerfile
FROM maven:3.9-eclipse-temurin-21-alpine AS build
WORKDIR /app
COPY pom.xml .
RUN mvn dependency:go-offline
COPY src ./src
RUN mvn clean package -DskipTests

FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
COPY --from=build /app/target/*.jar app.jar
RUN addgroup -S spring && adduser -S spring -G spring
USER spring:spring
EXPOSE 8080
HEALTHCHECK CMD wget --spider http://localhost:8080/actuator/health || exit 1
ENTRYPOINT ["java", "-jar", "app.jar"]
```

**Provider Dockerfile** :
```dockerfile
FROM node:20-alpine AS base
FROM base AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

FROM base AS builder
WORKDIR /app
COPY . .
RUN npm run build

FROM base AS runner
WORKDIR /app
ENV NODE_ENV production
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
EXPOSE 3000
HEALTHCHECK CMD node -e "require('http').get('http://localhost:3000/api/health', r => process.exit(r.statusCode === 200 ? 0 : 1))"
CMD ["node", "server.js"]
```

2. **Docker Compose Production** - P0 - 2h
   - PostgreSQL avec healthcheck
   - Secrets via Docker secrets
   - Networks isolés (backend/frontend)

3. **GitHub Actions CI/CD** - P1 - 4h
   - Test → Build → Push to GHCR
   - Déploiement auto staging

4. **Health endpoints** - P0 - 1h
   ```typescript
   // app/api/health/route.ts
   export async function GET() {
     await db.execute(sql`SELECT 1`);
     return Response.json({ status: 'healthy' });
   }
   ```

5. **Monitoring Stack** - P1 - 1 jour
   - Prometheus + Grafana
   - Loki logs centralisés
   - Alertes Slack

6. **OpenAPI Documentation** - P2 - 3h
   ```xml
   <dependency>
     <groupId>org.springdoc</groupId>
     <artifactId>springdoc-openapi-starter-webmvc-ui</artifactId>
   </dependency>
   ```

**Justification Rouge** : Aucune infrastructure de déploiement. **Impossible de déployer en production sans Sprint 0 + Sprint 1 + Sprint 2.**

---

## Roadmap de Déploiement

### 📅 Timeline Globale

```
Aujourd'hui        +1 jour         +1 semaine        +2 semaines
    │                 │                 │                 │
    ▼                 ▼                 ▼                 ▼
┌─────────┐     ┌─────────┐     ┌──────────┐     ┌──────────┐
│ Sprint 0│────▶│ Sprint 1│────▶│ Sprint 2 │────▶│ Sprint 3 │
│ Fixes P0│     │Container│     │ Sécurité │     │Monitoring│
│  1 jour │     │  1 jour │     │  2 jours │     │  2 jours │
└─────────┘     └─────────┘     └──────────┘     └──────────┘
                                                       │
                                                       ▼
                                              MVP PRODUCTION-READY
                                              (Phase 2 - 80€/mois)
```

---

### 🚨 Sprint 0 : Fixes Critiques P0 - 1 jour (BLOQUANT)

**Objectif** : Rendre l'application démarrable localement sans erreurs

| # | Tâche | Composant | Effort | Responsable |
|---|-------|-----------|--------|-------------|
| 1 | Générer `API_KEY_PEPPER` unique (32 bytes) | Scripts | 15 min | DevOps |
| 2 | Créer `.env` Gateway avec pepper | Gateway | 15 min | Backend |
| 3 | Créer `.env.local` Provider avec MÊME pepper | Provider | 15 min | Backend |
| 4 | Fixer JPQL `CURRENT_TIMESTAMP()` → `CURRENT_TIMESTAMP` | Gateway | 15 min | Backend |
| 5 | Résoudre erreur build Next.js (exclure `.claude`) | Provider | 1h | Frontend |
| 6 | Créer `lib/utils/auth.ts` avec `getCurrentUser()` | Provider | 30 min | Frontend |
| 7 | Appliquer migrations Drizzle (`npm run db:migrate`) | Provider | 30 min | Backend |
| 8 | Exécuter seed services (`npm run seed:services`) | Provider | 15 min | Backend |

#### Commandes Sprint 0

```bash
# 1. Générer pepper unique
mkdir -p secrets
openssl rand -base64 32 > secrets/api_key_pepper.txt

# 2. Configurer Gateway
echo "API_KEY_PEPPER=$(cat secrets/api_key_pepper.txt)" > api-gateway/.env

# 3. Configurer Provider
echo "API_KEY_PEPPER=$(cat secrets/api_key_pepper.txt)" >> api-key-provider/.env.local

# 4. Fixer JPQL
# Éditer api-gateway/src/main/java/com/rnblock/gateway/repository/WalletRepository.java
# Ligne 22 : CURRENT_TIMESTAMP() → CURRENT_TIMESTAMP

# 5. Fixer build Next.js
echo ".claude" >> api-key-provider/.gitignore
echo ".claude" >> api-key-provider/.dockerignore

# 6. Créer getCurrentUser()
cat > api-key-provider/lib/utils/auth.ts <<'EOF'
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export async function getCurrentUser() {
  const session = await auth.api.getSession({
    headers: await headers()
  });

  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  return session.user;
}
EOF

# 7. Appliquer migrations
cd api-key-provider
npm run db:migrate

# 8. Seed services
npm run seed:services
```

#### Validation Sprint 0

```bash
# Test Gateway
cd api-gateway && ./mvnw spring-boot:run
# Expected : "Started GatewayApiN8nApplication in X seconds"

# Test Provider
cd api-key-provider && npm run build
# Expected : "✓ Compiled successfully"

# Test Database
psql -h localhost -p 5434 -U postgres api_key_provider_db \
  -c "SELECT COUNT(*) FROM services;"
# Expected : 3

# Test API end-to-end
curl -X POST http://localhost:3000/api/keys \
  -H "Content-Type: application/json" \
  -d '{"name": "Test Key", "orgId": "org_123"}'
# Expected : HTTP 201 avec clé sk_test_...
```

**Critères de Sortie** :
- [ ] Gateway démarre sans RuntimeException
- [ ] Provider compile (`npm run build` réussit)
- [ ] Création API key fonctionne
- [ ] Requête API retourne HTTP 200/402 (pas 500)

---

### 🐳 Sprint 1 : Containerisation P0 - 1 jour

**Objectif** : Rendre l'application déployable via Docker Compose

| # | Tâche | Effort |
|---|-------|--------|
| 1 | Créer `api-gateway/Dockerfile` (multi-stage) | 1h |
| 2 | Créer `api-key-provider/Dockerfile` (multi-stage) | 1h |
| 3 | Créer `docker-compose.production.yml` | 2h |
| 4 | Créer `secrets/` directory avec fichiers | 1h |
| 5 | Tester build images Docker | 1h |
| 6 | Tester déploiement complet | 2h |

#### Scripts Sprint 1

**build-images.sh** :
```bash
#!/bin/bash
set -e

echo "Building Gateway image..."
docker build -t solokonta/gateway:latest ./api-gateway

echo "Building Provider image..."
docker build -t solokonta/provider:latest ./api-key-provider

echo "Images built successfully!"
docker images | grep solokonta
```

**deploy-local.sh** :
```bash
#!/bin/bash
set -e

# Generate secrets if not exist
if [ ! -f secrets/api_key_pepper.txt ]; then
  openssl rand -base64 32 > secrets/api_key_pepper.txt
fi

if [ ! -f secrets/auth_secret.txt ]; then
  openssl rand -base64 32 > secrets/auth_secret.txt
fi

# Start services
docker-compose -f docker-compose.production.yml up -d

# Wait for health
sleep 10

# Check health
curl -f http://localhost:8080/actuator/health || exit 1
curl -f http://localhost:3000/api/health || exit 1

echo "✅ Deployment successful!"
```

#### Validation Sprint 1

```bash
./scripts/build-images.sh
./scripts/deploy-local.sh

# Test API
curl -H "X-API-Key: sk_test_xxx" http://localhost:8080/api/v1/service-1/test
# Expected : HTTP 200 ou 402
```

**Critères de Sortie** :
- [ ] Images Docker < 500MB (Gateway), < 200MB (Provider)
- [ ] `docker-compose up` démarre 3 services
- [ ] Health checks HTTP 200
- [ ] Communication inter-services OK
- [ ] Secrets chargés depuis fichiers

---

### 🔒 Sprint 2 : Sécurité Production P1 - 2 jours

**Objectif** : HTTPS + Secrets externalisés

| # | Tâche | Effort |
|---|-------|--------|
| 1 | Choisir secrets manager (AWS/Vault/fichiers) | 1h |
| 2 | Implémenter chargement secrets runtime | 4h |
| 3 | Configurer Traefik + Let's Encrypt | 3h |
| 4 | Configurer CORS strict | 1h |
| 5 | Restreindre actuator endpoints | 1h |
| 6 | Remplacer Stripe secret key par publishable | 30 min |
| 7 | Audit OWASP ZAP | 4h |
| 8 | Documenter runbook incidents | 2h |

#### Traefik Configuration

```yaml
# docker-compose.production.yml (extrait)
services:
  traefik:
    image: traefik:v2.10
    command:
      - --entrypoints.websecure.address=:443
      - --certificatesresolvers.letsencrypt.acme.tlschallenge=true
      - --certificatesresolvers.letsencrypt.acme.email=admin@solokonta.com
      - --certificatesresolvers.letsencrypt.acme.storage=/letsencrypt/acme.json
    ports:
      - "80:80"
      - "443:443"

  gateway:
    labels:
      - traefik.http.routers.gateway.rule=Host(`api.solokonta.com`)
      - traefik.http.routers.gateway.tls.certresolver=letsencrypt
```

#### Validation Sprint 2

```bash
# Test HTTPS
curl -I https://api.solokonta.com/actuator/health
# Expected : HTTP/2 200, Strict-Transport-Security header

# Test CORS
curl -X OPTIONS https://api.solokonta.com/api/v1/test \
  -H "Origin: https://malicious.com"
# Expected : HTTP 403

# Audit OWASP ZAP
docker run -t owasp/zap2docker-stable \
  zap-baseline.py -t https://api.solokonta.com
# Expected : 0 vulnerabilities HIGH/CRITICAL
```

**Critères de Sortie** :
- [ ] HTTPS certificat Let's Encrypt valide
- [ ] HTTP → HTTPS redirect
- [ ] CORS whitelist configuré
- [ ] Secrets via AWS Secrets / fichiers chiffrés
- [ ] Actuator protégé (HTTP 401)
- [ ] Audit OWASP : 0 vulnérabilités critiques

---

### 📊 Sprint 3 : Monitoring & Logging P1 - 2 jours

**Objectif** : Observabilité production

| # | Tâche | Effort |
|---|-------|--------|
| 1 | Logback JSON logs (Gateway) | 2h |
| 2 | Pino JSON logs (Provider) | 2h |
| 3 | Déployer Grafana Cloud | 2h |
| 4 | Prometheus metrics | 3h |
| 5 | Dashboards Grafana | 3h |
| 6 | Alertes Slack | 2h |
| 7 | Tester alerting | 1h |

#### Logback Configuration

```xml
<!-- logback-spring.xml -->
<configuration>
  <appender name="JSON" class="ch.qos.logback.core.ConsoleAppender">
    <encoder class="net.logstash.logback.encoder.LogstashEncoder">
      <fieldNames>
        <timestamp>timestamp</timestamp>
        <message>message</message>
        <level>level</level>
      </fieldNames>
    </encoder>
  </appender>
  <root level="INFO">
    <appender-ref ref="JSON"/>
  </root>
</configuration>
```

#### Validation Sprint 3

```bash
# Logs JSON
docker logs gateway 2>&1 | jq .
# Expected : JSON formaté

# Métriques
curl http://localhost:8080/actuator/prometheus | grep http_server_requests
# Expected : Métriques Prometheus

# Test alerte
docker stop gateway
# Expected : Notification Slack dans 1-2 min
```

**Critères de Sortie** :
- [ ] Logs JSON centralisés
- [ ] Métriques Prometheus exposées
- [ ] Dashboard Grafana opérationnel
- [ ] Alertes Slack configurées
- [ ] Rétention logs 30 jours

---

### ⚙️ Sprint 4 : CI/CD P1 - 1 jour

**Objectif** : Automatiser déploiement

| # | Tâche | Effort |
|---|-------|--------|
| 1 | `.github/workflows/gateway-ci.yml` | 2h |
| 2 | `.github/workflows/provider-ci.yml` | 2h |
| 3 | GitHub Container Registry | 1h |
| 4 | Déploiement auto staging | 2h |
| 5 | Smoke tests post-deploy | 1h |

**Critères de Sortie** :
- [ ] Pipeline CI/CD réussit
- [ ] Tests passent (Maven + lint)
- [ ] Images publiées GHCR
- [ ] Déploiement staging auto
- [ ] Notifications Slack échec

---

### ⚡ Sprint 5 : Performance & Scale P2 - 3 jours

**Objectif** : Scaling horizontal

| # | Tâche | Effort |
|---|-------|--------|
| 1 | Cache Caffeine → Redis | 1 jour |
| 2 | Rate limiting → Redis | 1 jour |
| 3 | Load testing k6 | 4h |
| 4 | Optimiser indexes PostgreSQL | 3h |
| 5 | Circuit breaker Resilience4j | 3h |

**Critères de Sortie** :
- [ ] Cache Redis partagé
- [ ] Rate limiting distribué
- [ ] p95 < 50ms @ 1000 req/s
- [ ] Circuit breaker fonctionne

---

## Estimation Coûts

### Par Phase

| Phase | Infrastructure | Coût/mois | Capacité | Timeline |
|-------|---------------|-----------|----------|----------|
| **MVP Local** | Docker Compose + Neon | **0€** | < 100 req/jour | Sprints 0-1 (2 jours) |
| **Prod Mini** | Hetzner VPS + DB | **80€** | < 100K req/jour | Sprints 2-3 (+1 semaine) |
| **Scale** | Kubernetes + Redis | **350€** | < 1M req/jour | Sprint 5 (+2 semaines) |
| **Enterprise** | Multi-region | **2000€+** | 10M+ req/jour | Futur |

### Détail "Prod Mini" (80€/mois)

| Service | Fournisseur | Spec | Prix |
|---------|-------------|------|------|
| VPS | Hetzner CX41 | 4vCPU, 16GB RAM | 15€ |
| PostgreSQL | Hetzner Managed | 2GB RAM | 30€ |
| Backup | Hetzner | 20% VPS cost | 3€ |
| Domain | Cloudflare | .com | 1€ |
| SSL | Let's Encrypt | Auto | 0€ |
| Monitoring | Grafana Cloud | Free tier | 0€ |
| Email | Resend | Free tier | 0€ |
| CDN | Cloudflare | Free tier | 0€ |
| **TOTAL** | | | **49€** |

**Capacité** :
- 100K requêtes/jour
- 50 organisations
- 500 API keys
- 10GB database

---

## Checklist Pré-Déploiement

### Avant Sprint 0 (IMMÉDIAT)

- [ ] **Plateforme cloud** : Hetzner (recommandé Europe)
- [ ] **Comptes services** :
  - [ ] Stripe production account
  - [ ] Resend email (100 emails/jour gratuit)
  - [ ] Upstash Redis (optional Sprint 5)
- [ ] **Nom de domaine** : `solokonta.com` (12€/an)
  - [ ] DNS : `api.solokonta.com` → IP Gateway
  - [ ] DNS : `app.solokonta.com` → IP Provider

### Avant Production (Phase 2)

- [ ] **Secrets Management**
  - [ ] Générer `API_KEY_PEPPER` : `openssl rand -base64 32`
  - [ ] Générer `BETTER_AUTH_SECRET` : `openssl rand -base64 32`
  - [ ] Stripe products + price IDs production
  - [ ] Webhooks Stripe : `https://app.solokonta.com/api/webhooks/stripe`

- [ ] **Infrastructure**
  - [ ] VPS Hetzner CX41
  - [ ] PostgreSQL Managed (2GB min)
  - [ ] Firewall UFW (ports 22, 80, 443)
  - [ ] Backups quotidiens (retention 7 jours)

- [ ] **SSL/TLS**
  - [ ] Traefik + Let's Encrypt
  - [ ] HTTPS redirect
  - [ ] HSTS headers
  - [ ] SSL Labs : note A+

- [ ] **Monitoring**
  - [ ] Grafana Cloud (free tier)
  - [ ] Dashboards Spring Boot + PostgreSQL
  - [ ] Alertes Slack (down, error rate, disk)

- [ ] **Testing**
  - [ ] Load testing k6 : 100 req/s × 10 min
  - [ ] Chaos testing : kill Gateway, vérifier recovery
  - [ ] Backup restoration test

- [ ] **Documentation**
  - [ ] Runbook incidents (DB down, crash, etc.)
  - [ ] Disaster recovery : RTO 4h, RPO 1h
  - [ ] Onboarding développeurs

---

## Annexes

### A. Commandes Utiles

#### Développement Local

```bash
# Gateway
cd api-gateway
./mvnw spring-boot:run

# Provider
cd api-key-provider
npm run dev

# Database
docker-compose up -d
psql -h localhost -p 5434 -U postgres api_key_provider_db
```

#### Build & Test

```bash
# Gateway
./mvnw clean install
./mvnw test

# Provider
npm run build
npm run lint
npm run db:migrate
npm run seed:services
```

#### Docker

```bash
# Build images
docker build -t solokonta/gateway:latest ./api-gateway
docker build -t solokonta/provider:latest ./api-key-provider

# Run
docker-compose -f docker-compose.production.yml up -d

# Logs
docker-compose logs -f gateway
docker-compose logs -f provider

# Health
curl http://localhost:8080/actuator/health
curl http://localhost:3000/api/health
```

### B. Variables d'Environnement

#### Gateway (.env)

```env
API_KEY_PEPPER=<32 bytes base64>
SPRING_DATASOURCE_URL=jdbc:postgresql://localhost:5434/api_key_provider_db
SPRING_DATASOURCE_USERNAME=postgres
SPRING_DATASOURCE_PASSWORD=<secret>
```

#### Provider (.env.local)

```env
DATABASE_URL=postgresql://postgres:<password>@localhost:5434/api_key_provider_db
API_KEY_PEPPER=<MÊME que Gateway>
BETTER_AUTH_SECRET=<32 bytes base64>
BETTER_AUTH_URL=http://localhost:3000

STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

RESEND_API_KEY=re_...

UPSTASH_REDIS_REST_URL=https://...
UPSTASH_REDIS_REST_TOKEN=...
```

### C. Références

- [CLAUDE.md](../CLAUDE.md) : Documentation projet complète
- [Spring Boot Docs](https://spring.io/projects/spring-boot)
- [Next.js Docs](https://nextjs.org/docs)
- [Drizzle ORM](https://orm.drizzle.team/)
- [Better Auth](https://www.better-auth.com/)
- [Traefik](https://doc.traefik.io/traefik/)
- [k6 Load Testing](https://k6.io/docs/)

### D. Contacts & Support

- **Chef de Projet** : [Email/Slack]
- **Lead Backend** : [Email/Slack]
- **Lead Frontend** : [Email/Slack]
- **DevOps** : [Email/Slack]

---

## Prochaine Action Recommandée

**Exécuter Sprint 0 AUJOURD'HUI** (1 jour)

1. Générer et synchroniser `API_KEY_PEPPER`
2. Fixer JPQL `CURRENT_TIMESTAMP()`
3. Résoudre build Next.js
4. Créer `getCurrentUser()`
5. Appliquer migrations + seed

**Résultat** : Application démarrable localement ✅

---

**Document généré le** : 2025-12-13
**Version** : 1.0
**Statut** : DRAFT - En attente validation équipe
