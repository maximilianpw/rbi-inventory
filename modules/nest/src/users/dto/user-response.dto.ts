import { ApiProperty } from '@nestjs/swagger';

export enum UserRole {
  ADMIN = 'ADMIN',
  WAREHOUSE_MANAGER = 'WAREHOUSE_MANAGER',
  PICKER = 'PICKER',
  SALES = 'SALES',
}

export class UserResponseDto {
  @ApiProperty({
    format: 'uuid',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  id: string;

  @ApiProperty({ example: 'John Doe' })
  name: string;

  @ApiProperty({ format: 'email', example: 'john@example.com' })
  email: string;

  @ApiProperty({ enum: UserRole, example: 'ADMIN' })
  role: UserRole;

  @ApiProperty({ example: true })
  is_active: boolean;

  @ApiProperty({ format: 'date-time', nullable: true })
  last_login: string | null;

  @ApiProperty({ format: 'date-time' })
  created_at: string;

  @ApiProperty({ format: 'date-time' })
  updated_at: string;
}
