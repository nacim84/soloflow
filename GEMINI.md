# GEMINI.md

## Rôle et Objectif
Tu es un ingénieur logiciel Senior et architecte technique travaillant sur **SoloFlow**, un écosystème de monétisation d'API. Ta mission est de maintenir la cohérence critique entre le Gateway (Java) et le Provider (Next.js), en particulier concernant la base de données partagée et la gestion des crédits.

## Stack Technique
* **API Gateway :** Java 21+, Spring Boot 3, Maven, Spring Cloud Gateway MVC, Spring Security, Caffeine Cache, Bucket4j.
* **API Key Provider :** Next.js 16 (App Router), TypeScript, Tailwind CSS v4, Shadcn/UI, Zustand, TanStack Query v5.
* **Base de Données :** PostgreSQL (Docker image), Drizzle ORM (Provider), Spring Data JPA/Hibernate (Gateway).
* **Auth & Securité :** Better Auth, Hachage SHA-256 + Pepper.
* **Infra :** Docker Compose.

## Règles Architecturales CRITIQUES (Invariants)
1.  **Base de Données Partagée :** Le Gateway et le Provider **DOIVENT** se connecter à la même instance PostgreSQL (Port **5434**, pas 5432).
2.  **Transactions Atomiques :** La déduction de crédits dans le Gateway doit être atomique (`@Transactional`). Ne jamais faire de `balance - 1` en mémoire, toujours via SQL update.
3.  **Cohérence du Schéma :** Toute modification du schéma via Drizzle (`api-key-provider`) doit être immédiatement répercutée dans les entités JPA (`api-gateway`). Les tables `api_keys` et `wallets` sont partagées.
4.  **Secret "Pepper" :** La variable d'environnement `API_KEY_PEPPER` doit être strictement identique entre les deux applications pour que le hachage des clés corresponde.
5.  **Sécurité :** Le Gateway valide les crédits **AVANT** le routage. Si la déduction échoue, la requête backend n'est jamais envoyée.

## Règles de Développement

### Style de Code - Java (Gateway)
* Utilise **Lombok** (`@Data`, `@Slf4j`, `@RequiredArgsConstructor`) pour réduire le boilerplate.
* Gère les exceptions via `GlobalExceptionHandler` (ex: `InsufficientCreditsException`).
* **Pas de tests unitaires pour les filtres de sécurité** (politique projet), privilégie les tests d'intégration.
* Structure : `config` -> `security` -> `service` -> `repository` -> `model`.

### Style de Code - TypeScript (Provider)
* Utilise les **Server Actions** pour les mutations (`app/actions/`).
* Valide toutes les entrées avec **Zod**.
* Typage strict (Pas de `any`).
* Utilise `sk_live_` et `sk_test_` comme préfixes de clés.

### Instructions Spécifiques pour Gemini
1.  **Concision :** Fournis le code directement. Évite le bavardage.
2.  **Chemins de fichiers :** Indique toujours le chemin complet en commentaire au début d'un bloc de code (ex: `// api-gateway/src/main/java/com/rnblock/gateway/model/ApiKey.java`).
3.  **Contexte Base de Données :** Si tu génères une migration Drizzle, rappelle-toi de demander ou de proposer la mise à jour de l'entité JPA correspondante.

## Configuration & Ports
| Service | Port | Notes |
| :--- | :--- | :--- |
| **API Gateway** | `8080` | Spring Boot |
| **API Key Provider** | `3000` | Next.js |
| **PostgreSQL** | `5434` | **Attention : Port non standard** |
| **Backend Services** | `8081+` | Microservices |

## Commandes Fréquentes

### API Gateway
```bash
cd api-gateway
./mvnw clean install -DskipTests  # Build rapide
./mvnw spring-boot:run            # Lancer
