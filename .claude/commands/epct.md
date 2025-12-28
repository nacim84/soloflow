# Workflow EPCT - Explore, Plan, Code, Test

Workflow rigoureux avec orchestration d'agents spécialisés pour le développement de features.

## 📚 PHASE 0: INITIALISATION DU CONTEXTE

**PREMIÈRE ÉTAPE OBLIGATOIRE** : Initialiser le contexte partagé pour cette session.

### Actions

1. **Invoquer context-manager-agent** pour initialiser la session :
   - Demander l'objectif global de la session
   - Créer l'état initial dans `session-active.md`
   - Définir le plan global

2. **Lire le contexte** :
   - Si `session-active.md` contient déjà du contexte → Le charger
   - Annoncer : `📖 Contexte chargé : [résumé]`

### Sortie attendue

```
✅ Session initialisée
🎯 Objectif : [Objectif de la session]
📊 Phase : ANALYSE
📄 Contexte prêt pour les agents
```

---

## 🔍 PHASE 1: ANALYSE & ROUTING (Orchestrateur)

**Rôle** : Le Main Agent (Claude Code) joue le rôle d'**Orchestrateur** qui coordonne les agents spécialisés selon le type de tâche.

### Actions

1. **Analyser la demande** de l'utilisateur :
   - Type de tâche ? (Feature SaaS, UI/UX, Refactoring, Bug fix, etc.)
   - Complexité ? (Simple, Modérée, Complexe)
   - Domaine ? (Backend, Frontend, Fullstack, Architecture, etc.)

2. **Décider quels agents** seront nécessaires pour chaque phase :
   - Feature SaaS → `saas-architect-validator-agent` requis en phase PLAN
   - Feature UI/UX → `ui-designer-agent` requis en phase PLAN
   - Nouveau projet / Refactoring majeur → `explorator-project-agent` requis en phase EXPLORE
   - Implémentation complexe → `fullstack-expert-agent` requis en phase CODE
   - Commit/PR demandé → `github-ops-agent` requis en phase SAVE

3. **Créer un plan d'orchestration** et le communiquer à l'utilisateur :
   ```
   📋 PLAN D'ORCHESTRATION EPCT

   🎯 Tâche : [Description]
   📊 Complexité : [Simple/Modérée/Complexe]
   🔀 Type : [Feature SaaS/UI/UX/Refactoring/etc.]

   📍 Agents qui seront invoqués :
   - Phase EXPLORE : [Liste des agents]
   - Phase PLAN : [Liste des agents]
   - Phase CODE : [Liste des agents]
   - Phase TEST : [Main Agent]
   - Phase SAVE : [Liste des agents]

   Procéder ? [Attendre confirmation]
   ```

4. **Mettre à jour le contexte** avec le plan d'orchestration :
   ```markdown
   ### main-agent - [YYYY-MM-DD HH:MM]
   **Tâche** : Orchestration EPCT - Analyse et routing
   **Actions réalisées** :
   - ✅ Analyse du type de tâche : [Type]
   - ✅ Plan d'orchestration défini
   **Plan d'orchestration** :
   - EXPLORE : [Agents]
   - PLAN : [Agents]
   - CODE : [Agents]
   - TEST : Main Agent
   - SAVE : [Agents]
   **Prochaines étapes suggérées** :
   - [ ] Phase EXPLORE : Exploration du contexte
   ---
   ```

### Agents disponibles

- `context-manager-agent` : Gestion du contexte partagé
- `explorator-project-agent` : Exploration exhaustive de codebase
- `saas-architect-validator-agent` : Validation d'architecture SaaS
- `ui-designer-agent` : Design UI/UX et propositions visuelles
- `fullstack-expert-agent` : Implémentation fullstack (Next.js/Spring Boot)
- `github-ops-agent` : Opérations Git et GitHub CLI
- `rest-api-architect` : Design et standards API REST
- `n8n-workflow-specialist` : Automatisation et workflows n8n
- `saas-product-marketing-advisor` : Stratégie produit et marketing
- `web-perf-security-optimizer` : Audit performance et sécurité

---

## 🔍 PHASE 2: EXPLORE (Exploration & Contexte)

**Objectif** : Comprendre l'état actuel du projet AVANT toute modification.

### Délégation d'agents

