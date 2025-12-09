import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { Client } from './clients/entities/client.entity';
import { Location } from './locations/entities/location.entity';
import { Supplier } from './suppliers/entities/supplier.entity';
import { SupplierProduct } from './suppliers/entities/supplier-product.entity';
import { AuditLog } from './audit-logs/entities/audit-log.entity';
import { Inventory } from './inventory/entities/inventory.entity';
import { Order } from './orders/entities/order.entity';
import { OrderItem } from './orders/entities/order-item.entity';
import { Photo } from './photos/entities/photo.entity';
import { StockMovement } from './stock-movements/entities/stock-movement.entity';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: '*',
  });

  // Set global prefix for all routes
  app.setGlobalPrefix('api/v1', {
    exclude: ['health-check'], // Exclude health check from prefix
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );

  const config = new DocumentBuilder()
    .setTitle('RBI Inventory API')
    .setDescription('REST API for RBI Inventory Management System')
    .setVersion('1.0.0')
    .setContact('API Support', '', '')
    .setLicense('MIT', '')
    .addServer('http://localhost:8080', 'Development Server')
    .addServer('https://api.rbi-inventory.com', 'Production Server')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Clerk JWT token',
      },
      'BearerAuth',
    )
    .build();

  const document = SwaggerModule.createDocument(app, config, {
    extraModels: [
      Client,
      Location,
      Supplier,
      SupplierProduct,
      AuditLog,
      Inventory,
      Order,
      OrderItem,
      Photo,
      StockMovement,
    ],
  });
  SwaggerModule.setup('api/docs', app, document);

  await app.listen(process.env.PORT ?? 8080);
}
bootstrap();
