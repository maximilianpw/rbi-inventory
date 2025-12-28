import { ApiProperty } from '@nestjs/swagger';

export class HateoasLink {
  @ApiProperty({ description: 'The URL of the linked resource' })
  href: string;

  @ApiProperty({
    description: 'HTTP method for this link',
    enum: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    required: false,
  })
  method?: string;

  constructor(href: string, method?: string) {
    this.href = href;
    this.method = method;
  }
}

export interface LinkDefinition {
  rel: string;
  href: string | ((data: any) => string);
  method?: string;
}
