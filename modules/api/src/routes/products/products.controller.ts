import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Patch,
  Body,
  Param,
  Query,
  ParseUUIDPipe,
  UseGuards,
  UseInterceptors,
  Req,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { ProductsService } from './products.service';
import {
  CreateProductDto,
  UpdateProductDto,
  ProductResponseDto,
  ProductQueryDto,
  PaginatedProductsResponseDto,
  BulkCreateProductsDto,
  BulkUpdateStatusDto,
  BulkDeleteDto,
  BulkRestoreDto,
  BulkOperationResultDto,
} from './dto';
import { ErrorResponseDto } from '../../common/dto/error-response.dto';
import { MessageResponseDto } from '../../common/dto/message-response.dto';
import {
  ClerkAuthGuard,
  ClerkRequest,
} from '../../common/guards/clerk-auth.guard';
import { HateoasInterceptor } from '../../common/hateoas/hateoas.interceptor';
import {
  HateoasLinks,
  PRODUCT_HATEOAS_LINKS,
} from '../../common/hateoas/hateoas.decorator';

const ProductHateoas = () => HateoasLinks(...PRODUCT_HATEOAS_LINKS);

@ApiTags('Products')
@ApiBearerAuth()
@UseGuards(ClerkAuthGuard)
@Controller()
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  @UseInterceptors(HateoasInterceptor)
  @ProductHateoas()
  @ApiOperation({
    summary: 'List products with pagination and filtering',
    operationId: 'listProducts',
  })
  @ApiResponse({ status: 200, type: PaginatedProductsResponseDto })
  @ApiResponse({ status: 401, type: ErrorResponseDto })
  async listProducts(
    @Query() query: ProductQueryDto,
  ): Promise<PaginatedProductsResponseDto> {
    return this.productsService.findAllPaginated(query);
  }

  @Get('all')
  @UseInterceptors(HateoasInterceptor)
  @ProductHateoas()
  @ApiOperation({
    summary: 'List all products without pagination',
    operationId: 'listAllProducts',
  })
  @ApiResponse({ status: 200, type: [ProductResponseDto] })
  @ApiResponse({ status: 401, type: ErrorResponseDto })
  async listAllProducts(): Promise<ProductResponseDto[]> {
    return this.productsService.findAll();
  }

  @Get(':id')
  @UseInterceptors(HateoasInterceptor)
  @ProductHateoas()
  @ApiOperation({ summary: 'Get product by ID', operationId: 'getProduct' })
  @ApiParam({ name: 'id', description: 'Product UUID', type: String })
  @ApiQuery({
    name: 'include_deleted',
    description: 'Include soft-deleted products',
    required: false,
    type: Boolean,
  })
  @ApiResponse({ status: 200, type: ProductResponseDto })
  @ApiResponse({ status: 400, type: ErrorResponseDto })
  @ApiResponse({ status: 401, type: ErrorResponseDto })
  @ApiResponse({ status: 404, type: ErrorResponseDto })
  async getProduct(
    @Param('id', ParseUUIDPipe) id: string,
    @Query('include_deleted') includeDeleted?: string,
  ): Promise<ProductResponseDto> {
    return this.productsService.findOne(
      id,
      includeDeleted === 'true' || includeDeleted === '1',
    );
  }

  @Get('category/:categoryId')
  @UseInterceptors(HateoasInterceptor)
  @ProductHateoas()
  @ApiOperation({
    summary: 'Get products by category',
    operationId: 'getProductsByCategory',
  })
  @ApiParam({ name: 'categoryId', description: 'Category UUID', type: String })
  @ApiResponse({ status: 200, type: [ProductResponseDto] })
  @ApiResponse({ status: 400, type: ErrorResponseDto })
  @ApiResponse({ status: 401, type: ErrorResponseDto })
  async getProductsByCategory(
    @Param('categoryId', ParseUUIDPipe) categoryId: string,
  ): Promise<ProductResponseDto[]> {
    return this.productsService.findByCategory(categoryId);
  }

  @Get('category/:categoryId/tree')
  @UseInterceptors(HateoasInterceptor)
  @ProductHateoas()
  @ApiOperation({
    summary: 'Get products by category tree',
    operationId: 'getProductsByCategoryTree',
  })
  @ApiParam({ name: 'categoryId', description: 'Category UUID', type: String })
  @ApiResponse({ status: 200, type: [ProductResponseDto] })
  @ApiResponse({ status: 400, type: ErrorResponseDto })
  @ApiResponse({ status: 401, type: ErrorResponseDto })
  async getProductsByCategoryTree(
    @Param('categoryId', ParseUUIDPipe) categoryId: string,
  ): Promise<ProductResponseDto[]> {
    return this.productsService.findByCategoryTree(categoryId);
  }

  @Post()
  @UseInterceptors(HateoasInterceptor)
  @ProductHateoas()
  @ApiOperation({ summary: 'Create product', operationId: 'createProduct' })
  @ApiResponse({ status: 201, type: ProductResponseDto })
  @ApiResponse({ status: 400, type: ErrorResponseDto })
  @ApiResponse({ status: 401, type: ErrorResponseDto })
  async createProduct(
    @Body() createProductDto: CreateProductDto,
    @Req() req: ClerkRequest,
  ): Promise<ProductResponseDto> {
    return this.productsService.create(createProductDto, req.auth?.userId);
  }

  @Post('bulk')
  @ApiOperation({
    summary: 'Bulk create products',
    operationId: 'bulkCreateProducts',
  })
  @ApiResponse({ status: 201, type: BulkOperationResultDto })
  @ApiResponse({ status: 400, type: ErrorResponseDto })
  @ApiResponse({ status: 401, type: ErrorResponseDto })
  async bulkCreateProducts(
    @Body() bulkDto: BulkCreateProductsDto,
    @Req() req: ClerkRequest,
  ): Promise<BulkOperationResultDto> {
    return this.productsService.bulkCreate(bulkDto, req.auth?.userId);
  }

  @Put(':id')
  @UseInterceptors(HateoasInterceptor)
  @ProductHateoas()
  @ApiOperation({ summary: 'Update product', operationId: 'updateProduct' })
  @ApiParam({ name: 'id', description: 'Product UUID', type: String })
  @ApiResponse({ status: 200, type: ProductResponseDto })
  @ApiResponse({ status: 400, type: ErrorResponseDto })
  @ApiResponse({ status: 401, type: ErrorResponseDto })
  @ApiResponse({ status: 404, type: ErrorResponseDto })
  async updateProduct(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateProductDto: UpdateProductDto,
    @Req() req: ClerkRequest,
  ): Promise<ProductResponseDto> {
    return this.productsService.update(id, updateProductDto, req.auth?.userId);
  }

  @Patch('bulk/status')
  @ApiOperation({
    summary: 'Bulk update product status',
    operationId: 'bulkUpdateProductStatus',
  })
  @ApiResponse({ status: 200, type: BulkOperationResultDto })
  @ApiResponse({ status: 400, type: ErrorResponseDto })
  @ApiResponse({ status: 401, type: ErrorResponseDto })
  async bulkUpdateStatus(
    @Body() bulkDto: BulkUpdateStatusDto,
    @Req() req: ClerkRequest,
  ): Promise<BulkOperationResultDto> {
    return this.productsService.bulkUpdateStatus(bulkDto, req.auth?.userId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete product', operationId: 'deleteProduct' })
  @ApiParam({ name: 'id', description: 'Product UUID', type: String })
  @ApiQuery({
    name: 'permanent',
    description: 'Permanently delete instead of soft delete',
    required: false,
    type: Boolean,
  })
  @ApiResponse({ status: 200, type: MessageResponseDto })
  @ApiResponse({ status: 400, type: ErrorResponseDto })
  @ApiResponse({ status: 401, type: ErrorResponseDto })
  async deleteProduct(
    @Param('id', ParseUUIDPipe) id: string,
    @Query('permanent') permanent: string,
    @Req() req: ClerkRequest,
  ): Promise<MessageResponseDto> {
    const isPermanent = permanent === 'true' || permanent === '1';
    await this.productsService.delete(id, req.auth?.userId, isPermanent);
    return {
      message: isPermanent
        ? 'Product permanently deleted'
        : 'Product deleted successfully',
    };
  }

  @Delete('bulk')
  @ApiOperation({
    summary: 'Bulk delete products',
    operationId: 'bulkDeleteProducts',
  })
  @ApiResponse({ status: 200, type: BulkOperationResultDto })
  @ApiResponse({ status: 400, type: ErrorResponseDto })
  @ApiResponse({ status: 401, type: ErrorResponseDto })
  async bulkDeleteProducts(
    @Body() bulkDto: BulkDeleteDto,
    @Req() req: ClerkRequest,
  ): Promise<BulkOperationResultDto> {
    return this.productsService.bulkDelete(bulkDto, req.auth?.userId);
  }

  @Patch(':id/restore')
  @UseInterceptors(HateoasInterceptor)
  @ProductHateoas()
  @ApiOperation({
    summary: 'Restore deleted product',
    operationId: 'restoreProduct',
  })
  @ApiParam({ name: 'id', description: 'Product UUID', type: String })
  @ApiResponse({ status: 200, type: ProductResponseDto })
  @ApiResponse({ status: 400, type: ErrorResponseDto })
  @ApiResponse({ status: 401, type: ErrorResponseDto })
  @ApiResponse({ status: 404, type: ErrorResponseDto })
  async restoreProduct(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() req: ClerkRequest,
  ): Promise<ProductResponseDto> {
    return this.productsService.restore(id, req.auth?.userId);
  }

  @Patch('bulk/restore')
  @ApiOperation({
    summary: 'Bulk restore products',
    operationId: 'bulkRestoreProducts',
  })
  @ApiResponse({ status: 200, type: BulkOperationResultDto })
  @ApiResponse({ status: 400, type: ErrorResponseDto })
  @ApiResponse({ status: 401, type: ErrorResponseDto })
  async bulkRestoreProducts(
    @Body() bulkDto: BulkRestoreDto,
    @Req() req: ClerkRequest,
  ): Promise<BulkOperationResultDto> {
    return this.productsService.bulkRestore(bulkDto, req.auth?.userId);
  }
}