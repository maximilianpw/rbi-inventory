# RBI Inventory System - Agent Context & Design Overview

> **Purpose:** This document provides AI agents and developers with a comprehensive understanding of the RBI Inventory System architecture, design patterns, and development guidelines.

## Table of Contents

- [1. Project Overview](#1-project-overview)
- [2. Architecture](#2-architecture)
- [3. Technology Stack](#3-technology-stack)
- [4. Module Design](#4-module-design)
- [5. Design Patterns](#5-design-patterns)
- [6. Data Flow](#6-data-flow)
- [7. API Design](#7-api-design)
- [8. Development Guidelines](#8-development-guidelines)
- [9. Common Tasks](#9-common-tasks)

---

## 1. Project Overview

### Business Context
RBI Inventory System is a luxury yacht provisioning management platform designed for managing inventory, orders, and client interactions for high-end yacht provisioning services.

### Project Type
**pnpm-based TypeScript monorepo** with three phases:
- **Phase 1 (Current):** Core inventory management (products, categories, suppliers)
- **Phase 2 (Planned):** Task and order management
- **Phase 3 (Planned):** Client portal and multi-tenancy

### Requirements
- **Node.js:** 20.0.0+
- **pnpm:** 10.0.0+
- **PostgreSQL:** 16+
- **Environment:** devenv.sh for local development

---

## 2. Architecture

### 2.1 Monorepo Structure

```
rbi/
├── modules/                    # Application modules
│   ├── api/                   # @rbi/api - NestJS REST API
│   └── web/                   # @rbi/web - Next.js 16 frontend
├── packages/                   # Shared libraries
│   ├── types/                 # @rbi/types - Shared TypeScript types
│   ├── tsconfig/              # Shared TypeScript configurations
│   └── eslint-config/         # Shared ESLint configuration
├── docs/                       # Documentation
├── pnpm-workspace.yaml        # Workspace configuration
└── devenv.nix                 # Development environment
```

**Key Principles:**
- All packages use `@rbi/` namespace
- Shared types compiled and published within monorepo
- Centralized configuration (TypeScript, ESLint)
- pnpm workspaces for dependency management

### 2.2 System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Next.js Frontend (Web)                   │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │  React Query │  │ Orval Client │  │  Clerk Auth  │     │
│  │    Hooks     │  │  (Generated) │  │    Provider  │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
└─────────────────────────────────────────────────────────────┘
                            ▼ HTTP/REST
┌─────────────────────────────────────────────────────────────┐
│                    NestJS Backend (API)                      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │ Controllers  │  │   Services   │  │ Repositories │     │
│  │   (HTTP)     │→│  (Business)  │→│ (Data Layer) │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
│                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │ ClerkAuth    │  │   TypeORM    │  │   OpenAPI    │     │
│  │    Guard     │  │  Entities    │  │   Generator  │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
└─────────────────────────────────────────────────────────────┘
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                  PostgreSQL Database                         │
│  Categories, Products, Suppliers, Audit Logs                │
└─────────────────────────────────────────────────────────────┘
```

**Authentication Flow:**
```
User → Clerk (Auth Provider) → JWT Token
                                    ↓
Frontend Request → Authorization: Bearer {token}
                                    ↓
Backend ClerkAuthGuard → Verify → Inject User Context
```

---

## 3. Technology Stack

### 3.1 Backend (@rbi/api)

| Category | Technology | Version | Purpose |
|----------|-----------|---------|---------|
| Framework | NestJS | 11.0.1 | Enterprise Node.js framework |
| Language | TypeScript | 5.1.3 | Type-safe development |
| Database | PostgreSQL | 16 | Primary data store |
| ORM | TypeORM | 0.3.27 | Database abstraction |
| Auth | Clerk Backend SDK | 2.22.0 | JWT verification |
| Validation | class-validator | - | DTO validation |
| API Docs | Swagger/OpenAPI | 11.2.1 | API documentation |
| Testing | Jest | - | Unit/integration tests |

### 3.2 Frontend (@rbi/web)

| Category | Technology | Version | Purpose |
|----------|-----------|---------|---------|
| Framework | Next.js | 16.0.1 | React framework (App Router) |
| React | React | 19.2.0 | UI library |
| Language | TypeScript | 5.9.3 | Type-safe development |
| Styling | Tailwind CSS | 4.1.17 | Utility-first CSS |
| UI Components | Radix UI | - | Accessible components |
| HTTP Client | Axios | 1.13.2 | API communication |
| Code Gen | Orval | 7.16.0 | OpenAPI client generator |
| State | TanStack Query | 5.90.7 | Server state management |
| Forms | TanStack Form | 1.23.8 | Form handling |
| Auth | Clerk Next.js | 6.35.0 | Authentication UI |
| i18n | i18next | 25.6.2 | Internationalization (EN/DE/FR) |

### 3.3 Development Environment

- **devenv.sh:** Nix-based development environment
- **PostgreSQL 16:** Auto-initialized local database
- **Process Manager:** API (port 8080) + Web (port 3000)
- **Code Quality:** Prettier, ESLint, pre-commit hooks

---

## 4. Module Design

### 4.1 API Module (@rbi/api)

**Purpose:** RESTful API backend for inventory management

**Route Structure:**
```
/api/v1/
├── /auth              - Authentication (Clerk integration)
├── /categories        - Category CRUD + hierarchy
├── /products          - Product CRUD + filtering/pagination
├── /health-check      - Health status
└── [Future]           - suppliers, inventory, locations, orders
```

**Key Entities:**

```typescript
// Product - Core inventory item
Product {
  id: UUID
  sku: string (unique)
  name: string
  category: Category (FK: RESTRICT)
  primary_supplier: Supplier (FK: SET NULL)
  cost: number
  price: number
  markup_percentage: number
  reorder_point: number
  is_active: boolean
  is_perishable: boolean
  // Measurements
  volume_ml, weight_kg, dimensions_cm
  // Audit
  created_at, updated_at, deleted_at
  created_by, updated_by, deleted_by
}

// Category - Hierarchical organization
Category {
  id: UUID
  name: string
  parent: Category (self-reference)
  children: Category[]
  // Audit fields
}

// Supplier - Procurement source
Supplier {
  id: UUID
  name: string
  contact_person, email, phone
  address, website
  is_active: boolean
  // Audit fields
}
```

**Module Structure:**
```
src/
├── common/
│   ├── decorators/        # HATEOAS, auth decorators
│   ├── dto/              # Base DTOs (error, message, pagination)
│   ├── entities/         # BaseAuditEntity, BaseEntity
│   ├── guards/           # ClerkAuthGuard
│   ├── interceptors/     # HateoasInterceptor
│   └── types/            # Shared types
├── config/               # Database, environment config
├── routes/
│   ├── auth/            # Authentication routes
│   ├── categories/      # Category module
│   │   ├── dto/         # Create, Update, Response DTOs
│   │   ├── entities/    # Category entity
│   │   ├── category.repository.ts
│   │   ├── categories.service.ts
│   │   └── categories.controller.ts
│   ├── products/        # Product module (same structure)
│   ├── suppliers/       # Supplier module
│   └── health-check/    # Health check module
├── app.module.ts        # Root module
└── main.ts              # Bootstrap + global config
```

### 4.2 Web Module (@rbi/web)

**Purpose:** Modern Next.js frontend with i18n support

**Directory Structure:**
```
src/
├── app/[lang]/                  # Next.js App Router + i18n
│   ├── products/               # Product management
│   ├── stock/                  # Stock management
│   └── settings/               # Settings
├── components/
│   ├── ui/                     # Radix UI components
│   ├── products/               # Product components
│   ├── category/               # Category components
│   └── common/                 # Shared components
├── hooks/
│   └── providers/              # React contexts
├── lib/
│   ├── data/                   # API client (Orval-generated)
│   │   ├── api.ts             # Axios instance
│   │   ├── model/             # TypeScript models
│   │   └── products/          # useListProducts, useCreateProduct hooks
│   └── enums/                  # Frontend enums
└── locales/                    # i18n (en, de, fr)
```

**Key Features:**
- **Code Generation:** Orval generates React Query hooks from OpenAPI
- **Type Safety:** Full type coverage from API to UI
- **i18n:** Browser language detection, 3 languages
- **Authentication:** Clerk UI components (SignIn, UserButton)

### 4.3 Shared Types Package (@rbi/types)

**Exports:**
```typescript
// API Response Types
export interface ApiErrorResponse
export interface ApiMessageResponse
export interface PaginatedResponse<T>

// Entities
export interface User
export interface Category
export interface Product

// Enums
export enum UserRole
export enum SortOrder
```

**Build:** Compiled to ESM with TypeScript declarations

---

## 5. Design Patterns

### 5.1 Repository Pattern

**Purpose:** Encapsulate data access logic

**Implementation:**
```typescript
// Custom repository extends TypeORM Repository
@Injectable()
export class ProductRepository {
  constructor(
    @InjectRepository(Product)
    private readonly repository: Repository<Product>,
  ) {}

  async findAllPaginated(query: ProductQueryDto): Promise<PaginatedResult> {
    const qb = this.repository.createQueryBuilder('product');

    // Complex filtering
    if (query.category_id) qb.andWhere('product.category_id = :categoryId', ...);
    if (query.search) qb.andWhere('product.name ILIKE :search', ...);
    if (!query.include_deleted) qb.andWhere('product.deleted_at IS NULL');

    // Pagination
    qb.skip((query.page - 1) * query.limit).take(query.limit);

    // Sorting
    qb.orderBy(`product.${query.sort_by}`, query.sort_order);

    return await qb.getManyAndCount();
  }
}
```

**Benefits:**
- Testable data layer
- Reusable query logic
- Separation of concerns

### 5.2 Service-Controller Pattern

**Flow:**
```
Controller → Service → Repository → Database
   ↓           ↓           ↓
 HTTP      Business     Data
 Layer      Logic      Access
```

**Example:**
```typescript
// Controller: HTTP handling
@Controller('products')
export class ProductsController {
  @Get()
  async listProducts(@Query() query: ProductQueryDto) {
    return this.productsService.findAllPaginated(query);
  }
}

// Service: Business logic
@Injectable()
export class ProductsService {
  async findAllPaginated(query: ProductQueryDto) {
    // Business rules, transformations
    const result = await this.productRepository.findAllPaginated(query);
    return this.toPaginatedDto(result);
  }
}

// Repository: Data access
@Injectable()
export class ProductRepository {
  async findAllPaginated(query: ProductQueryDto) {
    // Database queries
  }
}
```

### 5.3 DTO Pattern

**Input DTOs (Validation):**
```typescript
export class CreateProductDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsUUID()
  category_id: string;

  @IsNumber()
  @Min(0)
  cost: number;
}
```

**Response DTOs (Serialization):**
```typescript
export class ProductResponseDto {
  id: string;
  sku: string;
  name: string;
  category: CategoryResponseDto;
  cost: number;
  price: number;
  _links: HateoasLinks; // Added by interceptor
  created_at: Date;
}
```

**Query DTOs (Pagination/Filtering):**
```typescript
export class ProductQueryDto {
  @IsOptional()
  @Type(() => Number)
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @IsEnum(ProductSortBy)
  sort_by?: ProductSortBy = ProductSortBy.CREATED_AT;

  @IsOptional()
  @IsUUID()
  category_id?: string;
}
```

### 5.4 HATEOAS Pattern

**Purpose:** RESTful hypermedia links for API discoverability

**Decorator-Based Implementation:**
```typescript
// Define links with decorator
@HateoasLinks(
  { rel: 'self', href: '/products/{id}', method: 'GET' },
  { rel: 'update', href: '/products/{id}', method: 'PUT' },
  { rel: 'delete', href: '/products/{id}', method: 'DELETE' },
)
export class ProductResponseDto {
  // ... fields
}
```

**Interceptor Adds Links:**
```typescript
// HateoasInterceptor reads metadata
// Injects _links into response
{
  "id": "123",
  "name": "Product",
  "_links": {
    "self": { "href": "/products/123", "method": "GET" },
    "update": { "href": "/products/123", "method": "PUT" }
  }
}
```

### 5.5 Soft Delete Pattern

**BaseAuditEntity:**
```typescript
export abstract class BaseAuditEntity {
  @Column({ nullable: true })
  deleted_at: Date | null; // null = active, set = soft deleted

  @Column({ nullable: true })
  created_by: string; // Clerk user ID

  @Column({ nullable: true })
  updated_by: string;

  @Column({ nullable: true })
  deleted_by: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
```

**Repository Handling:**
```typescript
// Default: exclude soft-deleted
qb.andWhere('entity.deleted_at IS NULL');

// Optional: include soft-deleted
if (query.include_deleted) {
  // Don't filter
}

// Restore soft-deleted
await repository.update(id, { deleted_at: null, deleted_by: null });
```

### 5.6 Authentication Guard Pattern

**ClerkAuthGuard:**
```typescript
@Injectable()
export class ClerkAuthGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);

    // Verify with Clerk
    const session = await clerkClient.verifyToken(token, {
      secretKey: process.env.CLERK_SECRET_KEY,
    });

    // Inject user context
    request.auth = {
      userId: session.sub,
      sessionId: session.sid,
    };

    return true;
  }
}
```

**Usage:**
```typescript
@UseGuards(ClerkAuthGuard)
@Post()
async createProduct(@Body() dto: CreateProductDto, @Req() req) {
  // req.auth.userId available for audit
  return this.productsService.create(dto, req.auth.userId);
}
```

### 5.7 OpenAPI-First Development

**Flow:**
```
1. Backend: NestJS controllers + @ApiProperty() decorators
              ↓
2. Backend: npm run openapi:generate → openapi.yaml
              ↓
3. Frontend: Orval reads openapi.yaml
              ↓
4. Frontend: Generates React Query hooks + TypeScript types
              ↓
5. Frontend: Import and use type-safe hooks
```

**Example:**
```typescript
// Backend: Controller with Swagger decorators
@ApiTags('products')
@Controller('products')
export class ProductsController {
  @Get()
  @ApiOperation({ summary: 'List products' })
  @ApiResponse({ type: PaginatedProductsResponseDto })
  async listProducts(@Query() query: ProductQueryDto) {
    return this.productsService.findAllPaginated(query);
  }
}

// Frontend: Generated hook
import { useListProducts } from '@/lib/data/products/products';

function ProductList() {
  const { data, isLoading } = useListProducts({
    page: 1,
    limit: 20,
  });

  // data is fully typed as PaginatedProductsResponseDto
}
```

---

## 6. Data Flow

### 6.1 Product Creation Flow

**Frontend:**
```typescript
// 1. User fills form (TanStack Form)
const form = useForm({
  defaultValues: { name: '', sku: '', category_id: '' },
  onSubmit: async (values) => {
    // 2. Call generated mutation hook
    await createProduct.mutateAsync(values);
  },
});

// 3. Generated hook (Orval)
const createProduct = useCreateProduct();
```

**Network:**
```http
POST /api/v1/products
Authorization: Bearer {clerk_jwt}
Content-Type: application/json

{
  "name": "Product Name",
  "sku": "SKU-123",
  "category_id": "uuid",
  "cost": 100,
  "price": 150
}
```

**Backend:**
```typescript
// 1. Controller receives request
@UseGuards(ClerkAuthGuard) // Verify JWT
@Post()
async createProduct(
  @Body() dto: CreateProductDto, // Validate DTO
  @Req() req,
) {
  // 2. Pass to service with user context
  return this.productsService.create(dto, req.auth.userId);
}

// 3. Service applies business logic
@Injectable()
export class ProductsService {
  async create(dto: CreateProductDto, userId: string) {
    // Calculate markup if needed
    const markup = ((dto.price - dto.cost) / dto.cost) * 100;

    // 4. Call repository
    const product = await this.productRepository.create({
      ...dto,
      markup_percentage: markup,
      created_by: userId,
    });

    // 5. Transform to response DTO
    return this.toResponseDto(product);
  }
}

// 6. Repository saves to database
@Injectable()
export class ProductRepository {
  async create(data: Partial<Product>) {
    const product = this.repository.create(data);
    return await this.repository.save(product);
  }
}
```

**Response:**
```json
{
  "id": "uuid",
  "name": "Product Name",
  "sku": "SKU-123",
  "cost": 100,
  "price": 150,
  "markup_percentage": 50,
  "created_at": "2025-01-15T10:00:00Z",
  "_links": {
    "self": { "href": "/products/uuid", "method": "GET" },
    "update": { "href": "/products/uuid", "method": "PUT" }
  }
}
```

### 6.2 Authentication Flow

```
1. User visits frontend
   ↓
2. Clerk React components detect no session
   ↓
3. Redirect to Clerk sign-in page
   ↓
4. User authenticates with Clerk
   ↓
5. Clerk issues JWT token
   ↓
6. Frontend stores token in cookie/localStorage
   ↓
7. Axios interceptor adds: Authorization: Bearer {token}
   ↓
8. Backend ClerkAuthGuard extracts token
   ↓
9. Verify token with Clerk secret key
   ↓
10. Inject userId into request.auth
   ↓
11. Service receives userId for audit logging
```

---

## 7. API Design

### 7.1 REST Conventions

**URL Structure:**
```
/api/v1/{resource}[/{id}][/{action}]

Examples:
GET    /api/v1/products              # List all
GET    /api/v1/products/:id          # Get one
POST   /api/v1/products              # Create
PUT    /api/v1/products/:id          # Full update
PATCH  /api/v1/products/:id          # Partial update
DELETE /api/v1/products/:id          # Soft delete
POST   /api/v1/products/bulk         # Bulk create
PATCH  /api/v1/products/bulk/restore # Bulk restore
```

**Standard HTTP Status Codes:**
- `200 OK` - Successful GET, PUT, PATCH
- `201 Created` - Successful POST
- `204 No Content` - Successful DELETE
- `400 Bad Request` - Validation error
- `401 Unauthorized` - Missing/invalid auth
- `404 Not Found` - Resource not found
- `500 Internal Server Error` - Server error

### 7.2 Response Formats

**Single Resource:**
```json
{
  "id": "uuid",
  "name": "Product Name",
  "created_at": "2025-01-15T10:00:00Z",
  "_links": {
    "self": { "href": "/products/uuid", "method": "GET" }
  }
}
```

**Paginated Collection:**
```json
{
  "data": [
    { "id": "1", "name": "Product 1" },
    { "id": "2", "name": "Product 2" }
  ],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "total_pages": 5,
    "has_previous": false,
    "has_next": true
  }
}
```

**Error Response:**
```json
{
  "statusCode": 400,
  "message": "Validation failed",
  "error": "Bad Request"
}
```

**Success Message:**
```json
{
  "message": "Product deleted successfully"
}
```

### 7.3 Query Parameters

**Pagination:**
- `page` (default: 1) - Page number
- `limit` (default: 20, max: 100) - Items per page

**Filtering:**
- `search` - Search in name/SKU
- `category_id` - Filter by category
- `brand_id` - Filter by brand
- `supplier_id` - Filter by supplier
- `is_active` - Filter by active status
- `is_perishable` - Filter perishable items
- `min_price`, `max_price` - Price range
- `include_deleted` - Include soft-deleted items

**Sorting:**
- `sort_by` - Field to sort by (name, sku, created_at, price, etc.)
- `sort_order` - ASC or DESC

**Example:**
```
GET /api/v1/products?page=2&limit=50&category_id=uuid&sort_by=price&sort_order=DESC
```

### 7.4 Bulk Operations

**Bulk Create:**
```http
POST /api/v1/products/bulk
Body: { "products": [{ "name": "A", ... }, { "name": "B", ... }] }
Response: { "created": [...], "failed": [...] }
```

**Bulk Update Status:**
```http
PATCH /api/v1/products/bulk/status
Body: { "ids": ["uuid1", "uuid2"], "is_active": false }
Response: { "updated": 2 }
```

**Bulk Soft Delete:**
```http
DELETE /api/v1/products/bulk
Body: { "ids": ["uuid1", "uuid2"] }
Response: { "deleted": 2 }
```

**Bulk Restore:**
```http
PATCH /api/v1/products/bulk/restore
Body: { "ids": ["uuid1", "uuid2"] }
Response: { "restored": 2 }
```

---

## 8. Development Guidelines

### 8.1 Adding a New Entity

**1. Create Entity:**
```typescript
// src/routes/{resource}/entities/{resource}.entity.ts
import { BaseAuditEntity } from '@/common/entities/base-audit.entity';

@Entity('resource_name')
export class Resource extends BaseAuditEntity {
  @Column()
  name: string;

  @ManyToOne(() => RelatedEntity)
  @JoinColumn({ name: 'related_id' })
  related: RelatedEntity;
}
```

**2. Create DTOs:**
```typescript
// dto/create-{resource}.dto.ts
export class CreateResourceDto {
  @ApiProperty()
  @IsString()
  name: string;
}

// dto/{resource}-response.dto.ts
@HateoasLinks(
  { rel: 'self', href: '/{resource}/{id}', method: 'GET' },
)
export class ResourceResponseDto {
  id: string;
  name: string;
  _links: HateoasLinks;
}
```

**3. Create Repository:**
```typescript
// {resource}.repository.ts
@Injectable()
export class ResourceRepository {
  constructor(
    @InjectRepository(Resource)
    private readonly repository: Repository<Resource>,
  ) {}

  async findAll() { ... }
}
```

**4. Create Service:**
```typescript
// {resource}.service.ts
@Injectable()
export class ResourceService {
  constructor(
    private readonly resourceRepository: ResourceRepository,
  ) {}

  async findAll() { ... }
}
```

**5. Create Controller:**
```typescript
// {resource}.controller.ts
@ApiTags('resource')
@Controller('resource')
export class ResourceController {
  @Get()
  async list() { ... }
}
```

**6. Create Module:**
```typescript
// {resource}.module.ts
@Module({
  imports: [TypeOrmModule.forFeature([Resource])],
  controllers: [ResourceController],
  providers: [ResourceService, ResourceRepository],
  exports: [ResourceService],
})
export class ResourceModule {}
```

**7. Register in AppModule:**
```typescript
// app.module.ts
@Module({
  imports: [
    // ...
    ResourceModule,
    RouterModule.register([
      { path: 'api/v1', children: [
        // ...
        { path: 'resource', module: ResourceModule },
      ]},
    ]),
  ],
})
```

**8. Generate OpenAPI & Frontend Client:**
```bash
pnpm --filter @rbi/api openapi:generate
pnpm --filter @rbi/web api:gen
```

### 8.2 Database Migrations (Future)

**Currently:** `synchronize: true` in development (auto-sync schema)

**Production:** Use TypeORM migrations
```bash
pnpm --filter @rbi/api migration:generate -- -n MigrationName
pnpm --filter @rbi/api migration:run
```

### 8.3 Adding a New Frontend Page

**1. Create Route:**
```typescript
// src/app/[lang]/resource/page.tsx
export default function ResourcePage() {
  const { data } = useListResource(); // Generated hook

  return <ResourceList data={data} />;
}
```

**2. Create Components:**
```typescript
// src/components/resource/resource-list.tsx
// src/components/resource/resource-form.tsx
```

**3. Use Generated Hooks:**
```typescript
import {
  useListResource,
  useCreateResource,
  useUpdateResource
} from '@/lib/data/resource/resource';
```

### 8.4 Code Quality Standards

**TypeScript:**
- Enable strict mode
- No `any` types (use `unknown` or proper types)
- Proper interface/type definitions
- Use TypeORM decorators for validation

**ESLint:**
- Fix all lint errors before committing
- Follow airbnb-typescript style guide

**Prettier:**
- Auto-format on save
- Consistent formatting across monorepo

**Testing:**
- Unit tests for services
- Integration tests for API endpoints
- E2E tests for critical flows

---

## 9. Common Tasks

### 9.1 Local Development

**Start Development Environment:**
```bash
devenv up
```

**Access Points:**
- API: http://localhost:8080/api/docs (Swagger UI)
- Frontend: http://localhost:3000
- Database: localhost:5432

**Rebuild Shared Types:**
```bash
pnpm types:build
```

**Regenerate API Client:**
```bash
pnpm --filter @rbi/api openapi:generate
pnpm --filter @rbi/web api:gen
```

### 9.2 Common Commands

```bash
# Install dependencies
pnpm install

# Build all packages
pnpm build

# Lint all packages
pnpm lint

# Run tests
pnpm test

# Clean build artifacts
pnpm clean

# API-specific
pnpm --filter @rbi/api start:dev      # Start API in dev mode
pnpm --filter @rbi/api test           # Run API tests

# Web-specific
pnpm --filter @rbi/web dev            # Start frontend dev server
pnpm --filter @rbi/web build          # Build for production
```

### 9.3 Debugging

**API Debugging:**
- Logs output to console via NestJS Logger
- Swagger UI for manual API testing: http://localhost:8080/api/docs
- Database inspection: `psql -h localhost -U postgres -d rbi_inventory`

**Frontend Debugging:**
- React DevTools for component inspection
- Network tab for API requests
- React Query DevTools for cache inspection

### 9.4 Environment Variables

**API (.env):**
```bash
DATABASE_URL=postgresql://user:pass@localhost:5432/rbi_inventory
# OR individual variables:
PGHOST=localhost
PGPORT=5432
PGUSER=postgres
PGPASSWORD=password
PGDATABASE=rbi_inventory

CLERK_SECRET_KEY=sk_test_...
NODE_ENV=development
PORT=8080
```

**Web (.env.local):**
```bash
NEXT_PUBLIC_API_URL=http://localhost:8080
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
```

---

## 10. Future Considerations

### Phase 2: Task & Order Management
- Order entities (orders, order_items)
- Stock movement tracking
- Task workflow system
- Inventory management module

### Phase 3: Client Portal
- Multi-tenancy support
- Client-facing portal
- Role-based access control (RBAC)
- Organization management

### Technical Debt
- Implement proper database migrations (disable synchronize)
- Add comprehensive test coverage
- Set up CI/CD pipeline
- Add monitoring and logging (Sentry, etc.)
- Performance optimization (caching, indexing)

---

## Quick Reference

### Key Files to Know

```
modules/api/
├── src/main.ts                           # App bootstrap + global config
├── src/app.module.ts                     # Root module
├── src/common/entities/base-audit.entity.ts  # Base entity with soft delete
├── src/common/guards/clerk-auth.guard.ts     # Auth guard
└── src/routes/products/                  # Example module

modules/web/
├── src/lib/data/api.ts                   # Axios client
├── src/lib/data/products/products.ts     # Generated hooks
└── src/app/[lang]/products/page.tsx      # Example page

packages/types/
└── src/index.ts                          # Shared types export
```

### Important Patterns

| Pattern | Files | Purpose |
|---------|-------|---------|
| Repository | `*.repository.ts` | Data access abstraction |
| Service | `*.service.ts` | Business logic |
| Controller | `*.controller.ts` | HTTP handling |
| DTO | `dto/*.dto.ts` | Validation & serialization |
| Entity | `entities/*.entity.ts` | Database models |
| HATEOAS | `@HateoasLinks()` | API discoverability |
| Soft Delete | `BaseAuditEntity` | Non-destructive deletion |
| Auth | `ClerkAuthGuard` | JWT verification |

---

## Questions or Issues?

For module-specific details, see:
- `/modules/api/DESIGN.md` (coming soon)
- `/modules/web/DESIGN.md` (coming soon)

For general architecture questions, refer to this document or consult the development team.
