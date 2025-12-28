# Workflow PPB - Product Requirements Document, Plan, Build

**Usage** : `/ppb [description du besoin produit]`

Workflow structuré pour transformer une idée produit en code fonctionnel avec documentation formelle.

**Quand utiliser PPB ?**
- ✅ Nouvelle fonctionnalité produit avec besoins utilisateurs
- ✅ Feature complexe nécessitant alignement vision/technique
- ✅ Développement nécessitant documentation formelle
- ✅ Projet avec stakeholders multiples (Product, Tech, Business)
- ✅ Feature critique nécessitant spécifications claires
- ✅ MVP ou nouvelle version majeure

**Quand utiliser EPCT plutôt ?**
- ❌ Refactoring technique pur (sans impact produit)
- ❌ Optimisation performance (sans nouvelle feature)
- ❌ Fix de bug (pas de nouveau besoin)

**Quand utiliser ONESHOT plutôt ?**
- ❌ Amélioration mineure d'une feature existante
- ❌ Modification rapide (< 15 min)

---

## 🎯 PHASE 0: INTAKE (Réception du Besoin)

**Objectif** : Comprendre le besoin utilisateur dans son contexte produit.

### Actions (Main Agent)

1. **Analyser la demande initiale** :
   - Problème à résoudre (pain point)
   - Utilisateurs cibles (persona)
   - Valeur métier attendue
   - Contexte produit

2. **Poser les questions produit** si nécessaire :
   ```
   🎯 QUESTIONS PRODUIT

   Pour rédiger un PRD complet, j'ai besoin de précisions :

   1. **Problème** : Quel problème utilisateur résolvons-nous ?
   2. **Utilisateurs** : Qui utilisera cette feature ? (persona)
   3. **Succès** : Comment mesurer le succès ? (métriques)
   4. **Priorité** : P0 (critique) / P1 (important) / P2 (nice to have)
   5. **Contraintes** : Limitations techniques/business/temps ?
   6. **Alternatives** : Pourquoi cette solution vs autres approches ?
   ```

3. **Confirmer le scope** :
   ```
   📋 SCOPE VALIDÉ

   🎯 Besoin : [Résumé]
   👥 Users : [Persona]
   📊 Priorité : [P0/P1/P2]

   Procéder avec le PRD ? [Y/n]
   ```

### Sortie attendue

```
✅ Besoin produit compris
🎯 Scope défini
📝 Prêt pour phase PRD
```

---

## 📋 PHASE 1: PRD (Product Requirements Document)

**Objectif** : Créer le document de spécifications produit - la "Source de Vérité".

### Délégation d'agents

- **SI** stratégie produit/marketing nécessaire → Invoquer `saas-product-marketing-advisor`
  - Positionnement produit
  - Messaging et value proposition
  - Alignement avec roadmap produit

- **SINON** Main Agent rédige le PRD

### Structure du PRD

Créer `docs/prd/[feature-name]-prd.md` :

