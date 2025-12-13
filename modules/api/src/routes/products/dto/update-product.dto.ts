import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsUUID,
  IsBoolean,
  IsNumber,
  MaxLength,
  MinLength,
  Min,
  Max,
} from 'class-validator';

export class UpdateProductDto {
  @ApiProperty({
    description: 'Product SKU',
    minLength: 1,
    maxLength: 50,
    required: false,
  })
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(50)
  sku?: string;

  @ApiProperty({
    description: 'Product name',
    minLength: 1,
    maxLength: 200,
    required: false,
  })
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(200)
  name?: string;

  @ApiProperty({
    description: 'Product description',
    maxLength: 1000,
    nullable: true,
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string | null;

  @ApiProperty({
    description: 'Category ID',
    format: 'uuid',
    nullable: true,
    required: false,
  })
  @IsOptional()
  @IsUUID()
  category_id?: string | null;

  @ApiProperty({
    description: 'Brand ID',
    format: 'uuid',
    nullable: true,
    required: false,
  })
  @IsOptional()
  @IsUUID()
  brand_id?: string | null;

  @ApiProperty({
    description: 'Volume in milliliters',
    nullable: true,
    required: false,
    minimum: 1,
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  volume_ml?: number | null;

  @ApiProperty({
    description: 'Weight in kilograms',
    nullable: true,
    required: false,
    minimum: 0,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  weight_kg?: number | null;

  @ApiProperty({
    description: 'Dimensions in cm',
    maxLength: 50,
    nullable: true,
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  dimensions_cm?: string | null;

  @ApiProperty({
    description: 'Standard cost',
    nullable: true,
    required: false,
    minimum: 0,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  standard_cost?: number | null;

  @ApiProperty({
    description: 'Standard price',
    nullable: true,
    required: false,
    minimum: 0,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  standard_price?: number | null;

  @ApiProperty({
    description: 'Markup percentage',
    nullable: true,
    required: false,
    minimum: 0,
    maximum: 1000,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(1000)
  markup_percentage?: number | null;

  @ApiProperty({
    description: 'Reorder point threshold',
    nullable: true,
    required: false,
    minimum: 0,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  reorder_point?: number;

  @ApiProperty({
    description: 'Primary supplier ID',
    format: 'uuid',
    nullable: true,
    required: false,
  })
  @IsOptional()
  @IsUUID()
  primary_supplier_id?: string | null;

  @ApiProperty({
    description: 'Supplier SKU',
    maxLength: 50,
    nullable: true,
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  supplier_sku?: string | null;

  @ApiProperty({
    description: 'Whether the product is active',
    nullable: true,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  is_active?: boolean;

  @ApiProperty({
    description: 'Whether the product is perishable',
    nullable: true,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  is_perishable?: boolean;

  @ApiProperty({
    description: 'Additional notes',
    maxLength: 500,
    nullable: true,
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  notes?: string | null;
}
