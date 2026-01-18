import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';
import { verifyToken } from '@clerk/backend';
import { classifyClerkError } from './clerk-errors';

export interface ClerkRequest extends Request {
  auth?: {
    userId: string;
    sessionId: string;
    sessionClaims: any;
  };
}

@Injectable()
export class ClerkAuthGuard implements CanActivate {
  private readonly logger = new Logger(ClerkAuthGuard.name);

  constructor(private configService: ConfigService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<ClerkRequest>();
    const token = this.extractTokenFromHeader(request);

    if (!token) {
      throw new UnauthorizedException('No authorization token provided');
    }

    try {
      const secretKey = this.configService.get<string>('CLERK_SECRET_KEY');
      if (!secretKey) {
        throw new UnauthorizedException('Clerk secret key not configured');
      }

      const payload = await verifyToken(token, {
        secretKey,
      });

      request.auth = {
        userId: payload.sub,
        sessionId: payload.sid,
        sessionClaims: payload,
      };

      return true;
    } catch (error) {
      // Classify the error for better user experience
      const classified = classifyClerkError(error);

      // Log the full error for debugging
      this.logger.warn(
        `Authentication failed: ${classified.type} - ${classified.originalError}`,
        {
          path: request.path,
          method: request.method,
          errorType: classified.type,
        },
      );

      // Throw structured error with classification
      throw new UnauthorizedException({
        message: classified.message,
        error_type: classified.type,
        retryable: classified.retryable,
      });
    }
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
