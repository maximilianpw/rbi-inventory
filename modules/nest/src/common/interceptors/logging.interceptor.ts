import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Request, Response } from 'express';
import { RequestWithId } from '../middleware/request-id.middleware';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('HTTP');

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest<RequestWithId>();
    const response = context.switchToHttp().getResponse<Response>();
    const startTime = Date.now();

    const { method, url, headers } = request;
    const requestId = request.id || 'unknown';
    const userAgent = headers['user-agent'] || 'unknown';

    return next.handle().pipe(
      tap({
        next: () => {
          const duration = Date.now() - startTime;
          const statusCode = response.statusCode;

          this.logger.log({
            message: 'HTTP request',
            requestId,
            method,
            path: url,
            statusCode,
            duration: `${duration}ms`,
            userAgent,
          });
        },
        error: (error) => {
          const duration = Date.now() - startTime;
          const statusCode = error.status || 500;

          this.logger.error({
            message: 'HTTP request failed',
            requestId,
            method,
            path: url,
            statusCode,
            duration: `${duration}ms`,
            error: error.message,
          });
        },
      }),
    );
  }
}
