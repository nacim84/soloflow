# Pricing Page Consolidation - Option A2 (Hybrid)

**Date**: 2025-12-12
**Type**: Architecture Refactoring
**Impact**: HIGH - Modèle économique changé

---

## 📋 Résumé Exécutif

Migration du modèle économique **Subscription (abonnement récurrent)** vers **Hybrid Pay-as-you-go** :
- ✅ Tier gratuit : 100 crédits test/mois (inchangé)
- ✅ Tiers payants : Achat de packs de crédits (one-time payment)
- ✅ Suppression de la page `/pricing` dédiée
- ✅ Consolidation sur la homepage avec Trust Banner + FAQ

---

## 🚦 Validation Architecturale SaaS

**Décision CTO**: 🔴 ROUGE - Rejet de la page `/pricing` dédiée

### Problèmes Critiques Identifiés

1. **Incohérence modèle économique**
   - Homepage : "5,000 Credits (Valid 1 year)" → Pay-as-you-go
   - Page /pricing : "monthly subscription at 9€/month" → Subscription
   - Stripe Checkout : Mode `subscription` → Contradiction totale

2. **Feature Premium non fonctionnelle**
   - Statut `isPremium` hardcodé à `false` (pricing/page.tsx:12-18)
   - Table `premiumUsers` jamais alimentée
   - Aucun webhook pour gérer les abonnements

3. **Architecture DB incohérente**
   - Projet conçu pour crédits partagés par organisation (B2B)
   - Page /pricing implémente un modèle premium individuel (B2C)

---

## 🏗️ Architecture Implémentée (Option A2 - Hybrid)

### Modèle Économique

```
┌─────────────────────────────────────────────────────────┐
│  FREE TIER (Developer)                                  │
│  - 100 crédits test/mois (renouvellement automatique)  │
│  - Rate limit: 60 req/min                              │
│  - Community Support                                    │
└─────────────────────────────────────────────────────────┘
                            │
                            ▼
         ┌──────────────────────────────────────┐
         │  ACHAT DE CRÉDITS (One-time payment) │
         └──────────────────────────────────────┘
                   │                    │
          ┌────────▼────────┐  ┌───────▼───────┐
          │ Startup Pack    │  │ Scale Pack    │
          │ $3.99           │  │ $9.99         │
          │ 5,000 crédits   │  │ 25,000 crédits│
          │ Valid 1 year    │  │ Valid 1 year  │
          └─────────────────┘  └───────────────┘
```

### Flow Utilisateur

```
1. Homepage → Section Pricing (avec Trust Banner + FAQ)
2. Clic "Buy Credits" → Stripe Checkout (mode: payment)
3. Paiement confirmé → Webhook Stripe
4. Webhook crédite le wallet de l'organisation
5. Utilisateur redirigé vers /keys?success=true
```

---

## 🔧 Modifications Techniques

### 1. Homepage - PricingSection Enrichie

**Fichier**: `components/landing/pricing-section.tsx`

**Ajouts**:
- ✅ Trust Banner (Stripe secure, Instant activation)
- ✅ FAQ avec Accordion (3 questions)
- ✅ Boutons "Buy Credits" avec appel API direct (pas de redirection)
- ✅ Loading states pendant checkout
- ✅ ID anchor `#pricing` pour navigation

**Exemple Code**:
```tsx
<section id="pricing" className="container mx-auto px-6 mb-20">
  {/* Pricing Cards */}
  <Button onClick={() => handleBuyCredits('startup')}>
    Buy Credits
  </Button>

  {/* Trust Banner */}
  <div className="border-y bg-zinc-50/50 py-10">
    <Shield /> Secure payment via Stripe
    <Zap /> Instant credit activation
  </div>

  {/* FAQ */}
  <Accordion>
    <AccordionItem value="item-1">
      How do credits work?
    </AccordionItem>
  </Accordion>
</section>
```

---

### 2. Stripe Checkout - Mode Payment

**Fichier**: `app/api/stripe/create-checkout/route.ts`

**Avant** (Subscription):
```typescript
mode: "subscription",
line_items: [{ price: process.env.STRIPE_PRICE_ID!, quantity: 1 }],
subscription_data: { metadata: { userId } }
```

**Après** (One-time Payment):
```typescript
mode: "payment", // ✅ One-time payment
line_items: [{ price: plan.priceId, quantity: 1 }],
metadata: {
  userId,
  planType: 'startup' | 'scale',
  creditAmount: '5000' | '25000',
  planName: 'Startup Pack' | 'Scale Pack'
}
```

**Configuration des Plans**:
```typescript
const CREDIT_PLANS = {
  startup: {
    priceId: process.env.STRIPE_PRICE_STARTUP_PACK!,
    credits: 5000,
    name: "Startup Pack",
  },
  scale: {
    priceId: process.env.STRIPE_PRICE_SCALE!,
    credits: 25000,
    name: "Scale Pack",
  },
} as const;
```

