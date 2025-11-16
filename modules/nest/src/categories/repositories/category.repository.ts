import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { Category } from '../entities/category.entity';

@Injectable()
export class CategoryRepository {
  constructor(
    @InjectRepository(Category)
    private readonly repository: Repository<Category>,
  ) {}

  async findAll(): Promise<Category[]> {
    return this.repository.find({
      relations: ['parent', 'children'],
    });
  }

  async findById(id: string): Promise<Category | null> {
    return this.repository.findOne({
      where: { id },
      relations: ['parent', 'children'],
    });
  }

  async findRootCategories(): Promise<Category[]> {
    return this.repository.find({
      where: { parent_id: IsNull() },
      relations: ['children'],
    });
  }

  async findByParentId(parentId: string): Promise<Category[]> {
    return this.repository.find({
      where: { parent_id: parentId },
      relations: ['children'],
    });
  }

  async findByName(name: string): Promise<Category | null> {
    return this.repository.findOne({
      where: { name },
      relations: ['parent', 'children'],
    });
  }

  async create(categoryData: Partial<Category>): Promise<Category> {
    const category = this.repository.create(categoryData);
    return this.repository.save(category);
  }

  async update(
    id: string,
    categoryData: Partial<Category>,
  ): Promise<Category | null> {
    await this.repository.update(id, categoryData);
    return this.findById(id);
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.repository.delete(id);
    return (result.affected ?? 0) > 0;
  }

  async findTreeWithChildren(categoryId: string): Promise<Category | null> {
    return this.repository
      .createQueryBuilder('category')
      .leftJoinAndSelect('category.children', 'children')
      .leftJoinAndSelect('children.children', 'grandchildren')
      .where('category.id = :categoryId', { categoryId })
      .getOne();
  }
}
