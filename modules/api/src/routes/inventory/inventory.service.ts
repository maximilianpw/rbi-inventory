import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { Inventory } from './entities/inventory.entity';
import {
  CreateInventoryDto,
  UpdateInventoryDto,
  AdjustInventoryDto,
  InventoryQueryDto,
  InventoryResponseDto,
  PaginatedInventoryResponseDto,
} from './dto';
import { InventoryRepository } from './inventory.repository';
import { ProductRepository } from '../products/product.repository';
import { LocationRepository } from '../locations/location.repository';

@Injectable()
export class InventoryService {
  constructor(
    private readonly inventoryRepository: InventoryRepository,
    private readonly productRepository: ProductRepository,
    private readonly locationRepository: LocationRepository,
  ) {}

  async findAllPaginated(
    query: InventoryQueryDto,
  ): Promise<PaginatedInventoryResponseDto> {
    const result = await this.inventoryRepository.findAllPaginated(query);

    return {
      data: result.data.map((inventory) => this.toResponseDto(inventory)),
      meta: {
        page: result.page,
        limit: result.limit,
        total: result.total,
        total_pages: result.total_pages,
        has_next: result.page < result.total_pages,
        has_previous: result.page > 1,
      },
    };
  }

  async findAll(): Promise<InventoryResponseDto[]> {
    const items = await this.inventoryRepository.findAll();
    return items.map((inventory) => this.toResponseDto(inventory));
  }

  async findOne(id: string): Promise<InventoryResponseDto> {
    const inventory = await this.inventoryRepository.findById(id);
    if (!inventory) {
      throw new NotFoundException('Inventory item not found');
    }
    return this.toResponseDto(inventory);
  }

  async findByProduct(productId: string): Promise<InventoryResponseDto[]> {
    const product = await this.productRepository.findById(productId);
    if (!product) {
      throw new NotFoundException('Product not found');
    }

    const items = await this.inventoryRepository.findByProductId(productId);
    return items.map((inventory) => this.toResponseDto(inventory));
  }

  async findByLocation(locationId: string): Promise<InventoryResponseDto[]> {
    const location = await this.locationRepository.findById(locationId);
    if (!location) {
      throw new NotFoundException('Location not found');
    }

    const items = await this.inventoryRepository.findByLocationId(locationId);
    return items.map((inventory) => this.toResponseDto(inventory));
  }

  async create(
    createInventoryDto: CreateInventoryDto,
  ): Promise<InventoryResponseDto> {
    // Validate product exists
    const product = await this.productRepository.findById(
      createInventoryDto.product_id,
    );
    if (!product) {
      throw new BadRequestException('Product not found');
    }

    // Validate location exists
    const location = await this.locationRepository.findById(
      createInventoryDto.location_id,
    );
    if (!location) {
      throw new BadRequestException('Location not found');
    }

    // Check if inventory for this product/location already exists
    const existing = await this.inventoryRepository.findByProductAndLocation(
      createInventoryDto.product_id,
      createInventoryDto.location_id,
    );
    if (existing) {
      throw new BadRequestException(
        'Inventory for this product at this location already exists. Use the update or adjust endpoint instead.',
      );
    }

    const inventory = await this.inventoryRepository.create({
      product_id: createInventoryDto.product_id,
      location_id: createInventoryDto.location_id,
      quantity: createInventoryDto.quantity,
      batch_number: createInventoryDto.batch_number ?? null,
      expiry_date: createInventoryDto.expiry_date
        ? new Date(createInventoryDto.expiry_date)
        : null,
      cost_per_unit: createInventoryDto.cost_per_unit ?? null,
      received_date: createInventoryDto.received_date
        ? new Date(createInventoryDto.received_date)
        : null,
    });

    // Fetch with relations
    const inventoryWithRelations = await this.inventoryRepository.findById(
      inventory.id,
    );
    return this.toResponseDto(inventoryWithRelations!);
  }

