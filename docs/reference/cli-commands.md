# CLI Commands

Reference of all available command line commands for RBI Inventory.

## Package Manager

All commands use pnpm. Run from the repository root.

## Root Commands

### Installation

```bash
# Install all dependencies
pnpm install

# Clean install (remove node_modules first)
rm -rf node_modules && pnpm install
```

### Development

```bash
# Start all services with devenv
devenv up

# Build all packages
pnpm build

# Lint all packages
pnpm lint

# Run all tests
pnpm test
```

### Documentation

```bash
# Serve docs locally
pnpm docs:dev

# Build docs (with strict mode)
pnpm docs:build
```

## API Module Commands

Use `pnpm --filter @rbi/api <command>` or run from `modules/api/`.

### Development

```bash
# Start development server with hot reload
pnpm --filter @rbi/api start:dev

# Start production server
pnpm --filter @rbi/api start:prod

# Build the application
pnpm --filter @rbi/api build
```

### Testing

```bash
# Run unit tests
pnpm --filter @rbi/api test

# Run tests in watch mode
pnpm --filter @rbi/api test:watch

# Run tests with coverage
pnpm --filter @rbi/api test:cov

# Run end-to-end tests
pnpm --filter @rbi/api test:e2e
```

### Code Quality

```bash
# Lint code
pnpm --filter @rbi/api lint

# Lint and fix
pnpm --filter @rbi/api lint --fix
```

### OpenAPI

```bash
# Generate OpenAPI spec
pnpm --filter @rbi/api openapi:generate
```

## Web Module Commands

Use `pnpm --filter @rbi/web <command>` or run from `modules/web/`.

### Development

```bash
# Start development server
pnpm --filter @rbi/web dev

# Build for production
pnpm --filter @rbi/web build

# Start production server
pnpm --filter @rbi/web start
```

### Code Quality

```bash
# Lint code
pnpm --filter @rbi/web lint

# Lint and fix
pnpm --filter @rbi/web lint:fix
```

### API Client

```bash
# Generate API client from OpenAPI spec
pnpm --filter @rbi/web api:gen
```

## Types Package

```bash
# Build types package
pnpm --filter @rbi/types build
```

## Devenv Commands

When using devenv:

```bash
# Start all services (PostgreSQL, API, Web)
devenv up

# Enter devenv shell
devenv shell

# Run specific process
devenv processes up api
devenv processes up web
devenv processes up docs
```

## Database Commands

With PostgreSQL running:

```bash
# Connect to database
psql -h localhost -p 5432 -U postgres -d rbi_inventory

# Check database status
pg_isready -h localhost -p 5432
```

## Useful Combinations

```bash
# Full rebuild
pnpm install && pnpm build

# Pre-commit check
pnpm lint && pnpm test && pnpm build

# Regenerate API types after backend changes
pnpm --filter @rbi/api openapi:generate && pnpm --filter @rbi/web api:gen
```
