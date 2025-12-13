import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Product } from './entities/product.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Category } from '../categories/entities/category.entity';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
  ) {}

  async findAll(): Promise<Product[]> {
    return this.productRepository.find({
      order: { name: 'ASC' },
    });
  }

  async findOne(id: string): Promise<Product> {
    const product = await this.productRepository.findOneBy({ id });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    return product;
  }

  async findByCategory(categoryId: string): Promise<Product[]> {
    const categoryExists = await this.categoryRepository.existsBy({
      id: categoryId,
    });

    if (!categoryExists) {
      throw new NotFoundException('Category not found');
    }

    return this.productRepository.find({
      where: { category_id: categoryId },
      order: { name: 'ASC' },
    });
  }

  async findByCategoryTree(categoryId: string): Promise<Product[]> {
    const categoryExists = await this.categoryRepository.existsBy({
      id: categoryId,
    });

    if (!categoryExists) {
      throw new NotFoundException('Category not found');
    }

    const categoryIds = await this.getAllChildCategoryIds(categoryId);
    categoryIds.push(categoryId);

    return this.productRepository.find({
      where: { category_id: In(categoryIds) },
      order: { name: 'ASC' },
    });
  }

  async create(createProductDto: CreateProductDto): Promise<Product> {
    const categoryExists = await this.categoryRepository.existsBy({
      id: createProductDto.category_id,
    });

    if (!categoryExists) {
      throw new BadRequestException('Category not found');
    }

    const existingSku = await this.productRepository.findOneBy({
      sku: createProductDto.sku,
    });

    if (existingSku) {
      throw new BadRequestException('A product with this SKU already exists');
    }

    const product = this.productRepository.create({
      sku: createProductDto.sku,
      name: createProductDto.name,
      description: createProductDto.description ?? null,
      category_id: createProductDto.category_id,
      brand_id: createProductDto.brand_id ?? null,
      volume_ml: createProductDto.volume_ml ?? null,
      weight_kg: createProductDto.weight_kg ?? null,
      dimensions_cm: createProductDto.dimensions_cm ?? null,
      standard_cost: createProductDto.standard_cost ?? null,
      standard_price: createProductDto.standard_price ?? null,
      markup_percentage: createProductDto.markup_percentage ?? null,
      reorder_point: createProductDto.reorder_point,
      primary_supplier_id: createProductDto.primary_supplier_id ?? null,
      supplier_sku: createProductDto.supplier_sku ?? null,
      is_active: createProductDto.is_active,
      is_perishable: createProductDto.is_perishable,
      notes: createProductDto.notes ?? null,
    });

    return this.productRepository.save(product);
  }

  async update(id: string, updateProductDto: UpdateProductDto): Promise<Product> {
    const product = await this.productRepository.findOneBy({ id });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    if (updateProductDto.category_id !== undefined && updateProductDto.category_id !== null) {
      const categoryExists = await this.categoryRepository.existsBy({
        id: updateProductDto.category_id,
      });

      if (!categoryExists) {
        throw new BadRequestException('Category not found');
      }
    }

    if (updateProductDto.sku !== undefined && updateProductDto.sku !== product.sku) {
      const existingSku = await this.productRepository.findOneBy({
        sku: updateProductDto.sku,
      });

      if (existingSku) {
        throw new BadRequestException('A product with this SKU already exists');
      }
    }

    if (updateProductDto.sku !== undefined) {
      product.sku = updateProductDto.sku;
    }
    if (updateProductDto.name !== undefined) {
      product.name = updateProductDto.name;
    }
    if (updateProductDto.description !== undefined) {
      product.description = updateProductDto.description;
    }
    if (updateProductDto.category_id !== undefined) {
      product.category_id = updateProductDto.category_id as string;
    }
    if (updateProductDto.brand_id !== undefined) {
      product.brand_id = updateProductDto.brand_id;
    }
    if (updateProductDto.volume_ml !== undefined) {
      product.volume_ml = updateProductDto.volume_ml;
    }
    if (updateProductDto.weight_kg !== undefined) {
      product.weight_kg = updateProductDto.weight_kg;
    }
    if (updateProductDto.dimensions_cm !== undefined) {
      product.dimensions_cm = updateProductDto.dimensions_cm;
    }
    if (updateProductDto.standard_cost !== undefined) {
      product.standard_cost = updateProductDto.standard_cost;
    }
    if (updateProductDto.standard_price !== undefined) {
      product.standard_price = updateProductDto.standard_price;
    }
    if (updateProductDto.markup_percentage !== undefined) {
      product.markup_percentage = updateProductDto.markup_percentage;
    }
    if (updateProductDto.reorder_point !== undefined) {
      product.reorder_point = updateProductDto.reorder_point;
    }
    if (updateProductDto.primary_supplier_id !== undefined) {
      product.primary_supplier_id = updateProductDto.primary_supplier_id;
    }
    if (updateProductDto.supplier_sku !== undefined) {
      product.supplier_sku = updateProductDto.supplier_sku;
    }
    if (updateProductDto.is_active !== undefined) {
      product.is_active = updateProductDto.is_active;
    }
    if (updateProductDto.is_perishable !== undefined) {
      product.is_perishable = updateProductDto.is_perishable;
    }
    if (updateProductDto.notes !== undefined) {
      product.notes = updateProductDto.notes;
    }

    return this.productRepository.save(product);
  }

  async delete(id: string): Promise<void> {
    const product = await this.productRepository.findOneBy({ id });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    await this.productRepository.delete(id);
  }

  private async getAllChildCategoryIds(categoryId: string): Promise<string[]> {
    const allCategories = await this.categoryRepository.find();
    const childIds: string[] = [];

    const findChildren = (parentId: string) => {
      for (const category of allCategories) {
        if (category.parent_id === parentId) {
          childIds.push(category.id);
          findChildren(category.id);
        }
      }
    };

    findChildren(categoryId);
    return childIds;
  }
}