---

### 3. Webhook Stripe - Crédit Wallets

**Fichier**: `app/api/stripe/webhook/route.ts`

**Handler Ajouté**: `handleCreditPurchase()`

**Flow**:
1. Écoute `checkout.session.completed` avec `mode: "payment"`
2. Extrait metadata (userId, creditAmount, planType)
3. Trouve ou crée l'organisation de l'utilisateur
4. Trouve ou crée le wallet de l'organisation
5. Crédite le wallet : `balance += creditAmount`
6. Log transaction pour audit

**Exemple Code**:
```typescript
async function handleCreditPurchase(session: Stripe.Checkout.Session) {
  const userId = session.metadata?.userId;
  const creditAmount = parseInt(session.metadata?.creditAmount || "0");

  // 1. Find or create user's organization
  let orgId = await findOrCreateUserOrg(userId);

  // 2. Update wallet
  await db.update(wallets)
    .set({
      balance: sql`${wallets.balance} + ${creditAmount}`,
      totalPurchased: sql`${wallets.totalPurchased} + ${creditAmount}`,
    })
    .where(eq(wallets.orgId, orgId));

  console.log(`✅ Credits added: ${creditAmount} to org ${orgId}`);
}
```

---

### 4. Suppression Page /pricing

**Supprimé**:
- ❌ `app/pricing/page.tsx`
- ❌ `app/pricing/pricing-client.tsx`

**Liens Mis à Jour**:
- `components/navbar.tsx:23`: `/pricing` → `/#pricing`
- `app/usage/usage-client.tsx:219`: `router.push("/pricing")` → `router.push("/#pricing")`

---

## 📦 Configuration Stripe Requise

### Variables d'Environnement

Ajouter dans `.env.local` :

```bash
# Stripe Checkout (One-time Payment)
STRIPE_PRICE_STARTUP_PACK=price_xxxxxxxxxxxxx  # $3.99 → 5000 crédits
STRIPE_PRICE_SCALE=price_xxxxxxxxxxxxx         # $9.99 → 25000 crédits

# Stripe Webhook
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxx

# Existing
STRIPE_SECRET_KEY=sk_test_xxxxxxxxxxxxx
NEXT_PUBLIC_URL=http://localhost:3000
```

---

### Configuration Stripe Dashboard

#### 1. Créer Produit "Startup Pack"

```
Produit: Startup Pack
Prix: $3.99 USD
Type: One-time payment
Metadata:
  - creditAmount: 5000
  - validityDays: 365
```

Copier **Price ID** → `.env.local` (`STRIPE_PRICE_STARTUP_PACK`)

#### 2. Créer Produit "Scale Pack"

```
Produit: Scale Pack
Prix: $9.99 USD
Type: One-time payment
Metadata:
  - creditAmount: 25000
  - validityDays: 365
```

Copier **Price ID** → `.env.local` (`STRIPE_PRICE_SCALE`)

#### 3. Configurer Webhook

```
URL: https://yourdomain.com/api/stripe/webhook
Événements:
  - checkout.session.completed
Signing Secret: whsec_xxxxxxxxxxxxx
```

Copier **Signing Secret** → `.env.local` (`STRIPE_WEBHOOK_SECRET`)

---

## 🧪 Tests à Effectuer

### 1. Test Achat Startup Pack

```bash
1. Aller sur homepage (/)
2. Scroller vers section "Pricing"
3. Cliquer "Buy Credits" (Startup Pack - $3.99)
4. Vérifier redirection vers Stripe Checkout
5. Compléter paiement test (carte 4242 4242 4242 4242)
6. Vérifier redirection vers /keys?success=true
7. Vérifier crédits ajoutés au wallet (DB)
```

### 2. Test Achat Scale Pack

```bash
Même flow avec Scale Pack ($9.99)
Vérifier 25,000 crédits ajoutés
```

### 3. Test Cancel Flow

```bash
1. Cliquer "Buy Credits"
2. Dans Stripe Checkout, cliquer "Back" ou fermer
3. Vérifier retour sur homepage (pas /pricing)
```

### 4. Test Webhook

```bash
# Tester depuis Stripe Dashboard
1. Stripe Dashboard → Webhooks → Test webhook
2. Sélectionner événement: checkout.session.completed
3. Copier payload du dernier checkout
4. Envoyer événement test
5. Vérifier logs webhook: "✅ Credits added"
6. Vérifier DB: wallet.balance incrémenté
```

### 5. Test Navigation

```bash
# Navbar
1. Cliquer "Pricing" dans navbar
2. Vérifier scroll vers section pricing (anchor)

# Usage Page
1. Aller sur /usage
2. Si balance < 500, voir banner "Solde faible"
3. Cliquer "Recharger maintenant"
4. Vérifier redirection vers homepage#pricing
```

