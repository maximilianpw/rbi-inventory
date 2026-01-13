# LibreStock API Module - Agent Context

> NestJS REST API for yacht provisioning inventory management.

## Tech Stack

NestJS 11 · TypeORM 0.3 · PostgreSQL 16 · Clerk Auth · class-validator · Swagger

## Directory Structure

```
modules/api/src/
├── main.ts                 # Bootstrap, global prefix /api/v1
├── app.module.ts           # Root module
├── app.routes.ts           # Route registration
├── config/database.config.ts
├── common/
│   ├── decorators/         # @CurrentUser, @ClerkClaims
│   ├── dto/                # BaseResponseDto, ErrorResponseDto
│   ├── entities/           # BaseEntity, BaseAuditEntity
│   ├── enums/              # AuditAction, UserRole
│   ├── guards/             # ClerkAuthGuard
│   ├── hateoas/            # @HateoasLinks, HateoasInterceptor
│   ├── interceptors/       # LoggingInterceptor
│   └── middleware/         # RequestIdMiddleware
└── routes/
    ├── auth/               # /api/v1/auth/*
    ├── categories/         # /api/v1/categories/*
    ├── products/           # /api/v1/products/*
    ├── locations/          # /api/v1/locations/*
    ├── areas/              # /api/v1/areas/*
    ├── inventory/          # /api/v1/inventory/*
    ├── audit-logs/         # /api/v1/audit-logs/*
    ├── suppliers/          # Entity only, no endpoints yet
    └── health/             # /health-check (no auth)
```

## Module Pattern

Each feature module follows:

```
<feature>/
├── <feature>.module.ts
├── <feature>.controller.ts
├── <feature>.service.ts
├── <feature>.repository.ts
├── <feature>.hateoas.ts      # HATEOAS link definitions
├── entities/<feature>.entity.ts
└── dto/
    ├── create-<feature>.dto.ts
    ├── update-<feature>.dto.ts
    ├── <feature>-response.dto.ts
    └── <feature>-query.dto.ts
```

**Dependency flow:** Controller → Service → Repository → TypeORM → PostgreSQL

## Key Conventions

### Base Entities

- `BaseEntity`: `created_at`, `updated_at`
- `BaseAuditEntity`: Adds `deleted_at`, `created_by`, `updated_by`, `deleted_by` (soft delete + audit)

### DTOs

- Response DTOs extend `BaseResponseDto` or `BaseAuditResponseDto`
- Use `@ApiProperty()` on all fields for Swagger
- Validation via class-validator decorators

### Authentication

- All `/api/v1/*` routes require `@UseGuards(ClerkAuthGuard)`
- Access user: `@CurrentUser('userId')` or `@CurrentUser()` for full object
- Access JWT claims: `@ClerkClaims()`

### HATEOAS

Each module has a `<module>.hateoas.ts` file:

```typescript
// products.hateoas.ts
export const PRODUCT_HATEOAS_LINKS: LinkDefinition[] = [
  { rel: 'self', href: (data) => `/products/${data.id}`, method: 'GET' },
  { rel: 'update', href: (data) => `/products/${data.id}`, method: 'PUT' },
  { rel: 'delete', href: (data) => `/products/${data.id}`, method: 'DELETE' },
];
export const ProductHateoas = () => HateoasLinks(...PRODUCT_HATEOAS_LINKS);
```

Usage in controller:

```typescript
@Get(':id')
@UseInterceptors(HateoasInterceptor)
@ProductHateoas()
async findOne(@Param('id') id: string) { ... }
```

### Soft Delete

Products use soft delete via `BaseAuditEntity`. Repositories filter `deleted_at IS NULL` by default. Pass `includeDeleted: true` to include soft-deleted records.

### Foreign Keys

| Relationship          | On Delete | Effect                                |
| --------------------- | --------- | ------------------------------------- |
| Product → Category    | RESTRICT  | Cannot delete category with products  |
| Product → Supplier    | SET NULL  | Clears reference                      |
| Category → Category   | SET NULL  | Children become root                  |
| Area → Location       | CASCADE   | Deleting location deletes its areas   |
| Area → Area           | CASCADE   | Deleting parent deletes children      |
| Inventory → Product   | (default) | Reference required                    |
| Inventory → Location  | (default) | Reference required                    |
| Inventory → Area      | SET NULL  | Clears area reference                 |

## Adding a New Entity

1. **Entity** in `routes/<feature>/entities/<feature>.entity.ts` — extend `BaseEntity` or `BaseAuditEntity`
2. **DTOs** in `routes/<feature>/dto/` — Create, Update, Response, Query (if paginated)
3. **Repository** in `routes/<feature>/<feature>.repository.ts`
4. **Service** in `routes/<feature>/<feature>.service.ts`
5. **HATEOAS** in `routes/<feature>/<feature>.hateoas.ts`
6. **Controller** in `routes/<feature>/<feature>.controller.ts`
7. **Module** in `routes/<feature>/<feature>.module.ts`
8. **Register** in `app.module.ts` (imports) and `app.routes.ts`
9. **Regenerate OpenAPI**: `npm run openapi:generate`

## Adding an Endpoint

1. Add HATEOAS links to `<module>.hateoas.ts` if needed
2. Add method to controller with:
   - `@UseInterceptors(HateoasInterceptor)`
   - `@<Module>Hateoas()` decorator
   - `@ApiOperation()`, `@ApiResponse()` for Swagger
3. Add service method with business logic
4. Add repository method if new query needed
5. Regenerate OpenAPI `npm run openapi:generate`

## API Routes

### Health & Auth

