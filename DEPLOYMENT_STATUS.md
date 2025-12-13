# 🚀 SoloKonta - État de Déploiement

**Dernière mise à jour** : 2025-12-13
**Statut global** : 🔴 **NON PRÊT POUR PRODUCTION**

---

## 📊 Vue d'Ensemble

| Composant | Statut | Build | Tests | Déploiement |
|-----------|--------|-------|-------|-------------|
| **API Gateway** | 🟡 Dev OK | ✅ Compile | ❌ 0% | ❌ Pas de Dockerfile |
| **API Key Provider** | 🔴 Build fail | ❌ Erreur | ❌ 0% | ❌ Pas de Dockerfile |
| **Intégration** | 🔴 Cassée | - | - | ❌ Pepper non sync |

---

## 🎯 Points Bloquants Critiques (P0)

### Must Fix Avant Déploiement

| # | Bloqueur | Composant | Impact | Effort |
|---|----------|-----------|--------|--------|
| 1 | `API_KEY_PEPPER` manquant | Gateway + Provider | Crash au démarrage | 30 min |
| 2 | JPQL `CURRENT_TIMESTAMP()` invalide | Gateway | Exception déduction crédits | 15 min |
| 3 | Build Next.js échoue (`.claude`) | Provider | Application non compilable | 1h |
| 4 | `getCurrentUser()` manquant | Provider | Build échoue | 30 min |
| 5 | Pepper non synchronisé | Intégration | Auth API cassée | 30 min |
| 6 | Aucun Dockerfile | Gateway + Provider | Impossible containeriser | 3h |
| 7 | Secrets hardcodés | Gateway + Provider | Violation sécurité | 3h |
| 8 | Pas de HTTPS | Infrastructure | MITM attack | 4h |
| 9 | Migrations non appliquées | Provider | DB vide = crash | 30 min |
| 10 | Aucune CI/CD | Projet | Déploiement manuel | 4h |

**Total Effort P0** : ~1 jour (fixes critiques) + 2 jours (infrastructure)

---

## 📅 Roadmap Rapide

### Sprint 0 : Fixes Critiques - 1 jour (AUJOURD'HUI)
```bash
✓ Générer API_KEY_PEPPER unique
✓ Synchroniser pepper Gateway ↔ Provider
✓ Fixer JPQL CURRENT_TIMESTAMP()
✓ Résoudre build Next.js
✓ Créer getCurrentUser()
✓ Appliquer migrations + seed
```
**Résultat** : Application démarrable localement ✅

### Sprint 1 : Dockerisation - 1 jour
```bash
□ Créer Dockerfiles multi-stage
□ Docker Compose production
□ Scripts build/deploy
```
**Résultat** : Application containerisable ✅

### Sprint 2 : Sécurité - 2 jours
```bash
□ HTTPS Traefik + Let's Encrypt
□ Secrets externalisés (AWS Secrets)
□ CORS configuré
□ Audit OWASP ZAP
```
**Résultat** : Production sécurisée ✅

### Sprint 3 : Monitoring - 2 jours
```bash
□ Logs JSON centralisés
□ Prometheus + Grafana
□ Alertes Slack
```
**Résultat** : Observabilité complète ✅

---

## 💰 Coûts Estimés

| Phase | Timeline | Infrastructure | Coût/mois |
|-------|----------|----------------|-----------|
| **MVP Local** | Sprints 0-1 (2 jours) | Docker Compose + Neon | **0€** |
| **Production Mini** | Sprints 2-3 (+1 semaine) | Hetzner VPS + DB | **80€** |
| **Scale** | Sprint 5 (+2 semaines) | Kubernetes + Redis | **350€** |

### Détail Production Mini (80€/mois)
- VPS Hetzner CX41 (4vCPU, 16GB) : 15€
- PostgreSQL Managed (2GB) : 30€
- Backup : 3€
- Domain + SSL : 1€
- Monitoring/Email/CDN : 0€ (free tiers)

**Capacité** : 100K req/jour, 50 organisations, 500 API keys

---

## ✅ Quick Start Sprint 0

### 1. Générer Secrets (15 min)

```bash
# Créer pepper unique
mkdir -p secrets
openssl rand -base64 32 > secrets/api_key_pepper.txt

# Configurer Gateway
echo "API_KEY_PEPPER=$(cat secrets/api_key_pepper.txt)" > api-gateway/.env

# Configurer Provider
echo "API_KEY_PEPPER=$(cat secrets/api_key_pepper.txt)" >> api-key-provider/.env.local
```

### 2. Fixer Gateway (15 min)

```java
// api-gateway/src/main/java/com/rnblock/gateway/repository/WalletRepository.java
// Ligne 22 : Changer
w.updatedAt = CURRENT_TIMESTAMP()  // ❌
// En
w.updatedAt = CURRENT_TIMESTAMP    // ✅
```

### 3. Fixer Provider (1h 30)

```bash
# Exclure .claude
echo ".claude" >> api-key-provider/.gitignore
echo ".claude" >> api-key-provider/.dockerignore

# Créer getCurrentUser()
cat > api-key-provider/lib/utils/auth.ts <<'EOF'
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export async function getCurrentUser() {
  const session = await auth.api.getSession({
    headers: await headers()
  });
  if (!session?.user) throw new Error("Unauthorized");
  return session.user;
}
EOF

# Appliquer migrations
cd api-key-provider
npm run db:migrate
npm run seed:services
```

### 4. Tester (30 min)

```bash
# Terminal 1: Gateway
cd api-gateway && ./mvnw spring-boot:run

# Terminal 2: Provider
cd api-key-provider && npm run dev

# Terminal 3: Test
curl -X POST http://localhost:3000/api/keys \
  -H "Content-Type: application/json" \
  -d '{"name": "Test", "orgId": "org_test"}'
```

**Succès si** :
- ✅ Gateway démarre sans RuntimeException
- ✅ Provider compile (`npm run build`)
- ✅ Création API key retourne HTTP 201
- ✅ Requête API retourne HTTP 200/402

---

## 📖 Documentation Complète

- **Audit Complet** : [`docs/ai/audit-deployment-roadmap-2025-12-13.md`](./api-key-provider/docs/ai/audit-deployment-roadmap-2025-12-13.md) (178 KB)
  - Audit technique détaillé Gateway + Provider
  - Validation architecture 5 Piliers SaaS
  - Roadmap sprints 0-5 avec estimations
  - Checklist pré-déploiement

---

## 🚦 Critères de Déploiement

### Phase 1 : MVP Local (✅ Après Sprint 0-1)
- [x] Application démarre sans erreur
- [ ] Tests manuels fonctionnels
- [ ] Docker Compose déploie localement

### Phase 2 : Production Mini (⏳ Après Sprint 2-3)
- [ ] HTTPS avec certificat valide
- [ ] Secrets externalisés
- [ ] Monitoring + alertes opérationnels
- [ ] Load testing p95 < 100ms

### Phase 3 : Production Scale (⏳ Après Sprint 5)
- [ ] Scaling horizontal (3+ instances)
- [ ] Rate limiting distribué (Redis)
- [ ] CI/CD automatique
- [ ] Load testing p95 < 50ms @ 1000 req/s

---

## 🆘 Contacts

- **Chef de Projet** : [Email/Slack]
- **Lead Backend** : [Email/Slack]
- **Lead Frontend** : [Email/Slack]
- **DevOps** : [Email/Slack]

---

**Prochaine action** : Exécuter Sprint 0 (1 jour) → Application démarrable localement
