import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  UseInterceptors,
  ParseUUIDPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { ClerkAuthGuard } from '../../common/guards/clerk-auth.guard';
import { HateoasInterceptor } from '../../common/hateoas/hateoas.interceptor';
import { StandardThrottle } from '../../common/decorators/throttle.decorator';
import { ErrorResponseDto } from '../../common/dto/error-response.dto';
import { AreasService } from './areas.service';
import { CreateAreaDto } from './dto/create-area.dto';
import { UpdateAreaDto } from './dto/update-area.dto';
import { AreaQueryDto } from './dto/area-query.dto';
import { AreaResponseDto } from './dto/area-response.dto';
import { AreaHateoas, AreaListHateoas } from './areas.hateoas';

@ApiTags('Areas')
@ApiBearerAuth('BearerAuth')
@UseGuards(ClerkAuthGuard)
@StandardThrottle()
@Controller()
export class AreasController {
  constructor(private readonly areasService: AreasService) {}

  @Post()
  @UseInterceptors(HateoasInterceptor)
  @AreaHateoas()
  @ApiOperation({ summary: 'Create a new area' })
  @ApiResponse({
    status: 201,
    description: 'Area created successfully',
    type: AreaResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid input',
    type: ErrorResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async create(@Body() dto: CreateAreaDto): Promise<AreaResponseDto> {
    const area = await this.areasService.create(dto);
    return area as unknown as AreaResponseDto;
  }

  @Get()
  @UseInterceptors(HateoasInterceptor)
  @AreaListHateoas()
  @ApiOperation({ summary: 'List areas with optional filtering' })
  @ApiResponse({
    status: 200,
    description: 'List of areas',
    type: [AreaResponseDto],
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async findAll(@Query() query: AreaQueryDto): Promise<AreaResponseDto[]> {
    const areas = await this.areasService.findAll(query);
    return areas as unknown as AreaResponseDto[];
  }

  @Get(':id')
  @UseInterceptors(HateoasInterceptor)
  @AreaHateoas()
  @ApiOperation({ summary: 'Get area by ID' })
  @ApiParam({ name: 'id', description: 'Area ID', format: 'uuid' })
  @ApiResponse({
    status: 200,
    description: 'Area found',
    type: AreaResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Area not found',
    type: ErrorResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async findById(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<AreaResponseDto> {
    const area = await this.areasService.findById(id);
    return area as unknown as AreaResponseDto;
  }

  @Get(':id/children')
  @UseInterceptors(HateoasInterceptor)
  @AreaHateoas()
  @ApiOperation({ summary: 'Get area with children' })
  @ApiParam({ name: 'id', description: 'Area ID', format: 'uuid' })
  @ApiResponse({
    status: 200,
    description: 'Area with children',
    type: AreaResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Area not found',
    type: ErrorResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async findByIdWithChildren(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<AreaResponseDto> {
    const area = await this.areasService.findByIdWithChildren(id);
    return area as unknown as AreaResponseDto;
  }

  @Put(':id')
  @UseInterceptors(HateoasInterceptor)
  @AreaHateoas()
  @ApiOperation({ summary: 'Update an area' })
  @ApiParam({ name: 'id', description: 'Area ID', format: 'uuid' })
  @ApiResponse({
    status: 200,
    description: 'Area updated successfully',
    type: AreaResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid input',
    type: ErrorResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Area not found',
    type: ErrorResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateAreaDto,
  ): Promise<AreaResponseDto> {
    const area = await this.areasService.update(id, dto);
    return area as unknown as AreaResponseDto;
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete an area' })
  @ApiParam({ name: 'id', description: 'Area ID', format: 'uuid' })
  @ApiResponse({ status: 204, description: 'Area deleted successfully' })
  @ApiResponse({
    status: 404,
    description: 'Area not found',
    type: ErrorResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async delete(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    await this.areasService.delete(id);
  }
}
