# RBI API Module - Agent Context

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

| Relationship        | On Delete | Effect                               |
| ------------------- | --------- | ------------------------------------ |
| Product → Category  | RESTRICT  | Cannot delete category with products |
| Product → Supplier  | SET NULL  | Clears reference                     |
| Category → Category | SET NULL  | Children become root                 |

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

| Method | Path                            | Description              |
| ------ | ------------------------------- | ------------------------ |
| GET    | `/health-check`                 | Health (no auth)         |
| GET    | `/api/v1/auth/profile`          | Clerk user profile       |
| GET    | `/api/v1/categories`            | List (hierarchical tree) |
| POST   | `/api/v1/categories`            | Create                   |
| PUT    | `/api/v1/categories/:id`        | Update                   |
| DELETE | `/api/v1/categories/:id`        | Delete                   |
| GET    | `/api/v1/products`              | List (paginated)         |
| GET    | `/api/v1/products/all`          | List all                 |
| GET    | `/api/v1/products/:id`          | Get one                  |
| POST   | `/api/v1/products`              | Create                   |
| POST   | `/api/v1/products/bulk`         | Bulk create              |
| PUT    | `/api/v1/products/:id`          | Update                   |
| PATCH  | `/api/v1/products/bulk/status`  | Bulk update status       |
| DELETE | `/api/v1/products/:id`          | Delete (soft)            |
| DELETE | `/api/v1/products/bulk`         | Bulk delete              |
| PATCH  | `/api/v1/products/:id/restore`  | Restore                  |
| PATCH  | `/api/v1/products/bulk/restore` | Bulk restore             |

## Environment Variables

```bash
CLERK_SECRET_KEY=sk_test_xxxxx    # Required

# Database (URL or individual vars)
DATABASE_URL=postgresql://user:pass@host:5432/rbi_inventory
# OR
PGHOST=localhost  PGPORT=5432  PGUSER=postgres  PGPASSWORD=pass  PGDATABASE=rbi_inventory

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

**Error:** `{ statusCode, message, error }```
