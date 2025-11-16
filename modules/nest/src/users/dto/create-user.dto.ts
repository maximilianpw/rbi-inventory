import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsEnum,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
import { UserRole } from './user-response.dto';

export class CreateUserDto {
  @ApiProperty({
    minLength: 2,
    maxLength: 100,
    example: 'John Doe',
  })
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  name: string;

  @ApiProperty({ format: 'email', example: 'john@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ enum: UserRole, example: 'ADMIN' })
  @IsEnum(UserRole)
  role: UserRole;
}
