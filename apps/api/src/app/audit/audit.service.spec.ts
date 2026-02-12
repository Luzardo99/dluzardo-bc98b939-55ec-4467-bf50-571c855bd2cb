import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { AuditService } from './audit.service';
import { AuditLog, AuditAction } from '@dluzardo-bc98b939-55ec-4467-bf50-571c855bd2cb/data';

describe('AuditService', () => {
  let service: AuditService;
  let auditRepo: { save: jest.Mock };

  const mockLog = {
    id: 'log-1',
    userId: 'u1',
    action: AuditAction.CREATE,
    resourceType: 'task',
    resourceId: 't1',
    organizationId: 'o1',
    metadata: { title: 'Task' },
    timestamp: new Date(),
  };

  beforeEach(async () => {
    auditRepo = {
      save: jest.fn().mockResolvedValue(mockLog),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuditService,
        { provide: getRepositoryToken(AuditLog), useValue: auditRepo },
      ],
    }).compile();

    service = module.get<AuditService>(AuditService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('log saves audit record', async () => {
    const params = {
      userId: 'u1',
      action: AuditAction.CREATE,
      resourceType: 'task',
      resourceId: 't1',
      organizationId: 'o1',
      metadata: { title: 'Task' },
    };
    const result = await service.log(params);
    expect(auditRepo.save).toHaveBeenCalledWith({
      ...params,
      metadata: params.metadata ?? null,
    });
    expect(result).toEqual(mockLog);
  });

  it('log uses null for undefined metadata', async () => {
    await service.log({
      userId: 'u1',
      action: AuditAction.DELETE,
      resourceType: 'task',
      resourceId: 't1',
      organizationId: 'o1',
    });
    expect(auditRepo.save).toHaveBeenCalledWith(
      expect.objectContaining({ metadata: null })
    );
  });
});
