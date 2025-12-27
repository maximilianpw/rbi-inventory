import { ApiProperty } from '@nestjs/swagger';
import { BaseResponseDto } from '../../../common/dto/base-response.dto';

export class AreaResponseDto extends BaseResponseDto {
  @ApiProperty({ description: 'Location ID', format: 'uuid' })
  location_id: string;

  @ApiProperty({
    description: 'Parent area ID',
    format: 'uuid',
    nullable: true,
  })
  parent_id: string | null;

  @ApiProperty({ description: 'Area name' })
  name: string;

  @ApiProperty({ description: 'Area code', nullable: true })
  code: string | null;

  @ApiProperty({ description: 'Area description', nullable: true })
  description: string | null;

  @ApiProperty({ description: 'Whether the area is active' })
  is_active: boolean;

  @ApiProperty({
    description: 'Child areas',
    type: () => [AreaResponseDto],
    required: false,
  })
  children?: AreaResponseDto[];
}
