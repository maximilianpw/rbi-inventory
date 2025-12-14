import { SetMetadata } from '@nestjs/common';
import { LinkDefinition } from './hateoas-link.dto';

export const HATEOAS_LINKS_KEY = 'hateoas:links';

export const HateoasLinks = (...links: LinkDefinition[]) =>
  SetMetadata(HATEOAS_LINKS_KEY, links);

export const SelfLink = (href: string | ((data: any) => string)) =>
  HateoasLinks({ rel: 'self', href, method: 'GET' });

export const PRODUCT_HATEOAS_LINKS: LinkDefinition[] = [
  { rel: 'self', href: (data: any) => `/products/${data.id}`, method: 'GET' },
  { rel: 'update', href: (data: any) => `/products/${data.id}`, method: 'PUT' },
  {
    rel: 'delete',
    href: (data: any) => `/products/${data.id}`,
    method: 'DELETE',
  },
  {
    rel: 'category',
    href: (data: any) => `/categories/${data.category_id}`,
    method: 'GET',
  },
];
