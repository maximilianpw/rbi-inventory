import { ApiProperty } from '@nestjs/swagger';

export enum ErrorType {
  BAD_REQUEST = 'BadRequest',
  NOT_FOUND = 'NotFound',
}

export class ErrorResponseDto {
  @ApiProperty({ example: 'Resource not found' })
  error: string;
}