```markdown
# PRD: [Nom de la Feature]

**Auteur** : [Nom]
**Date** : [YYYY-MM-DD]
**Status** : DRAFT / REVIEW / APPROVED / IMPLEMENTED
**Priorité** : P0 / P1 / P2
**Version** : 1.0

---

## 1. Contexte & Problème

### 1.1 Problème à Résoudre
[Description du pain point utilisateur]

### 1.2 Utilisateurs Cibles
**Persona Principal** : [Nom du persona]
- Rôle : [Ex: Developer utilisant notre API]
- Besoins : [Liste des besoins]
- Frustrations actuelles : [Ce qui ne marche pas aujourd'hui]

**Persona Secondaire** (si applicable) : [...]

### 1.3 Opportunité Business
- Valeur pour l'utilisateur : [Bénéfice direct]
- Valeur pour le business : [Impact revenus/rétention/acquisition]
- Alignement stratégique : [Lien avec vision produit]

---

## 2. Objectifs & Critères de Succès

### 2.1 Objectifs Produit
1. [Objectif mesurable 1]
2. [Objectif mesurable 2]
3. [Objectif mesurable 3]

### 2.2 Métriques de Succès
**Métriques Primaires** :
- [Métrique 1] : Objectif [valeur] dans [délai]
- [Métrique 2] : Objectif [valeur] dans [délai]

**Métriques Secondaires** :
- [Métrique 3] : [Description]

### 2.3 Non-Objectifs (Out of Scope)
- [Ce que cette feature NE fait PAS]
- [Features exclues volontairement]

---

## 3. Exigences Fonctionnelles

### 3.1 User Stories

**US-1** : [Titre court]
```
En tant que [persona]
Je veux [action]
Afin de [bénéfice]
```
**Critères d'acceptation** :
- [ ] [Critère 1]
- [ ] [Critère 2]
- [ ] [Critère 3]

**US-2** : [Titre court]
[...]

### 3.2 Workflows Utilisateur

**Workflow Principal** :
1. Utilisateur [action 1]
2. Système [réaction 1]
3. Utilisateur [action 2]
4. Système [réaction 2]
5. Résultat : [état final]

**Workflow Alternatif** (si erreur) :
[...]

### 3.3 Règles Métier
1. [Règle 1] : [Description]
2. [Règle 2] : [Description]

---

## 4. Exigences Non-Fonctionnelles

### 4.1 Performance
- Temps de réponse : [< X ms]
- Throughput : [Y requêtes/sec]
- Scalabilité : [Concurrent users supportés]

### 4.2 Sécurité
- Authentification : [Méthode]
- Autorisation : [RBAC, permissions]
- Données sensibles : [Encryption, masking]

### 4.3 UX/UI
- Responsive : [Mobile/Tablet/Desktop]
- Accessibilité : [WCAG AA compliance]
- Loading states : [< 2s max]

### 4.4 Compatibilité
- Navigateurs : [Chrome, Firefox, Safari, Edge]
- Devices : [Desktop, Mobile, Tablet]
- APIs : [Versions supportées]

---

## 5. Contraintes & Dépendances

### 5.1 Contraintes Techniques
- [Contrainte 1] : [Description]
- [Contrainte 2] : [Description]

### 5.2 Contraintes Business
- Budget : [Si applicable]
- Deadline : [Si applicable]
- Compliance : [RGPD, HIPAA, etc.]

### 5.3 Dépendances
**Bloquantes** :
- [Dépendance 1] : [Pourquoi bloquante]

**Non-bloquantes** :
- [Dépendance 2] : [Impact si manquante]

---

## 6. Alternatives Considérées

### 6.1 Solution A : [Nom]
**Avantages** : [Liste]
**Inconvénients** : [Liste]
**Décision** : ❌ Rejetée car [raison]

### 6.2 Solution B : [Nom] ← Solution Retenue
**Avantages** : [Liste]
**Inconvénients** : [Liste]
**Décision** : ✅ Retenue car [raison]

---

## 7. Plan de Déploiement

### 7.1 Stratégie de Rollout
- [ ] Phase 1 : [Beta interne - 10% users]
- [ ] Phase 2 : [Beta publique - 50% users]
- [ ] Phase 3 : [GA - 100% users]

### 7.2 Feature Flags
- `feature_[nom]_enabled` : Boolean (default: false)

### 7.3 Rollback Plan
Si [métrique] < [seuil] après [délai] → Rollback automatique

---

## 8. Documentation & Communication

### 8.1 Documentation Utilisateur
- [ ] Guide utilisateur (docs/)
- [ ] FAQ
- [ ] Vidéo tutoriel (si applicable)

### 8.2 Communication
- [ ] Annonce blog
- [ ] Email utilisateurs
- [ ] Changelog

---

## 9. Open Questions

**Q1** : [Question ouverte]
**Status** : OPEN / RESOLVED
**Décision** : [Réponse si resolved]

---

## 10. Historique des Révisions

| Version | Date | Auteur | Changements |
|---------|------|--------|-------------|
| 1.0 | [Date] | [Nom] | Version initiale |

---

## Approbations

- [ ] Product Manager : [Nom]
- [ ] Tech Lead : [Nom]
- [ ] Design Lead : [Nom] (si applicable)
- [ ] Stakeholder : [Nom] (si applicable)
```

### Mise à jour du contexte

Ajouter dans `session-active.md` :
```markdown
### main-agent - [YYYY-MM-DD HH:MM]
**Tâche** : PPB - Phase PRD
**Actions réalisées** :
- ✅ PRD créé : `docs/prd/[feature-name]-prd.md`
- ✅ User Stories définies : [Nombre] US
- ✅ Critères de succès : [Métriques]
**Fichiers créés** :
- `docs/prd/[feature-name]-prd.md` - PRD complet (v1.0)
**Décisions prises** :
- 🎯 Persona principal : [Nom]
- 🎯 Priorité : [P0/P1/P2]
- 🎯 Solution retenue : [Nom de la solution]
**Prochaines étapes suggérées** :
- [ ] Validation PRD par stakeholders
- [ ] Phase PLAN : Architecture technique
---
```

### ⚠️ CHECKPOINT CRITIQUE

**VALIDATION PRD OBLIGATOIRE** avant de passer à la phase PLAN.

Présenter au user :
```
📋 PRD GÉNÉRÉ

📁 Fichier : docs/prd/[feature-name]-prd.md

📊 Contenu :
- [N] User Stories
- [M] Critères de succès
- [X] Métriques de performance
- [Y] Contraintes techniques

🎯 Solution retenue : [Description courte]

⚠️ Veuillez VALIDER le PRD avant de passer à la phase PLAN.

Options :
[1] ✅ Approuver et continuer vers PLAN
[2] 📝 Demander révisions au PRD
[3] ❌ Annuler le workflow
```

