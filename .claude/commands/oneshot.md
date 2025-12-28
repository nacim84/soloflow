# Workflow ONESHOT - Quick Feature Evolution

**Usage** : `/oneshot [description de l'amélioration]`

Workflow rapide et optimisé pour implémenter une amélioration ou évolution d'une fonctionnalité existante.

**Quand utiliser ONESHOT ?**
- ✅ Amélioration d'une feature existante
- ✅ Optimisation de performance
- ✅ Ajout d'une option/paramètre à une fonctionnalité
- ✅ Refactoring localisé (1-3 fichiers)
- ✅ Correction étendue (plus qu'un simple bugfix)
- ✅ Amélioration UX/UI mineure

**Quand utiliser EPCT plutôt ?**
- ❌ Nouvelle feature majeure
- ❌ Changement d'architecture
- ❌ Ajout de dépendances majeures
- ❌ Multi-tenancy / RBAC / Security critique
- ❌ Modification de plus de 5 fichiers

---

## 🎯 PHASE 0: LOAD CONTEXT (5 secondes)

**Objectif** : Charger le contexte existant sans formalités.

### Actions

1. **Lire le contexte actuel** :
   ```bash
   Read: .claude/shared-context/session-active.md
   ```

2. **Annoncer brièvement** :
   ```
   📖 Contexte chargé
   🎯 Tâche oneshot : [Description]
   🚀 Mode : FAST TRACK
   ```

3. **PAS d'invocation de context-manager** (sauf si session jamais initialisée)

---

## 🔍 PHASE 1: QUICK EXPLORE (30 secondes)

**Objectif** : Comprendre rapidement le code concerné par l'amélioration.

### Actions (Main Agent)

1. **Identifier les fichiers cibles** :
   - Utiliser `Glob` pour trouver les fichiers concernés
   - Utiliser `Grep` pour chercher les patterns pertinents

2. **Lire les fichiers clés** (2-5 fichiers max) :
   - Fichier principal de la fonctionnalité
   - Tests associés (si existants)
   - Types/Schemas (si applicable)

3. **Identifier les conventions** :
   - Pattern de code utilisé (Server Actions, API Routes, etc.)
   - Style de validation (Zod, yup, etc.)
   - Naming conventions

### Sortie attendue

```
🔍 ANALYSE RAPIDE

📁 Fichiers identifiés :
- `app/keys/page.tsx` - Composant principal
- `app/actions/keys.ts` - Server Actions
- `drizzle/schema.ts` - Schema DB

📊 Conventions repérées :
- Server Actions pour les mutations
- Validation Zod stricte
- Type-safety avec Drizzle ORM

🎯 Zone d'impact : [Description]
```

**INTERDICTION** : Pas d'invocation d'`explorator-project-agent` sauf si absolument nécessaire.

---

## 📋 PHASE 2: LIGHT PLAN (1 minute)

**Objectif** : Définir rapidement les changements à apporter.

### Actions (Main Agent)

1. **Déterminer la complexité** :
   - **Simple** : 1-2 fichiers, pas de validation architecturale nécessaire
   - **Modérée** : 3-5 fichiers, validation optionnelle
   - **Complexe** : 5+ fichiers → **PASSER À EPCT**

2. **Plan d'action** :
   ```
   📋 PLAN ONESHOT

   🎯 Objectif : [Description]
   📊 Complexité : [Simple/Modérée]

   📝 Modifications :
   - `file1.ts` : [Action]
   - `file2.tsx` : [Action]

   🔄 Étapes :
   1. [Étape 1]
   2. [Étape 2]
   3. [Étape 3]

   ⏱️ Temps estimé : [5-15 min]
   ```

3. **Validation architecturale** (SI nécessaire) :
   - **SI** Security/RBAC/Multi-tenancy → Invoquer `saas-architect-validator-agent`
   - **SI** Nouveaux composants visuels → Invoquer `saas-ui-ux-specialist`
   - **SINON** → Skip validation, continuer direct

### ⚠️ CHECKPOINT LÉGER

**SI complexité = Simple** : Pas de validation utilisateur, continuer
**SI complexité = Modérée** : Demander confirmation :
```
Procéder avec ce plan ? [Y/n]
```

---

## 💻 PHASE 3: CODE (5-10 minutes)

**Objectif** : Implémenter l'amélioration rapidement.

### Délégation d'agents

- **SI** Next.js/Spring Boot/Fullstack → Invoquer `fullstack-expert-agent`
- **SI** Simple modification → Main Agent code directement
- **SI** Performance critique → Invoquer `web-perf-security-optimizer` APRÈS implémentation

### Principes

1. **Modification minimale** : Toucher le moins de code possible
2. **Conservation des patterns** : Suivre les conventions existantes
3. **Type-safety** : Maintenir la cohérence TypeScript/Zod
4. **Pas de sur-ingénierie** : Pas d'ajout de features non demandées

### Mise à jour du contexte (optionnel)

Si l'amélioration est significative, ajouter une entrée dans `session-active.md` :
```markdown
### main-agent - [YYYY-MM-DD HH:MM]
**Tâche** : Oneshot - [Description courte]
**Actions réalisées** :
- ✅ Modifié `file1.ts` - [Action]
- ✅ Modifié `file2.tsx` - [Action]
**Décisions prises** :
- 🎯 [Décision technique si pertinente]
---
```

---

## ✅ PHASE 4: QUICK TEST (2 minutes)

**Objectif** : Vérifier que l'amélioration fonctionne.

### Actions (Main Agent)

1. **Build rapide** (si applicable) :
   ```bash
   npm run build
   # OU
   mvn clean compile -DskipTests
   ```

2. **Lint** (si applicable) :
   ```bash
   npm run lint
   ```

3. **Test manuel ciblé** :
   - Tester uniquement la fonctionnalité modifiée
   - Vérifier qu'il n'y a pas de régression évidente

### Sortie attendue

```
✅ TESTS RAPIDES

Build : ✅ Succès
Lint : ✅ Succès
Test manuel : ✅ [Fonctionnalité] fonctionne correctement

🎯 Amélioration validée
```

**SI ERREUR** :
1. Fix immédiat
2. Re-test
3. PAS de contexte détaillé sauf si problème complexe

---

## 💾 PHASE 5: COMMIT (30 secondes)

**Objectif** : Commiter l'amélioration immédiatement.

### Actions

1. **Git status** :
   ```bash
   git status
   ```

2. **Commit direct** (sur la branche actuelle, pas de nouvelle branche) :
   ```bash
   git add [fichiers modifiés]
   git commit -m "enhance: [description courte]"
   ```

   **Convention de message** :
   - `enhance:` pour amélioration
   - `optimize:` pour optimisation performance
   - `refactor:` pour refactoring
   - `ux:` pour amélioration UX/UI

3. **Push** (optionnel, demander confirmation) :
   ```bash
   git push
   ```

### Note

- **PAS d'invocation de github-ops-agent** (overhead inutile pour oneshot)
- **PAS de nouvelle branche** (sauf si demandé explicitement)
- **PAS de PR** (commit direct sur branche actuelle)

---

## 🎯 Principes ONESHOT

1. **Rapidité** : 10-15 minutes maximum du début à la fin
2. **Focus** : Une seule amélioration à la fois
3. **Simplicité** : Pas d'over-engineering
4. **Pragmatisme** : Skip les étapes non essentielles
5. **Autonomie** : Main Agent fait 80% du travail, agents spécialisés seulement si nécessaire
6. **Contexte léger** : Mise à jour optionnelle du contexte partagé

---

## 📊 Exemple de Workflow Complet

**Demande** : `/oneshot Ajouter un bouton "Copy to clipboard" sur les API keys`

### Phase 0: LOAD CONTEXT
```
📖 Contexte chargé
🎯 Tâche oneshot : Ajouter bouton "Copy to clipboard" sur API keys
🚀 Mode : FAST TRACK
```

### Phase 1: QUICK EXPLORE
```
🔍 ANALYSE RAPIDE

📁 Fichiers identifiés :
- `app/keys/page.tsx` - Liste des API keys
- `components/ui/button.tsx` - Composant Button

📊 Conventions : Server Components Next.js 14, Shadcn/UI
🎯 Zone d'impact : Composant d'affichage des keys
```

### Phase 2: LIGHT PLAN
```
📋 PLAN ONESHOT

🎯 Objectif : Bouton copy to clipboard avec toast feedback
📊 Complexité : Simple

📝 Modifications :
- `app/keys/page.tsx` : Ajouter bouton + fonction copy

🔄 Étapes :
1. Ajouter composant Button avec icône Copy
2. Implémenter fonction navigator.clipboard.writeText()
3. Toast de confirmation

⏱️ Temps estimé : 8 min
```

### Phase 3: CODE
```
→ Main Agent :
   - Ajout bouton Copy avec icône
   - Fonction handleCopy() avec clipboard API
   - Toast success/error
```

### Phase 4: QUICK TEST
```
✅ TESTS RAPIDES

Build : ✅ Succès
Lint : ✅ Succès
Test manuel : ✅ Copy fonctionne, toast s'affiche

🎯 Amélioration validée
```

### Phase 5: COMMIT
```
git add app/keys/page.tsx
git commit -m "enhance: add copy to clipboard for API keys"
git push
```

**Temps total** : 12 minutes

---

## ⚠️ Quand basculer vers EPCT

Si pendant le oneshot tu réalises que :
- Les modifications touchent plus de 5 fichiers
- L'architecture doit être modifiée
- De nouvelles dépendances sont nécessaires
- La sécurité est impactée (auth, permissions, etc.)
- Le changement est plus complexe que prévu

→ **ARRÊTER le oneshot** et basculer vers `/epct`

---

## ✅ Checklist de Qualité ONESHOT

- [ ] ✅ Contexte chargé rapidement
- [ ] ✅ Fichiers cibles identifiés (< 5 fichiers)
- [ ] ✅ Plan léger défini
- [ ] ✅ Code implémenté en suivant les conventions
- [ ] ✅ Tests rapides passés
- [ ] ✅ Commit effectué avec message conventionnel
- [ ] ✅ Temps total < 20 minutes

---

**Version** : 1.0.0
**Dernière mise à jour** : 2025-12-28
**Auteur** : Nacim84
**Inspiré de** : EPCT Workflow v2.0.0
