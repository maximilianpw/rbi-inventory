import { Injectable } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import {
  CategoryResponseDto,
  CategoryWithChildrenResponseDto,
} from './dto/category-response.dto';

@Injectable()
export class CategoriesService {
  private categories: CategoryResponseDto[] = [];

  findAll(): CategoryWithChildrenResponseDto[] {
    const rootCategories = this.categories.filter((cat) => !cat.parent_id);
    return rootCategories.map((cat) => this.buildCategoryTree(cat));
  }

  private buildCategoryTree(
    category: CategoryResponseDto,
  ): CategoryWithChildrenResponseDto {
    const children = this.categories
      .filter((cat) => cat.parent_id === category.id)
      .map((cat) => this.buildCategoryTree(cat));

    return {
      ...category,
      children,
    };
  }

  create(createCategoryDto: CreateCategoryDto): CategoryResponseDto {
    const category: CategoryResponseDto = {
      id: uuidv4(),
      name: createCategoryDto.name,
      parent_id: createCategoryDto.parent_id || null,
      description: createCategoryDto.description || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    this.categories.push(category);
    return category;
  }

  update(
    id: string,
    updateCategoryDto: UpdateCategoryDto,
  ): CategoryResponseDto | undefined {
    const index = this.categories.findIndex((cat) => cat.id === id);
    if (index === -1) return undefined;

    this.categories[index] = {
      ...this.categories[index],
      ...updateCategoryDto,
      updated_at: new Date().toISOString(),
    };
    return this.categories[index];
  }

  remove(id: string): boolean {
    const index = this.categories.findIndex((cat) => cat.id === id);
    if (index === -1) return false;
    this.categories.splice(index, 1);
    return true;
  }
}