---

## 🏗️ PHASE 2: PLAN (Architecture & Découpage Technique)

**Objectif** : Transformer les exigences produit en plan technique exécutable.

### Prérequis

- ✅ PRD approuvé (status = APPROVED dans le fichier)

### Délégation d'agents

1. **Exploration du contexte existant** :
   - Invoquer `explorator-project-agent` pour comprendre l'architecture actuelle
   - Identifier les patterns existants, la stack, les conventions

2. **Validation architecturale SaaS** (si applicable) :
   - **SI** feature multi-tenant / RBAC / Scale → Invoquer `saas-architect-validator-agent`
   - Valider les 5 Piliers SaaS
   - Décision : VERT / ORANGE / ROUGE

3. **Design API** (si applicable) :
   - **SI** endpoints API → Invoquer `rest-api-architect`
   - Design RESTful resources
   - Validation standards

4. **Design UI/UX** (si applicable) :
   - **SI** composants visuels → Invoquer `saas-ui-ux-specialist`
   - Design system
   - Maquettes/wireframes

### Structure du PLAN

Créer `docs/plan/[feature-name]-plan.md` :

```markdown
# PLAN TECHNIQUE: [Nom de la Feature]

**PRD Source** : `docs/prd/[feature-name]-prd.md`
**Auteur** : [Nom]
**Date** : [YYYY-MM-DD]
**Status** : DRAFT / APPROVED / IMPLEMENTED

---

## 1. Architecture Overview

### 1.1 Stack Technique

**Frontend** :
- Framework : [Next.js 16, React 19]
- Styling : [Tailwind CSS v4]
- State Management : [Zustand, TanStack Query v5]
- Validation : [Zod]

**Backend** :
- Framework : [Spring Boot 3.3.6 / Next.js Server Actions]
- Database : [PostgreSQL]
- ORM : [Drizzle / JPA Hibernate]
- Cache : [Redis]

**Infrastructure** :
- Deployment : [Docker, Vercel, etc.]
- CI/CD : [GitHub Actions]

### 1.2 Architectural Patterns

**Pattern Principal** : [Server Actions / REST API / Microservices]

**Justification** : [Pourquoi ce pattern pour ce use case]

### 1.3 Architecture Diagram

```
┌─────────────┐       ┌──────────────┐       ┌─────────────┐
│   Client    │──────▶│  API Gateway │──────▶│   Service   │
│  (Next.js)  │◀──────│  (Auth/Rate) │◀──────│  (Backend)  │
└─────────────┘       └──────────────┘       └─────────────┘
                              │
                              ▼
                      ┌──────────────┐
                      │  PostgreSQL  │
                      └──────────────┘
