import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_INTERCEPTOR , RouterModule } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './routes/auth/auth.module';
import { CategoriesModule } from './routes/categories/categories.module';
import { ProductsModule } from './routes/products/products.module';
import { LocationsModule } from './routes/locations/locations.module';
import { AreasModule } from './routes/areas/areas.module';
import { InventoryModule } from './routes/inventory/inventory.module';
import { AuditLogsModule } from './routes/audit-logs/audit-logs.module';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import { RequestIdMiddleware } from './common/middleware/request-id.middleware';
import databaseConfig from './config/database.config';
import { HealthModule } from './routes/health/health.module';
import { routes } from './app.routes';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
      load: [databaseConfig],
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const dbConfig = configService.get('database');
        if (!dbConfig) {
          throw new Error('Database configuration not found');
        }
        return dbConfig;
      },
    }),
    HealthModule,
    AuthModule,
    CategoriesModule,
    ProductsModule,
    LocationsModule,
    AreasModule,
    InventoryModule,
    AuditLogsModule,
    RouterModule.register(routes),
  ],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggingInterceptor,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(RequestIdMiddleware).forRoutes('*');
  }
}
