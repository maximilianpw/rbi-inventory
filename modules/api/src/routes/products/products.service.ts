import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { Product } from './entities/product.entity';
import {
  CreateProductDto,
  UpdateProductDto,
  ProductQueryDto,
  ProductResponseDto,
  PaginatedProductsResponseDto,
  BulkCreateProductsDto,
  BulkUpdateStatusDto,
  BulkDeleteDto,
  BulkRestoreDto,
  BulkOperationResultDto,
} from './dto';
import { ProductRepository } from './product.repository';
import { CategoryRepository } from '../categories/category.repository';

@Injectable()
export class ProductsService {
  constructor(
    private readonly productRepository: ProductRepository,
    private readonly categoryRepository: CategoryRepository,
  ) {}

  async findAllPaginated(
    query: ProductQueryDto,
  ): Promise<PaginatedProductsResponseDto> {
    const result = await this.productRepository.findAllPaginated(query);

    return {
      data: result.data.map((p) => this.toResponseDto(p)),
      meta: {
        page: result.page,
        limit: result.limit,
        total: result.total,
        total_pages: result.total_pages,
        has_next: result.page < result.total_pages,
        has_previous: result.page > 1,
      },
    };
  }

  async findAll(): Promise<ProductResponseDto[]> {
    const products = await this.productRepository.findAll();
    return products.map((p) => this.toResponseDto(p));
  }

  async findOne(
    id: string,
    includeDeleted = false,
  ): Promise<ProductResponseDto> {
    const product = await this.productRepository.findById(id, includeDeleted);
    if (!product) {
      throw new NotFoundException('Product not found');
    }
    return this.toResponseDto(product);
  }

  async findByCategory(categoryId: string): Promise<ProductResponseDto[]> {
    await this.checkCategoryExistence(categoryId, 'NotFound');
    const products = await this.productRepository.findByCategoryId(categoryId);
    return products.map((p) => this.toResponseDto(p));
  }

  async findByCategoryTree(categoryId: string): Promise<ProductResponseDto[]> {
    await this.checkCategoryExistence(categoryId, 'NotFound');

    const descendantIds =
      await this.categoryRepository.findAllDescendantIds(categoryId);
    const categoryIds = [categoryId, ...descendantIds];

    const products =
      await this.productRepository.findByCategoryIds(categoryIds);
    return products.map((p) => this.toResponseDto(p));
  }

  async create(
    createProductDto: CreateProductDto,
    userId?: string,
  ): Promise<ProductResponseDto> {
    await this.checkCategoryExistence(
      createProductDto.category_id,
      'BadRequest',
    );

    const existingSku = await this.productRepository.findBySku(
      createProductDto.sku,
    );

    if (existingSku) {
      throw new BadRequestException('A product with this SKU already exists');
    }

    // Validate price >= cost
    if (
      createProductDto.standard_price !== undefined &&
      createProductDto.standard_price !== null &&
      createProductDto.standard_cost !== undefined &&
      createProductDto.standard_cost !== null &&
      createProductDto.standard_price < createProductDto.standard_cost
    ) {
      throw new BadRequestException(
        'Standard price must be greater than or equal to standard cost',
      );
    }

    const product = await this.productRepository.create({
      ...createProductDto,
      description: createProductDto.description ?? null,
      brand_id: createProductDto.brand_id ?? null,
      volume_ml: createProductDto.volume_ml ?? null,
      weight_kg: createProductDto.weight_kg ?? null,
      dimensions_cm: createProductDto.dimensions_cm ?? null,
      standard_cost: createProductDto.standard_cost ?? null,
      standard_price: createProductDto.standard_price ?? null,
      markup_percentage: createProductDto.markup_percentage ?? null,
      primary_supplier_id: createProductDto.primary_supplier_id ?? null,
      supplier_sku: createProductDto.supplier_sku ?? null,
      notes: createProductDto.notes ?? null,
      created_by: userId ?? null,
      updated_by: userId ?? null,
    });

    // Fetch with relations
    const productWithRelations = await this.productRepository.findById(
      product.id,
    );
    return this.toResponseDto(productWithRelations!);
  }

