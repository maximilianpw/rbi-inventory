import { Controller, Get, Put, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { ClerkAuthGuard } from 'src/common/guards/clerk-auth.guard';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { StandardThrottle } from 'src/common/decorators/throttle.decorator';
import { BrandingService } from './branding.service';
import { BrandingResponseDto } from './dto/branding-response.dto';
import { UpdateBrandingDto } from './dto/update-branding.dto';

@ApiTags('Branding')
@Controller()
@StandardThrottle()
export class BrandingController {
  constructor(private readonly service: BrandingService) {}

  @Get()
  @ApiOperation({ summary: 'Get branding settings (public)' })
  @ApiResponse({ status: 200, description: 'Branding settings', type: BrandingResponseDto })
  async get(): Promise<BrandingResponseDto> {
    return this.service.get();
  }

  @Put()
  @UseGuards(ClerkAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update branding settings' })
  @ApiResponse({ status: 200, description: 'Updated branding settings', type: BrandingResponseDto })
  async update(
    @Body() dto: UpdateBrandingDto,
    @CurrentUser('userId') userId: string,
  ): Promise<BrandingResponseDto> {
    return this.service.update(dto, userId);
  }
}