```

---

## 2. Database Schema

### 2.1 Nouvelles Tables

**Table : `[table_name]`**
```sql
CREATE TABLE [table_name] (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  [column1] VARCHAR(255) NOT NULL,
  [column2] INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_[table]_[column] ON [table_name]([column]);
```

**Relations** :
- `[table1]` → `[table2]` (foreign key: `[column]`)

### 2.2 Tables Modifiées

**Table : `[existing_table]`**
- ✅ Ajouter colonne : `[new_column] TYPE`
- ✅ Modifier index : `[index_name]`

### 2.3 Migrations

**Drizzle Migration** :
```typescript
// drizzle/migrations/XXXX_add_[feature].ts
export const [tableName] = pgTable('[table_name]', {
  id: uuid('id').primaryKey().defaultRandom(),
  [column]: varchar('[column]', { length: 255 }).notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});
```

**JPA Entity** (si Spring Boot) :
```java
@Entity
@Table(name = "[table_name]")
public class [EntityName] {
  @Id
  @GeneratedValue(strategy = GenerationType.UUID)
  private UUID id;

  @Column(name = "[column]", nullable = false)
  private String [column];
}
```

---

## 3. API Design

### 3.1 Endpoints (REST API)

**Endpoint 1 : Create [Resource]**
```
POST /api/v1/[resource]
Authorization: Bearer {token}

Request Body:
{
  "[field1]": "string",
  "[field2]": 123
}

Response 201 Created:
{
  "id": "uuid",
  "[field1]": "string",
  "created_at": "ISO8601"
}

Errors:
- 400 Bad Request : Validation error
- 401 Unauthorized : Missing/invalid token
- 403 Forbidden : Insufficient permissions
- 429 Too Many Requests : Rate limit exceeded
```

**Endpoint 2 : Get [Resource]**
```
GET /api/v1/[resource]/{id}
[...]
```

### 3.2 Server Actions (Next.js)

**Action : `create[Resource]Action`**
```typescript
// app/actions/[resource].ts
export async function create[Resource]Action(data: [Schema]) {
  // 1. Validate input (Zod)
  // 2. Check permissions (auth)
  // 3. Insert DB (Drizzle)
  // 4. Return result
}
```

---

## 4. File Structure

### 4.1 Nouveaux Fichiers

**Frontend (Next.js)** :
```
app/
├── [feature]/
│   ├── page.tsx              # Main page
│   ├── [resource]-client.tsx # Client component
│   └── loading.tsx           # Loading state
├── actions/
│   └── [resource].ts         # Server Actions
components/
└── [feature]/
    ├── [component1].tsx
    └── [component2].tsx
lib/
├── validations/
│   └── [resource].ts         # Zod schemas
└── types/
    └── [resource].ts         # TypeScript types
```

**Backend (Spring Boot)** :
```
src/main/java/com/[org]/[project]/
├── controller/
│   └── [Resource]Controller.java
├── service/
│   └── [Resource]Service.java
├── repository/
│   └── [Resource]Repository.java
└── model/
    └── [Resource].java
```

### 4.2 Fichiers Modifiés

- `drizzle/schema.ts` : Ajout tables [list]
- `app/layout.tsx` : Ajout [navigation/context/etc.]
- [...] : [Description modification]

---

## 5. Découpage en Tâches

### 5.1 Phase 1 : Database & Backend (P0)

**Durée estimée** : [X heures]

- [ ] **DB-1** : Créer migration Drizzle pour table `[table1]`
- [ ] **DB-2** : Créer JPA Entity `[Entity1]` (si applicable)
- [ ] **BE-1** : Implémenter `[Resource]Repository` avec méthodes CRUD
- [ ] **BE-2** : Implémenter `[Resource]Service` avec business logic
- [ ] **BE-3** : Créer endpoint `POST /api/v1/[resource]`
- [ ] **BE-4** : Créer endpoint `GET /api/v1/[resource]`
- [ ] **BE-5** : Tests unitaires service layer

### 5.2 Phase 2 : Frontend Core (P0)

**Durée estimée** : [Y heures]

- [ ] **FE-1** : Créer Zod schema `[resource]Schema` dans `lib/validations/`
- [ ] **FE-2** : Créer types TypeScript dans `lib/types/`
- [ ] **FE-3** : Implémenter Server Action `create[Resource]Action`
- [ ] **FE-4** : Créer composant `[Component1]` (formulaire création)
- [ ] **FE-5** : Créer composant `[Component2]` (liste/affichage)
- [ ] **FE-6** : Intégrer TanStack Query pour fetch/mutations
- [ ] **FE-7** : Créer page `app/[feature]/page.tsx`

### 5.3 Phase 3 : UX & Polish (P1)

**Durée estimée** : [Z heures]

- [ ] **UX-1** : Loading states (Suspense, Skeleton)
- [ ] **UX-2** : Error boundaries
- [ ] **UX-3** : Toast notifications (success/error)
- [ ] **UX-4** : Form validation feedback
- [ ] **UX-5** : Responsive design (mobile/tablet)

### 5.4 Phase 4 : Tests & Documentation (P1)

- [ ] **TEST-1** : E2E tests (Playwright/Cypress)
- [ ] **TEST-2** : Integration tests
- [ ] **DOC-1** : User documentation (docs/)
- [ ] **DOC-2** : API documentation (Swagger/OpenAPI)

---

## 6. Dépendances & Intégrations

### 6.1 Nouvelles Dépendances NPM

```json
{
  "dependencies": {
    "[package]": "^[version]"
  }
}
```

**Justification** : [Pourquoi cette dépendance]

### 6.2 Nouvelles Dépendances Maven

```xml
<dependency>
  <groupId>[group]</groupId>
  <artifactId>[artifact]</artifactId>
  <version>[version]</version>
</dependency>
```

### 6.3 Services Externes

- **Service : [Stripe/Twilio/etc.]**
  - Intégration : [Description]
  - API Key required : [Env var name]

---

## 7. Security & Performance

### 7.1 Security Checklist

- [ ] Authentication : [JWT/Session/OAuth]
- [ ] Authorization : [RBAC implementation]
- [ ] Input validation : [Zod server-side + client-side]
- [ ] SQL Injection : [Parameterized queries only]
- [ ] XSS : [React auto-escaping + DOMPurify if needed]
- [ ] CSRF : [Token validation]
- [ ] Rate limiting : [Bucket4j/Upstash]
- [ ] Sensitive data : [Encryption at rest]

### 7.2 Performance Targets

- **Page Load** : < 2s (FCP)
- **API Response** : < 200ms (p95)
- **Database Query** : < 50ms (avg)
- **Concurrent Users** : [N] users without degradation

### 7.3 Optimizations

- [ ] Database indexes on `[columns]`
- [ ] Redis cache for `[data]` (TTL: [duration])
- [ ] Frontend: React.memo on `[Component]`
- [ ] API: Pagination (limit 50 items/page)

---

## 8. Rollout & Feature Flags

### 8.1 Feature Flag

**Flag Name** : `feature_[name]_enabled`

**Implementation** :
```typescript
// lib/feature-flags.ts
export const FEATURE_FLAGS = {
  [NAME]: process.env.NEXT_PUBLIC_FEATURE_[NAME] === 'true'
};
```

### 8.2 Rollout Plan

1. **Dev** : Feature flag ON (test internal)
2. **Staging** : Feature flag ON (QA validation)
3. **Production Beta** : Feature flag ON for 10% users (A/B test)
4. **Production GA** : Feature flag ON for 100% users

---

## 9. Risks & Mitigations

| Risk | Impact | Probabilité | Mitigation |
|------|--------|-------------|------------|
| [Risk 1] | High | Medium | [Strategy] |
| [Risk 2] | Medium | Low | [Strategy] |

---

## 10. Success Metrics (Post-Launch)

**Tracking** :
- [ ] Analytics event : `[event_name]` on `[action]`
- [ ] Database query : `SELECT COUNT(*) FROM [table] WHERE created_at > NOW() - INTERVAL '7 days'`
- [ ] Performance monitoring : APM alerts on p95 > 500ms

**Review** : 7 days post-launch

---

## Approbations Techniques

- [ ] Tech Lead : [Nom]
- [ ] Senior Backend Dev : [Nom]
- [ ] Senior Frontend Dev : [Nom]
- [ ] DevOps : [Nom] (si infra changes)
```

### Mise à jour du contexte

```markdown
### main-agent - [YYYY-MM-DD HH:MM]
**Tâche** : PPB - Phase PLAN
**Actions réalisées** :
- ✅ Plan technique créé : `docs/plan/[feature-name]-plan.md`
- ✅ Architecture définie : [Pattern]
- ✅ Database schema : [N] tables
- ✅ Découpage : [M] tâches
**Agents invoqués** :
- explorator-project-agent : Analyse architecture existante
- saas-architect-validator-agent : Validation SaaS (VERT)
**Fichiers créés** :
- `docs/plan/[feature-name]-plan.md` - Plan technique complet
**Décisions prises** :
- 🎯 Pattern : [Server Actions / REST API]
- 🎯 Stack : [Technologies]
- 🎯 Phases : [4 phases, P0/P1]
**Prochaines étapes suggérées** :
- [ ] Validation PLAN par Tech Lead
- [ ] Phase BUILD : Exécution
---
```

### ⚠️ CHECKPOINT CRITIQUE

**VALIDATION PLAN OBLIGATOIRE** avant de passer à la phase BUILD.

```
🏗️ PLAN TECHNIQUE GÉNÉRÉ

📁 Fichier : docs/plan/[feature-name]-plan.md

📊 Contenu :
- Architecture : [Pattern]
- Database : [N] tables, [M] migrations
- API : [X] endpoints
- Tâches : [Y] tasks (P0: [Z], P1: [W])

🎯 Découpage :
- Phase 1 : Backend ([X]h)
- Phase 2 : Frontend ([Y]h)
- Phase 3 : UX/Polish ([Z]h)
- Phase 4 : Tests/Docs ([W]h)

⚠️ Veuillez VALIDER le PLAN avant de passer au BUILD.

Options :
[1] ✅ Approuver et continuer vers BUILD
[2] 📝 Demander révisions au PLAN
[3] ❌ Annuler le workflow
```

---

## 💻 PHASE 3: BUILD (Exécution & Implémentation)

**Objectif** : Transformer le PLAN en code fonctionnel.

### Prérequis

- ✅ PRD approuvé (status = APPROVED)
- ✅ PLAN approuvé (status = APPROVED)

### Contexte fourni aux agents

Avant toute implémentation, fournir **systématiquement** :
1. Le PRD : `docs/prd/[feature-name]-prd.md`
2. Le PLAN : `docs/plan/[feature-name]-plan.md`
3. Session active : `.claude/shared-context/session-active.md`

**Prompt type pour fullstack-expert-agent** :
```
📋 CONTEXTE COMPLET

📄 PRD : docs/prd/[feature-name]-prd.md
🏗️ PLAN : docs/plan/[feature-name]-plan.md

🎯 Tâche : Implémenter Phase [N] - [Nom de la phase]

📝 Tasks à compléter :
- [ ] [Task 1]
- [ ] [Task 2]
- [ ] [Task 3]

⚠️ Impératifs :
- Respecter STRICTEMENT le plan technique
- Suivre les conventions du projet (voir CLAUDE.md)
- Type-safety complète (Zod + TypeScript strict)
- Code production-ready (pas de TODO/FIXME)

Procéder avec l'implémentation.
```

### Délégation d'agents

**Phase 1 : Backend** → Invoquer `fullstack-expert-agent`
- Implémenter database migrations
- Créer JPA entities / Drizzle schema
- Implémenter repositories et services
- Créer endpoints API ou Server Actions

**Phase 2 : Frontend** → Invoquer `fullstack-expert-agent`
- Créer Zod schemas et types
- Implémenter Server Actions ou API calls
- Créer composants React
- Intégrer TanStack Query
- Créer pages Next.js

**Phase 3 : UX/Polish** → Main Agent ou `saas-ui-ux-specialist`
- Loading states
- Error handling
- Toast notifications
- Responsive design

**Phase 4 : Tests & Docs** → Main Agent
- Tests E2E
- Documentation utilisateur
- API documentation

### Suivi de progression

Utiliser TodoWrite pour tracker les tâches du PLAN :

```typescript
TodoWrite({
  todos: [
    { content: "DB-1: Migration table users", status: "completed", activeForm: "Creating migration" },
    { content: "DB-2: JPA Entity User", status: "in_progress", activeForm: "Creating JPA Entity" },
    { content: "BE-1: UserRepository", status: "pending", activeForm: "Implementing repository" },
    // ...
  ]
});
```

### Mise à jour du contexte

Mettre à jour `session-active.md` après chaque phase :

```markdown
### fullstack-expert-agent - [YYYY-MM-DD HH:MM]
**Tâche** : PPB - Phase BUILD - Backend Implementation
**Actions réalisées** :
- ✅ Migration Drizzle : `users` table
- ✅ JPA Entity : `User.java`
- ✅ Repository : `UserRepository.java`
- ✅ Service : `UserService.java` (CRUD + business logic)
- ✅ Endpoint : `POST /api/v1/users` (201 Created)
**Fichiers créés** :
- `drizzle/migrations/XXXX_create_users.ts`
- `src/main/java/com/org/project/model/User.java`
- `src/main/java/com/org/project/repository/UserRepository.java`
- `src/main/java/com/org/project/service/UserService.java`
- `src/main/java/com/org/project/controller/UserController.java`
**Tests** :
- ✅ Build : Success
- ✅ Unit tests : 5/5 passed
**Prochaines étapes suggérées** :
- [ ] Phase 2 : Frontend implementation
---
```

---

## ✅ PHASE 4: TEST & VALIDATION

**Objectif** : Vérifier que l'implémentation répond au PRD.

### Actions (Main Agent)

1. **Build & Compile** :
   ```bash
   # Frontend
   npm run build
   npm run lint

   # Backend
   mvn clean install
   ```

2. **Tests Automatisés** :
   ```bash
   # Frontend
   npm test

   # Backend
   mvn test
   ```

3. **Tests E2E** (si applicable) :
   ```bash
   npm run test:e2e
   ```

4. **Validation Fonctionnelle contre PRD** :

   Pour chaque User Story du PRD :
   ```
   ✅ VALIDATION PRD

   **US-1** : [Titre]
   ✅ Critère 1 : [PASS/FAIL]
   ✅ Critère 2 : [PASS/FAIL]
   ✅ Critère 3 : [PASS/FAIL]

   **US-2** : [Titre]
   [...]
   ```

5. **Validation Métriques** :

   Vérifier les critères de succès du PRD :
   ```
   📊 MÉTRIQUES

   Performance :
   - Page Load : [X]s (Target: < 2s) ✅
   - API Response : [Y]ms (Target: < 200ms) ✅

   Fonctionnel :
   - [Métrique 1] : [Valeur] ✅
   ```

6. **Audit Performance & Sécurité** (si critique) :
   - Invoquer `web-perf-security-optimizer`
   - Vérifier OWASP top 10
   - Vérifier Core Web Vitals

### Sortie attendue

```
✅ VALIDATION COMPLÈTE

Build : ✅ Success
Tests : ✅ [N]/[N] passed
PRD US : ✅ [M]/[M] validated
Performance : ✅ All targets met
Security : ✅ No vulnerabilities

🎯 Feature prête pour déploiement
```

### En cas d'échec

1. Identifier le gap PRD vs Implémentation
2. Retour en phase BUILD avec fix
3. Re-tester jusqu'à succès complet
4. Documenter le problème dans contexte

---

## 💾 PHASE 5: DEPLOY & MONITOR

**Objectif** : Déployer la feature et monitorer les métriques.

### Délégation d'agent

- Invoquer `github-ops-agent` pour versionnement

### Actions (github-ops-agent)

1. **Commit avec référence PRD** :
   ```bash
   git add [fichiers]
   git commit -m "$(cat <<'EOF'
   feat([scope]): [description courte]

   Implements PRD: docs/prd/[feature-name]-prd.md

   User Stories:
   - US-1: [Description]
   - US-2: [Description]

   Technical Implementation:
   - [Point 1]
   - [Point 2]

   Metrics:
   - [Métrique 1]: [Valeur]
   - [Métrique 2]: [Valeur]

   PRD: docs/prd/[feature-name]-prd.md
   PLAN: docs/plan/[feature-name]-plan.md

   🤖 Generated with [Claude Code](https://claude.com/claude-code)

   Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>
   EOF
   )"
   ```

2. **Créer Pull Request** :
   ```bash
   gh pr create --title "feat: [Feature Name]" --body "$(cat <<'EOF'
   ## Summary

   Implements [Feature Name] as per PRD.

   **PRD** : `docs/prd/[feature-name]-prd.md`
   **PLAN** : `docs/plan/[feature-name]-plan.md`

   ## User Stories Implemented

   - ✅ US-1: [Description]
   - ✅ US-2: [Description]

   ## Technical Changes

   ### Backend
   - [Change 1]
   - [Change 2]

   ### Frontend
   - [Change 1]
   - [Change 2]

   ### Database
   - Migration: [Description]

   ## Test Results

   - Build: ✅ Success
   - Unit Tests: ✅ [N]/[N] passed
   - E2E Tests: ✅ [M]/[M] passed
   - Performance: ✅ All targets met

   ## Metrics Targets (Post-Deploy)

   - [Métrique 1]: Target [valeur]
   - [Métrique 2]: Target [valeur]

   ## Rollout Plan

   - [ ] Deploy to staging
   - [ ] QA validation
   - [ ] Feature flag ON for 10% users (Beta)
   - [ ] Monitor metrics for 48h
   - [ ] Feature flag ON for 100% users (GA)

   ## Documentation

   - User docs: `docs/user-guide/[feature].md`
   - API docs: `docs/api/[feature].md`

   🤖 Generated with [Claude Code](https://claude.com/claude-code)
   EOF
   )"
   ```

3. **Mettre à jour statuts PRD et PLAN** :

   Dans `docs/prd/[feature-name]-prd.md` :
   ```markdown
   **Status** : IMPLEMENTED
   **PR** : #[N]
   **Deployed** : [Date]
   ```

   Dans `docs/plan/[feature-name]-plan.md` :
   ```markdown
   **Status** : IMPLEMENTED
   **PR** : #[N]
   ```

### Monitoring Post-Deploy

Créer `docs/metrics/[feature-name]-metrics.md` :

```markdown
# Metrics Tracking: [Feature Name]

**Feature** : [Feature Name]
**PRD** : `docs/prd/[feature-name]-prd.md`
**Deployed** : [Date]

## Success Metrics (from PRD)

| Métrique | Target | Baseline | 7 Days | 30 Days | Status |
|----------|--------|----------|--------|---------|--------|
| [Metric 1] | [Target] | [Value] | [Value] | [Value] | 🟢/🟡/🔴 |
| [Metric 2] | [Target] | [Value] | [Value] | [Value] | 🟢/🟡/🔴 |

## Performance Metrics

| Métrique | Target | Current | Status |
|----------|--------|---------|--------|
| Page Load (FCP) | < 2s | [Value] | 🟢/🔴 |
| API Response (p95) | < 200ms | [Value] | 🟢/🔴 |

## User Feedback

- [Feedback 1]
- [Feedback 2]

## Action Items

- [ ] [Action si métrique rouge]
```

### Mise à jour du contexte final

```markdown
### github-ops-agent - [YYYY-MM-DD HH:MM]
**Tâche** : PPB - Phase DEPLOY
**Actions réalisées** :
- ✅ Commit créé : "feat([scope]): [description]"
- ✅ PR ouverte : #[N]
- ✅ PRD status → IMPLEMENTED
- ✅ Metrics tracking doc créé
**Fichiers modifiés** :
- `docs/prd/[feature-name]-prd.md` - Status IMPLEMENTED
- `docs/plan/[feature-name]-plan.md` - Status IMPLEMENTED
**Fichiers créés** :
- `docs/metrics/[feature-name]-metrics.md` - Tracking post-deploy
**Prochaines étapes suggérées** :
- [ ] Review PR
- [ ] Deploy to staging
- [ ] Monitor metrics
---
```

---

## 📊 Workflow Complet - Exemple

**Demande** : `/ppb Système de notifications in-app pour alerter les utilisateurs sur leur usage API`

### Phase 0: INTAKE
```
🎯 QUESTIONS PRODUIT

1. Problème : Users ne savent pas quand ils approchent de leur limite de crédits
2. Utilisateurs : Developers utilisant notre API (persona: "Alex the API Consumer")
3. Succès : Réduction de 50% des surprises "out of credits"
4. Priorité : P1 (important pour rétention)
5. Contraintes : Doit fonctionner en temps réel (< 5s latency)

Procéder avec le PRD ? [Y]
```

### Phase 1: PRD
```
→ saas-product-marketing-advisor :
   - Positionnement : Feature de "Developer Experience"
   - Value prop : "Never run out of credits unexpectedly"

→ Main Agent :
   - PRD créé : docs/prd/in-app-notifications-prd.md
   - 5 User Stories
   - Métriques : Réduction 50% des churn liés aux crédits

📋 PRD GÉNÉRÉ → VALIDATION → APPROVED
```

### Phase 2: PLAN
```
→ explorator-project-agent :
   - Architecture actuelle : Next.js + Spring Boot
   - Pas de système de notifications existant

→ saas-architect-validator-agent :
   - Validation : VERT (multi-tenancy OK, RBAC simple)

→ rest-api-architect :
   - Endpoints : GET /api/v1/notifications, PATCH /api/v1/notifications/{id}/read

→ Main Agent :
   - Plan créé : docs/plan/in-app-notifications-plan.md
   - Stack : WebSockets (Server-Sent Events) + Redis pub/sub
   - 4 phases, 23 tâches

🏗️ PLAN TECHNIQUE GÉNÉRÉ → VALIDATION → APPROVED
```

### Phase 3: BUILD
```
→ fullstack-expert-agent (Phase 1 - Backend) :
   - ✅ Migration : notifications table
   - ✅ JPA Entity : Notification.java
   - ✅ Service : NotificationService.java (publish/subscribe)
   - ✅ Endpoint : GET /api/v1/notifications

→ fullstack-expert-agent (Phase 2 - Frontend) :
   - ✅ Hook : useNotifications() avec TanStack Query
   - ✅ Component : NotificationBell.tsx
   - ✅ Component : NotificationList.tsx
   - ✅ Integration : Navbar

→ Main Agent (Phase 3 - UX) :
   - ✅ Toast animations (Framer Motion)
   - ✅ Sound notification (optional, user setting)
   - ✅ Badge count (unread)

→ Main Agent (Phase 4 - Tests) :
   - ✅ E2E tests : Notification flow
   - ✅ Docs : User guide
```

### Phase 4: TEST
```
✅ VALIDATION COMPLÈTE

Build : ✅ Success
Tests : ✅ 18/18 passed
PRD US : ✅ 5/5 validated
Performance : ✅ Notification latency < 2s
Security : ✅ No vulnerabilities

🎯 Feature prête pour déploiement
```

### Phase 5: DEPLOY
```
→ github-ops-agent :
   - Commit : "feat(notifications): add in-app notification system"
   - PR #52 créée
   - PRD/PLAN status → IMPLEMENTED
   - Metrics tracking doc créé

🚀 Déployé en staging → Beta (10% users) → GA (100%)
📊 Monitoring : 7 days, 30 days
```

**Temps total** : 6h (PRD: 1h, PLAN: 1h30, BUILD: 3h, TEST: 30min)

---

## 🎯 Principes PPB

1. **Documentation First** : PRD et PLAN avant tout code
2. **Alignment** : Product/Tech/Business alignés via le PRD
3. **Traceability** : Chaque ligne de code traçable au PRD
4. **Validation Gates** : Checkpoints PRD et PLAN obligatoires
5. **Context Richness** : PRD + PLAN fournis aux agents pour éviter hallucinations
6. **Metrics Driven** : Success criteria mesurables dès le PRD

---

## ✅ Checklist de Qualité PPB

- [ ] ✅ Besoin produit compris et validé
- [ ] ✅ PRD complet (User Stories, Metrics, Constraints)
- [ ] ✅ PRD approuvé par stakeholders (status = APPROVED)
- [ ] ✅ PLAN technique détaillé (Architecture, DB, Tasks)
- [ ] ✅ PLAN approuvé par Tech Lead (status = APPROVED)
- [ ] ✅ PRD + PLAN fournis en contexte aux agents
- [ ] ✅ Implémentation conforme au PLAN
- [ ] ✅ Tous les critères d'acceptation (PRD) validés
- [ ] ✅ Tests passés (unit + E2E)
- [ ] ✅ Performance targets atteints
- [ ] ✅ Security audit OK
- [ ] ✅ Documentation utilisateur créée
- [ ] ✅ PR créée avec référence PRD/PLAN
- [ ] ✅ Metrics tracking configuré

---

**Version** : 1.0.0
**Dernière mise à jour** : 2025-12-28
**Auteur** : Nacim84 & Claude Sonnet 4.5
**Inspiré de** : Product Development Best Practices
