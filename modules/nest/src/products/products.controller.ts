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
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductResponseDto } from './dto/product-response.dto';
import { ErrorResponseDto } from '../common/dto/error-response.dto';
import { MessageResponseDto } from '../common/dto/message-response.dto';
import { ClerkAuthGuard } from '../common/guards/clerk-auth.guard';

@ApiTags('Products')
@ApiBearerAuth()
@UseGuards(ClerkAuthGuard)
@Controller('api/v1/products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  @ApiOperation({
    summary: 'List all products',
    description: 'Retrieves all products in the catalog',
    operationId: 'listProducts',
  })
  @ApiResponse({
    status: 200,
    description: 'Products retrieved successfully',
    type: [ProductResponseDto],
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
  findAll(): ProductResponseDto[] {
    return this.productsService.findAll();
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create product',
    description: 'Creates a new product in the catalog',
    operationId: 'createProduct',
  })
  @ApiResponse({
    status: 201,
    description: 'Product created successfully',
    type: ProductResponseDto,
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
  create(@Body() createProductDto: CreateProductDto): ProductResponseDto {
    return this.productsService.create(createProductDto);
  }

  @Get('category/:categoryId')
  @ApiOperation({
    summary: 'Get products by category',
    description: 'Retrieves all products in a specific category',
    operationId: 'getProductsByCategory',
  })
  @ApiParam({
    name: 'categoryId',
    type: String,
    description: 'Category UUID',
  })
  @ApiResponse({
    status: 200,
    description: 'Products retrieved successfully',
    type: [ProductResponseDto],
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
  findByCategory(
    @Param('categoryId') categoryId: string,
  ): ProductResponseDto[] {
    return this.productsService.findByCategory(categoryId);
  }

  @Get('category/:categoryId/tree')
  @ApiOperation({
    summary: 'Get products by category tree',
    description:
      'Retrieves all products in a category and its child categories',
    operationId: 'getProductsByCategoryTree',
  })
  @ApiParam({
    name: 'categoryId',
    type: String,
    description: 'Category UUID',
  })
  @ApiResponse({
    status: 200,
    description: 'Products retrieved successfully',
    type: [ProductResponseDto],
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
  findByCategoryTree(
    @Param('categoryId') categoryId: string,
  ): ProductResponseDto[] {
    return this.productsService.findByCategoryTree(categoryId);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get product by ID',
    description: 'Retrieves a specific product by UUID',
    operationId: 'getProduct',
  })
  @ApiParam({
    name: 'id',
    type: String,
    description: 'Product UUID',
  })
  @ApiResponse({
    status: 200,
    description: 'Product retrieved successfully',
    type: ProductResponseDto,
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
    status: 404,
    description: 'Product not found',
    type: ErrorResponseDto,
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error',
    type: ErrorResponseDto,
  })
  findOne(@Param('id') id: string): ProductResponseDto {
    const product = this.productsService.findOne(id);
    if (!product) {
      throw new NotFoundException('Product not found');
    }
    return product;
  }

  @Put(':id')
  @ApiOperation({
    summary: 'Update product',
    description: 'Updates an existing product',
    operationId: 'updateProduct',
  })
  @ApiParam({
    name: 'id',
    type: String,
    description: 'Product UUID',
  })
  @ApiResponse({
    status: 200,
    description: 'Product updated successfully',
    type: ProductResponseDto,
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
    description: 'Product not found',
    type: ErrorResponseDto,
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error',
    type: ErrorResponseDto,
  })
  update(
    @Param('id') id: string,
    @Body() updateProductDto: UpdateProductDto,
  ): ProductResponseDto {
    const product = this.productsService.update(id, updateProductDto);
    if (!product) {
      throw new NotFoundException('Product not found');
    }
    return product;
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Delete product',
    description: 'Deletes a product from the catalog',
    operationId: 'deleteProduct',
  })
  @ApiParam({
    name: 'id',
    type: String,
    description: 'Product UUID',
  })
  @ApiResponse({
    status: 200,
    description: 'Product deleted successfully',
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
    const success = this.productsService.remove(id);
    if (!success) {
      throw new NotFoundException('Product not found');
    }
    return { message: 'Product deleted successfully' };
  }
}
