import { Test, TestingModule } from '@nestjs/testing';
import { TasksController } from './tasks.controller';
import { TasksService } from './tasks.service';

describe('TasksController', () => {
  let controller: TasksController;
  let tasksService: {
    findAll: jest.Mock;
    findOne: jest.Mock;
    create: jest.Mock;
    update: jest.Mock;
    remove: jest.Mock;
  };

  const mockUser = { id: 'u1', organizationId: 'o1', role: 'admin' };
  const mockTask = { id: 't1', title: 'Task' };

  beforeEach(async () => {
    tasksService = {
      findAll: jest.fn().mockResolvedValue([mockTask]),
      findOne: jest.fn().mockResolvedValue(mockTask),
      create: jest.fn().mockResolvedValue(mockTask),
      update: jest.fn().mockResolvedValue(mockTask),
      remove: jest.fn().mockResolvedValue({ deleted: true }),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [TasksController],
      providers: [{ provide: TasksService, useValue: tasksService }],
    }).compile();

    controller = module.get<TasksController>(TasksController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('findAll delegates to service with user', async () => {
    await controller.findAll(mockUser as any);
    expect(tasksService.findAll).toHaveBeenCalledWith(mockUser);
  });

  it('findOne delegates to service', async () => {
    await controller.findOne('t1', mockUser as any);
    expect(tasksService.findOne).toHaveBeenCalledWith('t1', mockUser);
  });

  it('create delegates to service', async () => {
    const dto = { title: 'New' };
    await controller.create(dto as any, mockUser as any);
    expect(tasksService.create).toHaveBeenCalledWith(dto, mockUser);
  });

  it('update delegates to service', async () => {
    const dto = { title: 'Updated' };
    await controller.update('t1', dto as any, mockUser as any);
    expect(tasksService.update).toHaveBeenCalledWith('t1', dto, mockUser);
  });

  it('remove delegates to service', async () => {
    await controller.remove('t1', mockUser as any);
    expect(tasksService.remove).toHaveBeenCalledWith('t1', mockUser);
  });
});
