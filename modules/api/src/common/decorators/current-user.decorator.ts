import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { ClerkRequest } from '../guards/clerk-auth.guard';

export const CurrentUser = createParamDecorator(
  (data: string | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<ClerkRequest>();
    const user = request.auth;

    if (!user) {
      return null;
    }

    return data ? user[data as keyof typeof user] : user;
  },
);
