# Sprint 1 - Checklist de Migration

**Date**: 2025-12-09  
**Status**: ⏳ En attente d'exécution

---

## Préparation (10 min)

- [ ] 1. Lire la documentation complète
  - [ ] `docs/ai/sprint-1-execution-guide.md`
  - [ ] `docs/ai/sprint-1-refactoring-db-security.md`

- [ ] 2. Backup de la base de données
  ```bash
  pg_dump -U postgres key_api_manager_db > backup_$(date +%Y%m%d_%H%M%S).sql
  ```

- [ ] 3. Générer le pepper
  ```bash
  openssl rand -base64 32
  ```

- [ ] 4. Ajouter dans `.env.local`
  ```env
  API_KEY_PEPPER=<votre_pepper_généré>
  ```

- [ ] 5. Installer les dépendances manquantes
  ```bash
  npm install
  ```

---

## Migration DB (15 min)

- [ ] 6. Appliquer la migration SQL
  ```bash
  npx drizzle-kit push
  # OU
  psql -U postgres -d key_api_manager_db -f drizzle/migrations/0001_refactor_api_keys_to_hash_with_orgs.sql
  ```

- [ ] 7. Migrer les clés existantes (AES → SHA-256)
  ```bash
  npm run migrate:keys
  ```
  **Vérifier la sortie** : Nombre de clés migrées avec succès

- [ ] 8. Seed des services réels
  ```bash
  npm run seed:services
  ```
  **Vérifier** : 3 services créés (PDF, AI, Mileage)

- [ ] 9. Créer organisations par défaut
  - [ ] Créer script `scripts/create-default-orgs.ts` (voir guide)
  - [ ] Exécuter le script
  - [ ] Vérifier en DB que chaque user a une org

---

## Tests (20 min)

- [ ] 10. Test création de clé API
  ```bash
  npm run dev
  ```
  - [ ] Se connecter au dashboard
  - [ ] Créer une nouvelle clé API test
  - [ ] Vérifier que la clé commence par `sk_test_`
  - [ ] Vérifier que la clé n'est affichée qu'une fois

- [ ] 11. Test authentification avec hash
  - [ ] Copier une clé générée
  - [ ] Vérifier en DB que seul le hash est stocké
  ```sql
  SELECT "keyHash", "keyHint", "keyPrefix" FROM api_keys ORDER BY "createdAt" DESC LIMIT 1;
  ```

- [ ] 12. Test révocation
  - [ ] Révoquer une clé depuis le dashboard
  - [ ] Vérifier que `isActive = false`

- [ ] 13. Test quotas (si implémenté dans UI)
  - [ ] Créer une clé avec quota journalier
  - [ ] Vérifier l'incrémentation après usage

---

## Nettoyage (5 min)

**⚠️ ATTENTION : Faire seulement après validation complète**

- [ ] 14. Supprimer colonnes obsolètes
  ```sql
  ALTER TABLE api_keys DROP COLUMN "serviceId";
  ALTER TABLE api_keys DROP COLUMN "encryptedKey";
  ALTER TABLE api_keys DROP COLUMN "accessLevel";
  ALTER TABLE api_keys DROP COLUMN "userId";
  ALTER TABLE api_usage_logs DROP COLUMN "userId";
  ```

- [ ] 15. Ajouter contraintes
  ```sql
  ALTER TABLE api_keys ALTER COLUMN "keyHash" SET NOT NULL;
  ALTER TABLE api_keys ALTER COLUMN "orgId" SET NOT NULL;
  ALTER TABLE api_keys ADD CONSTRAINT api_keys_keyHash_unique UNIQUE("keyHash");
  ```

- [ ] 16. Supprimer tables backup
  ```sql
  DROP TABLE IF EXISTS api_keys_backup;
  DROP TABLE IF EXISTS supported_services;
  DROP TABLE IF EXISTS user_credits;
  ```

---

## Post-Migration (10 min)

- [ ] 17. Update Frontend (si nécessaire)
  - [ ] Modal "Copy API Key" lors de création
  - [ ] Formulaire avec scopes (checkboxes)
  - [ ] Affichage keyPrefix + keyHint

- [ ] 18. Documentation
  - [ ] Mettre à jour README principal
  - [ ] Documenter les nouvelles variables d'environnement

- [ ] 19. Git Commit
  ```bash
  git add .
  git commit -m "feat: Sprint 1 - Refactoring DB & Sécurité (AES → SHA-256 + Multi-org)"
  git push origin feature/migration-to-api-provider
  ```

---

## Déploiement Production

- [ ] 20. Configuration secrets
  - [ ] Ajouter `API_KEY_PEPPER` dans GitHub Secrets
  - [ ] Ou AWS Secrets Manager
  - [ ] Ou Vercel Environment Variables

- [ ] 21. CI/CD
  - [ ] Pipeline de tests automatisés
  - [ ] Smoke tests post-déploiement

- [ ] 22. Monitoring
  - [ ] Alertes sur erreurs de hash
  - [ ] Alertes sur création massive de clés

---

## Troubleshooting

### Erreur : "API_KEY_PEPPER environment variable is not set"
**Solution** :
```bash
openssl rand -base64 32
echo "API_KEY_PEPPER=<pepper>" >> .env.local
npm run dev
```

### Erreur : "Failed to decrypt API key"
**Solution** :
- Vérifier que `ENCRYPTION_KEY` est correcte
- Vérifier le format des données `encryptedKey` en DB

### Erreur : "Organisation not found"
**Solution** :
```sql
-- Vérifier clés sans org
SELECT COUNT(*) FROM api_keys WHERE "orgId" IS NULL;
-- Créer orgs et assigner (voir Étape 9)
```

---

## Rollback (Si Problème Majeur)

```bash
# Restaurer depuis backup
psql -U postgres -d key_api_manager_db < backup_YYYYMMDD_HHMMSS.sql

# Revenir au commit précédent
git reset --hard HEAD~1

# Redémarrer
npm run dev
```

---

## Validation Finale

### Critères de Succès
- ✅ Toutes les anciennes clés migrées avec succès
- ✅ Nouvelles clés générées au format `sk_live_` ou `sk_test_`
- ✅ Hash stocké en DB, pas la clé en clair
- ✅ Organisations créées pour tous les utilisateurs
- ✅ Services réels seeded (3 services)
- ✅ Tests de création/révocation passent
- ✅ Aucune régression sur l'authentification

---

## Support

**En cas de problème** :
- Consulter `docs/ai/sprint-1-execution-guide.md` (section Troubleshooting)
- Vérifier les logs : `npm run dev` (console)
- Rollback si bloqué (voir section Rollback ci-dessus)

**Contact** : Ouvrir une issue sur le repo avec :
- Message d'erreur complet
- Étape où l'erreur s'est produite
- Output du script de migration

---

**Temps Estimé Total** : 1h - 1h30  
**Bon courage !** 🚀