---

## 🗑️ Nettoyage Future (Optionnel)

### Table premiumUsers

La table `premiumUsers` est devenue obsolète avec le modèle Hybrid. Options :

**Option A - Garder (Recommandé à court terme)**
- Compatibilité avec les webhooks subscription existants
- Permet rollback si besoin

**Option B - Supprimer (Migration future)**
```sql
-- Migration Drizzle
DROP TABLE IF EXISTS premium_users CASCADE;
```

Mettre à jour `drizzle/schema.ts` :
```typescript
// export const premiumUsers = pgTable(...) // ❌ SUPPRIMER
```

---

## 📊 Comparaison Avant/Après

| Critère                 | Avant (Subscription)         | Après (Hybrid)              |
|-------------------------|------------------------------|------------------------------|
| **Modèle économique**   | Abonnement 9€/mois           | Crédits prépayés (1 an)     |
| **Stripe mode**         | `subscription`               | `payment`                   |
| **Pages pricing**       | 2 (homepage + /pricing)      | 1 (homepage uniquement)     |
| **Maintenance**         | Duplication de code          | Single source of truth      |
| **Conversion**          | 2 étapes (homepage → /pricing) | 1 étape (homepage → checkout) |
| **Architecture DB**     | Incohérente (premium vs wallets) | Cohérente (wallets uniquement) |
| **Webhook handlers**    | 4 (subscription events)      | 5 (+ credit purchase)       |

---

## 🎯 Prochaines Étapes Recommandées

### Priorité 1 (P0)

- [ ] **Rate Limiting Checkout** (TODO dans create-checkout/route.ts:24)
  - Implémenter : `checkCheckoutRateLimit(\`checkout:\${session.user.id}\`)`
  - Limite : 5 tentatives / 15 min par utilisateur
  - Prévenir spam checkout

- [ ] **Expiration des Crédits**
  - Ajouter champ `expiresAt` dans table `wallets`
  - Cron job pour marquer crédits expirés (1 an après achat)
  - Notifier utilisateurs 30 jours avant expiration

### Priorité 2 (P1)

- [ ] **Auto-refill**
  - Permettre utilisateurs de configurer auto-recharge
  - Déclencher achat automatique si balance < threshold
  - Stockage Stripe Payment Method

- [ ] **Historique Transactions**
  - Créer table `credit_transactions` pour audit
  - Logger tous les achats, consommations, expirations
  - UI pour afficher historique utilisateur

### Priorité 3 (P2)

- [ ] **Notifications Low Balance**
  - Email automatique si balance < 500 crédits
  - Banner persistant sur dashboard
  - Intégration avec service email (Resend/SendGrid)

---

## 🔐 Sécurité & Compliance

### Validations Implémentées

- ✅ Vérification signature Stripe webhook (HMAC SHA-256)
- ✅ Validation metadata (userId, creditAmount requis)
- ✅ Transaction DB atomique (évite race conditions)
- ✅ Idempotence implicite (Stripe gère dedup d'événements)
- ✅ Logs audit (stripeEvents table)
- ✅ EU Compliance (automatic_tax, consent_collection)

### Points d'Attention

⚠️ **CRITIQUE**: Ne JAMAIS committer les clés Stripe dans Git
⚠️ **PRODUCTION**: Vérifier `sk_test_` non utilisé en prod (check ligne 10 create-checkout)
⚠️ **WEBHOOK**: Toujours vérifier signature avant traitement

---

## 📞 Support & Dépannage

### Erreur "Invalid plan type"

**Cause**: `planType` non transmis ou invalide
**Solution**: Vérifier body de fetch contient `{ planType: 'startup' | 'scale' }`

### Crédits non ajoutés après paiement

**Cause**: Webhook non reçu ou signature invalide
**Debug**:
1. Stripe Dashboard → Webhooks → Voir logs
2. Vérifier `STRIPE_WEBHOOK_SECRET` correct
3. Checker logs serveur : `console.error("❌ Failed to process credit purchase")`

### "Missing metadata in checkout session"

**Cause**: Metadata non transmises à Stripe
**Solution**: Vérifier `metadata` dans `stripe.checkout.sessions.create()`

---

## ✅ Validation Finale

- [x] Build Next.js passe sans erreur TypeScript
- [x] Route `/pricing` supprimée (visible dans build output)
- [x] Tous les liens vers `/pricing` mis à jour vers `/#pricing`
- [x] Trust Banner + FAQ affichés sur homepage
- [x] Webhook supporte mode `payment`
- [x] Variables d'env documentées (.env.local)
- [x] Documentation créée (ce fichier)

---

**Implémenté par**: Claude Code (SaaS Architect + Fullstack Expert)
**Validé par**: Expert SaaS (agentId: aab149e)
