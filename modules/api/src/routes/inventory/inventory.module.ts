import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Inventory } from './entities/inventory.entity';
import { InventoryController } from './inventory.controller';
import { InventoryService } from './inventory.service';
import { InventoryRepository } from './inventory.repository';
import { ProductsModule } from '../products/products.module';
import { LocationsModule } from '../locations/locations.module';
import { ClerkAuthGuard } from '../../common/guards/clerk-auth.guard';

@Module({
  imports: [
    TypeOrmModule.forFeature([Inventory]),
    ProductsModule,
    LocationsModule,
  ],
  controllers: [InventoryController],
  providers: [InventoryService, InventoryRepository, ClerkAuthGuard],
  exports: [InventoryService, InventoryRepository],
})
export class InventoryModule {}
