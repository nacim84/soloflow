# API Credit Gateway - Spécification Technique

## 1. Vue d'Ensemble
Ce projet est une **Gateway API** centralisée basée sur l'architecture Servlet. 
Elle agit comme un middleware de péage : elle intercepte le trafic entrant, 
valide la solvabilité du client (crédits), 
et délègue le routage à **Spring Cloud Gateway MVC**. 

Elle ne gère pas l'authentification utilisateur (login), mais uniquement la validation technique et financière des clés API.

## 2. Objectifs Principaux

Le système repose sur trois piliers :

1.  **Sécurité & Validation** :
    *   Interception via `Spring Security FilterChain`.
    *   Validation de la clé API (existence, signature, activation).
2.  **Gestion Monétaire (Crédits)** :
    *   Vérification atomique du solde.
    *   Décrémentation immédiate avant le routage.
3.  **Routage Déclaratif** :
    *   Utilisation de **Spring Cloud Gateway MVC** pour acheminer les requêtes.
    *   Suppression du code "boilerplate" de routage manuel.

## 3. Stack Technologique

### Core
- **Langage** : Java 21
- **Framework** : Spring Boot 3.5.7
- **Build** : Apache Maven (Layout Standard)
- **Outils** : Lombok

### Web & Routing
- **Framework Web** : Spring Web (Servlet Stack)
- **Routing Engine** : **Spring Cloud Gateway MVC** (Remplace WebClient pour le proxying)
- **Sécurité** : Spring Security (Custom Filter Chain)
- **Monitoring** : Spring Boot Actuator

### Data & Performance
- **Base de données** : PostgreSQL
- **Accès Data** : Spring Data JDBC
- **Cache** : Caffeine (Cache local pour les clés API)
- **Rate Limiting** : Bucket4j (Limitation de débit)

---

## 4. Architecture du Flux de Données (Pipeline)

Le traitement d'une requête suit cet ordre strict :

1.  **Extraction & Sécurité (Security Filter Chain)** :
    *   Le filtre personnalisé extrait le header `X-API-KEY`.
    *   Si manquant → *401 Unauthorized*.
2.  **Validation Métier (Service Layer)** :
    *   Vérification dans le **Cache Caffeine**.
    *   Si absent : Recherche en BDD (Hash) et mise en cache.
    *   Vérification du Rate Limit (Bucket4j).
    *   Si invalide ou limite atteinte → *403 / 429*.
3.  **Transaction de Crédit (Atomicité)** :
    *   Exécution SQL : `UPDATE ... SET credits = credits - 1 WHERE key_hash = ? AND credits > 0`.
    *   Si 0 ligne modifiée (crédit épuisé) → *402 Payment Required*.
    *   *Note : Si cette étape échoue, la requête est stoppée net.*
4.  **Routage (Spring Cloud Gateway MVC)** :
    *   Si la chaîne de sécurité valide la requête, Spring passe la main au moteur de Gateway.
    *   Le Gateway matche la route (ex: `/api/v1/service-a/**` → `http://backend-service-a:8080`).
    *   Transmission transparente des headers et du body.

---

## 5. Modèle de Données (PostgreSQL)

```sql
CREATE TABLE api_keys (
    id BIGSERIAL PRIMARY KEY,
    key_hash VARCHAR(255) NOT NULL UNIQUE, -- Hash SHA-256
    owner_id VARCHAR(50) NOT NULL,
    credits INT NOT NULL DEFAULT 0 CHECK (credits >= 0),
    is_active BOOLEAN DEFAULT TRUE,
    rate_limit INT DEFAULT 10,             -- Limite en Req/Sec
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_api_key_hash ON api_keys(key_hash);
```

---

## 6. Structure du Projet (Maven)

L'architecture est simplifiée car le service de routage manuel disparaît.

```text
src/main/java/com/company/gateway
├── config
│   ├── SecurityConfig.java       // Config de la FilterChain + Beans de sécurité
│   ├── GatewayConfig.java        // Définition des Routes (RouterFunctions)
│   └── CacheConfig.java          // Config Caffeine
├── security
│   ├── ApiKeyAuthFilter.java     // Le filtre qui fait tout le travail de validation
│   └── ApiKeyAuthentication.java // Token interne Spring Security
├── service
│   └── ApiKeyValidationService.java // Logique Cache + DB + Bucket4j
├── repository
│   └── ApiKeyRepository.java     // Spring Data JDBC
├── exception
│   ├── GlobalExceptionHandler.java
│   └── ApiExceptions.java        // Classes d'exceptions (NoCreditsException, etc.)
└── GatewayApplication.java
```

---

## 7. Configuration du Routage (Exemple Conceptuel)

Avec Spring Cloud Gateway MVC, le routage se configure via `application.yml` ou une classe Java `RouterFunction`.

**Exemple `application.yml` :**
```yaml
spring:
  cloud:
    gateway:
      mvc:
        routes:
          - id: weather-service
            uri: http://weather-backend:8081
            predicates:
              - Path=/api/weather/**
          - id: finance-service
            uri: http://finance-backend:8082
            predicates:
              - Path=/api/finance/**
```

---

## 8. Règles de Gestion & Contraintes

### Sécurité & Données
*   **Hachage** : Stockage des clés hashées uniquement.
*   **Zero-Trust** : Aucune requête ne passe au backend si le filtre de sécurité ne valide pas explicitement le crédit.

### Performance
*   **Connection Pooling** : La Gateway MVC utilise le pool de threads de Tomcat (ou Jetty). Il faut configurer `server.tomcat.threads.max` correctement pour la charge.
*   **Circuit Breaker** : Possibilité d'ajouter *Resilience4j* sur les routes Gateway pour gérer les pannes des backends.

### Développement
*   **Tests** : Interdiction stricte de tests unitaires.
*   **Erreurs** : Les erreurs de validation (401, 402, 403) sont gérées par le `GlobalExceptionHandler` avant même que le Gateway ne tente de router la requête.