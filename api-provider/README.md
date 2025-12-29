# 🔐 API Provider - Portail Développeur & Gestion de Clés

> **Application web moderne pour générer et gérer des clés API permettant de consommer les services de l'API Gateway, avec un système de crédits intégré.**

L'objectif de cette application est d'offrir un portail aux développeurs souhaitant intégrer mes services (PDF, Document Intelligence, Frais Km) dans leurs propres applications. Elle centralise la génération de clés d'accès, la documentation, l'achat de crédits et le suivi de consommation.

⚠️ **Note d'Architecture** : Cette application partage sa base de données PostgreSQL avec l'application `api-gateway-app`. Cela garantit une cohérence immédiate pour la vérification des clés API et la déduction des crédits en temps réel lors des appels API.

[![Next.js](https://img.shields.io/badge/Next.js-16.0.7-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)](https://www.typescriptlang.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-blue)](https://www.postgresql.org/)
[![Drizzle ORM](https://img.shields.io/badge/Drizzle-0.45.0-green)](https://orm.drizzle.team/)
[![License](https://img.shields.io/badge/License-MIT-green)](LICENSE)

---

## 🚀 Sprint 1 : Refactoring DB & Sécurité (Déc 2025)

**Status** : ✅ Implémenté - En attente de tests et déploiement

**Changements majeurs** :
- Migration du stockage des clés API : AES-256 → SHA-256 + Pepper (hash unidirectionnel)
- Support multi-organisation (B2B) avec rôles (`owner`, `admin`, `developer`, `billing`)
- Remplacement de 15 services fictifs par 3 services réels : PDF, AI, Mileage
- Système de permissions granulaires (scopes) : `pdf:read`, `pdf:write`, `ai:read`, etc.
- Wallets par organisation + Test wallets (100 crédits/mois par utilisateur)

**Documentation complète** : [Sprint 1 - Guide d'Exécution](docs/ai/sprint-1-execution-guide.md)

**Scripts npm ajoutés** :
```bash
npm run seed:services      # Seed les 3 services réels
npm run migrate:keys       # Migration AES → SHA-256 (une seule fois)
```

---

## 📋 Table des matières

- [Description](#-description)
- [Services Disponibles](#-services-disponibles)
- [Fonctionnalités](#-fonctionnalités)
- [Stack Technique](#-stack-technique)
- [Architecture & DB Partagée](#-architecture--db-partagée)
- [Installation](#-installation)
- [Configuration](#️-configuration)
- [Utilisation](#-utilisation)
- [Sécurité](#-sécurité)
- [Contribuer](#-contribuer)

---

## 📖 Description

**API Provider** est le front-end de gestion pour mon écosystème d'APIs. Il permet aux utilisateurs (développeurs, entreprises) de s'inscrire, d'acheter des crédits via Stripe, et de générer des **Clés API (API Keys)**.

Ces clés sont ensuite utilisées pour authentifier les requêtes HTTP envoyées vers l'**API Gateway**. Grâce à la base de données partagée, l'API Gateway peut instantanément valider une clé générée ici et vérifier si l'utilisateur possède assez de crédits pour effectuer l'action demandée.

---

## 💎 Services Disponibles

Les clés API générées sur cette plateforme donnent accès aux services suivants (via l'API Gateway) :

1.  **📄 PDF Manipulation & Generation**
    *   Fusionner, convertir, manipuler et générer des documents PDF.
    *   Sources supportées : HTML, Images, autres PDFs, données brutes.

2.  **🧠 Document Intelligence (AI)**
    *   Extraction et compréhension de données depuis n'importe quel document (PDF, Word, Images).
    *   Utilise des modèles de transformation (IA) pour structurer les données.
    *   Outputs : Markdown, CSV, JSON, XML, HTML.

3.  **🚗 Mileage Expenses Generator**
    *   Création automatisée de relevés de frais kilométriques mensuels.
    *   Templates personnalisables pour l'export.

---

## 🚀 Fonctionnalités

### 🔑 Gestion des Clés API (Portail Développeur)

- ✅ **Génération instantanée** de clés API (ex: `sk_live_...`)
- ✅ **Révocation & Régénération** (Rolling keys) en cas de fuite
- ✅ **Scopes & Permissions** (Limiter une clé à un service spécifique : ex: "PDF Only")
- ✅ **Étiquetage** (Nommer les clés : "Prod", "Staging", "Mobile App")
- ✅ **Last Used** : Voir quand et par qui la clé a été utilisée la dernière fois

### 💰 Système de Crédits & Facturation

- ✅ **Portefeuille virtuel** : Achat de crédits prépayés (Top-up) via Stripe
- ✅ **Auto-refill** : Rechargement automatique si le solde est bas
- ✅ **Calcul en temps réel** : Débit immédiat lors de l'appel à l'API Gateway
- ✅ **Facturation** : Génération de factures PDF pour chaque achat

### 📊 Dashboard & Analytics

- ✅ **Suivi de consommation** : Graphiques d'utilisation par jour/mois
- ✅ **Logs d'erreurs** : Aider le développeur à débugger ses intégrations (400, 401, 500)
- ✅ **Répartition des coûts** : Voir quel service consomme le plus de crédits

### 👤 Gestion Compte

- ✅ Authentification (Email/Password, Google, GitHub) via Better Auth
- ✅ Gestion d'équipe (Inviter d'autres développeurs sur le même compte de facturation) - *Roadmap*

---

## 🛠️ Stack Technique

### Frontend (Ce repo)
- **Framework**: Next.js 15+ (App Router)
- **UI**: Tailwind CSS v4, Shadcn/ui, Lucide React
- **State**: Zustand (gestion état global du dashboard)
- **Data Fetching**: TanStack Query v5
- **Charts**: Recharts (pour les analytics)

### Backend (Server Actions)
- **Runtime**: Node.js
- **Auth**: Better Auth
- **Validation**: Zod
- **Payment**: Stripe SDK

### Infrastructure & Data
- **Database**: PostgreSQL 16 (**Partagée avec api-gateway-app**)
- **ORM**: Drizzle ORM (Schémas partagés)
- **Cache/Rate Limit**: Upstash Redis (pour protéger le dashboard)
- **Emails**: Resend

---

## 🏗️ Architecture & DB Partagée

L'élément central est la base de données PostgreSQL partagée.

```mermaid
graph TD
    User((Développeur)) -->|Génère Clé & Achète Crédits| Dashboard[API Provider Next.js]
    User -->|Requête API + Clé| Gateway[API Gateway App]
    
    Dashboard -->|Write Keys & Credits| DB[(Shared PostgreSQL)]
    Gateway -->|Read Keys & Check Credits| DB
    
    subgraph "Base de Données Partagée"
        Tables[Users, ApiKeys, Credits, UsageLogs]
    end
```

**Pourquoi ce choix ?**
1.  **Atomicité** : Pas de latence de synchronisation. Si un utilisateur achète des crédits, l'API Gateway le sait à la milliseconde près.
2.  **Sécurité** : La Gateway vérifie directement en base si la clé est active (pas de cache stale critique).

---

## ⚡ Installation

### Prérequis

- Node.js 20+
- Docker (pour la DB locale)
- Un compte Stripe (Test mode)

### Étapes

```bash
# 1. Cloner le repository
git clone https://github.com/votre-username/api-provider.git
cd api-provider

# 2. Installer les dépendances
npm install

# 3. Configuration de l'environnement
cp .env.local.example .env.local

# 4. Lancer la base de données (si pas déjà active pour la gateway)
docker-compose up -d

# 5. Synchroniser le schéma de base de données (Drizzle)
# Attention : Assurez-vous que cela n'écrase pas les tables de la Gateway si elles existent déjà
npm run db:push

# 6. Initialiser les services (Seed)
# Ajoute les services (PDF, DI, Mileage) dans la table 'services'
npx tsx drizzle/seed/init-services.ts

# 7. Démarrer le serveur de dev
npm run dev
```

---

## ⚙️ Configuration

Le fichier `.env.local` doit pointer vers la même base de données que votre Gateway.

```env
# URL de connexion PostgreSQL (MÊME QUE API-GATEWAY)
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/shared_api_db

# Authentification (Better Auth)
BETTER_AUTH_SECRET=...
BETTER_AUTH_URL=http://localhost:3000

# Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Sécurité (Pour hacher les clés API avant stockage)
API_KEY_PEPPER=... 
```

---

## 📱 Utilisation

### Scénario typique utilisateur :

1.  **Inscription** : L'utilisateur crée un compte sur `/register`.
2.  **Dashboard** : Il voit son solde de crédits (0 par défaut).
3.  **Achat** : Il va sur `/billing`, choisit un pack (ex: 50€ pour 5000 crédits), paie via Stripe.
4.  **Génération** : Il va sur `/keys`, clique sur "Nouvelle Clé", la nomme "Mon App PHP".
5.  **Intégration** : Il copie la clé `sk_live_xxxx`.
6.  **Consommation** : Il utilise cette clé dans son code pour appeler `https://api.votre-domaine.com/v1/pdf/merge`.
7.  **Suivi** : Il revient sur le dashboard pour voir le succès de ses requêtes.

---

## 🔒 Sécurité

- **Stockage des Clés** : Les clés API générées ne sont **jamais stockées en clair**. Seul un hash (SHA-256 + Salt/Pepper) est stocké en base pour la validation. L'utilisateur ne voit la clé complète qu'une seule fois à la création.
- **Isolation** : Chaque utilisateur ne voit que ses propres clés et logs.
- **Paiements** : Aucune donnée bancaire ne transite par l'app, tout est géré par Stripe Elements.

---

## 🤝 Contribuer

Les Pull Requests sont les bienvenues, notamment pour :
- Ajouter de nouveaux types de graphiques d'analytics.
- Améliorer l'UX de la gestion des factures.

Veuillez suivre le style de code défini par ESLint et Prettier.

---

## 📄 Licence

MIT
