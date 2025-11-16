import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from '../entities/product.entity';

@Injectable()
export class ProductRepository {
  constructor(
    @InjectRepository(Product)
    private readonly repository: Repository<Product>,
  ) {}

  async findAll(): Promise<Product[]> {
    return this.repository.find({
      relations: ['category'],
    });
  }

  async findById(id: string): Promise<Product | null> {
    return this.repository.findOne({
      where: { id },
      relations: ['category'],
    });
  }

  async findBySku(sku: string): Promise<Product | null> {
    return this.repository.findOne({
      where: { sku },
      relations: ['category'],
    });
  }

  async findByCategoryId(categoryId: string): Promise<Product[]> {
    return this.repository.find({
      where: { category_id: categoryId },
      relations: ['category'],
    });
  }

  async create(productData: Partial<Product>): Promise<Product> {
    const product = this.repository.create(productData);
    return this.repository.save(product);
  }

  async update(
    id: string,
    productData: Partial<Product>,
  ): Promise<Product | null> {
    await this.repository.update(id, productData);
    return this.findById(id);
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.repository.delete(id);
    return (result.affected ?? 0) > 0;
  }

  async findLowStock(): Promise<Product[]> {
    return this.repository
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.category', 'category')
      .where('product.reorder_point > 0')
      .getMany();
  }

  async findActive(): Promise<Product[]> {
    return this.repository.find({
      where: { is_active: true },
      relations: ['category'],
    });
  }
}
