import { ApiProperty } from '@nestjs/swagger';

class PoweredByDto {
  @ApiProperty({ description: 'Product name', example: 'LibreStock' })
  name: string;

  @ApiProperty({ description: 'Product URL', example: 'https://github.com/maximilianpw/librestock' })
  url: string;
}

export class BrandingResponseDto {
  @ApiProperty({ description: 'Application name' })
  app_name: string;

  @ApiProperty({ description: 'Application tagline' })
  tagline: string;

  @ApiProperty({ description: 'Logo URL', nullable: true })
  logo_url: string | null;

  @ApiProperty({ description: 'Favicon URL', nullable: true })
  favicon_url: string | null;

  @ApiProperty({ description: 'Primary brand color (hex)' })
  primary_color: string;

  @ApiProperty({ description: 'Powered by attribution (always present)' })
  powered_by: PoweredByDto;

  @ApiProperty({ description: 'Last update timestamp' })
  updated_at: Date;
}
