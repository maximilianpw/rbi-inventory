import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: '*',
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
    .addTag('Health', 'System health endpoints')
    .addTag('Auth', 'Authentication endpoints (Clerk JWT)')
    .addTag('Users', 'User management endpoints')
    .addTag('Categories', 'Product category management')
    .addTag('Products', 'Product catalog management')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  await app.listen(process.env.PORT ?? 8080);
}
bootstrap();
