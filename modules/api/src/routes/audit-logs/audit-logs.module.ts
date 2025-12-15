import { Global, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuditLog } from './entities/audit-log.entity';
import { AuditLogRepository } from './audit-log.repository';
import { AuditLogService } from './audit-log.service';
import { AuditLogsController } from './audit-logs.controller';
import { AuditInterceptor } from '../../common/interceptors/audit.interceptor';
import { ClerkAuthGuard } from '../../common/guards/clerk-auth.guard';

@Global()
@Module({
  imports: [TypeOrmModule.forFeature([AuditLog])],
  controllers: [AuditLogsController],
  providers: [
    AuditLogRepository,
    AuditLogService,
    AuditInterceptor,
    ClerkAuthGuard,
  ],
  exports: [AuditLogService, AuditInterceptor],
})
export class AuditLogsModule {}
