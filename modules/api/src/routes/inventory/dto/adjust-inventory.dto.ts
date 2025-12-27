import { ApiProperty } from '@nestjs/swagger';
import { IsInt } from 'class-validator';

export class AdjustInventoryDto {
  @ApiProperty({
    description: 'Quantity adjustment (positive to add, negative to subtract)',
    example: 5,
  })
  @IsInt()
  adjustment: number;
}
