import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import {
  Task,
  User,
  UserRole,
  Organization,
} from '@dluzardo-bc98b939-55ec-4467-bf50-571c855bd2cb/data';
import type {
  CreateTaskDto,
  UpdateTaskDto,
} from '@dluzardo-bc98b939-55ec-4467-bf50-571c855bd2cb/data';
import {
  getAccessibleOrgIds,
  type OrgWithChildren,
} from '@dluzardo-bc98b939-55ec-4467-bf50-571c855bd2cb/auth';

@Injectable()
export class TasksService {
  constructor(
    @InjectRepository(Task)
    private taskRepo: Repository<Task>,
    @InjectRepository(Organization)
    private orgRepo: Repository<Organization>,
  ) {}

  private async getAccessibleOrgIdsForUser(user: User): Promise<string[]> {
    const userOrg = await this.orgRepo.findOne({
      where: { id: user.organizationId },
      relations: ['children'],
    });
    if (!userOrg) return [user.organizationId];
    const tree: OrgWithChildren = {
      id: userOrg.id,
      parentId: userOrg.parentId,
      children:
        userOrg.children?.map((c) => ({
          id: c.id,
          parentId: c.parentId,
          children: [],
        })) ?? [],
    };
    return getAccessibleOrgIds(user, tree);
  }

  async findAll(user: User) {
    const orgIds = await this.getAccessibleOrgIdsForUser(user);
    return this.taskRepo.find({
      where: { organizationId: In(orgIds) },
      relations: ['owner', 'organization'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string, user: User) {
    const orgIds = await this.getAccessibleOrgIdsForUser(user);
    const task = await this.taskRepo.findOne({
      where: { id },
      relations: ['owner', 'organization'],
    });
    if (!task) throw new NotFoundException('Task not found');
    if (!orgIds.includes(task.organizationId)) {
      throw new ForbiddenException('Access denied to this task');
    }
    return task;
  }

  async create(dto: CreateTaskDto, user: User) {
    const orgIds = await this.getAccessibleOrgIdsForUser(user);
    if (!orgIds.includes(user.organizationId)) {
      throw new ForbiddenException('Cannot create task in this organization');
    }
    if (user.role === UserRole.VIEWER) {
      throw new ForbiddenException('Viewers cannot create tasks');
    }
    return this.taskRepo.save({
      ...dto,
      ownerId: user.id,
      organizationId: user.organizationId,
    });
  }

  async update(id: string, dto: UpdateTaskDto, user: User) {
    const task = await this.findOne(id, user);
    if (user.role === UserRole.VIEWER) {
      throw new ForbiddenException('Viewers cannot edit tasks');
    }
    await this.taskRepo.update(id, dto);
    return this.taskRepo.findOne({ where: { id }, relations: ['owner', 'organization'] });
  }

  async remove(id: string, user: User) {
    const task = await this.findOne(id, user);
    if (user.role === UserRole.VIEWER) {
      throw new ForbiddenException('Viewers cannot delete tasks');
    }
    await this.taskRepo.delete(id);
    return { deleted: true };
  }
}
