import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  HealthIndicator,
  HealthIndicatorResult,
  HealthCheckError,
} from '@nestjs/terminus';

/**
 * Custom health indicator for Clerk authentication service
 * Validates that Clerk configuration is present and properly formatted
 */
@Injectable()
export class ClerkHealthIndicator extends HealthIndicator {
  constructor(private readonly configService: ConfigService) {
    super();
  }

  async isHealthy(key: string): Promise<HealthIndicatorResult> {
    const secretKey = this.configService.get<string>('CLERK_SECRET_KEY');

    // Check if secret key exists
    if (!secretKey) {
      const result = this.getStatus(key, false, {
        message: 'CLERK_SECRET_KEY is not configured',
      });
      throw new HealthCheckError('Clerk configuration check failed', result);
    }

    // Basic validation: check if it starts with the expected prefix
    const isValid =
      secretKey.startsWith('sk_test_') || secretKey.startsWith('sk_live_');

    if (!isValid) {
      const result = this.getStatus(key, false, {
        message: 'CLERK_SECRET_KEY format is invalid',
      });
      throw new HealthCheckError('Clerk configuration check failed', result);
    }

    // Configuration is valid
    return this.getStatus(key, true, {
      message: 'Clerk is properly configured',
      environment: secretKey.startsWith('sk_test_') ? 'test' : 'live',
    });
  }
}
