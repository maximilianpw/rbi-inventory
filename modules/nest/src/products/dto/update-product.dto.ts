import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';

export class UpdateProductDto {
  @ApiPropertyOptional({ minLength: 1, maxLength: 50 })
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(50)
  sku?: string;

  @ApiPropertyOptional({ minLength: 1, maxLength: 200 })
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(200)
  name?: string;

  @ApiPropertyOptional({ maxLength: 1000, nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string | null;

  @ApiPropertyOptional({ format: 'uuid', nullable: true })
  @IsOptional()
  @IsUUID()
  category_id?: string | null;

  @ApiPropertyOptional({ format: 'uuid', nullable: true })
  @IsOptional()
  @IsUUID()
  brand_id?: string | null;

  @ApiPropertyOptional({ minimum: 1, nullable: true })
  @IsOptional()
  @IsInt()
  @Min(1)
  volume_ml?: number | null;

  @ApiPropertyOptional({ format: 'float', minimum: 0, nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(0)
  weight_kg?: number | null;

  @ApiPropertyOptional({ maxLength: 50, nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  dimensions_cm?: string | null;

  @ApiPropertyOptional({ format: 'float', minimum: 0, nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(0)
  standard_cost?: number | null;

  @ApiPropertyOptional({ format: 'float', minimum: 0, nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(0)
  standard_price?: number | null;

  @ApiPropertyOptional({
    format: 'float',
    minimum: 0,
    maximum: 1000,
    nullable: true,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(1000)
  markup_percentage?: number | null;

  @ApiPropertyOptional({ minimum: 0, nullable: true })
  @IsOptional()
  @IsInt()
  @Min(0)
  reorder_point?: number | null;

  @ApiPropertyOptional({ format: 'uuid', nullable: true })
  @IsOptional()
  @IsUUID()
  primary_supplier_id?: string | null;

  @ApiPropertyOptional({ maxLength: 50, nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  supplier_sku?: string | null;

  @ApiPropertyOptional({ nullable: true })
  @IsOptional()
  @IsBoolean()
  is_active?: boolean | null;

  @ApiPropertyOptional({ nullable: true })
  @IsOptional()
  @IsBoolean()
  is_perishable?: boolean | null;

  @ApiPropertyOptional({ maxLength: 500, nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  notes?: string | null;
}
