# Architecture

## System Overview

```mermaid
graph TB
    subgraph "Frontend"
        A[TanStack Start] --> B[React 19]
        A --> E[TanStack Router]
        B --> C[TanStack Query]
        B --> D[TanStack Form]
    end

    subgraph "Backend"
        E[NestJS 11] --> F[TypeORM]
        F --> G[(PostgreSQL 16)]
    end

    subgraph "Auth"
        H[Clerk]
    end

    A -->|REST API| E
    A --> H
    E --> H
```

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | TanStack Start, React 19, TanStack Router, TanStack Query/Form, Tailwind CSS |
| Backend | NestJS 11, TypeORM, PostgreSQL 16 |
| Auth | Clerk |
| API Docs | OpenAPI/Swagger |
| Tooling | pnpm workspaces, devenv.sh, TypeScript |

## Monorepo Structure

```
rbi/
├── modules/
│   ├── api/                 # @rbi/api - NestJS backend
│   └── web/                 # @rbi/web - TanStack Start frontend
├── packages/
│   ├── tsconfig/            # Shared TS configs
│   └── eslint-config/       # Shared ESLint config
├── docs/                    # MkDocs documentation
├── openapi.yaml             # Generated API spec
├── pnpm-workspace.yaml
├── mkdocs.yml               # Documentation config
└── devenv.nix               # Nix dev environment
```

## Data Flow

```
┌─────────────────────────────────────────┐
│           TanStack Start Frontend       │
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

## Authentication Flow

```
User → Clerk → JWT Token
                  ↓
Frontend: Authorization: Bearer {token}
                  ↓
Backend: ClerkAuthGuard → verify → req.auth.userId
```

## OpenAPI-First Workflow

The API specification is the contract between frontend and backend:

```bash
# 1. Backend generates spec from decorators
pnpm --filter @rbi/api openapi:generate   # → openapi.yaml

# 2. Frontend generates typed hooks from spec
pnpm --filter @rbi/web api:gen            # → src/lib/data/generated.ts
```

!!! warning "Always regenerate both after API changes"
    The `openapi.yaml` at repo root is the source of truth for the frontend.

## Domain Model

```mermaid
classDiagram
    class Product {
        +uuid id
        +string sku
        +string name
        +uuid category_id
        +int reorder_point
    }

    class Location {
        +uuid id
        +string name
        +LocationType type
    }

    class Area {
        +uuid id
        +uuid location_id
        +uuid parent_id
        +string name
        +string code
    }

    class Inventory {
        +uuid id
        +uuid product_id
        +uuid location_id
        +uuid area_id
        +int quantity
    }

    class Category {
        +uuid id
        +string name
        +uuid parent_id
    }

    Product --> Category : belongs to
    Product --> Inventory : tracked in
    Location --> Inventory : stores
    Location --> Area : contains
    Area --> Area : parent/children
    Area --> Inventory : specifies placement
```

### Core Entities

| Entity | Purpose |
|--------|---------|
| **Product** | Catalog item (what) - SKU, name, category, reorder point |
| **Category** | Hierarchical product organization |
| **Location** | Physical place (where) - warehouse, supplier, client, in-transit |
| **Area** | Zone within a location (where exactly) - shelf, bin, cold storage |
| **Inventory** | Stock quantity (how many) of a product at a location/area |

### Design Decisions

1. **Product vs Inventory separation** - Products define what an item is. Inventory tracks quantities at locations.
2. **Location types** - `WAREHOUSE`, `SUPPLIER`, `IN_TRANSIT`, `CLIENT` describe the category of place.
3. **Areas are optional** - Inventory can reference just a Location, or optionally an Area for precise tracking.
4. **Area hierarchy** - Areas support parent-child relationships (Zone A → Shelf A1 → Bin A1-1).
5. **Unique constraint** - One inventory record per (product, location, area) combination.

## Key Patterns

| Pattern | Location | Purpose |
|---------|----------|---------|
| Repository | `api/src/routes/*/` | Data access layer |
| Service | `api/src/routes/*/` | Business logic |
| BaseAuditEntity | `api/src/common/entities/` | Soft delete + audit fields |
| ClerkAuthGuard | `api/src/common/guards/` | JWT verification |
| HATEOAS | `api/src/common/hateoas/` | REST hypermedia links |
| Generated hooks | `web/src/lib/data/generated.ts` | Type-safe API calls |
