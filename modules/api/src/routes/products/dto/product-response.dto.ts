import { ApiProperty } from '@nestjs/swagger';

export class ProductResponseDto {
  @ApiProperty({
    description: 'Unique identifier',
    format: 'uuid',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  id: string;

  @ApiProperty({
    description: 'Product SKU',
    example: 'PROD-001',
  })
  sku: string;

  @ApiProperty({
    description: 'Product name',
    example: 'Marine Pump',
  })
  name: string;

  @ApiProperty({
    description: 'Product description',
    nullable: true,
  })
  description: string | null;

  @ApiProperty({
    description: 'Category ID',
    format: 'uuid',
  })
  category_id: string;

  @ApiProperty({
    description: 'Brand ID',
    format: 'uuid',
    nullable: true,
  })
  brand_id: string | null;

  @ApiProperty({
    description: 'Volume in milliliters',
    nullable: true,
  })
  volume_ml: number | null;

  @ApiProperty({
    description: 'Weight in kilograms',
    nullable: true,
  })
  weight_kg: number | null;

  @ApiProperty({
    description: 'Dimensions in cm',
    nullable: true,
    example: '10x10x5',
  })
  dimensions_cm: string | null;

  @ApiProperty({
    description: 'Standard cost',
    nullable: true,
  })
  standard_cost: number | null;

  @ApiProperty({
    description: 'Standard price',
    nullable: true,
  })
  standard_price: number | null;

  @ApiProperty({
    description: 'Markup percentage',
    nullable: true,
  })
  markup_percentage: number | null;

  @ApiProperty({
    description: 'Reorder point threshold',
    example: 10,
  })
  reorder_point: number;

  @ApiProperty({
    description: 'Primary supplier ID',
    format: 'uuid',
    nullable: true,
  })
  primary_supplier_id: string | null;

  @ApiProperty({
    description: 'Supplier SKU',
    nullable: true,
  })
  supplier_sku: string | null;

  @ApiProperty({
    description: 'Whether the product is active',
  })
  is_active: boolean;

  @ApiProperty({
    description: 'Whether the product is perishable',
  })
  is_perishable: boolean;

  @ApiProperty({
    description: 'Additional notes',
    nullable: true,
  })
  notes: string | null;

  @ApiProperty({
    description: 'Creation timestamp',
    format: 'date-time',
  })
  created_at: Date;

  @ApiProperty({
    description: 'Last update timestamp',
    format: 'date-time',
  })
  updated_at: Date;
}
