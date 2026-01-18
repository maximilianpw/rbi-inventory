import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import {
  HealthCheckService,
  HealthCheck,
  TypeOrmHealthIndicator,
} from '@nestjs/terminus';
import { SkipThrottle } from '@nestjs/throttler';
import { ClerkHealthIndicator } from './indicators/clerk-health.indicator';

@ApiTags('Health')
@Controller()
@SkipThrottle()
export class HealthController {
  constructor(
    private health: HealthCheckService,
    private db: TypeOrmHealthIndicator,
    private clerk: ClerkHealthIndicator,
  ) {}

  @Get('health-check')
  @HealthCheck()
  @ApiOperation({
    summary: 'Full health check',
    description:
      'Comprehensive health check including database and Clerk configuration',
    operationId: 'healthCheck',
  })
  @ApiResponse({
    status: 200,
    description: 'All systems healthy',
  })
  @ApiResponse({
    status: 503,
    description: 'One or more systems unhealthy',
  })
  check() {
    return this.health.check([
      () => this.db.pingCheck('database'),
      () => this.clerk.isHealthy('clerk'),
    ]);
  }

  @Get('health-check/live')
  @HealthCheck()
  @ApiOperation({
    summary: 'Liveness probe',
    description:
      'Kubernetes liveness probe - returns 200 if application is running',
    operationId: 'liveness',
  })
  @ApiResponse({
    status: 200,
    description: 'Application is alive',
  })
  liveness() {
    return this.health.check([]);
  }

  @Get('health-check/ready')
  @HealthCheck()
  @ApiOperation({
    summary: 'Readiness probe',
    description:
      'Kubernetes readiness probe - returns 200 if application is ready to serve traffic',
    operationId: 'readiness',
  })
  @ApiResponse({
    status: 200,
    description: 'Application is ready',
  })
  @ApiResponse({
    status: 503,
    description: 'Application is not ready',
  })
  readiness() {
    return this.health.check([() => this.db.pingCheck('database')]);
  }
}
