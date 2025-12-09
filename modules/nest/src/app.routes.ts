import { Routes } from '@nestjs/core';
import { AuthModule } from './auth/auth.module';
import { HealthModule } from './health/health.module';

/**
 * Application routes configuration
 * Centralizes all route-to-module mappings for the application
 * Routes are combined with the global prefix /api/v1 (except those excluded in main.ts)
 */
export const routes: Routes = [
  {
    path: '',
    module: HealthModule,
  },
  {
    path: 'auth',
    module: AuthModule,
  },
];
