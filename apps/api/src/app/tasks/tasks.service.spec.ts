import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException, ForbiddenException } from '@nestjs/common';
import { In } from 'typeorm';
import { TasksService } from './tasks.service';
import { AuditService } from '../audit/audit.service';
import {
  Task,
  User,
  UserRole,
  Organization,
} from '@dluzardo-bc98b939-55ec-4467-bf50-571c855bd2cb/data';

const mockUser: User = {
  id: 'user-1',
  email: 'admin@acme.com',
  role: UserRole.ADMIN,
  organizationId: 'org-1',
} as User;

const mockTask: Task = {
  id: 'task-1',
  title: 'Test',
  status: 'todo' as any,
  category: 'work' as any,
  ownerId: 'user-1',
  organizationId: 'org-1',
  description: null,
  createdAt: new Date(),
  updatedAt: new Date(),
} as Task;

const mockOrg: Organization = {
  id: 'org-1',
  name: 'Acme',
  parentId: null,
  children: [],
} as Organization;

describe('TasksService', () => {
  let service: TasksService;
  let taskRepo: any;
  let orgRepo: any;
  let auditService: any;

  beforeEach(async () => {
    orgRepo = {
      findOne: jest.fn().mockResolvedValue({ ...mockOrg, children: [] }),
    };
    taskRepo = {
      find: jest.fn().mockResolvedValue([mockTask]),
      findOne: jest.fn().mockResolvedValue(mockTask),
      save: jest.fn().mockImplementation((t) => Promise.resolve({ ...mockTask, ...t })),
      update: jest.fn().mockResolvedValue({ affected: 1 }),
      delete: jest.fn().mockResolvedValue({ affected: 1 }),
    };
    auditService = {
      log: jest.fn().mockResolvedValue({}),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TasksService,
        { provide: getRepositoryToken(Task), useValue: taskRepo },
        { provide: getRepositoryToken(Organization), useValue: orgRepo },
        { provide: AuditService, useValue: auditService },
      ],
    }).compile();

    service = module.get<TasksService>(TasksService);
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('returns tasks for user org', async () => {
      const result = await service.findAll(mockUser);
      expect(taskRepo.find).toHaveBeenCalledWith({
        where: { organizationId: In(['org-1']) },
        relations: ['owner', 'organization'],
        order: { createdAt: 'DESC' },
      });
      expect(result).toEqual([mockTask]);
    });
  });

  describe('findOne', () => {
    it('throws NotFoundException when task not found', async () => {
      taskRepo.findOne.mockResolvedValue(null);
      await expect(service.findOne('missing', mockUser)).rejects.toThrow(
        NotFoundException
      );
    });

    it('throws ForbiddenException when task in different org', async () => {
      taskRepo.findOne.mockResolvedValue({
        ...mockTask,
        organizationId: 'other-org',
      });
      await expect(service.findOne('task-1', mockUser)).rejects.toThrow(
        ForbiddenException
      );
    });

    it('returns task when authorized', async () => {
      const result = await service.findOne('task-1', mockUser);
      expect(result).toEqual(mockTask);
    });
  });

  describe('create', () => {
    it('throws ForbiddenException for Viewer', async () => {
      const viewer = { ...mockUser, role: UserRole.VIEWER };
      await expect(
        service.create({ title: 'New' }, viewer)
      ).rejects.toThrow(ForbiddenException);
    });

    it('creates task and logs audit', async () => {
      const dto = { title: 'New task', description: 'Desc' };
      const result = await service.create(dto, mockUser);
      expect(taskRepo.save).toHaveBeenCalledWith({
        ...dto,
        ownerId: mockUser.id,
        organizationId: mockUser.organizationId,
      });
      expect(auditService.log).toHaveBeenCalled();
      expect(result).toBeDefined();
    });
  });

  describe('update', () => {
    it('throws ForbiddenException for Viewer', async () => {
      const viewer = { ...mockUser, role: UserRole.VIEWER };
      await expect(
        service.update('task-1', { title: 'Updated' }, viewer)
      ).rejects.toThrow(ForbiddenException);
    });

    it('updates task and logs audit', async () => {
      taskRepo.findOne
        .mockResolvedValueOnce(mockTask)
        .mockResolvedValueOnce({ ...mockTask, title: 'Updated' });
      await service.update('task-1', { title: 'Updated' }, mockUser);
      expect(taskRepo.update).toHaveBeenCalledWith('task-1', { title: 'Updated' });
      expect(auditService.log).toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('throws ForbiddenException for Viewer', async () => {
      const viewer = { ...mockUser, role: UserRole.VIEWER };
      await expect(service.remove('task-1', viewer)).rejects.toThrow(
        ForbiddenException
      );
    });

    it('deletes task and logs audit', async () => {
      const result = await service.remove('task-1', mockUser);
      expect(auditService.log).toHaveBeenCalled();
      expect(taskRepo.delete).toHaveBeenCalledWith('task-1');
      expect(result).toEqual({ deleted: true });
    });
  });
});