  async bulkCreate(
    bulkDto: BulkCreateProductsDto,
    userId?: string,
  ): Promise<BulkOperationResultDto> {
    const result: BulkOperationResultDto = {
      success_count: 0,
      failure_count: 0,
      succeeded: [],
      failures: [],
    };

    // Validate all categories exist first
    const categoryIds = [
      ...new Set(bulkDto.products.map((p) => p.category_id)),
    ];
    for (const categoryId of categoryIds) {
      const exists = await this.categoryRepository.existsById(categoryId);
      if (!exists) {
        result.failure_count = bulkDto.products.length;
        result.failures = bulkDto.products.map((p) => ({
          sku: p.sku,
          error: `Category ${categoryId} not found`,
        }));
        return result;
      }
    }

    // Check for duplicate SKUs in request
    const skusInRequest = bulkDto.products.map((p) => p.sku);
    const duplicateSkus = skusInRequest.filter(
      (sku, idx) => skusInRequest.indexOf(sku) !== idx,
    );
    if (duplicateSkus.length > 0) {
      for (const product of bulkDto.products) {
        if (duplicateSkus.includes(product.sku)) {
          result.failure_count++;
          result.failures.push({
            sku: product.sku,
            error: 'Duplicate SKU in request',
          });
        }
      }
    }

    // Process each product
    for (const productDto of bulkDto.products) {
      if (duplicateSkus.includes(productDto.sku)) {
        continue; // Already handled above
      }

      try {
        const existingSku = await this.productRepository.findBySku(
          productDto.sku,
        );
        if (existingSku) {
          result.failure_count++;
          result.failures.push({
            sku: productDto.sku,
            error: 'A product with this SKU already exists',
          });
          continue;
        }

        const product = await this.productRepository.create({
          ...productDto,
          description: productDto.description ?? null,
          brand_id: productDto.brand_id ?? null,
          volume_ml: productDto.volume_ml ?? null,
          weight_kg: productDto.weight_kg ?? null,
          dimensions_cm: productDto.dimensions_cm ?? null,
          standard_cost: productDto.standard_cost ?? null,
          standard_price: productDto.standard_price ?? null,
          markup_percentage: productDto.markup_percentage ?? null,
          primary_supplier_id: productDto.primary_supplier_id ?? null,
          supplier_sku: productDto.supplier_sku ?? null,
          notes: productDto.notes ?? null,
          created_by: userId ?? null,
          updated_by: userId ?? null,
        });

        result.success_count++;
        result.succeeded.push(product.id);
      } catch (error) {
        result.failure_count++;
        result.failures.push({
          sku: productDto.sku,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

    return result;
  }

  async update(
    id: string,
    updateProductDto: UpdateProductDto,
    userId?: string,
  ): Promise<ProductResponseDto> {
    const product = await this.getProductOrFail(id);

    if (updateProductDto.category_id) {
      await this.checkCategoryExistence(
        updateProductDto.category_id,
        'BadRequest',
      );
    }

    if (updateProductDto.sku && updateProductDto.sku !== product.sku) {
      const existingSku = await this.productRepository.findBySku(
        updateProductDto.sku,
      );

      if (existingSku) {
        throw new BadRequestException('A product with this SKU already exists');
      }
    }

    // Validate price >= cost (considering both existing and new values)
    const newCost = updateProductDto.standard_cost ?? product.standard_cost;
    const newPrice = updateProductDto.standard_price ?? product.standard_price;
    if (
      newPrice !== undefined &&
      newPrice !== null &&
      newCost !== undefined &&
      newCost !== null &&
      newPrice < newCost
    ) {
      throw new BadRequestException(
        'Standard price must be greater than or equal to standard cost',
      );
    }

    if (Object.keys(updateProductDto).length === 0) {
      return this.toResponseDto(product);
    }

    await this.productRepository.update(id, {
      ...updateProductDto,
      updated_by: userId ?? null,
    });

    // Fetch with relations
    const productWithRelations = await this.productRepository.findById(id);
    return this.toResponseDto(productWithRelations!);
  }

  async bulkUpdateStatus(
    bulkDto: BulkUpdateStatusDto,
    userId?: string,
  ): Promise<BulkOperationResultDto> {
    const result: BulkOperationResultDto = {
      success_count: 0,
      failure_count: 0,
      succeeded: [],
      failures: [],
    };

    // Find existing products
    const existingProducts = await this.productRepository.findByIds(
      bulkDto.ids,
    );
    const existingIds = new Set(existingProducts.map((p) => p.id));

    // Check for non-existent products
    for (const id of bulkDto.ids) {
      if (!existingIds.has(id)) {
        result.failure_count++;
        result.failures.push({ id, error: 'Product not found' });
      }
    }

    // Update existing products
    const idsToUpdate = bulkDto.ids.filter((id) => existingIds.has(id));
    if (idsToUpdate.length > 0) {
      const affectedCount = await this.productRepository.updateMany(
        idsToUpdate,
        {
          is_active: bulkDto.is_active,
          updated_by: userId ?? null,
        },
      );
      result.success_count = affectedCount;
      result.succeeded = idsToUpdate.slice(0, affectedCount);
    }

    return result;
  }

  async delete(id: string, userId?: string, permanent = false): Promise<void> {
    await this.getProductOrFail(id);

    if (permanent) {
      await this.productRepository.hardDelete(id);
    } else {
      await this.productRepository.softDelete(id, userId);
    }
  }

  async bulkDelete(
    bulkDto: BulkDeleteDto,
    userId?: string,
  ): Promise<BulkOperationResultDto> {
    const result: BulkOperationResultDto = {
      success_count: 0,
      failure_count: 0,
      succeeded: [],
      failures: [],
    };

    // Find existing products
    const existingProducts = await this.productRepository.findByIds(
      bulkDto.ids,
    );
    const existingIds = new Set(existingProducts.map((p) => p.id));

    // Check for non-existent products
    for (const id of bulkDto.ids) {
      if (!existingIds.has(id)) {
        result.failure_count++;
        result.failures.push({ id, error: 'Product not found' });
      }
    }

    // Delete existing products
    const idsToDelete = bulkDto.ids.filter((id) => existingIds.has(id));
    if (idsToDelete.length > 0) {
      if (bulkDto.permanent) {
        const affectedCount =
          await this.productRepository.hardDeleteMany(idsToDelete);
        result.success_count = affectedCount;
        result.succeeded = idsToDelete.slice(0, affectedCount);
      } else {
        const affectedCount = await this.productRepository.softDeleteMany(
          idsToDelete,
          userId,
        );
        result.success_count = affectedCount;
        result.succeeded = idsToDelete.slice(0, affectedCount);
      }
    }

    return result;
  }

  async restore(id: string, _userId?: string): Promise<ProductResponseDto> {
    const product = await this.productRepository.findById(id, true);
    if (!product) {
      throw new NotFoundException('Product not found');
    }
    if (!product.deleted_at) {
      throw new BadRequestException('Product is not deleted');
    }

    await this.productRepository.restore(id);

    const restored = await this.productRepository.findById(id);
    return this.toResponseDto(restored!);
  }

  async bulkRestore(
    bulkDto: BulkRestoreDto,
    _userId?: string,
  ): Promise<BulkOperationResultDto> {
    const result: BulkOperationResultDto = {
      success_count: 0,
      failure_count: 0,
      succeeded: [],
      failures: [],
    };

    // Find deleted products
    const deletedProducts = await this.productRepository.findDeletedByIds(
      bulkDto.ids,
    );
    const deletedIds = new Set(deletedProducts.map((p) => p.id));

    // Check for non-existent or not-deleted products
    for (const id of bulkDto.ids) {
      if (!deletedIds.has(id)) {
        result.failure_count++;
        result.failures.push({
          id,
          error: 'Product not found or not deleted',
        });
      }
    }

    // Restore deleted products
    const idsToRestore = bulkDto.ids.filter((id) => deletedIds.has(id));
    if (idsToRestore.length > 0) {
      const affectedCount =
        await this.productRepository.restoreMany(idsToRestore);
      result.success_count = affectedCount;
      result.succeeded = idsToRestore.slice(0, affectedCount);
    }

    return result;
  }

  private async getProductOrFail(id: string): Promise<Product> {
    const product = await this.productRepository.findById(id);
    if (!product) {
      throw new NotFoundException('Product not found');
    }
    return product;
  }

  private async checkCategoryExistence(
    categoryId: string,
    errorType: 'NotFound' | 'BadRequest',
  ): Promise<void> {
    const exists = await this.categoryRepository.existsById(categoryId);

    if (!exists) {
      throw errorType === 'NotFound'
        ? new NotFoundException('Category not found')
        : new BadRequestException('Category not found');
    }
  }

  private toResponseDto(product: Product): ProductResponseDto {
    const dto: ProductResponseDto = {
      id: product.id,
      sku: product.sku,
      name: product.name,
      description: product.description,
      category_id: product.category_id,
      brand_id: product.brand_id,
      volume_ml: product.volume_ml,
      weight_kg: product.weight_kg,
      dimensions_cm: product.dimensions_cm,
      standard_cost: product.standard_cost,
      standard_price: product.standard_price,
      markup_percentage: product.markup_percentage,
      reorder_point: product.reorder_point,
      primary_supplier_id: product.primary_supplier_id,
      supplier_sku: product.supplier_sku,
      is_active: product.is_active,
      is_perishable: product.is_perishable,
      notes: product.notes,
      created_at: product.created_at,
      updated_at: product.updated_at,
      deleted_at: product.deleted_at,
      created_by: product.created_by,
      updated_by: product.updated_by,
      deleted_by: product.deleted_by,
    };

    // Add nested category if loaded
    if (product.category) {
      dto.category = {
        id: product.category.id,
        name: product.category.name,
        parent_id: product.category.parent_id,
      };
    }

    // Add nested supplier if loaded
    if (product.primary_supplier) {
      dto.primary_supplier = {
        id: product.primary_supplier.id,
        name: product.primary_supplier.name,
      };
    }

    return dto;
  }
}