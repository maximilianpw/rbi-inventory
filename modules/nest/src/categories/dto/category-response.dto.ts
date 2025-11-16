import { ApiProperty } from '@nestjs/swagger';

export class CategoryResponseDto {
  @ApiProperty({
    format: 'uuid',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  id: string;

  @ApiProperty({ example: 'Electronics' })
  name: string;

  @ApiProperty({
    format: 'uuid',
    nullable: true,
  })
  parent_id: string | null;

  @ApiProperty({
    nullable: true,
    example: 'Electronic equipment and components',
  })
  description: string | null;

  @ApiProperty({ format: 'date-time' })
  created_at: string;

  @ApiProperty({ format: 'date-time' })
  updated_at: string;
}

export class CategoryWithChildrenResponseDto extends CategoryResponseDto {
  @ApiProperty({ type: [CategoryWithChildrenResponseDto] })
  children: CategoryWithChildrenResponseDto[];
}
