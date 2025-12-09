import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { ClerkRequest } from '../guards/clerk-auth.guard';

export const ClerkClaims = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<ClerkRequest>();
    return request.auth?.sessionClaims;
  },
);
