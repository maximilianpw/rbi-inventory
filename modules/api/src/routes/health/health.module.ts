import { Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';
import { HealthController } from './health.controller';
import { ClerkHealthIndicator } from './indicators/clerk-health.indicator';

@Module({
  imports: [TerminusModule],
  controllers: [HealthController],
  providers: [ClerkHealthIndicator],
})
export class HealthModule {}
