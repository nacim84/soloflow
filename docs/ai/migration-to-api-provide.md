Bonjour. En tant qu'expert fonctionnel SaaS et Product Manager, j'ai analysé la nouvelle version de votre README.

**Le pivot est réussi.** L'incohérence a disparu : le projet est désormais clairement défini comme un **Portail Développeur (Developer Portal)** permettant de monétiser vos propres technologies (PDF, AI, Km).

Voici l'analyse mise à jour et mes recommandations pour la phase de développement, basées sur cette nouvelle direction.

### 1. ✅ Validation du Concept (Pivot Confirmé)

Le conflit *"Stockage de clés externes vs Vente de services"* est résolu.
*   **Avant :** "Je stocke mes clés AWS pour que l'app les utilise." (Risqué et peu utile).
*   **Maintenant :** "Je génère une clé pour consommer VOS services PDF/IA." (Modèle économique clair type Stripe/Twilio).

**Impact immédiat :** L'architecture est simplifiée. Vous n'avez plus besoin de gérer le déchiffrement complexe de clés tierces pour les injecter dans des appels. Vous devez uniquement **vérifier** (hash check) les clés entrantes.

---

### 2. 💡 Recommandations Fonctionnelles (Architecture SaaS)

Pour transformer ce README en un produit robuste, voici les spécificités à implémenter :

#### A. Architecture du "Wallet Unifié" (Priorité Haute)
Le README mentionne un système de crédits. Pour une UX fluide :
*   **Ne liez pas les crédits à une Clé API spécifique.**
*   **Liez les crédits à l'Organisation (ou l'Utilisateur).**
*   *Pourquoi ?* Un client peut avoir 3 clés (Prod, Staging, Dev). Si "Prod" n'a plus de crédits mais que "Dev" en a 5000, le service de prod va couper. C'est frustrant.
*   **Modèle recommandé :** Une table `Wallets` liée au `User`. Toutes les `ApiKeys` de cet utilisateur puisent dans ce même `Wallet`.

#### B. Gestion des Scopes (Permissions Granulaires)
Puisque vous avez 3 services distincts (PDF, AI, Frais), le système de clé doit gérer des droits.
*   **Feature :** Lors de la création de la clé, ajouter des cases à cocher.
    *   `pdf:write` (Autorisé)
    *   `ai:read` (Refusé - peut-être parce que c'est plus cher et le client ne veut pas que ses devs l'utilisent par erreur)
*   **Implémentation :** Stocker un tableau de scopes (ex: `["pdf", "mileage"]`) dans la table `ApiKeys` et le vérifier dans l'API Gateway.

#### C. Le Playground (Zone de Test)
Pour vendre de l'API, il faut réduire la friction.
*   **Ajout indispensable :** Une page "Sandbox" dans le dashboard.
*   L'utilisateur peut uploader un PDF test, cliquer sur "Fusionner", et voir le résultat *sans écrire une ligne de code*, en utilisant ses crédits gratuits.

---

### 3. 🛡️ Sécurité & Gestion des Clés (Correction Technique)

Le README a corrigé le tir sur le stockage, mais soyons précis pour le développement :

#### A. Hachage vs Chiffrement (Point Critique)
Dans la version précédente, on parlait d'AES (reversible). Dans ce nouveau modèle :
*   **Vous ne devez JAMAIS stocker la clé générée (ex: `sk_live_123...`) de manière réversible.**
*   Vous devez stocker son **Empreinte (Hash)** (SHA-256 ou Argon2).
*   *Pourquoi ?* Si votre base de données fuite, les pirates ne pourront pas utiliser les clés des clients car ils n'auront que les hashs. L'API Gateway, elle, recevra la clé en clair lors de la requête, la hachera, et comparera avec la base.

#### B. Préfixe de Clé
Adoptez un format reconnaissable pour faciliter le support client et les scans de sécurité (comme Github ou Stripe) :
*   `sk_live_...` (Clé de production)
*   `sk_test_...` (Clé de test - ne débitant pas de vrais crédits ou utilisant un wallet "fictif").

---

### 4. 📊 Analytics orientés "Business"

Le dashboard ne doit pas seulement montrer "Nombre d'appels", mais justifier la valeur de votre service.

*   **Logs enrichis :**
    *   Au lieu de : `POST /merge - 200 OK`
    *   Afficher : `POST /merge - 5 pages processed - Cost: 5 credits`
*   **Métrique clé :** Afficher le solde restant en gros, avec une estimation de la date d'épuisement ("À ce rythme, vos crédits expirent dans 12 jours").

---

### 5. 📝 Roadmap Révisée (Plan d'action)

Voici la nouvelle structure logique pour vos sprints de développement :

1.  **Sprint 1 : Identity & DB**
    *   Setup Next.js + Better Auth.
    *   **DB Schema :** Tables `Users`, `Wallets`, `ApiKeys` (avec colonne `hash` et `scopes`), `Services`.
    *   Pas encore de stockage externe chiffré (supprimé).

2.  **Sprint 2 : Key Management (Provider side)**
    *   UI de génération de clé (générer string aléatoire -> afficher 1 fois -> hasher -> stocker DB).
    *   UI de révocation / renommage.

3.  **Sprint 3 : Billing & Credits**
    *   Intégration Stripe (Achat ponctuel).
    *   Webhook Stripe : `payment_succeeded` -> `UPDATE wallets SET balance = balance + amount`.
    *   Logique de débit (simulation) : Créer une Server Action qui simule ce que fera l'API Gateway (`checkKey` + `decrementCredit`).

4.  **Sprint 4 : Dashboard & Analytics**
    *   Graphiques de consommation (Recharts).
    *   Liste des logs d'utilisation.

---

### Résumé pour le développeur

1.  **Oubliez** le chiffrement AES bidirectionnel pour les clés API. Passez au Hachage unidirectionnel.
2.  **Architecture DB :** Assurez-vous que la table `Credits/Wallet` est centralisée sur l'utilisateur, pas sur la clé.
3.  **Focus Gateway :** Gardez en tête que ce dashboard est "passif". Il écrit dans la DB. C'est l'autre application (Gateway) qui sera "active" (lecture DB + débit crédits).
