import { ApiProperty } from '@nestjs/swagger';

export class SessionClaimsResponseDto {
  @ApiProperty()
  user_id: string;

  @ApiProperty()
  session_id: string;

  @ApiProperty({ format: 'int64' })
  expires_at: number;

  @ApiProperty({ format: 'int64' })
  issued_at: number;
}
