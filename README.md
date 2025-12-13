# SoloFlow - API Gateway & Key Provider Ecosystem

## Description du Projet

SoloFlow est un écosystème API complet conçu pour monétiser et sécuriser l'accès à divers microservices. Il se compose d'une **API Gateway** centralisée qui gère la sécurité et la facturation (crédits), et d'un **Portail Développeur** (API Key Provider) où les utilisateurs peuvent gérer leurs clés API et acheter des crédits.

La philosophie centrale est la **Monétisation Atomique** : l'accès est accordé et facturé en temps réel via une architecture de base de données partagée, garantissant une cohérence stricte entre le solde d'un utilisateur et son utilisation de l'API.

### Architecture Système

```mermaid
graph TD
    User((Developer)) -->|1. Inscription & Achat Crédits| Portal[API Key Provider (Next.js)]
    Portal -->|Écrit Clés/Crédits| DB[(PostgreSQL Partagée)]
    
    ClientApp[Application Cliente] -->|2. Requête API + Clé| Gateway[API Gateway (Spring Boot)]
    Gateway -->|Lit Clé & Déduit Crédit| DB
    
    Gateway -- Autorisé --> ServiceA[Service: api-n8n]
    Gateway -- Autorisé --> ServiceB[Autres Services]
```

## Installation

Pour configurer et faire fonctionner l'ensemble de l'écosystème SoloFlow, suivez les étapes ci-dessous :

### Prérequis

-   **Node.js**: Version 20+ (pour `api-key-provider`)
-   **Java**: JDK 21 (pour `api-gateway`)
-   **Maven**: Outil de build (pour `api-gateway`)
-   **Docker**: Pour faire fonctionner la base de données PostgreSQL.

### Étapes d'Installation

1.  **Cloner le dépôt** (si ce n'est pas déjà fait) :
    ```bash
    git clone https://github.com/votre-username/soloslow.git
    cd soloflow
    ```

2.  **Base de Données PostgreSQL** :
    Le projet `api-key-provider` contient un `docker-compose.yml` pour démarrer PostgreSQL.
    Naviguez dans le dossier `api-key-provider` et lancez la DB :
    ```bash
    cd api-key-provider
    docker-compose up -d
    ```
    Assurez-vous que la base de données est accessible sur `localhost:5432` et que les variables d'environnement dans `.env.local` sont correctement configurées pour pointer vers cette DB.

3.  **API Key Provider (Next.js)** :
    Installez les dépendances et configurez la base de données.
    ```bash
    cd api-key-provider
    npm install
    cp .env.local.example .env.local # Configurez vos variables d'environnement
    npm run db:push # Pousse le schéma Drizzle vers la DB
    npm run seed:services # (Optionnel) Ajoute des services d'exemple
    ```

4.  **API Gateway (Spring Boot)** :
    Naviguez dans le dossier `api-gateway`, construisez et exécutez l'application.
    ```bash
    cd api-gateway
    ./mvnw clean install # Construire le projet
    ./mvnw spring-boot:run # Lancer l'API Gateway
    ```

## Utilisation

Une fois que les deux services (`api-key-provider` et `api-gateway`) sont en cours d'exécution et que la base de données est initialisée :

### Scénario Typique d'Utilisation

1.  **Inscription et Achat de Crédits** :
    Accédez au Portail Développeur (par défaut sur `http://localhost:3000` si vous exécutez `api-key-provider` en mode développement).
    -   Créez un compte.
    -   Achetez des crédits via l'interface de facturation.

2.  **Génération de Clés API** :
    Dans le portail, naviguez vers la section de gestion des clés API et générez une nouvelle clé. Notez cette clé, elle ne sera affichée qu'une seule fois.

3.  **Appel à l'API Gateway** :
    Utilisez la clé API générée dans l'en-tête `X-API-KEY` pour effectuer des requêtes vers l'API Gateway. Par exemple, si votre Gateway s'exécute sur `http://localhost:8080` et que vous avez une route `/api/your-route` :
    ```bash
    curl -H "X-API-KEY: sk_live_votre_cle_api" http://localhost:8080/api/your-route
    ```
    L'API Gateway validera votre clé et vos crédits avant de router la requête vers le microservice approprié.

## Contribution

Nous accueillons les contributions ! Veuillez suivre les lignes directrices suivantes :

-   **Structure Monorepo-ish** : Les services distincts résident dans des répertoires de premier niveau (`api-gateway`, `api-key-provider`, `services`).
-   **Conventions Java (Gateway)** : Suivez les conventions de style Spring Boot et Maven. Les tests unitaires sont découragés pour les filtres de sécurité, l'accent est mis sur les tests d'intégration.
-   **Conventions TypeScript (Provider)** : Adhérez aux conventions Next.js (App Router), TypeScript strict et Tailwind CSS. Utilisez Zod pour la validation.
-   **Base de Données** : Toute modification de schéma doit être compatible avec les deux applications utilisant la base de données partagée.

## Licence

Ce projet est sous licence MIT. Pour plus de détails, consultez le fichier `LICENSE` dans les répertoires de chaque sous-projet, ou se référer à la licence MIT générale.
