import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { AuditAction } from 'src/common/enums';

@Entity('audit_logs')
export class AuditLog {
  @ApiProperty({ description: 'Unique identifier', format: 'uuid' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({
    description: 'User ID who performed the action',
    format: 'uuid',
    nullable: true,
  })
  @Column({ type: 'uuid', nullable: true })
  user_id: string | null;

  @ApiProperty({ description: 'Action performed', enum: AuditAction })
  @Column({
    type: 'enum',
    enum: AuditAction,
  })
  action: AuditAction;

  @ApiProperty({ description: 'Type of entity affected' })
  @Column({ type: 'varchar' })
  entity_type: string;

  @ApiProperty({ description: 'ID of the affected entity', format: 'uuid' })
  @Column({ type: 'uuid' })
  entity_id: string;

  @ApiProperty({ description: 'Changes made', nullable: true })
  @Column({ type: 'jsonb', nullable: true })
  changes: object | null;

  @ApiProperty({ description: 'IP address of the requester', nullable: true })
  @Column({ type: 'varchar', nullable: true })
  ip_address: string | null;

  @ApiProperty({ description: 'Creation timestamp' })
  @CreateDateColumn({ type: 'timestamptz' })
  created_at: Date;
}
