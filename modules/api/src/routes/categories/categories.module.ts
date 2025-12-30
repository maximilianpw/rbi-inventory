import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClerkAuthGuard } from '../../common/guards/clerk-auth.guard';
import { CategoriesController } from './categories.controller';
import { CategoriesService } from './categories.service';
import { CategoryRepository } from './category.repository';
import { Category } from './entities/category.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Category])],
  controllers: [CategoriesController],
  providers: [CategoriesService, CategoryRepository, ClerkAuthGuard],
  exports: [CategoriesService, CategoryRepository],
})
export class CategoriesModule {}
