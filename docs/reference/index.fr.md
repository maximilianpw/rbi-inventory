# Référence

Documentation de référence technique pour RBI Inventory.

## Contenu

- [Variables d'environnement](environment-variables.md) - Toutes les options de configuration
- [Commandes CLI](cli-commands.md) - Commandes disponibles en ligne de commande
- [Dépannage](troubleshooting.md) - Problèmes courants et solutions

## Liens rapides

### Documentation API

L'API est documentée via OpenAPI/Swagger :

- **Local :** http://localhost:8080/api/docs
- **Fichier spec :** `openapi.yaml` à la racine du repository

### Types générés

Les types TypeScript du frontend sont générés depuis la spec OpenAPI :

```bash
pnpm --filter @rbi/web api:gen
```

Les fichiers générés sont dans `modules/web/src/lib/data/generated.ts`.
