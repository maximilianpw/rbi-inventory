import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import {
  CategoryResponseDto,
  CategoryWithChildrenResponseDto,
} from './dto/category-response.dto';
import { ErrorResponseDto } from '../common/dto/error-response.dto';
import { MessageResponseDto } from '../common/dto/message-response.dto';
import { ClerkAuthGuard } from '../common/guards/clerk-auth.guard';

@ApiTags('Categories')
@ApiBearerAuth()
@UseGuards(ClerkAuthGuard)
@Controller('api/v1/categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Get()
  @ApiOperation({
    summary: 'List all categories',
    description: 'Retrieves all product categories with their child categories',
    operationId: 'listCategories',
  })
  @ApiResponse({
    status: 200,
    description: 'Categories retrieved successfully',
    type: [CategoryWithChildrenResponseDto],
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
    type: ErrorResponseDto,
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error',
    type: ErrorResponseDto,
  })
  findAll(): CategoryWithChildrenResponseDto[] {
    return this.categoriesService.findAll();
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create category',
    description: 'Creates a new product category',
    operationId: 'createCategory',
  })
  @ApiResponse({
    status: 201,
    description: 'Category created successfully',
    type: CategoryResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid request body',
    type: ErrorResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
    type: ErrorResponseDto,
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error',
    type: ErrorResponseDto,
  })
  create(@Body() createCategoryDto: CreateCategoryDto): CategoryResponseDto {
    return this.categoriesService.create(createCategoryDto);
  }

  @Put(':id')
  @ApiOperation({
    summary: 'Update category',
    description: 'Updates an existing product category',
    operationId: 'updateCategory',
  })
  @ApiParam({
    name: 'id',
    type: String,
    description: 'Category UUID',
  })
  @ApiResponse({
    status: 200,
    description: 'Category updated successfully',
    type: CategoryResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid request',
    type: ErrorResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
    type: ErrorResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Category not found',
    type: ErrorResponseDto,
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error',
    type: ErrorResponseDto,
  })
  update(
    @Param('id') id: string,
    @Body() updateCategoryDto: UpdateCategoryDto,
  ): CategoryResponseDto {
    const category = this.categoriesService.update(id, updateCategoryDto);
    if (!category) {
      throw new NotFoundException('Category not found');
    }
    return category;
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Delete category',
    description: 'Deletes a product category',
    operationId: 'deleteCategory',
  })
  @ApiParam({
    name: 'id',
    type: String,
    description: 'Category UUID',
  })
  @ApiResponse({
    status: 200,
    description: 'Category deleted successfully',
    type: MessageResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid UUID format',
    type: ErrorResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
    type: ErrorResponseDto,
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error',
    type: ErrorResponseDto,
  })
  remove(@Param('id') id: string): MessageResponseDto {
    const success = this.categoriesService.remove(id);
    if (!success) {
      throw new NotFoundException('Category not found');
    }
    return { message: 'Category deleted successfully' };
  }
}
