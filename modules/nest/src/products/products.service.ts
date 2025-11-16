import { Injectable } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductResponseDto } from './dto/product-response.dto';

@Injectable()
export class ProductsService {
  private products: ProductResponseDto[] = [];

  findAll(): ProductResponseDto[] {
    return this.products;
  }

  findOne(id: string): ProductResponseDto | undefined {
    return this.products.find((product) => product.id === id);
  }

  findByCategory(categoryId: string): ProductResponseDto[] {
    return this.products.filter(
      (product) => product.category_id === categoryId,
    );
  }

  findByCategoryTree(categoryId: string): ProductResponseDto[] {
    return this.products.filter(
      (product) => product.category_id === categoryId,
    );
  }

  create(createProductDto: CreateProductDto): ProductResponseDto {
    const product: ProductResponseDto = {
      id: uuidv4(),
      ...createProductDto,
      description: createProductDto.description || null,
      brand_id: createProductDto.brand_id || null,
      volume_ml: createProductDto.volume_ml || null,
      weight_kg: createProductDto.weight_kg || null,
      dimensions_cm: createProductDto.dimensions_cm || null,
      standard_cost: createProductDto.standard_cost || null,
      standard_price: createProductDto.standard_price || null,
      markup_percentage: createProductDto.markup_percentage || null,
      primary_supplier_id: createProductDto.primary_supplier_id || null,
      supplier_sku: createProductDto.supplier_sku || null,
      notes: createProductDto.notes || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    this.products.push(product);
    return product;
  }

  update(
    id: string,
    updateProductDto: UpdateProductDto,
  ): ProductResponseDto | undefined {
    const index = this.products.findIndex((product) => product.id === id);
    if (index === -1) return undefined;

    this.products[index] = {
      ...this.products[index],
      ...updateProductDto,
      updated_at: new Date().toISOString(),
    };
    return this.products[index];
  }

  remove(id: string): boolean {
    const index = this.products.findIndex((product) => product.id === id);
    if (index === -1) return false;
    this.products.splice(index, 1);
    return true;
  }
}
