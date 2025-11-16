import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';
import { verifyToken } from '@clerk/backend';

export interface ClerkRequest extends Request {
  auth?: {
    userId: string;
    sessionId: string;
    sessionClaims: any;
  };
}

@Injectable()
export class ClerkAuthGuard implements CanActivate {
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
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (_error) {
      throw new UnauthorizedException('Invalid or expired token');
    }
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
