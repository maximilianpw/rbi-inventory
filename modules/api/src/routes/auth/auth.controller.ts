import { Controller, Get, UseGuards } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { createClerkClient } from '@clerk/backend';
import { ClerkClaims } from 'src/common/decorators/clerk-claims.decorator';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { ErrorResponseDto } from 'src/common/dto/error-response.dto';
import { ClerkAuthGuard } from 'src/common/guards/clerk-auth.guard';
import { SessionClaimsResponseDto } from './dto/session-claims-response.dto';
import { ProfileResponseDto } from './dto/profile-response.dto';

@ApiTags('Auth')
@ApiBearerAuth()
@UseGuards(ClerkAuthGuard)
@Controller('auth')
export class AuthController {
  constructor(private configService: ConfigService) {}

  @Get('profile')
  @ApiOperation({
    summary: 'Get user profile',
    description: 'Retrieves the current user profile from Clerk',
    operationId: 'getProfile',
  })
  @ApiResponse({
    status: 200,
    description: 'Profile retrieved successfully',
    type: ProfileResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
    type: ErrorResponseDto,
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error',
    type: ErrorResponseDto,
  })
  async getProfile(
    @CurrentUser('userId') userId: string,
  ): Promise<ProfileResponseDto> {
    const secretKey = this.configService.get<string>('CLERK_SECRET_KEY');
    const client = createClerkClient({ secretKey });
    const user = await client.users.getUser(userId);
    return user;
  }

  @Get('session-claims')
  @ApiOperation({
    summary: 'Get session claims',
    description: 'Retrieves the current session JWT claims',
    operationId: 'getSessionClaims',
  })
  @ApiResponse({
    status: 200,
    description: 'Session claims retrieved successfully',
    type: SessionClaimsResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
    type: ErrorResponseDto,
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error',
    type: ErrorResponseDto,
  })
  getSessionClaims(
    @ClerkClaims() claims: any,
    @CurrentUser() user: any,
  ): SessionClaimsResponseDto {
    return {
      user_id: user.userId,
      session_id: user.sessionId,
      expires_at: claims.exp,
      issued_at: claims.iat,
    };
  }
}
