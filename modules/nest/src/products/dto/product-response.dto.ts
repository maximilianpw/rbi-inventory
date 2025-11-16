import { ApiProperty } from '@nestjs/swagger';

export class ProductResponseDto {
  @ApiProperty({
    format: 'uuid',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  id: string;

  @ApiProperty({ example: 'PROD-001' })
  sku: string;

  @ApiProperty({ example: 'Marine Pump' })
  name: string;

  @ApiProperty({ nullable: true })
  description: string | null;

  @ApiProperty({ format: 'uuid' })
  category_id: string;

  @ApiProperty({ format: 'uuid', nullable: true })
  brand_id: string | null;

  @ApiProperty({ nullable: true })
  volume_ml: number | null;

  @ApiProperty({ format: 'float', nullable: true })
  weight_kg: number | null;

  @ApiProperty({ nullable: true, example: '10x10x5' })
  dimensions_cm: string | null;

  @ApiProperty({ format: 'float', nullable: true })
  standard_cost: number | null;

  @ApiProperty({ format: 'float', nullable: true })
  standard_price: number | null;

  @ApiProperty({ format: 'float', nullable: true })
  markup_percentage: number | null;

  @ApiProperty({ example: 10 })
  reorder_point: number;

  @ApiProperty({ format: 'uuid', nullable: true })
  primary_supplier_id: string | null;

  @ApiProperty({ nullable: true })
  supplier_sku: string | null;

  @ApiProperty()
  is_active: boolean;

  @ApiProperty()
  is_perishable: boolean;

  @ApiProperty({ nullable: true })
  notes: string | null;

  @ApiProperty({ format: 'date-time' })
  created_at: string;

  @ApiProperty({ format: 'date-time' })
  updated_at: string;
}
