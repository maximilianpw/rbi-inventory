import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Location } from '../../locations/entities/location.entity';

@Entity('inventory')
export class Inventory {
  @ApiProperty({ description: 'Unique identifier', format: 'uuid' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ description: 'Product ID', format: 'uuid' })
  @Column({ type: 'uuid' })
  product_id: string;

  @ApiProperty({ description: 'Location ID', format: 'uuid' })
  @Column({ type: 'uuid' })
  location_id: string;

  @ApiProperty({ description: 'Location relation', type: () => Location })
  @ManyToOne(() => Location)
  @JoinColumn({ name: 'location_id' })
  location: Location;

  @ApiProperty({ description: 'Quantity in stock', default: 0 })
  @Column({ type: 'int', default: 0 })
  quantity: number;

  @ApiProperty({ description: 'Batch number', nullable: true })
  @Column({ type: 'varchar', nullable: true })
  batch_number: string | null;

  @ApiProperty({ description: 'Expiry date', nullable: true })
  @Column({ type: 'timestamptz', nullable: true })
  expiry_date: Date | null;

  @ApiProperty({ description: 'Cost per unit', type: 'number', nullable: true })
  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
  cost_per_unit: number | null;

  @ApiProperty({ description: 'Date when received', nullable: true })
  @Column({ type: 'timestamptz', nullable: true })
  received_date: Date | null;

  @ApiProperty({ description: 'Last update timestamp' })
  @UpdateDateColumn({ type: 'timestamptz' })
  updated_at: Date;
}
