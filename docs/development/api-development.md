# API Development

This guide covers NestJS development patterns for the LibreStock Inventory backend.

## Module Structure

Each feature follows this structure:

```
routes/<feature>/
├── <feature>.module.ts
├── <feature>.controller.ts
├── <feature>.service.ts
├── <feature>.repository.ts
├── <feature>.hateoas.ts
├── entities/
│   └── <feature>.entity.ts
└── dto/
    ├── create-<feature>.dto.ts
    ├── update-<feature>.dto.ts
    ├── <feature>-response.dto.ts
    ├── <feature>-query.dto.ts
    └── index.ts
```

## Creating a New Entity

### 1. Entity Definition

```typescript
// routes/products/entities/product.entity.ts
import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseAuditEntity } from 'src/common/entities/base-audit.entity';
import { Category } from '../../categories/entities/category.entity';

@Entity('products')
export class Product extends BaseAuditEntity {
  @Column({ length: 50, unique: true })
  sku: string;

  @Column({ length: 200 })
  name: string;

  @Column({ type: 'uuid', nullable: true })
  category_id: string | null;

  @ManyToOne(() => Category, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'category_id' })
  category: Category | null;
}
```

### Base Entities

- `BaseEntity`: `created_at`, `updated_at`
- `BaseAuditEntity`: Adds `deleted_at`, `created_by`, `updated_by`, `deleted_by`

### 2. DTOs

```typescript
// dto/create-product.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsUUID, IsOptional, MaxLength } from 'class-validator';

export class CreateProductDto {
  @ApiProperty({ example: 'PROD-001' })
  @IsString()
  @MaxLength(50)
  sku: string;

  @ApiProperty({ example: 'Luxury Towel' })
  @IsString()
  @MaxLength(200)
  name: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsUUID()
  category_id?: string;
}
```

### 3. Repository

```typescript
// product.repository.ts
@Injectable()
export class ProductRepository {
  constructor(
    @InjectRepository(Product)
    private readonly repository: Repository<Product>,
  ) {}

  async findById(id: string): Promise<Product | null> {
    return this.repository.findOne({
      where: { id, deleted_at: IsNull() },
      relations: ['category'],
    });
  }

  async create(data: Partial<Product>): Promise<Product> {
    const product = this.repository.create(data);
    return this.repository.save(product);
  }
}
```

### 4. Service

```typescript
// products.service.ts
@Injectable()
export class ProductsService {
  constructor(
    private readonly productRepository: ProductRepository,
    private readonly categoryRepository: CategoryRepository,
  ) {}

  async create(dto: CreateProductDto, userId: string): Promise<Product> {
    // Validate category exists
    if (dto.category_id) {
      const exists = await this.categoryRepository.existsById(dto.category_id);
      if (!exists) {
        throw new NotFoundException('Category not found');
      }
    }

    // Check SKU uniqueness
    const existing = await this.productRepository.findBySku(dto.sku);
    if (existing) {
      throw new BadRequestException('SKU already exists');
    }

    return this.productRepository.create({
      ...dto,
      created_by: userId,
      updated_by: userId,
    });
  }
}
```

### 5. Controller

```typescript
// products.controller.ts
@Controller('products')
@UseGuards(ClerkAuthGuard)
@ApiTags('Products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  @UseInterceptors(HateoasInterceptor)
  @ProductHateoas()
  @ApiOperation({ summary: 'Create product' })
  @ApiResponse({ status: 201, type: ProductResponseDto })
  async create(
    @Body() dto: CreateProductDto,
    @CurrentUser('userId') userId: string,
  ): Promise<Product> {
    return this.productsService.create(dto, userId);
  }
}
```

### 6. HATEOAS Links

```typescript
// products.hateoas.ts
export const PRODUCT_HATEOAS_LINKS: LinkDefinition[] = [
  { rel: 'self', href: (data) => `/products/${data.id}`, method: 'GET' },
  { rel: 'update', href: (data) => `/products/${data.id}`, method: 'PUT' },
  { rel: 'delete', href: (data) => `/products/${data.id}`, method: 'DELETE' },
];

export const ProductHateoas = () => HateoasLinks(...PRODUCT_HATEOAS_LINKS);
```

### 7. Module Registration

```typescript
// products.module.ts
@Module({
  imports: [TypeOrmModule.forFeature([Product])],
  controllers: [ProductsController],
  providers: [ProductsService, ProductRepository],
  exports: [ProductsService],
})
export class ProductsModule {}

// Register in app.module.ts
@Module({
  imports: [
    // ...
    ProductsModule,
  ],
})
export class AppModule {}
```

### 8. Generate OpenAPI

```bash
pnpm --filter @librestock/api openapi:generate
```

## Authentication

### Using Guards

```typescript
@Controller('products')
@UseGuards(ClerkAuthGuard)
export class ProductsController {}
```

### Accessing User

```typescript
// Get user ID
@CurrentUser('userId') userId: string

// Get full auth object
@CurrentUser() auth: { userId: string; sessionId: string }

// Get JWT claims
@ClerkClaims() claims: JwtPayload
```

## Error Handling

Use NestJS built-in exceptions:

```typescript
throw new NotFoundException('Product not found');
throw new BadRequestException('Invalid SKU format');
throw new UnauthorizedException('Token expired');
throw new ForbiddenException('Insufficient permissions');
```

## Soft Delete

Products use soft delete:

```typescript
// Repository - exclude deleted by default
async findAll(): Promise<Product[]> {
  return this.repository.find({
    where: { deleted_at: IsNull() },
  });
}

// Include deleted
async findAllWithDeleted(): Promise<Product[]> {
  return this.repository.find();
}

// Soft delete
async softDelete(id: string, userId: string): Promise<void> {
  await this.repository.update(id, {
    deleted_at: new Date(),
    deleted_by: userId,
  });
}
```

## Response Formats

### Single Entity

```json
{
  "id": "uuid",
  "name": "Product Name",
  "_links": {
    "self": { "href": "/products/uuid", "method": "GET" }
  }
}
```

### Paginated List

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

### Bulk Operation

```json
{
  "success_count": 8,
  "failure_count": 2,
  "succeeded": ["id1", "id2"],
  "failures": [
    { "id": "id3", "error": "Not found" }
  ]
}
```
