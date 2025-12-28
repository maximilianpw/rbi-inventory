import { Injectable, Logger } from '@nestjs/common';
import { AuditAction, AuditEntityType } from 'src/common/enums';
import {
  AuditLogRepository,
  CreateAuditLogData,
  AuditLogQueryOptions,
  PaginatedAuditLogs,
} from './audit-log.repository';
import { AuditLog, AuditChanges } from './entities/audit-log.entity';

export interface AuditContext {
  userId: string | null;
  ipAddress?: string | null;
  userAgent?: string | null;
}

export interface LogAuditParams {
  action: AuditAction;
  entityType: AuditEntityType;
  entityId: string;
  context: AuditContext;
  changes?: AuditChanges | null;
}

export interface LogBulkAuditParams {
  action: AuditAction;
  entityType: AuditEntityType;
  entityIds: string[];
  context: AuditContext;
}

@Injectable()
export class AuditLogService {
  private readonly logger = new Logger(AuditLogService.name);

  constructor(private readonly auditLogRepository: AuditLogRepository) {}

  async log(params: LogAuditParams): Promise<AuditLog> {
    const { action, entityType, entityId, context, changes } = params;

    const data: CreateAuditLogData = {
      user_id: context.userId,
      action,
      entity_type: entityType,
      entity_id: entityId,
      changes: changes ?? null,
      ip_address: context.ipAddress ?? null,
      user_agent: context.userAgent ?? null,
    };

    try {
      const auditLog = await this.auditLogRepository.create(data);
      this.logger.debug(
        `Audit log created: ${action} on ${entityType}:${entityId} by user ${context.userId}`,
      );
      return auditLog;
    } catch (error) {
      this.logger.error(
        `Failed to create audit log: ${action} on ${entityType}:${entityId}`,
        error instanceof Error ? error.stack : undefined,
      );
      throw error;
    }
  }

  async logBulk(params: LogBulkAuditParams): Promise<AuditLog[]> {
    const { action, entityType, entityIds, context } = params;

    const dataArray: CreateAuditLogData[] = entityIds.map((entityId) => ({
      user_id: context.userId,
      action,
      entity_type: entityType,
      entity_id: entityId,
      changes: null,
      ip_address: context.ipAddress ?? null,
      user_agent: context.userAgent ?? null,
    }));

    try {
      const auditLogs = await this.auditLogRepository.createMany(dataArray);
      this.logger.debug(
        `Bulk audit logs created: ${action} on ${entityType} for ${entityIds.length} entities by user ${context.userId}`,
      );
      return auditLogs;
    } catch (error) {
      this.logger.error(
        `Failed to create bulk audit logs: ${action} on ${entityType}`,
        error instanceof Error ? error.stack : undefined,
      );
      throw error;
    }
  }

  async getEntityHistory(
    entityType: AuditEntityType,
    entityId: string,
  ): Promise<AuditLog[]> {
    return this.auditLogRepository.findByEntityId(entityType, entityId);
  }

  async getUserHistory(userId: string): Promise<AuditLog[]> {
    return this.auditLogRepository.findByUserId(userId);
  }

  async query(options: AuditLogQueryOptions): Promise<PaginatedAuditLogs> {
    return this.auditLogRepository.findPaginated(options);
  }

  async findById(id: string): Promise<AuditLog | null> {
    return this.auditLogRepository.findById(id);
  }

  computeChanges<T extends Record<string, unknown>>(
    before: T | null,
    after: T | null,
    fieldsToTrack?: (keyof T)[],
  ): AuditChanges | null {
    if (!before && !after) {
      return null;
    }

    if (!before) {
      return { after: after as Record<string, unknown> };
    }

    if (!after) {
      return { before: before as Record<string, unknown> };
    }

    const fields = fieldsToTrack ?? (Object.keys(after) as (keyof T)[]);
    const beforeChanges: Record<string, unknown> = {};
    const afterChanges: Record<string, unknown> = {};
    let hasChanges = false;

    for (const field of fields) {
      const beforeValue = before[field];
      const afterValue = after[field];

      if (JSON.stringify(beforeValue) !== JSON.stringify(afterValue)) {
        beforeChanges[field as string] = beforeValue;
        afterChanges[field as string] = afterValue;
        hasChanges = true;
      }
    }

    if (!hasChanges) {
      return null;
    }

    return {
      before: beforeChanges,
      after: afterChanges,
    };
  }
}
