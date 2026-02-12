import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { AuditLogController } from './audit.controller';
import { AuditLog, AuditAction, Organization } from '@dluzardo-bc98b939-55ec-4467-bf50-571c855bd2cb/data';

describe('AuditLogController', () => {
  let controller: AuditLogController;
  let auditRepo: any;
  let orgRepo: any;

  const mockUser = {
    id: 'u1',
    organizationId: 'o1',
    role: 'admin',
  };

  const mockLogs = [
    {
      id: '1',
      action: AuditAction.CREATE,
      resourceType: 'task',
      resourceId: 't1',
      organizationId: 'o1',
      timestamp: new Date(),
    },
  ];

  beforeEach(async () => {
    orgRepo = {
      findOne: jest.fn().mockResolvedValue({
        id: 'o1',
        parentId: null,
        children: [],
      }),
    };
    auditRepo = {
      findAndCount: jest.fn().mockResolvedValue([mockLogs, 1]),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuditLogController],
      providers: [
        { provide: getRepositoryToken(AuditLog), useValue: auditRepo },
        { provide: getRepositoryToken(Organization), useValue: orgRepo },
      ],
    }).compile();

    controller = module.get<AuditLogController>(AuditLogController);
  });

  it('findAll returns paginated audit logs', async () => {
    const result = await controller.findAll(mockUser as any, 50, 0);
    expect(auditRepo.findAndCount).toHaveBeenCalled();
    expect(result).toEqual({ items: mockLogs, total: 1 });
  });
});