- **SI** nouveau projet OU refactoring majeur → Invoquer `explorator-project-agent`
- **SINON** Main Agent effectue exploration légère :
  - Lire `CLAUDE.md` (instructions projet)
  - Analyser arborescence (`ls`, `tree`, ou `Glob`)
  - Lire fichiers concernés par la tâche

### Sortie attendue

- Rapport de contexte consolidé (Architecture, Stack, Patterns, Conventions)
- **INTERDICTION** : N'écrire AUCUNE ligne de code pendant cette phase

### Mise à jour du contexte

Chaque agent doit mettre à jour `session-active.md` avec :
- Fichiers analysés
- Architecture découverte
- Patterns identifiés
- Conventions repérées
- Points d'attention

**Exemple** :
```markdown
### explorator-project-agent - [YYYY-MM-DD HH:MM]
**Tâche** : Exploration exhaustive du projet
**Actions réalisées** :
- ✅ Analyse de 145 fichiers
- ✅ Stack identifiée : Next.js 14, TypeScript, Tailwind
- ✅ Patterns : Server Actions, App Router
**Fichiers clés** :
- `app/layout.tsx` - Layout principal
- `lib/actions/*.ts` - Server Actions
**Décisions prises** :
- 🎯 Architecture fullstack Next.js native (pas de backend séparé)
**Prochaines étapes suggérées** :
- [ ] Valider l'architecture avec saas-architect-validator-agent
---
```

---

## 📋 PHASE 3: PLAN (Planification & Validation Architecturale)

**Objectif** : Valider l'approche AVANT d'écrire du code.

### Délégation d'agents

1. **SI** feature SaaS (multi-tenancy, RBAC, scale) → Invoquer `saas-architect-validator-agent` :
   - Analyse des 5 Piliers SaaS
   - Décision : VERT / ORANGE / ROUGE
   - Recommandations architecturales

2. **SI** nouvelle API ou refactoring API → Invoquer `rest-api-architect` :
   - Design des ressources et URIs
   - Validation des standards (Maturity Model)
   - Stratégie de sécurité et versioning

3. **SI** nouvelle feature majeure / lancement → Invoquer `saas-product-marketing-advisor` :
   - Positionnement et messaging
   - Stratégie de pricing (si applicable)
   - Alignement avec la roadmap produit

4. **SI** composant visuel / ergonomique → Invoquer `ui-designer-agent` :
   - Concept UI/UX
   - Palette de couleurs et composants
   - Structure responsive

5. **Main Agent** consolide les validations et propose plan détaillé :
   - Fichiers à créer / modifier
   - Étapes d'implémentation
   - Décisions techniques prises
   - Prérequis et dépendances

### ⚠️ CHECKPOINT CRITIQUE

**VALIDATION UTILISATEUR OBLIGATOIRE** avant de passer à la phase CODE.

Présenter :
```
📋 PLAN D'IMPLÉMENTATION

🏗️ Décisions architecturales :
- [Décision 1]
- [Décision 2]

📝 Fichiers à modifier :
- `path/to/file1.ts` - [Description]
- `path/to/file2.tsx` - [Description]

🔄 Étapes d'implémentation :
1. [Étape 1]
2. [Étape 2]
3. [Étape 3]

⚠️ Points d'attention :
- [Point critique 1]
- [Point critique 2]

Procéder avec l'implémentation ? [OUI / NON / AJUSTEMENTS]
```

### Mise à jour du contexte

Mettre à jour `session-active.md` dans `## 🗺️ Plan Global` avec le plan validé.

---

## 💻 PHASE 4: CODE (Implémentation)

**Objectif** : Implémenter le plan validé.

### Délégation d'agents

- **SI** implémentation complexe (Next.js, Spring Boot, Zod, TanStack Query) → Invoquer `fullstack-expert-agent`
- **SI** workflow d'automatisation / intégration → Invoquer `n8n-workflow-specialist`
- **SINON** Main Agent code directement si modification simple

### Principes d'implémentation

1. **Appliquer le plan validé** à la lettre
2. **Respecter les conventions** identifiées en phase EXPLORE
3. **Assurer type safety** (Zod validation, TypeScript strict)
4. **Code production-ready** (pas de code tutoriel)
5. **Documenter les décisions** non évidentes

### Mise à jour du contexte

Mettre à jour `session-active.md` avec :
- Fichiers créés / modifiés
- Décisions d'implémentation prises
- Problèmes rencontrés et solutions

**Exemple** :
```markdown
### fullstack-expert-agent - [YYYY-MM-DD HH:MM]
**Tâche** : Implémentation du système d'authentification
**Actions réalisées** :
- ✅ Créé `lib/actions/auth.ts` (Server Actions)
- ✅ Créé `components/LoginForm.tsx` (Formulaire avec validation Zod)
- ✅ Créé `lib/validations/auth.ts` (Schemas Zod)
**Fichiers modifiés** :
- `lib/actions/auth.ts` - Server Actions pour login/logout
- `components/LoginForm.tsx` - Formulaire React avec React Hook Form
- `lib/validations/auth.ts` - Validation Zod
**Décisions prises** :
- 🎯 Utilisation de Server Actions (pas d'API Route)
- 🎯 Validation côté serveur avec Zod
- 🎯 État de loading géré par useFormState
**Prochaines étapes suggérées** :
- [ ] Tester le formulaire de login
- [ ] Vérifier les erreurs de validation
---
```

---

## ✅ PHASE 5: TEST (Vérification)

**Objectif** : Vérifier que l'implémentation fonctionne.

### Actions (Main Agent & Specialists)

1. **Build & Lint** :
   ```bash
   npm run build
   npm run lint
   ```

2. **Tests automatisés** (si existants) :
   ```bash
   npm test
   ```

3. **Audit Performance & Sécurité** (si critique) :
   - Invoquer `web-perf-security-optimizer` pour audit approfondi
   - Vérifier Core Web Vitals, N+1 queries, failles OWASP

4. **Tests manuels** :
   - Lancer le serveur de dev
   - Tester la fonctionnalité implémentée
   - Vérifier les cas d'erreur
   - Tester responsive si UI

### Preuves requises

**PAS DE "C'est fait" SANS DÉMONSTRATION**

Fournir :
- Output du build (succès ou erreurs)
- Output des tests
- Screenshots si UI
- Logs de console si nécessaire

### En cas d'erreur

1. **Analyser l'erreur** en détail
2. **Retour en phase CODE** avec fix
3. **Re-tester** jusqu'à succès
4. **Documenter le problème et la solution** dans le contexte

### Mise à jour du contexte

```markdown
### main-agent - [YYYY-MM-DD HH:MM]
**Tâche** : Tests et vérification
**Actions réalisées** :
- ✅ Build réussi (0 erreurs)
- ✅ Lint réussi
- ✅ Tests manuels : Login fonctionne correctement
**Problèmes rencontrés** :
- 🚧 Erreur TypeScript sur LoginForm.tsx:23 : Solution = Ajout du type correct
**Prochaines étapes suggérées** :
- [ ] Commit des changements
---
```

---

## 💾 PHASE 6: SAVE (Versionnement & Sauvegarde)

**Objectif** : Sauvegarder le travail effectué (si demandé par l'utilisateur).

### Délégation d'agent

- **SI** commit / PR demandé → Invoquer `github-ops-agent`

### Actions (github-ops-agent)

1. **Git status** : Vérifier les fichiers modifiés
2. **Git add** : Ajouter les fichiers pertinents (JAMAIS `.env`)
3. **Git commit** : Message clair et descriptif
4. **Branche feature** : Créer si nécessaire (`feat/nom-de-la-feature`)
5. **Pull Request** : Ouvrir si applicable avec description complète

### Mise à jour du contexte

```markdown
### github-ops-agent - [YYYY-MM-DD HH:MM]
**Tâche** : Versionnement Git et création PR
**Actions réalisées** :
- ✅ Commit créé : "feat: add authentication system"
- ✅ Branche créée : feat/authentication
- ✅ PR ouverte : #42
**Fichiers commités** :
- `lib/actions/auth.ts`
- `components/LoginForm.tsx`
- `lib/validations/auth.ts`
**Prochaines étapes suggérées** :
- [ ] Review de la PR
---
```

---

## 🗄️ PHASE 7: CLÔTURE DE SESSION (Optionnel)

**Objectif** : Archiver la session si la feature est complète.

### Quand clôturer ?

- Feature complète et testée
- Tous les commits effectués
- L'utilisateur confirme la clôture

### Actions

1. **Invoquer context-manager-agent** pour archiver la session :
   - Calcul des métriques finales
   - Archivage de `session-active.md` vers `session-history/session-XXX.md`
   - Réinitialisation pour la prochaine session

2. **Sortie attendue** :
   ```
   🗄️ SESSION ARCHIVÉE

   📁 Fichier : session-history/session_015.md
   📊 Métriques :
      - Durée : 2h30min
      - Agents : explorator, saas-architect, fullstack-expert, github-ops
      - Fichiers : 12 fichiers modifiés
      - Décisions : 8 décisions architecturales
      - État : ✅ TERMINÉ

   📄 Nouvelle session active créée et prête.
   ```

---

## 🎯 Principes d'Orchestration

1. **Délégation Intelligente** : Bon agent au bon moment
2. **Consolidation** : Synthèse des retours agents pour l'utilisateur
3. **Validation Continue** : Checkpoint utilisateur avant implémentation
4. **Traçabilité** : Indication claire de quel agent est invoqué et pourquoi
5. **Adaptabilité** : Ajustement selon complexité de la demande
6. **Contexte Partagé** : Tous les agents mettent à jour `session-active.md`

---

## 📊 Exemple de Workflow Complet

**Demande** : "Ajoute un système de partage de workspace avec rôles (admin, editor, viewer)"

### Phase 0: INITIALISATION
```
→ context-manager-agent : Initialisation session
   🎯 Objectif : Système de partage de workspace avec RBAC
```

### Phase 1: ANALYSE
```
→ Main Agent (Orchestrateur) :
   - Type : Feature SaaS (multi-tenancy + RBAC)
   - Agents requis :
     * EXPLORE : explorator-project-agent
     * PLAN : saas-architect-validator-agent
     * CODE : fullstack-expert-agent
     * SAVE : github-ops-agent
```

### Phase 2: EXPLORE
```
→ explorator-project-agent :
   - Analyse architecture actuelle
   - Stack : Next.js 14, Prisma, PostgreSQL
   - Patterns : Server Actions, RBAC existant
   - 📖 Contexte mis à jour
```

### Phase 3: PLAN
```
→ saas-architect-validator-agent :
   - Analyse 5 Piliers SaaS
   - Décision : VERT (Architecture validée)
   - Recommandations : Rate limiting sur invitations
   - 📖 Contexte mis à jour

→ Main Agent :
   - Plan consolidé avec toutes validations
   - ⚠️ CHECKPOINT : Validation utilisateur → OUI
```

### Phase 4: CODE
```
→ fullstack-expert-agent :
   - Implémentation Prisma schema (WorkspaceMember, Role)
   - Server Actions (invite, updateRole, remove)
   - Composants React (InviteForm, MembersList)
   - Validation Zod complète
   - 📖 Contexte mis à jour
```

### Phase 5: TEST
```
→ Main Agent :
   - Build : ✅ Succès
   - Lint : ✅ Succès
   - Tests manuels : ✅ Invitation fonctionne
   - 📖 Contexte mis à jour
```

### Phase 6: SAVE
```
→ github-ops-agent :
   - Commit : "feat: add workspace sharing with RBAC"
   - Branche : feat/workspace-sharing
   - PR : #45 créée
   - 📖 Contexte mis à jour
```

### Phase 7: CLÔTURE
```
→ context-manager-agent :
   - Session archivée : session_015.md
   - Métriques : 4 agents, 17 fichiers, 3h15min
   - Nouvelle session prête
```

---

## ✅ Checklist de Qualité

Avant de terminer le workflow EPCT, vérifier :

- [ ] ✅ Session initialisée avec context-manager-agent
- [ ] ✅ Contexte lu au début de chaque phase
- [ ] ✅ Plan d'orchestration communiqué à l'utilisateur
- [ ] ✅ Exploration effectuée (explorator-project-agent si nécessaire)
- [ ] ✅ Validation architecturale (saas-architect ou ui-designer si applicable)
- [ ] ✅ CHECKPOINT utilisateur validé avant CODE
- [ ] ✅ Implémentation conforme au plan validé
- [ ] ✅ Tests réussis avec preuves
- [ ] ✅ Contexte mis à jour à chaque phase
- [ ] ✅ Commit/PR effectué si demandé
- [ ] ✅ Session archivée si feature terminée

---

**Version** : 2.0.0 (avec Système de Contexte Partagé)
**Dernière mise à jour** : 2025-12-18
**Auteur** : Nacim84
