import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { AreaRepository } from './area.repository';
import { LocationRepository } from '../locations/location.repository';
import { Area } from './entities/area.entity';
import { CreateAreaDto } from './dto/create-area.dto';
import { UpdateAreaDto } from './dto/update-area.dto';
import { AreaQueryDto } from './dto/area-query.dto';

@Injectable()
export class AreasService {
  constructor(
    private readonly areaRepository: AreaRepository,
    private readonly locationRepository: LocationRepository,
  ) {}

  async create(dto: CreateAreaDto): Promise<Area> {
    // Validate location exists
    const locationExists = await this.locationRepository.existsById(
      dto.location_id,
    );
    if (!locationExists) {
      throw new BadRequestException(
        `Location with ID ${dto.location_id} not found`,
      );
    }

    // Validate parent area exists and belongs to same location
    if (dto.parent_id) {
      const parentArea = await this.areaRepository.findById(dto.parent_id);
      if (!parentArea) {
        throw new BadRequestException(
          `Parent area with ID ${dto.parent_id} not found`,
        );
      }
      if (parentArea.location_id !== dto.location_id) {
        throw new BadRequestException(
          'Parent area must belong to the same location',
        );
      }
    }

    return this.areaRepository.create(dto);
  }

  async findAll(query: AreaQueryDto): Promise<Area[]> {
    if (query.include_children && query.location_id) {
      return this.areaRepository.findHierarchyByLocationId(query.location_id);
    }
    return this.areaRepository.findAll(query);
  }

  async findById(id: string): Promise<Area> {
    const area = await this.areaRepository.findById(id);
    if (!area) {
      throw new NotFoundException(`Area with ID ${id} not found`);
    }
    return area;
  }

  async findByIdWithChildren(id: string): Promise<Area> {
    const area = await this.areaRepository.findByIdWithChildren(id);
    if (!area) {
      throw new NotFoundException(`Area with ID ${id} not found`);
    }
    return area;
  }

  async findByLocationId(locationId: string): Promise<Area[]> {
    return this.areaRepository.findByLocationId(locationId);
  }

  async findHierarchyByLocationId(locationId: string): Promise<Area[]> {
    return this.areaRepository.findHierarchyByLocationId(locationId);
  }

  async update(id: string, dto: UpdateAreaDto): Promise<Area> {
    const existingArea = await this.areaRepository.findById(id);
    if (!existingArea) {
      throw new NotFoundException(`Area with ID ${id} not found`);
    }

    // Validate parent area if being updated
    if (dto.parent_id !== undefined && dto.parent_id !== null) {
      if (dto.parent_id === id) {
        throw new BadRequestException('Area cannot be its own parent');
      }

      const parentArea = await this.areaRepository.findById(dto.parent_id);
      if (!parentArea) {
        throw new BadRequestException(
          `Parent area with ID ${dto.parent_id} not found`,
        );
      }
      if (parentArea.location_id !== existingArea.location_id) {
        throw new BadRequestException(
          'Parent area must belong to the same location',
        );
      }

      // Check for circular reference
      if (await this.wouldCreateCircularReference(id, dto.parent_id)) {
        throw new BadRequestException(
          'Cannot set parent: would create circular reference',
        );
      }
    }

    const updated = await this.areaRepository.update(id, dto);
    if (!updated) {
      throw new NotFoundException(`Area with ID ${id} not found`);
    }
    return updated;
  }

  async delete(id: string): Promise<void> {
    const exists = await this.areaRepository.existsById(id);
    if (!exists) {
      throw new NotFoundException(`Area with ID ${id} not found`);
    }

    // Note: Children will be deleted via CASCADE
    const deleted = await this.areaRepository.delete(id);
    if (!deleted) {
      throw new NotFoundException(`Area with ID ${id} not found`);
    }
  }

  private async wouldCreateCircularReference(
    areaId: string,
    newParentId: string,
  ): Promise<boolean> {
    let currentId: string | null = newParentId;

    while (currentId) {
      if (currentId === areaId) {
        return true;
      }
      const parent = await this.areaRepository.findById(currentId);
      currentId = parent?.parent_id ?? null;
    }

    return false;
  }
}
