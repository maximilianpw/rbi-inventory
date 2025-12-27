import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Area } from './entities/area.entity';
import { AreaRepository } from './area.repository';
import { AreasService } from './areas.service';
import { AreasController } from './areas.controller';
import { LocationsModule } from '../locations/locations.module';

@Module({
  imports: [TypeOrmModule.forFeature([Area]), LocationsModule],
  controllers: [AreasController],
  providers: [AreasService, AreaRepository],
  exports: [AreaRepository, AreasService],
})
export class AreasModule {}
