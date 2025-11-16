import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Category } from '../../categories/entities/category.entity';

@Entity('products')
export class Product {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', unique: true })
  sku: string;

  @Column({ type: 'varchar' })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ type: 'uuid', name: 'category_id' })
  category_id: string;

  @ManyToOne(() => Category)
  @JoinColumn({ name: 'category_id' })
  category: Category;

  @Column({ type: 'uuid', nullable: true, name: 'brand_id' })
  brand_id: string | null;

  @Column({ type: 'int', nullable: true, name: 'volume_ml' })
  volume_ml: number | null;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    nullable: true,
    name: 'weight_kg',
  })
  weight_kg: number | null;

  @Column({ type: 'varchar', nullable: true, name: 'dimensions_cm' })
  dimensions_cm: string | null;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    nullable: true,
    name: 'standard_cost',
  })
  standard_cost: number | null;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    nullable: true,
    name: 'standard_price',
  })
  standard_price: number | null;

  @Column({
    type: 'decimal',
    precision: 5,
    scale: 2,
    nullable: true,
    name: 'markup_percentage',
  })
  markup_percentage: number | null;

  @Column({ type: 'int', default: 10, name: 'reorder_point' })
  reorder_point: number;

  @Column({ type: 'uuid', nullable: true, name: 'primary_supplier_id' })
  primary_supplier_id: string | null;

  @Column({ type: 'varchar', nullable: true, name: 'supplier_sku' })
  supplier_sku: string | null;

  @Column({ type: 'boolean', default: true, name: 'is_active' })
  is_active: boolean;

  @Column({ type: 'boolean', default: false, name: 'is_perishable' })
  is_perishable: boolean;

  @Column({ type: 'text', nullable: true })
  notes: string | null;

  @CreateDateColumn({ type: 'timestamp', name: 'created_at' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamp', name: 'updated_at' })
  updated_at: Date;
}
