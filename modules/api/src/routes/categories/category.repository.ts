import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category } from './entities/category.entity';

@Injectable()
export class CategoryRepository {
  constructor(
    @InjectRepository(Category)
    private readonly repository: Repository<Category>,
  ) {}

  async findAll(): Promise<Category[]> {
    return this.repository.find({
      order: { name: 'ASC' },
    });
  }

  async findById(id: string): Promise<Category | null> {
    return this.repository.findOneBy({ id });
  }

  async existsById(id: string): Promise<boolean> {
    return this.repository.existsBy({ id });
  }

  async create(createData: Partial<Category>): Promise<Category> {
    const category = this.repository.create(createData);
    return this.repository.save(category);
  }

  async update(
    id: string,
    updateData: Partial<Category>,
  ): Promise<Category | null> {
    const category = await this.repository.findOneBy({ id });
    if (category) {
      Object.assign(category, updateData);
      return this.repository.save(category);
    }
    return null;
  }

  async delete(id: string): Promise<void> {
    await this.repository.delete(id);
  }

  async findOne(options: any): Promise<Category | null> {
    return this.repository.findOne(options);
  }

  async findAllDescendantIds(parentId: string): Promise<string[]> {
    const allCategories = await this.repository.find({
      select: ['id', 'parent_id'],
    });

    const childIds: string[] = [];
    const findChildren = (currentParentId: string) => {
      for (const category of allCategories) {
        if (category.parent_id === currentParentId) {
          childIds.push(category.id);
          findChildren(category.id);
        }
      }
    };
    findChildren(parentId);
    return childIds;
  }
}
