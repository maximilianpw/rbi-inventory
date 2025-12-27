# Commandes CLI

Référence de toutes les commandes disponibles en ligne de commande pour RBI Inventory.

## Gestionnaire de paquets

Toutes les commandes utilisent pnpm. Exécutez depuis la racine du repository.

## Commandes racine

### Installation

```bash
# Installer toutes les dépendances
pnpm install

# Installation propre (supprimer node_modules d'abord)
rm -rf node_modules && pnpm install
```

### Développement

```bash
# Démarrer tous les services avec devenv
devenv up

# Build tous les packages
pnpm build

# Lint tous les packages
pnpm lint

# Exécuter tous les tests
pnpm test
```

### Documentation

```bash
# Servir la doc localement
pnpm docs:dev

# Build la doc (avec mode strict)
pnpm docs:build
```

## Commandes du module API

Utilisez `pnpm --filter @rbi/api <commande>` ou exécutez depuis `modules/api/`.

### Développement

```bash
# Démarrer le serveur de développement avec hot reload
pnpm --filter @rbi/api start:dev

# Démarrer le serveur de production
pnpm --filter @rbi/api start:prod

# Build l'application
pnpm --filter @rbi/api build
```

### Tests

```bash
# Exécuter les tests unitaires
pnpm --filter @rbi/api test

# Exécuter les tests en mode watch
pnpm --filter @rbi/api test:watch

# Exécuter les tests avec couverture
pnpm --filter @rbi/api test:cov

# Exécuter les tests end-to-end
pnpm --filter @rbi/api test:e2e
```

### Qualité du code

```bash
# Lint le code
pnpm --filter @rbi/api lint

# Lint et corriger
pnpm --filter @rbi/api lint --fix
```

### OpenAPI

```bash
# Générer la spec OpenAPI
pnpm --filter @rbi/api openapi:generate
```

## Commandes du module Web

Utilisez `pnpm --filter @rbi/web <commande>` ou exécutez depuis `modules/web/`.

### Développement

```bash
# Démarrer le serveur de développement
pnpm --filter @rbi/web dev

# Build pour la production
pnpm --filter @rbi/web build

# Démarrer le serveur de production
pnpm --filter @rbi/web start
```

### Qualité du code

```bash
# Lint le code
pnpm --filter @rbi/web lint

# Lint et corriger
pnpm --filter @rbi/web lint:fix
```

### Client API

```bash
# Générer le client API depuis la spec OpenAPI
pnpm --filter @rbi/web api:gen
```

## Package Types

```bash
# Build le package types
pnpm --filter @rbi/types build
```

## Commandes Devenv

Lors de l'utilisation de devenv :

```bash
# Démarrer tous les services (PostgreSQL, API, Web)
devenv up

# Entrer dans le shell devenv
devenv shell

# Exécuter un processus spécifique
devenv processes up api
devenv processes up web
devenv processes up docs
```

## Commandes Base de données

Avec PostgreSQL en cours d'exécution :

```bash
# Se connecter à la base de données
psql -h localhost -p 5432 -U postgres -d rbi_inventory

# Vérifier le statut de la base
pg_isready -h localhost -p 5432
```

## Combinaisons utiles

```bash
# Rebuild complet
pnpm install && pnpm build

# Vérification pré-commit
pnpm lint && pnpm test && pnpm build

# Régénérer les types API après des changements backend
pnpm --filter @rbi/api openapi:generate && pnpm --filter @rbi/web api:gen
```