  async update(
    id: string,
    updateInventoryDto: UpdateInventoryDto,
  ): Promise<InventoryResponseDto> {
    const inventory = await this.getInventoryOrFail(id);

    // Validate location if changing
    if (
      updateInventoryDto.location_id &&
      updateInventoryDto.location_id !== inventory.location_id
    ) {
      const location = await this.locationRepository.findById(
        updateInventoryDto.location_id,
      );
      if (!location) {
        throw new BadRequestException('Location not found');
      }

      // Check if inventory for this product at new location already exists
      const existing = await this.inventoryRepository.findByProductAndLocation(
        inventory.product_id,
        updateInventoryDto.location_id,
      );
      if (existing) {
        throw new BadRequestException(
          'Inventory for this product at the target location already exists',
        );
      }
    }

    if (Object.keys(updateInventoryDto).length === 0) {
      return this.toResponseDto(inventory);
    }

    const updateData: Partial<Inventory> = {};

    if (updateInventoryDto.location_id !== undefined) {
      updateData.location_id = updateInventoryDto.location_id;
    }
    if (updateInventoryDto.quantity !== undefined) {
      updateData.quantity = updateInventoryDto.quantity;
    }
    if (updateInventoryDto.batch_number !== undefined) {
      updateData.batch_number = updateInventoryDto.batch_number;
    }
    if (updateInventoryDto.expiry_date !== undefined) {
      updateData.expiry_date = updateInventoryDto.expiry_date
        ? new Date(updateInventoryDto.expiry_date)
        : null;
    }
    if (updateInventoryDto.cost_per_unit !== undefined) {
      updateData.cost_per_unit = updateInventoryDto.cost_per_unit;
    }
    if (updateInventoryDto.received_date !== undefined) {
      updateData.received_date = updateInventoryDto.received_date
        ? new Date(updateInventoryDto.received_date)
        : null;
    }

    await this.inventoryRepository.update(id, updateData);

    const updated = await this.inventoryRepository.findById(id);
    return this.toResponseDto(updated!);
  }

  async adjustQuantity(
    id: string,
    adjustDto: AdjustInventoryDto,
  ): Promise<InventoryResponseDto> {
    const inventory = await this.getInventoryOrFail(id);

    // Check if adjustment would make quantity negative
    if (inventory.quantity + adjustDto.adjustment < 0) {
      throw new BadRequestException(
        `Cannot adjust quantity by ${adjustDto.adjustment}. Current quantity is ${inventory.quantity}.`,
      );
    }

    const affected = await this.inventoryRepository.adjustQuantity(
      id,
      adjustDto.adjustment,
    );

    if (affected === 0) {
      throw new BadRequestException(
        'Quantity adjustment failed. The resulting quantity would be negative.',
      );
    }

    const updated = await this.inventoryRepository.findById(id);
    return this.toResponseDto(updated!);
  }

  async delete(id: string): Promise<void> {
    await this.getInventoryOrFail(id);
    await this.inventoryRepository.delete(id);
  }

  private async getInventoryOrFail(id: string): Promise<Inventory> {
    const inventory = await this.inventoryRepository.findById(id);
    if (!inventory) {
      throw new NotFoundException('Inventory item not found');
    }
    return inventory;
  }

  private toResponseDto(inventory: Inventory): InventoryResponseDto {
    return {
      id: inventory.id,
      product_id: inventory.product_id,
      product: inventory.product
        ? {
            id: inventory.product.id,
            sku: inventory.product.sku,
            name: inventory.product.name,
            unit: inventory.product.unit,
          }
        : null,
      location_id: inventory.location_id,
      location: inventory.location
        ? {
            id: inventory.location.id,
            name: inventory.location.name,
            type: inventory.location.type,
          }
        : null,
      quantity: inventory.quantity,
      batch_number: inventory.batch_number,
      expiry_date: inventory.expiry_date,
      cost_per_unit: inventory.cost_per_unit
        ? Number(inventory.cost_per_unit)
        : null,
      received_date: inventory.received_date,
      created_at: inventory.created_at,
      updated_at: inventory.updated_at,
    };
  }
}
