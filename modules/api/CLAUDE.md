# RBI API Module - Agent Context & Design Document

> **Purpose:** Detailed technical reference for AI agents and developers working on the NestJS backend API module.

## Table of Contents

- [1. Module Overview](#1-module-overview)
- [2. Application Bootstrap](#2-application-bootstrap)
- [3. Module Architecture](#3-module-architecture)
- [4. Common Infrastructure](#4-common-infrastructure)
- [5. Route Modules](#5-route-modules)
- [6. Database Design](#6-database-design)
- [7. Authentication](#7-authentication)
- [8. API Documentation](#8-api-documentation)
- [9. Development Patterns](#9-development-patterns)
- [10. Quick Reference](#10-quick-reference)

---

## 1. Module Overview

### 1.1 Purpose

The `@rbi/api` module is a NestJS REST API backend providing:
- CRUD operations for inventory entities (products, categories, suppliers)
- Authentication via Clerk JWT tokens
- Pagination, filtering, and sorting capabilities
- Soft delete with audit trail
- HATEOAS-compliant responses
- OpenAPI documentation generation

### 1.2 Directory Structure

```
modules/api/
├── src/
│   ├── main.ts                    # Application bootstrap
│   ├── app.module.ts              # Root module
│   ├── app.routes.ts              # Route configuration
│   ├── generate-openapi.ts        # OpenAPI export script
│   │
│   ├── config/
│   │   └── database.config.ts     # TypeORM configuration
│   │
│   ├── common/                    # Shared infrastructure
│   │   ├── decorators/
│   │   │   ├── current-user.decorator.ts
│   │   │   └── clerk-claims.decorator.ts
│   │   ├── dto/
│   │   │   ├── base-response.dto.ts
│   │   │   ├── error-response.dto.ts
│   │   │   └── message-response.dto.ts
│   │   ├── entities/
│   │   │   ├── base.entity.ts
│   │   │   └── base-audit.entity.ts
│   │   ├── enums/
│   │   │   ├── audit-action.enum.ts
│   │   │   └── user-role.enum.ts
│   │   ├── guards/
│   │   │   └── clerk-auth.guard.ts
│   │   ├── hateoas/
│   │   │   ├── hateoas.decorator.ts
│   │   │   ├── hateoas.interceptor.ts
│   │   │   └── hateoas-link.dto.ts
│   │   ├── interceptors/
│   │   │   └── logging.interceptor.ts
│   │   ├── middleware/
│   │   │   └── request-id.middleware.ts
│   │   └── types/
│   │
│   └── routes/                    # Feature modules
│       ├── auth/
│       │   ├── auth.controller.ts
│       │   ├── auth.module.ts
│       │   └── dto/
│       ├── categories/
│       │   ├── categories.controller.ts
│       │   ├── categories.service.ts
│       │   ├── categories.module.ts
│       │   ├── category.repository.ts
│       │   ├── entities/
│       │   │   └── category.entity.ts
│       │   └── dto/
│       ├── products/
│       │   ├── products.controller.ts
│       │   ├── products.service.ts
│       │   ├── products.module.ts
│       │   ├── product.repository.ts
│       │   ├── entities/
│       │   │   └── product.entity.ts
│       │   └── dto/
│       ├── suppliers/
│       │   └── entities/
│       │       └── supplier.entity.ts
│       └── health/
│           ├── health.controller.ts
│           └── health.module.ts
│
├── package.json
├── tsconfig.json
└── .env.template
```

### 1.3 Technology Stack

| Technology | Version | Purpose |
|------------|---------|---------|
| NestJS | 11.0.1 | Framework |
| TypeORM | 0.3.27 | ORM |
| PostgreSQL | 16 | Database |
| class-validator | 0.14.2 | DTO validation |
| class-transformer | 0.5.1 | DTO transformation |
| @clerk/backend | 2.22.0 | Authentication |
| @nestjs/swagger | 11.2.1 | API documentation |
| TypeScript | 5.1.3 | Language |

---

## 2. Application Bootstrap

### 2.1 Main Entry Point

**File:** `src/main.ts`

```typescript
// Key Configuration:

// 1. Global Prefix - All routes prefixed with /api/v1
app.setGlobalPrefix('api/v1', {
  exclude: ['health-check'], // Health check accessible at /health-check
});

// 2. Global Validation Pipe
app.useGlobalPipes(new ValidationPipe({
  whitelist: true,    // Strip properties not in DTO
  transform: true,    // Auto-transform types
}));

// 3. Global Interceptors
app.useGlobalInterceptors(new HateoasInterceptor(app.get(Reflector)));

// 4. CORS
app.enableCors({ origin: '*' });

// 5. Swagger at /api/docs
SwaggerModule.setup('api/docs', app, document);

// 6. Port
await app.listen(process.env.PORT ?? 8080);
```

### 2.2 App Module

**File:** `src/app.module.ts`

```typescript
@Module({
  imports: [
    // Global configuration
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: path.join(__dirname, '../../.env'),
      load: [databaseConfig],
    }),

    // Database connection
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => config.get('database'),
    }),

    // Feature modules
    HealthModule,
    AuthModule,
    CategoriesModule,
    ProductsModule,

    // Route registration
    RouterModule.register(routes),
  ],
  providers: [
    { provide: APP_INTERCEPTOR, useClass: LoggingInterceptor },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(RequestIdMiddleware).forRoutes('*');
  }
}
```

### 2.3 Route Configuration

**File:** `src/app.routes.ts`

```typescript
export const routes: Routes = [
  { path: '', module: HealthModule },        // /health-check
  { path: 'auth', module: AuthModule },      // /api/v1/auth/*
  { path: 'categories', module: CategoriesModule }, // /api/v1/categories/*
  { path: 'products', module: ProductsModule },     // /api/v1/products/*
];
```

### 2.4 Database Configuration

**File:** `src/config/database.config.ts`

```typescript
export default registerAs('database', () => {
  // Priority 1: DATABASE_URL (production/CI)
  if (process.env.DATABASE_URL) {
    return {
      type: 'postgres',
      url: process.env.DATABASE_URL,
      entities: [path.join(__dirname, '../**/*.entity{.ts,.js}')],
      synchronize: process.env.NODE_ENV !== 'production',
      logging: process.env.NODE_ENV === 'development',
    };
  }

  // Priority 2: Individual PG* variables (devenv)
  const host = process.env.PGHOST || 'localhost';
  const isSocket = host.startsWith('/');

  return {
    type: 'postgres',
    host: isSocket ? undefined : host,
    port: isSocket ? undefined : parseInt(process.env.PGPORT || '5432'),
    username: process.env.PGUSER || process.env.USER,
    password: process.env.PGPASSWORD || '',
    database: process.env.PGDATABASE || 'rbi_inventory',
    entities: [...],
    synchronize: process.env.NODE_ENV !== 'production',
    logging: process.env.NODE_ENV === 'development',
  };
});
```

---

## 3. Module Architecture

### 3.1 Module Pattern

Each feature module follows this structure:

```
<feature>/
├── <feature>.module.ts       # NestJS module definition
├── <feature>.controller.ts   # HTTP endpoints
├── <feature>.service.ts      # Business logic
├── <feature>.repository.ts   # Data access layer
├── entities/
│   └── <feature>.entity.ts   # TypeORM entity
└── dto/
    ├── create-<feature>.dto.ts
    ├── update-<feature>.dto.ts
    ├── <feature>-response.dto.ts
    ├── <feature>-query.dto.ts   # (if pagination)
    └── index.ts
```

### 3.2 Module Registration

```typescript
// Example: ProductsModule
@Module({
  imports: [
    TypeOrmModule.forFeature([Product]),
    CategoriesModule, // Import for CategoryRepository access
  ],
  controllers: [ProductsController],
  providers: [
    ProductsService,
    ProductRepository,
    ClerkAuthGuard,
  ],
  exports: [ProductsService, ProductRepository],
})
export class ProductsModule {}
```

### 3.3 Dependency Flow

```
Controller
    ↓ Injects
Service
    ↓ Injects
Repository
    ↓ Uses
TypeORM Repository<Entity>
    ↓
PostgreSQL
```

**Example:**

```typescript
// Controller
@Controller()
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  async list(@Query() query: ProductQueryDto) {
    return this.productsService.findAllPaginated(query);
  }
}

// Service
@Injectable()
export class ProductsService {
  constructor(
    private readonly productRepository: ProductRepository,
    private readonly categoryRepository: CategoryRepository,
  ) {}

  async findAllPaginated(query: ProductQueryDto) {
    const result = await this.productRepository.findAllPaginated(query);
    return this.toPaginatedDto(result);
  }
}

// Repository
@Injectable()
export class ProductRepository {
  constructor(
    @InjectRepository(Product)
    private readonly repository: Repository<Product>,
  ) {}

  async findAllPaginated(query: ProductQueryDto) {
    const qb = this.repository.createQueryBuilder('product');
    // Build query...
    return await qb.getManyAndCount();
  }
}
```

---

## 4. Common Infrastructure

### 4.1 Base Entities

**BaseEntity** (`src/common/entities/base.entity.ts`)

```typescript
export abstract class BaseEntity {
  @CreateDateColumn({ type: 'timestamptz' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updated_at: Date;
}
```

**BaseAuditEntity** (`src/common/entities/base-audit.entity.ts`)

```typescript
export abstract class BaseAuditEntity extends BaseEntity {
  @DeleteDateColumn({ type: 'timestamptz', nullable: true })
  deleted_at: Date | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  created_by: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  updated_by: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  deleted_by: string | null;
}
```

**Usage:**
- Entities with **only timestamps**: extend `BaseEntity`
- Entities with **soft delete + audit**: extend `BaseAuditEntity`

### 4.2 Common DTOs

**BaseResponseDto** (`src/common/dto/base-response.dto.ts`)

```typescript
export abstract class BaseResponseDto {
  @ApiProperty({ format: 'date-time' })
  created_at: Date;

  @ApiProperty({ format: 'date-time' })
  updated_at: Date;
}

export abstract class BaseAuditResponseDto extends BaseResponseDto {
  @ApiPropertyOptional({ format: 'date-time', nullable: true })
  deleted_at?: Date | null;

  @ApiPropertyOptional({ nullable: true })
  created_by?: string | null;

  @ApiPropertyOptional({ nullable: true })
  updated_by?: string | null;

  @ApiPropertyOptional({ nullable: true })
  deleted_by?: string | null;
}
```

**ErrorResponseDto** / **MessageResponseDto**

```typescript
export class ErrorResponseDto {
  @ApiProperty()
  error: string;
}

export class MessageResponseDto {
  @ApiProperty()
  message: string;
}
```

### 4.3 Guards

**ClerkAuthGuard** (`src/common/guards/clerk-auth.guard.ts`)

```typescript
@Injectable()
export class ClerkAuthGuard implements CanActivate {
  constructor(private readonly configService: ConfigService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<ClerkRequest>();

    // 1. Extract token from Authorization header
    const token = this.extractTokenFromHeader(request);
    if (!token) {
      throw new UnauthorizedException('No authorization token provided');
    }

    // 2. Get Clerk secret key
    const clerkSecretKey = this.configService.get<string>('CLERK_SECRET_KEY');
    if (!clerkSecretKey) {
      throw new UnauthorizedException('Clerk secret key not configured');
    }

    // 3. Verify token
    try {
      const payload = await verifyToken(token, { secretKey: clerkSecretKey });

      // 4. Attach user context to request
      request.auth = {
        userId: payload.sub,
        sessionId: payload.sid,
        sessionClaims: payload,
      };

      return true;
    } catch {
      throw new UnauthorizedException('Invalid or expired token');
    }
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
```

**ClerkRequest Interface:**

```typescript
export interface ClerkRequest extends Request {
  auth?: {
    userId: string;
    sessionId: string;
    sessionClaims: any;
  };
}
```

### 4.4 Decorators

**@CurrentUser** (`src/common/decorators/current-user.decorator.ts`)

```typescript
// Extract specific property
@Get()
async endpoint(@CurrentUser('userId') userId: string) {
  // userId = "user_xxxxx"
}

// Extract full user object
@Get()
async endpoint(@CurrentUser() user: any) {
  // user = { userId, sessionId, sessionClaims }
}
```

**@ClerkClaims** (`src/common/decorators/clerk-claims.decorator.ts`)

```typescript
@Get()
async endpoint(@ClerkClaims() claims: any) {
  // claims = full JWT payload (exp, iat, sub, sid, etc.)
}
```

**@HateoasLinks** (`src/common/hateoas/hateoas.decorator.ts`)

```typescript
// Define HATEOAS links for a response DTO
@HateoasLinks(
  { rel: 'self', href: '/products/{id}', method: 'GET' },
  { rel: 'update', href: '/products/{id}', method: 'PUT' },
  { rel: 'delete', href: '/products/{id}', method: 'DELETE' },
)
export class ProductResponseDto { ... }

// Dynamic href using function
@HateoasLinks(
  { rel: 'self', href: (data) => `/products/${data.id}`, method: 'GET' },
  { rel: 'category', href: (data) => `/categories/${data.category_id}`, method: 'GET' },
)
```

**Pre-defined Product Links:**

```typescript
// Use in controller
@Get()
@HateoasLinks(...PRODUCT_HATEOAS_LINKS)
async listProducts() { ... }
```

### 4.5 Interceptors

**LoggingInterceptor** (`src/common/interceptors/logging.interceptor.ts`)

- Registered globally via `APP_INTERCEPTOR`
- Logs all HTTP requests with: method, path, statusCode, duration, requestId
- Logs errors with error message

**HateoasInterceptor** (`src/common/hateoas/hateoas.interceptor.ts`)

- Registered globally in `main.ts`
- Reads `@HateoasLinks` metadata from controller methods
- Adds `_links` property to response objects
- Handles arrays (maps over items) and single objects

**Response Format:**

```json
{
  "id": "uuid",
  "name": "Product Name",
  "_links": {
    "self": { "href": "/api/v1/products/uuid", "method": "GET" },
    "update": { "href": "/api/v1/products/uuid", "method": "PUT" },
    "delete": { "href": "/api/v1/products/uuid", "method": "DELETE" }
  }
}
```

### 4.6 Middleware

**RequestIdMiddleware** (`src/common/middleware/request-id.middleware.ts`)

- Applied to all routes in `AppModule.configure()`
- Checks for existing `X-Request-ID` header
- Generates UUID if not present
- Sets `req.id` and `X-Request-ID` response header
- Used by LoggingInterceptor for request tracing

### 4.7 Enums

**AuditAction** (`src/common/enums/audit-action.enum.ts`)

```typescript
enum AuditAction {
  CREATE,
  UPDATE,
  DELETE,
  ADJUST_QUANTITY,
  ADD_PHOTO,
  STATUS_CHANGE,
}
```

**UserRole** (`src/common/enums/user-role.enum.ts`)

```typescript
enum UserRole {
  ADMIN,
  WAREHOUSE_MANAGER,
  PICKER,
  SALES,
}
```

---

## 5. Route Modules

### 5.1 Categories Module

**Entity: Category** (`src/routes/categories/entities/category.entity.ts`)

```typescript
@Entity('categories')
export class Category extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 100 })
  name: string;

  @Column({ type: 'uuid', nullable: true })
  parent_id: string | null;

  @Column({ type: 'varchar', length: 500, nullable: true })
  description: string | null;

  // Self-referential relationship
  @ManyToOne(() => Category, (category) => category.children, {
    onDelete: 'SET NULL',
    nullable: true,
  })
  @JoinColumn({ name: 'parent_id' })
  parent: Category;

  @OneToMany(() => Category, (category) => category.parent)
  children: Category[];
}
```

**Key Behaviors:**
- Hierarchical structure (unlimited nesting)
- `onDelete: 'SET NULL'` - deleting parent orphans children (become root)
- No unique constraint on name

**Repository Methods:**

| Method | Description |
|--------|-------------|
| `findAll()` | All categories ordered by name |
| `findById(id)` | Single category by ID |
| `existsById(id)` | Boolean existence check |
| `create(data)` | Create and save |
| `update(id, data)` | Update existing |
| `delete(id)` | Hard delete |
| `findAllDescendantIds(parentId)` | Recursive descendant IDs |

**Service Methods:**

| Method | Description |
|--------|-------------|
| `findAll()` | Returns hierarchical tree structure |
| `create(dto)` | Validates parent, creates category |
| `update(id, dto)` | Validates parent, checks cycles, updates |
| `delete(id)` | Validates existence, deletes |

**Cycle Detection:**
The service prevents circular references when updating parent:
```typescript
// Cannot set parent to self
if (id === parent_id) throw BadRequestException;

// Cannot set parent to descendant (would create cycle)
if (await this.checkForCycle(id, parent_id)) throw BadRequestException;
```

**API Endpoints:**

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/v1/categories` | List all (hierarchical tree) |
| POST | `/api/v1/categories` | Create category |
| PUT | `/api/v1/categories/:id` | Update category |
| DELETE | `/api/v1/categories/:id` | Delete category |

**DTOs:**

- `CreateCategoryDto`: name (required), parent_id?, description?
- `UpdateCategoryDto`: All optional
- `CategoryResponseDto`: id, name, parent_id, description, timestamps
- `CategoryWithChildrenResponseDto`: Adds `children[]` (recursive)

---

### 5.2 Products Module

**Entity: Product** (`src/routes/products/entities/product.entity.ts`)

```typescript
@Entity('products')
@Index(['deleted_at'])
@Index(['is_active', 'deleted_at'])
@Index(['category_id', 'deleted_at'])
export class Product extends BaseAuditEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 50, unique: true })
  sku: string;

  @Column({ type: 'varchar', length: 200 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ type: 'uuid' })
  category_id: string;

  @Column({ type: 'uuid', nullable: true })
  brand_id: string | null;

  @Column({ type: 'int', nullable: true })
  volume_ml: number | null;

  @Column({ type: 'decimal', precision: 10, scale: 3, nullable: true })
  weight_kg: number | null;

  @Column({ type: 'varchar', length: 50, nullable: true })
  dimensions_cm: string | null;  // Format: "LxWxH"

  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
  standard_cost: number | null;

  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
  standard_price: number | null;

  @Column({ type: 'decimal', precision: 6, scale: 2, nullable: true })
  markup_percentage: number | null;

  @Column({ type: 'int', default: 0 })
  reorder_point: number;

  @Column({ type: 'uuid', nullable: true })
  primary_supplier_id: string | null;

  @Column({ type: 'varchar', length: 50, nullable: true })
  supplier_sku: string | null;

  @Column({ type: 'boolean', default: true })
  is_active: boolean;

  @Column({ type: 'boolean', default: false })
  is_perishable: boolean;

  @Column({ type: 'text', nullable: true })
  notes: string | null;

  // Relationships
  @ManyToOne(() => Supplier, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'primary_supplier_id' })
  primary_supplier: Supplier;

  @ManyToOne(() => Category, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'category_id' })
  category: Category;
}
```

**Key Behaviors:**
- `sku` is unique
- `onDelete: 'RESTRICT'` on category - **cannot delete category with products**
- `onDelete: 'SET NULL'` on supplier - deleting supplier clears reference
- Extends `BaseAuditEntity` for soft delete + audit fields
- Indexes for common query patterns

**Repository Methods:**

| Method | Parameters | Description |
|--------|------------|-------------|
| `findAllPaginated` | `ProductQueryDto` | Paginated with filters |
| `findAll` | `includeDeleted?` | All products |
| `findById` | `id, includeDeleted?` | Single by ID |
| `findBySku` | `sku, includeDeleted?` | Single by SKU |
| `findByCategoryId` | `categoryId, includeDeleted?` | Products in category |
| `findByCategoryIds` | `categoryIds[], includeDeleted?` | Products in multiple categories |
| `findByIds` | `ids[], includeDeleted?` | Multiple by IDs |
| `findDeletedByIds` | `ids[]` | Only soft-deleted products |
| `create` | `data` | Create single |
| `createMany` | `data[]` | Bulk create |
| `update` | `id, data` | Update single |
| `updateMany` | `ids[], data` | Bulk update |
| `softDelete` | `id, deletedBy?` | Soft delete |
| `softDeleteMany` | `ids[], deletedBy?` | Bulk soft delete |
| `restore` | `id` | Restore deleted |
| `restoreMany` | `ids[]` | Bulk restore |
| `hardDelete` | `id` | Permanent delete |
| `hardDeleteMany` | `ids[]` | Bulk permanent delete |

**Query Building (findAllPaginated):**

```typescript
// Soft delete filter (default)
if (!include_deleted) {
  qb.andWhere('product.deleted_at IS NULL');
}

// Search (name OR sku)
if (search) {
  qb.andWhere('(product.name ILIKE :search OR product.sku ILIKE :search)',
    { search: `%${search}%` });
}

// Category filter
if (category_id) {
  qb.andWhere('product.category_id = :categoryId', { categoryId: category_id });
}

// Price range
if (min_price && max_price) {
  qb.andWhere('product.standard_price BETWEEN :min AND :max',
    { min: min_price, max: max_price });
}

// Load relations
qb.leftJoinAndSelect('product.category', 'category')
  .leftJoinAndSelect('product.primary_supplier', 'supplier');

// Sorting
qb.orderBy(`product.${sort_by}`, sort_order);

// Pagination
qb.skip((page - 1) * limit).take(limit);
```

**Service Methods:**

| Method | Description |
|--------|-------------|
| `findAllPaginated(query)` | Paginated list with filters |
| `findAll()` | All products (no pagination) |
| `findOne(id, includeDeleted?)` | Single product |
| `findByCategory(categoryId)` | Products in category |
| `findByCategoryTree(categoryId)` | Products in category + descendants |
| `create(dto, userId?)` | Create with validation |
| `bulkCreate(dto, userId?)` | Bulk create with validation |
| `update(id, dto, userId?)` | Update with validation |
| `bulkUpdateStatus(dto, userId?)` | Bulk update is_active |
| `delete(id, userId?, permanent?)` | Soft or hard delete |
| `bulkDelete(dto, userId?)` | Bulk delete |
| `restore(id, userId?)` | Restore soft-deleted |
| `bulkRestore(dto, userId?)` | Bulk restore |

**Validation Rules:**
1. **Category must exist** (BadRequestException if not)
2. **SKU must be unique** (BadRequestException if duplicate)
3. **Price >= Cost** when both provided (BadRequestException if violated)

**API Endpoints:**

| Method | Path | Description |
|--------|------|-------------|
| GET | `/products` | List paginated |
| GET | `/products/all` | List all (no pagination) |
| GET | `/products/:id` | Get single |
| GET | `/products/category/:categoryId` | By category |
| GET | `/products/category/:categoryId/tree` | By category tree |
| POST | `/products` | Create |
| POST | `/products/bulk` | Bulk create |
| PUT | `/products/:id` | Update |
| PATCH | `/products/bulk/status` | Bulk update status |
| DELETE | `/products/:id` | Delete (soft by default) |
| DELETE | `/products/bulk` | Bulk delete |
| PATCH | `/products/:id/restore` | Restore |
| PATCH | `/products/bulk/restore` | Bulk restore |

**Query Parameters (ProductQueryDto):**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `page` | number | 1 | Page number (min: 1) |
| `limit` | number | 20 | Items per page (1-100) |
| `search` | string | - | Search name/SKU |
| `category_id` | UUID | - | Filter by category |
| `brand_id` | UUID | - | Filter by brand |
| `primary_supplier_id` | UUID | - | Filter by supplier |
| `is_active` | boolean | - | Filter by active status |
| `is_perishable` | boolean | - | Filter by perishable |
| `min_price` | number | - | Minimum price |
| `max_price` | number | - | Maximum price |
| `include_deleted` | boolean | false | Include soft-deleted |
| `sort_by` | enum | NAME | Sort field |
| `sort_order` | enum | ASC | Sort direction |

**Sort Fields:** NAME, SKU, CREATED_AT, UPDATED_AT, STANDARD_PRICE, STANDARD_COST, REORDER_POINT

**Bulk Operation DTOs:**

```typescript
// BulkCreateProductsDto
{ products: CreateProductDto[] }  // 1-100 items

// BulkUpdateStatusDto
{ ids: string[], is_active: boolean }  // 1-100 IDs

// BulkDeleteDto
{ ids: string[], permanent?: boolean }  // 1-100 IDs

// BulkRestoreDto
{ ids: string[] }  // 1-100 IDs

// BulkOperationResultDto
{
  success_count: number,
  failure_count: number,
  succeeded: string[],        // IDs of successful operations
  failures: [{ id?: string, sku?: string, error: string }]
}
```

---

### 5.3 Suppliers Module

**Entity: Supplier** (`src/routes/suppliers/entities/supplier.entity.ts`)

```typescript
@Entity('suppliers')
export class Supplier extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar' })
  name: string;

  @Column({ type: 'varchar', nullable: true })
  contact_person: string | null;

  @Column({ type: 'varchar', nullable: true })
  email: string | null;

  @Column({ type: 'varchar', nullable: true })
  phone: string | null;

  @Column({ type: 'text', nullable: true })
  address: string | null;

  @Column({ type: 'varchar', nullable: true })
  website: string | null;

  @Column({ type: 'text', nullable: true })
  notes: string | null;

  @Column({ type: 'boolean', default: true })
  is_active: boolean;
}
```

**Note:** Currently only entity defined. Controller, service, repository not implemented.

---

### 5.4 Auth Module

**API Endpoints:**

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/v1/auth/profile` | Get Clerk user profile |
| GET | `/api/v1/auth/session-claims` | Get JWT session claims |

**Profile Endpoint:**

```typescript
@Get('profile')
@UseGuards(ClerkAuthGuard)
async getProfile(@CurrentUser('userId') userId: string) {
  const client = createClerkClient({ secretKey: clerkSecretKey });
  return client.users.getUser(userId);  // Returns full Clerk user object
}
```

**Session Claims Endpoint:**

```typescript
@Get('session-claims')
@UseGuards(ClerkAuthGuard)
async getSessionClaims(
  @ClerkClaims() claims: any,
  @CurrentUser() user: any,
) {
  return {
    user_id: user.userId,
    session_id: user.sessionId,
    expires_at: claims.exp,
    issued_at: claims.iat,
  };
}
```

---

### 5.5 Health Module

**API Endpoint:**

| Method | Path | Description |
|--------|------|-------------|
| GET | `/health-check` | Health status (no auth required) |

**Response:**

```json
{
  "status": "healthy",
  "timestamp": "2025-01-15T10:00:00.000Z"
}
```

**Note:** Excluded from `/api/v1` prefix.

---

## 6. Database Design

### 6.1 Entity Relationships

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│  Category   │     │   Product   │     │  Supplier   │
├─────────────┤     ├─────────────┤     ├─────────────┤
│ id (PK)     │◄────│ category_id │     │ id (PK)     │
│ parent_id   │──┐  │ supplier_id │────►│ name        │
│ name        │  │  │ sku (UK)    │     │ email       │
│ description │  │  │ name        │     │ phone       │
└─────────────┘  │  │ ...         │     │ ...         │
       ▲         │  └─────────────┘     └─────────────┘
       │         │
       └─────────┘
      (self-ref)
```

### 6.2 Foreign Key Behaviors

| Relationship | Constraint | Delete Behavior | Effect |
|--------------|------------|-----------------|--------|
| Product → Category | RESTRICT | Blocks delete | Cannot delete category with products |
| Product → Supplier | SET NULL | Clears reference | Product keeps, supplier_id becomes null |
| Category → Category | SET NULL | Orphans children | Children become root categories |

### 6.3 Soft Delete

**Applies to:** Products (via `BaseAuditEntity`)

**Implementation:**
```typescript
// Entity
@DeleteDateColumn({ type: 'timestamptz', nullable: true })
deleted_at: Date | null;

// Repository - Soft delete
await this.repository.createQueryBuilder()
  .update(Product)
  .set({ deleted_at: new Date(), deleted_by: userId })
  .where('id = :id', { id })
  .andWhere('deleted_at IS NULL')
  .execute();

// Repository - Query (excludes deleted by default)
if (!includeDeleted) {
  qb.andWhere('product.deleted_at IS NULL');
}

// Repository - Restore
await this.repository.createQueryBuilder()
  .update(Product)
  .set({ deleted_at: null, deleted_by: null })
  .where('id = :id', { id })
  .andWhere('deleted_at IS NOT NULL')
  .execute();
```

### 6.4 Audit Trail

**Fields:**
- `created_by`: Set on creation
- `updated_by`: Set on every update
- `deleted_by`: Set on soft delete

**Set in Service Layer:**
```typescript
// Create
const product = await this.productRepository.create({
  ...dto,
  created_by: userId ?? null,
  updated_by: userId ?? null,
});

// Update
await this.productRepository.update(id, {
  ...updateData,
  updated_by: userId ?? null,
});

// Soft Delete
await this.productRepository.softDelete(id, userId);
```

### 6.5 Indexes

**Product Entity:**
```typescript
@Index(['deleted_at'])                    // Soft delete queries
@Index(['is_active', 'deleted_at'])       // Active products
@Index(['category_id', 'deleted_at'])     // Category filtering
```

---

## 7. Authentication

### 7.1 Flow

```
1. Client sends request with JWT
   Authorization: Bearer <clerk_jwt_token>
        ↓
2. ClerkAuthGuard extracts token
        ↓
3. Verify token with Clerk SDK
   verifyToken(token, { secretKey })
        ↓
4. Attach user context to request
   request.auth = { userId, sessionId, sessionClaims }
        ↓
5. Controller accesses via decorators
   @CurrentUser('userId') userId: string
```

### 7.2 Protected vs Public Endpoints

**Protected (requires auth):**
- All `/api/v1/*` endpoints except health-check
- Use `@UseGuards(ClerkAuthGuard)` at controller or method level

**Public (no auth):**
- `GET /health-check`

### 7.3 Accessing User Context

```typescript
// In Controller - Get userId
@Post()
async create(
  @Body() dto: CreateProductDto,
  @CurrentUser('userId') userId: string,
) {
  return this.service.create(dto, userId);
}

// In Controller - Get full user object
@Get()
async get(@CurrentUser() user: any) {
  // user = { userId, sessionId, sessionClaims }
}

// In Controller - Get raw claims
@Get()
async get(@ClerkClaims() claims: any) {
  // claims = full JWT payload
}

// In Controller - Get from request
@Post()
async create(@Req() req: ClerkRequest) {
  const userId = req.auth?.userId;
}
```

---

## 8. API Documentation

### 8.1 Swagger Setup

**Access:** `http://localhost:8080/api/docs`

**Configuration:**
- Title: "RBI Inventory API"
- Version: "1.0.0"
- Servers: Development (localhost:8080), Production
- Auth: Bearer JWT (Clerk)

### 8.2 Documentation Decorators

**Controller Level:**
```typescript
@ApiTags('Products')          // Group in Swagger UI
@ApiBearerAuth()              // Requires auth
@Controller()
export class ProductsController { ... }
```

**Method Level:**
```typescript
@Get()
@ApiOperation({
  summary: 'List products',
  description: 'Returns paginated list of products',
  operationId: 'listProducts',
})
@ApiResponse({ status: 200, type: PaginatedProductsResponseDto })
@ApiResponse({ status: 401, type: ErrorResponseDto })
async listProducts() { ... }
```

**Parameter Level:**
```typescript
@ApiParam({ name: 'id', type: 'string', format: 'uuid' })
@ApiQuery({ name: 'include_deleted', type: 'boolean', required: false })
```

**DTO Level:**
```typescript
export class CreateProductDto {
  @ApiProperty({
    description: 'Product SKU',
    example: 'SKU-001',
    minLength: 1,
    maxLength: 50,
  })
  @IsString()
  @MinLength(1)
  @MaxLength(50)
  sku: string;
}
```

### 8.3 OpenAPI Generation

**Script:** `npm run openapi:generate`

**Command:**
```bash
ts-node -r tsconfig-paths/register src/generate-openapi.ts
```

**Output:** `openapi.yaml` in repository root

---

## 9. Development Patterns

### 9.1 Adding a New Entity

**Step 1: Create Entity**
```typescript
// src/routes/inventory/entities/inventory.entity.ts
@Entity('inventory')
export class Inventory extends BaseAuditEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  product_id: string;

  @Column({ type: 'int', default: 0 })
  quantity: number;

  @ManyToOne(() => Product, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'product_id' })
  product: Product;
}
```

**Step 2: Create DTOs**
```typescript
// dto/create-inventory.dto.ts
export class CreateInventoryDto {
  @ApiProperty()
  @IsUUID()
  product_id: string;

  @ApiProperty()
  @IsNumber()
  @Min(0)
  quantity: number;
}

// dto/inventory-response.dto.ts
export class InventoryResponseDto extends BaseAuditResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  product_id: string;

  @ApiProperty()
  quantity: number;
}
```

**Step 3: Create Repository**
```typescript
// inventory.repository.ts
@Injectable()
export class InventoryRepository {
  constructor(
    @InjectRepository(Inventory)
    private readonly repository: Repository<Inventory>,
  ) {}

  async findByProductId(productId: string) {
    return this.repository.findOne({
      where: { product_id: productId, deleted_at: IsNull() },
    });
  }
}
```

**Step 4: Create Service**
```typescript
// inventory.service.ts
@Injectable()
export class InventoryService {
  constructor(
    private readonly inventoryRepository: InventoryRepository,
  ) {}

  async getByProduct(productId: string) {
    return this.inventoryRepository.findByProductId(productId);
  }
}
```

**Step 5: Create Controller**
```typescript
// inventory.controller.ts
@ApiTags('Inventory')
@ApiBearerAuth()
@UseGuards(ClerkAuthGuard)
@Controller()
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Get('product/:productId')
  @ApiOperation({ summary: 'Get inventory by product' })
  async getByProduct(@Param('productId', ParseUUIDPipe) productId: string) {
    return this.inventoryService.getByProduct(productId);
  }
}
```

**Step 6: Create Module**
```typescript
// inventory.module.ts
@Module({
  imports: [TypeOrmModule.forFeature([Inventory])],
  controllers: [InventoryController],
  providers: [InventoryService, InventoryRepository, ClerkAuthGuard],
  exports: [InventoryService],
})
export class InventoryModule {}
```

**Step 7: Register in App**
```typescript
// app.module.ts - Add to imports
InventoryModule,

// app.routes.ts - Add route
{ path: 'inventory', module: InventoryModule },
```

**Step 8: Regenerate OpenAPI**
```bash
npm run openapi:generate
```

### 9.2 Adding a New Endpoint

```typescript
// In existing controller
@Post(':id/duplicate')
@ApiOperation({ summary: 'Duplicate a product' })
@ApiParam({ name: 'id', type: 'string', format: 'uuid' })
@ApiResponse({ status: 201, type: ProductResponseDto })
async duplicateProduct(
  @Param('id', ParseUUIDPipe) id: string,
  @CurrentUser('userId') userId: string,
): Promise<ProductResponseDto> {
  return this.productsService.duplicate(id, userId);
}
```

### 9.3 Validation Patterns

**Custom Validator:**
```typescript
@ValidatorConstraint({ async: false })
export class PriceGreaterThanCostConstraint implements ValidatorConstraintInterface {
  validate(value: number, args: ValidationArguments) {
    const obj = args.object as CreateProductDto;
    if (obj.standard_price != null && obj.standard_cost != null) {
      return obj.standard_price >= obj.standard_cost;
    }
    return true;
  }

  defaultMessage() {
    return 'Price must be greater than or equal to cost';
  }
}

// Usage in DTO
@Validate(PriceGreaterThanCostConstraint)
standard_price: number;
```

**Transform Decorator:**
```typescript
// Trim whitespace
@Transform(({ value }) => value?.trim())
name: string;

// Transform to null if empty
@Transform(({ value }) => value?.trim() || null)
description: string | null;

// Parse boolean from string
@Transform(({ value }) => value === 'true' || value === '1')
is_active: boolean;
```

### 9.4 Error Handling

**Standard Exceptions:**
```typescript
// 404 - Resource not found
throw new NotFoundException('Product not found');

// 400 - Invalid request
throw new BadRequestException('SKU already exists');

// 401 - Authentication failed
throw new UnauthorizedException('Invalid token');
```

**In Services:**
```typescript
async findOne(id: string): Promise<ProductResponseDto> {
  const product = await this.productRepository.findById(id);
  if (!product) {
    throw new NotFoundException(`Product with ID ${id} not found`);
  }
  return this.toResponseDto(product);
}
```

---

## 10. Quick Reference

### 10.1 Commands

```bash
# Development
npm run start:dev          # Start with hot reload

# Production
npm run build              # Compile TypeScript
npm run start:prod         # Start from dist/

# Documentation
npm run openapi:generate   # Generate openapi.yaml

# Testing
npm run test               # Run unit tests
npm run test:e2e           # Run e2e tests
npm run test:cov           # Coverage report
```

### 10.2 Environment Variables

```bash
# Required
CLERK_SECRET_KEY=sk_test_xxxxx

# Database (option 1: URL)
DATABASE_URL=postgresql://user:pass@localhost:5432/rbi_inventory

# Database (option 2: Individual vars)
PGHOST=localhost
PGPORT=5432
PGUSER=postgres
PGPASSWORD=password
PGDATABASE=rbi_inventory

# Optional
PORT=8080                  # Default: 8080
NODE_ENV=development       # development | production
```

### 10.3 Key Files

| File | Purpose |
|------|---------|
| `src/main.ts` | Bootstrap, global config |
| `src/app.module.ts` | Root module |
| `src/app.routes.ts` | Route registration |
| `src/config/database.config.ts` | DB configuration |
| `src/common/entities/base-audit.entity.ts` | Base entity with soft delete |
| `src/common/guards/clerk-auth.guard.ts` | Authentication |
| `src/common/hateoas/hateoas.interceptor.ts` | HATEOAS links |

### 10.4 API Routes Summary

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/health-check` | No | Health status |
| GET | `/api/v1/auth/profile` | Yes | User profile |
| GET | `/api/v1/auth/session-claims` | Yes | JWT claims |
| GET | `/api/v1/categories` | Yes | List categories (tree) |
| POST | `/api/v1/categories` | Yes | Create category |
| PUT | `/api/v1/categories/:id` | Yes | Update category |
| DELETE | `/api/v1/categories/:id` | Yes | Delete category |
| GET | `/api/v1/products` | Yes | List products (paginated) |
| GET | `/api/v1/products/all` | Yes | List all products |
| GET | `/api/v1/products/:id` | Yes | Get product |
| POST | `/api/v1/products` | Yes | Create product |
| POST | `/api/v1/products/bulk` | Yes | Bulk create |
| PUT | `/api/v1/products/:id` | Yes | Update product |
| PATCH | `/api/v1/products/bulk/status` | Yes | Bulk update status |
| DELETE | `/api/v1/products/:id` | Yes | Delete product |
| DELETE | `/api/v1/products/bulk` | Yes | Bulk delete |
| PATCH | `/api/v1/products/:id/restore` | Yes | Restore product |
| PATCH | `/api/v1/products/bulk/restore` | Yes | Bulk restore |

### 10.5 Response Formats

**Success (Single):**
```json
{
  "id": "uuid",
  "name": "Product",
  "created_at": "2025-01-15T10:00:00Z",
  "_links": { "self": { "href": "/products/uuid", "method": "GET" } }
}
```

**Success (Paginated):**
```json
{
  "data": [...],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "total_pages": 5,
    "has_next": true,
    "has_previous": false
  }
}
```

**Success (Message):**
```json
{ "message": "Product deleted successfully" }
```

**Error:**
```json
{
  "statusCode": 404,
  "message": "Product not found",
  "error": "Not Found"
}
```

**Bulk Operation:**
```json
{
  "success_count": 8,
  "failure_count": 2,
  "succeeded": ["uuid1", "uuid2", ...],
  "failures": [
    { "sku": "SKU-001", "error": "SKU already exists" }
  ]
}
```
