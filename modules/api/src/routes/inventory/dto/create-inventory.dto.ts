import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsUUID,
  IsInt,
  IsNumber,
  IsDateString,
  Min,
  MaxLength,
} from 'class-validator';

export class CreateInventoryDto {
  @ApiProperty({
    description: 'Product ID',
    format: 'uuid',
  })
  @IsUUID()
  product_id: string;

  @ApiProperty({
    description: 'Location ID',
    format: 'uuid',
  })
  @IsUUID()
  location_id: string;

  @ApiProperty({
    description: 'Quantity in stock',
    minimum: 0,
    default: 0,
  })
  @IsInt()
  @Min(0)
  quantity: number;

  @ApiProperty({
    description: 'Batch number',
    type: String,
    maxLength: 100,
    nullable: true,
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  batch_number?: string | null;

  @ApiProperty({
    description: 'Expiry date',
    type: String,
    format: 'date-time',
    nullable: true,
    required: false,
  })
  @IsOptional()
  @IsDateString()
  expiry_date?: string | null;

  @ApiProperty({
    description: 'Cost per unit',
    type: Number,
    nullable: true,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  cost_per_unit?: number | null;

  @ApiProperty({
    description: 'Date when received',
    type: String,
    format: 'date-time',
    nullable: true,
    required: false,
  })
  @IsOptional()
  @IsDateString()
  received_date?: string | null;
}
