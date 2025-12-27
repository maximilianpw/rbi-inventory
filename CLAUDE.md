# RBI Inventory System - Agent Context

> pnpm monorepo for yacht provisioning inventory management. NestJS API + Next.js frontend.

## Tech Stack

**Backend:** NestJS 11 · TypeORM · PostgreSQL 16 · Clerk Auth · OpenAPI/Swagger
**Frontend:** Next.js 16 · React 19 · TanStack Query/Form · Tailwind · Radix UI · Orval
**Tooling:** pnpm workspaces · devenv.sh · TypeScript

## Monorepo Structure

```
rbi/
├── modules/
│   ├── api/                 # @rbi/api - NestJS backend
│   └── web/                 # @rbi/web - Next.js frontend
├── packages/
│   ├── types/               # @rbi/types - Shared TypeScript types
│   ├── tsconfig/            # Shared TS configs
│   └── eslint-config/       # Shared ESLint config
├── openapi.yaml             # Generated API spec (source of truth for frontend)
├── pnpm-workspace.yaml
└── devenv.nix               # Nix dev environment
```

## Architecture

```
┌─────────────────────────────────────────┐
│           Next.js Frontend              │
│  React Query ←── Orval (generated) ←────┼── openapi.yaml
│  Clerk Auth                             │
└─────────────────────────────────────────┘
                    ▼ HTTP/REST
┌─────────────────────────────────────────┐
│            NestJS Backend               │
│  Controller → Service → Repository      │
│  ClerkAuthGuard · TypeORM · Swagger ────┼──► openapi.yaml
└─────────────────────────────────────────┘
                    ▼
┌─────────────────────────────────────────┐
│             PostgreSQL                  │
└─────────────────────────────────────────┘
```

## OpenAPI-First Workflow

```bash
# 1. Backend generates spec from decorators
pnpm --filter @rbi/api openapi:generate   # → openapi.yaml

# 2. Frontend generates typed hooks from spec
pnpm --filter @rbi/web api:gen            # → src/lib/data/generated.ts
```

**Always regenerate both after API changes.** The `openapi.yaml` at repo root is the contract between frontend and backend.

## Development

```bash
devenv up                    # Start PostgreSQL + API (8080) + Web (3000)

# Or manually:
pnpm --filter @rbi/api start:dev
pnpm --filter @rbi/web dev
```

**Access:**

- API Swagger: http://localhost:8080/api/docs
- Frontend: http://localhost:3000
- Database: localhost:5432

## Common Commands

```bash
pnpm install                 # Install all dependencies
pnpm build                   # Build all packages
pnpm lint                    # Lint all packages
pnpm test                    # Test all packages

# Module-specific
pnpm --filter @rbi/api <cmd>
pnpm --filter @rbi/web <cmd>
pnpm --filter @rbi/types build
```

## Domain Model

```
Product   ← what an item is (SKU, name, category)
Location  ← where items are stored (warehouse, supplier, client)
Area      ← specific spot within a location (zone, shelf, bin)
Inventory ← how many of a product exist at a location/area
```

Products are catalog items. Inventory tracks quantities at locations. Areas provide optional granular placement within locations.

## Key Patterns

| Pattern         | Location                        | Purpose                    |
| --------------- | ------------------------------- | -------------------------- |
| Repository      | `api/src/routes/*/`             | Data access layer          |
| Service         | `api/src/routes/*/`             | Business logic             |
| BaseAuditEntity | `api/src/common/entities/`      | Soft delete + audit fields |
| ClerkAuthGuard  | `api/src/common/guards/`        | JWT verification           |
| HATEOAS         | `api/src/common/hateoas/`       | REST hypermedia links      |
| Generated hooks | `web/src/lib/data/generated.ts` | Type-safe API calls        |

## Authentication Flow

```
User → Clerk → JWT Token
                  ↓
Frontend: Authorization: Bearer {token}
                  ↓
Backend: ClerkAuthGuard → verify → req.auth.userId
```

## Adding a New Entity (Full Stack)

1. **Backend entity** in `api/src/routes/<feature>/entities/`
2. **Backend DTOs** in `api/src/routes/<feature>/dto/`
3. **Backend repository/service/controller/module**
4. **Register module** in `api/src/app.module.ts` and `app.routes.ts`
5. **Generate OpenAPI:** `pnpm --filter @rbi/api openapi:generate`
6. **Generate frontend client:** `pnpm --filter @rbi/web api:gen`
7. **Frontend components** using generated hooks

## Environment Variables

**API (`modules/api/.env`):**

```bash
DATABASE_URL=postgresql://...  # or PGHOST/PGPORT/PGUSER/PGPASSWORD/PGDATABASE
CLERK_SECRET_KEY=sk_test_...
PORT=8080
```

**Web (`modules/web/.env.local`):**

```bash
NEXT_PUBLIC_API_BASE_URL=http://localhost:8080
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
```

## Module Documentation

See module-specific context files:

- `modules/api/CLAUDE.md` - Backend patterns, entities, endpoints
- `modules/web/CLAUDE.md` - Frontend patterns, components, state management
