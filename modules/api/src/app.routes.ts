import { Routes } from '@nestjs/core';
import { AuthModule } from './routes/auth/auth.module';
import { CategoriesModule } from './routes/categories/categories.module';
import { HealthModule } from './routes/health/health.module';
import { ProductsModule } from './routes/products/products.module';
import { AuditLogsModule } from './routes/audit-logs/audit-logs.module';

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
  {
    path: 'categories',
    module: CategoriesModule,
  },
  {
    path: 'products',
    module: ProductsModule,
  },
  {
    path: 'audit-logs',
    module: AuditLogsModule,
  },
];
