---
description: Crée un symlink .claude → .ai pour que Claude Code utilise le dossier .ai
---

# Setup Symlink .claude → .ai

Tu dois créer un symlink (junction sur Windows) du dossier `.claude` vers `.ai` pour que Claude Code puisse accéder aux configurations dans `.ai/`.

## Étapes à suivre :

### 1. Vérifier l'état actuel

Vérifie si `.claude` existe et s'il s'agit d'un symlink ou d'un dossier normal :

```bash
# Sur Windows
powershell -Command "Get-Item .claude -ErrorAction SilentlyContinue | Select-Object LinkType, Target"

# Sur Linux/Mac
ls -la | grep .claude
```

### 2. Supprimer l'ancien .claude (si nécessaire)

**Si `.claude` est un dossier normal** :
- Demande à l'utilisateur de le supprimer manuellement
- Ou propose de le sauvegarder avant suppression

**Si `.claude` est déjà un symlink vers `.ai`** :
- Informe l'utilisateur que c'est déjà configuré ✅
- Rien à faire !

### 3. Créer le symlink

**Sur Windows** :
```bash
powershell -Command "New-Item -ItemType Junction -Path '.claude' -Target '.ai'"
```

**Sur Linux/Mac** :
```bash
ln -s .ai .claude
```

### 4. Vérifier que ça fonctionne

```bash
# Vérifier que .claude pointe bien vers .ai
test -f .claude/settings.local.json && echo "✅ Symlink OK" || echo "❌ Erreur"

# Lister le contenu
ls -la .claude/
```

### 5. Confirmer à l'utilisateur

Affiche un message de succès :

```
✅ Symlink créé avec succès !

Structure actuelle :
.claude/ → (junction vers .ai/)
  ├── agents/
  ├── commands/
  ├── skills/
  └── settings.local.json

Claude Code utilisera maintenant les configurations dans .ai/
```

## Notes Importantes

- **Windows** : Utilise une **junction** (pas besoin de droits admin)
- **Linux/Mac** : Utilise un **symlink** classique
- **Avantage** : Claude Code cherche automatiquement dans `.claude/`
- **Modifications** : Tout changement dans `.ai/` sera visible dans `.claude/`

## Troubleshooting

**Si erreur "Already exists"** :
- Supprime d'abord `.claude` manuellement
- Puis relance la commande

**Si erreur "Permission denied"** :
- Sur Windows : Vérifie que le terminal n'est pas en lecture seule
- Sur Linux/Mac : Utilise `sudo` si nécessaire (rare)

**Si symlink ne fonctionne pas** :
- Vérifie que `.ai/` existe bien
- Vérifie les permissions du dossier
- Essaye avec le chemin absolu : `powershell -Command "New-Item -ItemType Junction -Path '.claude' -Target '$(pwd)\.ai'"`
