import { Test, type TestingModule } from '@nestjs/testing';
import { type ExecutionContext, type CallHandler } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { of, throwError } from 'rxjs';
import { AuditLogService } from '../../routes/audit-logs/audit-log.service';
import { AuditAction, AuditEntityType } from '../enums';
import { type AuditMetadata } from '../decorators/auditable.decorator';
import { AuditInterceptor } from './audit.interceptor';

describe('AuditInterceptor', () => {
  let interceptor: AuditInterceptor;
  let reflector: jest.Mocked<Reflector>;
  let auditLogService: jest.Mocked<AuditLogService>;

  const mockRequest = {
    params: { id: 'entity-123' },
    body: { name: 'Test' },
    headers: {
      'x-forwarded-for': '192.168.1.1',
      'user-agent': 'Mozilla/5.0',
    },
    socket: { remoteAddress: '127.0.0.1' },
    auth: { userId: 'user_123' },
  };

  const mockExecutionContext = {
    switchToHttp: jest.fn().mockReturnValue({
      getRequest: jest.fn().mockReturnValue(mockRequest),
    }),
    getHandler: jest.fn(),
    getClass: jest.fn(),
  } as unknown as ExecutionContext;

  const mockCallHandler: CallHandler = {
    handle: jest.fn().mockReturnValue(of({ id: 'response-id', name: 'Test' })),
  };

  beforeEach(async () => {
    const mockReflector = {
      get: jest.fn(),
    };

    const mockAuditLogService = {
      log: jest.fn().mockResolvedValue({}),
      logBulk: jest.fn().mockResolvedValue([]),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuditInterceptor,
        { provide: Reflector, useValue: mockReflector },
        { provide: AuditLogService, useValue: mockAuditLogService },
      ],
    }).compile();

    interceptor = module.get<AuditInterceptor>(AuditInterceptor);
    reflector = module.get(Reflector);
    auditLogService = module.get(AuditLogService);
  });

  it('should be defined', () => {
    expect(interceptor).toBeDefined();
  });

  describe('intercept', () => {
    it('should pass through when no audit metadata is present', (done) => {
      reflector.get.mockReturnValue(undefined);

      interceptor.intercept(mockExecutionContext, mockCallHandler).subscribe({
        next: (result) => {
          expect(result).toEqual({ id: 'response-id', name: 'Test' });
          expect(auditLogService.log).not.toHaveBeenCalled();
          done();
        },
      });
    });

    it('should create audit log when metadata is present with entityIdParam', (done) => {
      const metadata: AuditMetadata = {
        action: AuditAction.UPDATE,
        entityType: AuditEntityType.PRODUCT,
        entityIdParam: 'id',
      };
      reflector.get.mockReturnValue(metadata);

      interceptor.intercept(mockExecutionContext, mockCallHandler).subscribe({
        next: () => {
          // Wait for async audit log creation
          setTimeout(() => {
            expect(auditLogService.log).toHaveBeenCalledWith({
              action: AuditAction.UPDATE,
              entityType: AuditEntityType.PRODUCT,
              entityId: 'entity-123',
              context: {
                userId: 'user_123',
                ipAddress: '192.168.1.1',
                userAgent: 'Mozilla/5.0',
              },
              changes: null,
            });
            done();
          }, 10);
        },
      });
    });

    it('should extract entity ID from response when entityIdFromResponse is set', (done) => {
      const metadata: AuditMetadata = {
        action: AuditAction.CREATE,
        entityType: AuditEntityType.PRODUCT,
        entityIdFromResponse: 'id',
      };
      reflector.get.mockReturnValue(metadata);

      interceptor.intercept(mockExecutionContext, mockCallHandler).subscribe({
        next: () => {
          setTimeout(() => {
            expect(auditLogService.log).toHaveBeenCalledWith(
              expect.objectContaining({
                entityId: 'response-id',
              }),
            );
            done();
          }, 10);
        },
      });
    });

    it('should extract entity ID from body when entityIdFromBody is set', (done) => {
      const customRequest = {
        ...mockRequest,
        body: { productId: 'body-id' },
      };
      const customContext = {
        ...mockExecutionContext,
        switchToHttp: jest.fn().mockReturnValue({
          getRequest: jest.fn().mockReturnValue(customRequest),
        }),
      } as unknown as ExecutionContext;

      const metadata: AuditMetadata = {
        action: AuditAction.UPDATE,
        entityType: AuditEntityType.PRODUCT,
        entityIdFromBody: 'productId',
      };
      reflector.get.mockReturnValue(metadata);

      interceptor.intercept(customContext, mockCallHandler).subscribe({
        next: () => {
          setTimeout(() => {
            expect(auditLogService.log).toHaveBeenCalledWith(
              expect.objectContaining({
                entityId: 'body-id',
              }),
            );
            done();
          }, 10);
        },
      });
    });

    it('should handle bulk operations with succeeded array in response', (done) => {
      const bulkResponse = {
        succeeded: ['id-1', 'id-2', 'id-3'],
        failures: [],
      };
      const bulkCallHandler: CallHandler = {
        handle: jest.fn().mockReturnValue(of(bulkResponse)),
      };

      const metadata: AuditMetadata = {
        action: AuditAction.DELETE,
        entityType: AuditEntityType.PRODUCT,
        entityIdFromResponse: 'succeeded',
      };
      reflector.get.mockReturnValue(metadata);

      interceptor.intercept(mockExecutionContext, bulkCallHandler).subscribe({
        next: () => {
          setTimeout(() => {
            expect(auditLogService.logBulk).toHaveBeenCalledWith({
              action: AuditAction.DELETE,
              entityType: AuditEntityType.PRODUCT,
              entityIds: ['id-1', 'id-2', 'id-3'],
              context: expect.any(Object),
            });
            done();
          }, 10);
        },
      });
    });

    it('should not create audit log on error', (done) => {
      const errorCallHandler: CallHandler = {
        handle: jest
          .fn()
          .mockReturnValue(throwError(() => new Error('Test error'))),
      };

      const metadata: AuditMetadata = {
        action: AuditAction.CREATE,
        entityType: AuditEntityType.PRODUCT,
        entityIdFromResponse: 'id',
      };
      reflector.get.mockReturnValue(metadata);

      interceptor.intercept(mockExecutionContext, errorCallHandler).subscribe({
        error: () => {
          setTimeout(() => {
            expect(auditLogService.log).not.toHaveBeenCalled();
            done();
          }, 10);
        },
      });
    });

    it('should extract IP from x-forwarded-for header', (done) => {
      const metadata: AuditMetadata = {
        action: AuditAction.UPDATE,
        entityType: AuditEntityType.PRODUCT,
        entityIdParam: 'id',
      };
      reflector.get.mockReturnValue(metadata);

      interceptor.intercept(mockExecutionContext, mockCallHandler).subscribe({
        next: () => {
          setTimeout(() => {
            expect(auditLogService.log).toHaveBeenCalledWith(
              expect.objectContaining({
                context: expect.objectContaining({
                  ipAddress: '192.168.1.1',
                }),
              }),
            );
            done();
          }, 10);
        },
      });
    });

    it('should handle multiple IPs in x-forwarded-for header', (done) => {
      const multiIpRequest = {
        ...mockRequest,
        headers: {
          ...mockRequest.headers,
          'x-forwarded-for': '10.0.0.1, 192.168.1.1, 172.16.0.1',
        },
      };
      const multiIpContext = {
        ...mockExecutionContext,
        switchToHttp: jest.fn().mockReturnValue({
          getRequest: jest.fn().mockReturnValue(multiIpRequest),
        }),
      } as unknown as ExecutionContext;

      const metadata: AuditMetadata = {
        action: AuditAction.UPDATE,
        entityType: AuditEntityType.PRODUCT,
        entityIdParam: 'id',
      };
      reflector.get.mockReturnValue(metadata);

      interceptor.intercept(multiIpContext, mockCallHandler).subscribe({
        next: () => {
          setTimeout(() => {
            expect(auditLogService.log).toHaveBeenCalledWith(
              expect.objectContaining({
                context: expect.objectContaining({
                  ipAddress: '10.0.0.1',
                }),
              }),
            );
            done();
          }, 10);
        },
      });
    });

    it('should fall back to socket remoteAddress when no x-forwarded-for', (done) => {
      const noForwardedRequest = {
        ...mockRequest,
        headers: { 'user-agent': 'Mozilla/5.0' },
      };
      const noForwardedContext = {
        ...mockExecutionContext,
        switchToHttp: jest.fn().mockReturnValue({
          getRequest: jest.fn().mockReturnValue(noForwardedRequest),
        }),
      } as unknown as ExecutionContext;

      const metadata: AuditMetadata = {
        action: AuditAction.UPDATE,
        entityType: AuditEntityType.PRODUCT,
        entityIdParam: 'id',
      };
      reflector.get.mockReturnValue(metadata);

      interceptor.intercept(noForwardedContext, mockCallHandler).subscribe({
        next: () => {
          setTimeout(() => {
            expect(auditLogService.log).toHaveBeenCalledWith(
              expect.objectContaining({
                context: expect.objectContaining({
                  ipAddress: '127.0.0.1',
                }),
              }),
            );
            done();
          }, 10);
        },
      });
    });

    it('should handle null userId when no auth present', (done) => {
      const noAuthRequest = {
        ...mockRequest,
        auth: undefined,
      };
      const noAuthContext = {
        ...mockExecutionContext,
        switchToHttp: jest.fn().mockReturnValue({
          getRequest: jest.fn().mockReturnValue(noAuthRequest),
        }),
      } as unknown as ExecutionContext;

      const metadata: AuditMetadata = {
        action: AuditAction.UPDATE,
        entityType: AuditEntityType.PRODUCT,
        entityIdParam: 'id',
      };
      reflector.get.mockReturnValue(metadata);

      interceptor.intercept(noAuthContext, mockCallHandler).subscribe({
        next: () => {
          setTimeout(() => {
            expect(auditLogService.log).toHaveBeenCalledWith(
              expect.objectContaining({
                context: expect.objectContaining({
                  userId: null,
                }),
              }),
            );
            done();
          }, 10);
        },
      });
    });

    it('should default to params.id when no entityId configuration', (done) => {
      const metadata: AuditMetadata = {
        action: AuditAction.DELETE,
        entityType: AuditEntityType.PRODUCT,
      };
      reflector.get.mockReturnValue(metadata);

      interceptor.intercept(mockExecutionContext, mockCallHandler).subscribe({
        next: () => {
          setTimeout(() => {
            expect(auditLogService.log).toHaveBeenCalledWith(
              expect.objectContaining({
                entityId: 'entity-123',
              }),
            );
            done();
          }, 10);
        },
      });
    });

    it('should handle nested path in entityIdFromResponse', (done) => {
      const nestedResponse = { data: { entity: { id: 'nested-id' } } };
      const nestedCallHandler: CallHandler = {
        handle: jest.fn().mockReturnValue(of(nestedResponse)),
      };

      const metadata: AuditMetadata = {
        action: AuditAction.CREATE,
        entityType: AuditEntityType.PRODUCT,
        entityIdFromResponse: 'data.entity.id',
      };
      reflector.get.mockReturnValue(metadata);

      interceptor.intercept(mockExecutionContext, nestedCallHandler).subscribe({
        next: () => {
          setTimeout(() => {
            expect(auditLogService.log).toHaveBeenCalledWith(
              expect.objectContaining({
                entityId: 'nested-id',
              }),
            );
            done();
          }, 10);
        },
      });
    });

    it('should continue without error when audit log creation fails', (done) => {
      auditLogService.log.mockRejectedValue(new Error('Database error'));

      const metadata: AuditMetadata = {
        action: AuditAction.UPDATE,
        entityType: AuditEntityType.PRODUCT,
        entityIdParam: 'id',
      };
      reflector.get.mockReturnValue(metadata);

      interceptor.intercept(mockExecutionContext, mockCallHandler).subscribe({
        next: (result) => {
          // Response should still be returned even if audit logging fails
          expect(result).toEqual({ id: 'response-id', name: 'Test' });
          done();
        },
      });
    });
  });
});
