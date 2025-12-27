# Développement

Cette section couvre tout ce dont vous avez besoin pour contribuer à la base de code RBI Inventory.

## Aperçu

RBI Inventory est un monorepo pnpm contenant :

- **@rbi/api** - Backend NestJS
- **@rbi/web** - Frontend Next.js
- **@rbi/types** - Types TypeScript partagés

## Liens Rapides

- [Architecture](architecture.md) - Conception du système et stack technique
- [Configuration](setup.md) - Configuration de l'environnement de développement
- [Style de Code](code-style.md) - ESLint, Prettier et conventions
- [Tests](testing.md) - Patterns de tests Jest
- [Développement API](api-development.md) - Patterns NestJS
- [Développement Frontend](frontend-development.md) - Patterns Next.js
- [CI/CD](ci-cd.md) - Workflows GitHub Actions

## Flux de Travail de Développement

1. **Démarrer l'environnement**

    ```bash
    devenv up
    ```

2. **Effectuer les modifications** dans la base de code

3. **Régénérer le client API** (si l'API a changé)

    ```bash
    pnpm --filter @rbi/api openapi:generate
    pnpm --filter @rbi/web api:gen
    ```

4. **Exécuter les tests et le lint**

    ```bash
    pnpm test
    pnpm lint
    ```

5. **Soumettre une pull request**
