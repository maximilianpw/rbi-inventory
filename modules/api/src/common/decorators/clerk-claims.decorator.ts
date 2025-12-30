import { createParamDecorator, type ExecutionContext } from '@nestjs/common';
import { type ClerkRequest } from '../guards/clerk-auth.guard';

export const ClerkClaims = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<ClerkRequest>();
    return request.auth?.sessionClaims;
  },
);