| Method | Path                   | Description        |
| ------ | ---------------------- | ------------------ |
| GET    | `/health-check`        | Health (no auth)   |
| GET    | `/api/v1/auth/profile` | Clerk user profile |

### Categories

| Method | Path                     | Description              |
| ------ | ------------------------ | ------------------------ |
| GET    | `/api/v1/categories`     | List (hierarchical tree) |
| POST   | `/api/v1/categories`     | Create                   |
| PUT    | `/api/v1/categories/:id` | Update                   |
| DELETE | `/api/v1/categories/:id` | Delete                   |

### Products

| Method | Path                            | Description        |
| ------ | ------------------------------- | ------------------ |
| GET    | `/api/v1/products`              | List (paginated)   |
| GET    | `/api/v1/products/all`          | List all           |
| GET    | `/api/v1/products/:id`          | Get one            |
| POST   | `/api/v1/products`              | Create             |
| POST   | `/api/v1/products/bulk`         | Bulk create        |
| PUT    | `/api/v1/products/:id`          | Update             |
| PATCH  | `/api/v1/products/bulk/status`  | Bulk update status |
| DELETE | `/api/v1/products/:id`          | Delete (soft)      |
| DELETE | `/api/v1/products/bulk`         | Bulk delete        |
| PATCH  | `/api/v1/products/:id/restore`  | Restore            |
| PATCH  | `/api/v1/products/bulk/restore` | Bulk restore       |

### Locations

| Method | Path                     | Description      |
| ------ | ------------------------ | ---------------- |
| GET    | `/api/v1/locations`      | List (paginated) |
| GET    | `/api/v1/locations/:id`  | Get one          |
| POST   | `/api/v1/locations`      | Create           |
| PUT    | `/api/v1/locations/:id`  | Update           |
| DELETE | `/api/v1/locations/:id`  | Delete           |

### Areas

| Method | Path                        | Description         |
| ------ | --------------------------- | ------------------- |
| GET    | `/api/v1/areas`             | List with filters   |
| GET    | `/api/v1/areas/:id`         | Get one             |
| GET    | `/api/v1/areas/:id/children`| Get with children   |
| POST   | `/api/v1/areas`             | Create              |
| PUT    | `/api/v1/areas/:id`         | Update              |
| DELETE | `/api/v1/areas/:id`         | Delete (cascades)   |

### Inventory

| Method | Path                         | Description         |
| ------ | ---------------------------- | ------------------- |
| GET    | `/api/v1/inventory`          | List (paginated)    |
| GET    | `/api/v1/inventory/:id`      | Get one             |
| POST   | `/api/v1/inventory`          | Create              |
| PUT    | `/api/v1/inventory/:id`      | Update              |
| PATCH  | `/api/v1/inventory/:id/adjust` | Adjust quantity   |
| DELETE | `/api/v1/inventory/:id`      | Delete              |

## Environment Variables

```bash
CLERK_SECRET_KEY=sk_test_xxxxx    # Required

# Database (URL or individual vars)
DATABASE_URL=postgresql://user:pass@host:5432/librestock_inventory
# OR
PGHOST=localhost  PGPORT=5432  PGUSER=postgres  PGPASSWORD=pass  PGDATABASE=librestock_inventory

PORT=8080                          # Default: 8080
NODE_ENV=development               # development | production
```

## Commands

```bash
npm run start:dev       # Dev with hot reload
npm run build           # Compile
npm run start:prod      # Production
npm run openapi:generate # Generate openapi.yaml
```

## Response Formats

**Single entity:** `{ id, name, ..., _links: { self, update, delete } }`

**Paginated:** `{ data: [...], meta: { page, limit, total, total_pages, has_next, has_previous } }`

**Bulk operation:** `{ success_count, failure_count, succeeded: [...ids], failures: [{ id?, sku?, error }] }`

**Error:** `{ statusCode, message, error }`

## Inventory Data Model

The inventory system uses a three-level hierarchy to track stock:

```
Product (what)     → defines item metadata (SKU, name, category, reorder point)
Location (where)   → physical place (warehouse, supplier, client, in-transit)
Area (where within)→ specific spot inside a location (zone, shelf, bin)
Inventory (how many) → quantity of a product at a location/area
```

### Design Decisions

1. **Product vs Inventory separation**: Products define *what* an item is (catalog). Inventory tracks *how many* exist at each location. This allows the same product to exist in multiple locations with different quantities.

2. **Location types**: `WAREHOUSE`, `SUPPLIER`, `IN_TRANSIT`, `CLIENT` — describes the category of place, not its position in a hierarchy.

3. **Areas are optional**: Inventory can reference just a Location, or optionally an Area within that Location for precise placement tracking.

4. **Area hierarchy**: Areas support parent-child relationships (Zone A → Shelf A1 → Bin A1-1). All areas must belong to the same Location.

5. **Unique constraint**: One inventory record per (product, location, area) combination. Use `PATCH /inventory/:id/adjust` to modify quantities.

### Entity Relationships

```
┌─────────────┐      ┌─────────────┐
│   Product   │      │  Category   │
│  (catalog)  │──────│  (tree)     │
└──────┬──────┘      └─────────────┘
       │ 1:N
       ▼
┌─────────────┐      ┌─────────────┐      ┌─────────────┐
│  Inventory  │──────│  Location   │──────│    Area     │
│ (quantity)  │ N:1  │  (place)    │ 1:N  │  (spot)     │
└─────────────┘      └─────────────┘      └──────┬──────┘
       │                                         │ self-ref
       └─────────────────────────────────────────┘ (optional)
```
