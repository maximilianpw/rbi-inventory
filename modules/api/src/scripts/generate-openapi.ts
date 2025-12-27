import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import * as fs from 'fs';
import * as path from 'path';
import * as yaml from 'js-yaml';
import { AppModule } from 'src/app.module';

async function generateOpenApi() {
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn'],
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
    .addTag('Locations', 'Location management (warehouses, suppliers, etc.)')
    .addTag('Areas', 'Area management (zones, shelves, bins within locations)')
    .addTag('Inventory', 'Inventory management (stock levels by location/area)')
    .build();

  const document = SwaggerModule.createDocument(app, config);

  // Write to root of project (two levels up from this file)
  const outputPath = path.resolve(__dirname, '..', '..', '..', 'openapi.yaml');
  const yamlContent = yaml.dump(document, { noRefs: true });

  fs.writeFileSync(outputPath, yamlContent, 'utf8');

  console.log(`OpenAPI spec generated successfully at: ${outputPath}`);

  await app.close();
  process.exit(0);
}

generateOpenApi().catch((error) => {
  console.error('Failed to generate OpenAPI spec:', error);
  process.exit(1);
});
