import { NestFactory, Reflector } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { HateoasInterceptor } from './common/hateoas';
import { AuditLog } from './routes/audit-logs/entities/audit-log.entity';
import { Category } from './routes/categories/entities/category.entity';
import { Client } from './clients/entities/client.entity';
import { Inventory } from './routes/inventory/entities/inventory.entity';
import { Location } from './routes/locations/entities/location.entity';
import { Order } from './routes/orders/entities/order.entity';
import { OrderItem } from './routes/orders/entities/order-item.entity';
import { Photo } from './routes/photos/entities/photo.entity';
import { StockMovement } from './routes/stock-movements/entities/stock-movement.entity';
import { Supplier } from './routes/suppliers/entities/supplier.entity';
import { SupplierProduct } from './routes/suppliers/entities/supplier-product.entity';

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

  app.useGlobalInterceptors(new HateoasInterceptor(app.get(Reflector)));

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
      AuditLog,
      Category,
      Client,
      Inventory,
      Location,
      Order,
      OrderItem,
      Photo,
      StockMovement,
      Supplier,
      SupplierProduct,
    ],
  });
  SwaggerModule.setup('api/docs', app, document);

  await app.listen(process.env.PORT ?? 8080);
}
void bootstrap();
