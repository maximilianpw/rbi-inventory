import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
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

export class CreateProductDto {
  @ApiProperty({ minLength: 1, maxLength: 50, example: 'PROD-001' })
  @IsString()
  @MinLength(1)
  @MaxLength(50)
  sku: string;

  @ApiProperty({ minLength: 1, maxLength: 200, example: 'Marine Pump' })
  @IsString()
  @MinLength(1)
  @MaxLength(200)
  name: string;

  @ApiPropertyOptional({ maxLength: 1000, nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string | null;

  @ApiProperty({ format: 'uuid' })
  @IsUUID()
  category_id: string;

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

  @ApiProperty({ minimum: 0, example: 10 })
  @IsInt()
  @Min(0)
  reorder_point: number;

  @ApiPropertyOptional({ format: 'uuid', nullable: true })
  @IsOptional()
  @IsUUID()
  primary_supplier_id?: string | null;

  @ApiPropertyOptional({ maxLength: 50, nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  supplier_sku?: string | null;

  @ApiProperty()
  @IsBoolean()
  is_active: boolean;

  @ApiProperty()
  @IsBoolean()
  is_perishable: boolean;

  @ApiPropertyOptional({ maxLength: 500, nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  notes?: string | null;
}
