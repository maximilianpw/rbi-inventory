import type { Request } from 'express';
import type { UserSession } from '@thallesp/nestjs-better-auth';

export type AuthRequest = Request & {
  session?: UserSession;
  user?: UserSession;
  auth?: UserSession;
};

export const getUserSession = (request: Request): UserSession | undefined => {
  const req = request as AuthRequest;
  return req.session ?? req.user ?? req.auth;
};

export const getUserIdFromSession = (
  session: UserSession | undefined,
): string | null => {
  if (!session) {
    return null;
  }
  const value = session as any;
  return (
    value.user?.id ??
    value.user?.userId ??
    value.user?.user_id ??
    value.session?.userId ??
    value.session?.user_id ??
    value.userId ??
    value.user_id ??
    null
  );
};

export const getSessionIdFromSession = (
  session: UserSession | undefined,
): string | null => {
  if (!session) {
    return null;
  }
  const value = session as any;
  return (
    value.session?.id ??
    value.sessionId ??
    value.session_id ??
    value.id ??
    null
  );
};

const normalizeEpochSeconds = (value: unknown): number | null => {
  if (value === null || value === undefined) {
    return null;
  }
  if (typeof value === 'number') {
    return value;
  }
  if (value instanceof Date) {
    return Math.floor(value.getTime() / 1000);
  }
  if (typeof value === 'string') {
    const parsedDate = Date.parse(value);
    if (!Number.isNaN(parsedDate)) {
      return Math.floor(parsedDate / 1000);
    }
    const parsedNumber = Number(value);
    if (!Number.isNaN(parsedNumber)) {
      return parsedNumber;
    }
  }
  return null;
};

export const getSessionTimingFromSession = (
  session: UserSession | undefined,
): { issuedAt: number | null; expiresAt: number | null } => {
  if (!session) {
    return { issuedAt: null, expiresAt: null };
  }
  const value = session as any;
  const issuedAt =
    normalizeEpochSeconds(value.session?.createdAt) ??
    normalizeEpochSeconds(value.session?.created_at) ??
    normalizeEpochSeconds(value.issuedAt) ??
    normalizeEpochSeconds(value.iat);
  const expiresAt =
    normalizeEpochSeconds(value.session?.expiresAt) ??
    normalizeEpochSeconds(value.session?.expires_at) ??
    normalizeEpochSeconds(value.expiresAt) ??
    normalizeEpochSeconds(value.exp);

  return { issuedAt, expiresAt };
};
