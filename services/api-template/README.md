# API Template Services

Template de Microservice Spring Boot, initialement conçu pour des workflows n8n, fournissant des exemples d'implémentation pour la génération de documents (PDF/HTML) et de calculs complexes.

## 📋 Fonctionnalités

*   **Génération de Notes de Frais Kilométriques** : Calcul automatique des indemnités selon la puissance fiscale (5, 6 ou 7 CV) et le kilométrage annuel cumulé.
*   **Génération de Timesheets** : Création de relevés mensuels excluant automatiquement les week-ends et les jours fériés (calendrier français géré de 2025 à 2030).
*   **Rendu HTML** : Utilisation de templates Thymeleaf (`frais-kilometriques-template.html`) pour générer des documents prêts à être convertis en PDF.
*   **Sécurité** : Authentification Basic Auth intégrée.

## 🛠 Stack Technique

*   **Langage** : Java 24
*   **Framework** : Spring Boot 3.5.4
*   **Moteur de Template** : Thymeleaf
*   **Build Tool** : Maven
*   **Conteneurisation** : Docker

## 🚀 Démarrage Rapide

### Prérequis

*   JDK 24 (si lancement local sans Docker)
*   Docker & Docker Compose

### Lancement Local

```bash
# Compiler et lancer
./mvnw spring-boot:run
```

L'application sera accessible sur `http://localhost:8080`.

### Lancement avec Docker

```bash
docker-compose up -d --build
```

## ⚙️ Configuration & Sécurité

L'application est sécurisée par **Spring Security** (Basic Auth). Les identifiants sont configurables via `application.properties` ou variables d'environnement.

| Propriété | Description |
| :--- | :--- |
| `app.admin.username` | Nom d'utilisateur pour l'authentification |
| `app.admin.password` | Mot de passe administrateur |

⚠️ **Note** : Le profil `prod` est activé par défaut dans le Dockerfile.

## 🔌 Endpoints API

Base URL : `/api/v1`

### 1. Générer Note de Frais (`POST /frais-kilometriques`)

Génère un objet JSON contenant le HTML de la note de frais et les détails du calcul.

**Body (JSON) :**
```json
{
  "year": 2025,
  "month": 8,
  "previousKilometers": 3948.0,
  "tripsPerWeek": 4,
  "destination": "12 Rue Villiot, 75012 Paris",
  "client": "Nom Client",
  "kilometersPerTrip": 42.0,
  "firstName": "John",
  "lastName": "DOE",
  "fiscalPower": 5
}
```

### 2. Générer Timesheet HTML (`POST /timesheet`)

Retourne directement le code HTML de la feuille de temps pour le mois donné.

**Body (JSON) :** *Même structure que ci-dessus.*

## 📊 Règles de Gestion

*   **Jours Fériés** : Prise en charge automatique des jours fériés fixes et mobiles français pour les années 2025 à 2030.
*   **Calcul Kilométrique** : Applique le barème fiscal progressif (tranches < 5000km, 5000-20000km, > 20000km).
*   **Planification** : Répartition intelligente des jours de présence selon le nombre de trajets par semaine (ex: 4 jours/semaine = Mardi à Vendredi).
