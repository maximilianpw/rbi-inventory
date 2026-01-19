import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { UserRole } from '../enums';
import type { UserSession } from '@thallesp/nestjs-better-auth';
import { getUserSession } from '../auth/session';

type RoleClaim = string | string[] | undefined;

const normalizeRoles = (claim: RoleClaim): string[] => {
  if (Array.isArray(claim)) {
    return claim;
  }
  return claim ? [claim] : [];
};

const extractRoles = (session: UserSession | undefined) => {
  if (!session) {
    return [];
  }

  const claims = session as Record<string, any>;
  const candidateRoles = [
    claims.user?.roles,
    claims.user?.role,
    claims.roles,
    claims.role,
    claims.user?.metadata?.roles,
    claims.user?.metadata?.role,
    claims.user?.publicMetadata?.roles,
    claims.user?.publicMetadata?.role,
    claims.user?.public_metadata?.roles,
    claims.user?.public_metadata?.role,
  ];

  return candidateRoles.flatMap((roleClaim) => normalizeRoles(roleClaim));
};

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles =
      this.reflector.getAllAndOverride<UserRole[]>(ROLES_KEY, [
        context.getHandler(),
        context.getClass(),
      ]) ?? [];

    if (requiredRoles.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const session = getUserSession(request);
    const roles = extractRoles(session);
    const hasRole = requiredRoles.some((role) => roles.includes(role));

    if (!hasRole) {
      throw new ForbiddenException('Insufficient role permissions');
    }

    return true;
  }
}
