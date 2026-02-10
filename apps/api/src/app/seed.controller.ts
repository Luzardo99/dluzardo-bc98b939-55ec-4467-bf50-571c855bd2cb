import { Controller, Post } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { 
  User, 
  Organization, 
  Task, 
  AuditLog,
  UserRole, 
  TaskStatus, 
  TaskCategory 
} from '@dluzardo-bc98b939-55ec-4467-bf50-571c855bd2cb/data';

@Controller('seed')
export class SeedController {
  constructor(
    @InjectRepository(User)
    private userRepo: Repository<User>,
    @InjectRepository(Organization)
    private orgRepo: Repository<Organization>,
    @InjectRepository(Task)
    private taskRepo: Repository<Task>,
    @InjectRepository(AuditLog)
    private auditLogRepo: Repository<AuditLog>,
  ) {}

  @Post()
  async seed() {
    // Clear in FK order: audit_logs → tasks → users → orgs (TypeORM rejects delete({}) for safety)
    await this.auditLogRepo.clear();
    await this.taskRepo.clear();
    await this.userRepo.clear();
    await this.orgRepo.clear();

    const parentOrg = await this.orgRepo.save({
      name: 'Acme Corporation',
      parentId: null,
    });

    const childOrg1 = await this.orgRepo.save({
      name: 'Engineering Department',
      parentId: parentOrg.id,
    });

    const childOrg2 = await this.orgRepo.save({
      name: 'Marketing Department',
      parentId: parentOrg.id,
    });

    const hashedPassword = await bcrypt.hash('password123', 10);

    const owner = await this.userRepo.save({
      email: 'owner@acme.com',
      passwordHash: hashedPassword,
      role: UserRole.OWNER,
      organizationId: parentOrg.id,
    });

    const admin = await this.userRepo.save({
      email: 'admin@acme.com',
      passwordHash: hashedPassword,
      role: UserRole.ADMIN,
      organizationId: parentOrg.id,
    });

    const engAdmin = await this.userRepo.save({
      email: 'admin.eng@acme.com',
      passwordHash: hashedPassword,
      role: UserRole.ADMIN,
      organizationId: childOrg1.id,
    });

    const engViewer = await this.userRepo.save({
      email: 'viewer.eng@acme.com',
      passwordHash: hashedPassword,
      role: UserRole.VIEWER,
      organizationId: childOrg1.id,
    });

    const mktViewer = await this.userRepo.save({
      email: 'viewer.marketing@acme.com',
      passwordHash: hashedPassword,
      role: UserRole.VIEWER,
      organizationId: childOrg2.id,
    });

    await this.taskRepo.save([
      {
        title: 'Setup CI/CD Pipeline',
        description: 'Configure GitHub Actions',
        status: TaskStatus.IN_PROGRESS,
        category: TaskCategory.WORK,
        ownerId: owner.id,
        organizationId: parentOrg.id,
      },
      {
        title: 'Implement RBAC',
        description: 'Build access control',
        status: TaskStatus.IN_PROGRESS,
        category: TaskCategory.WORK,
        ownerId: admin.id,
        organizationId: parentOrg.id,
      },
      {
        title: 'Write Tests',
        description: 'Code coverage',
        status: TaskStatus.TODO,
        category: TaskCategory.WORK,
        ownerId: engAdmin.id,
        organizationId: childOrg1.id,
      },
      {
        title: 'Code Review',
        description: 'Review implementation',
        status: TaskStatus.TODO,
        category: TaskCategory.WORK,
        ownerId: engViewer.id,
        organizationId: childOrg1.id,
      },
      {
        title: 'Marketing Campaign',
        description: 'Product launch',
        status: TaskStatus.IN_PROGRESS,
        category: TaskCategory.WORK,
        ownerId: mktViewer.id,
        organizationId: childOrg2.id,
      },
    ]);

    return {
      message: 'Database seeded successfully',
      users: [
        'owner@acme.com (OWNER)',
        'admin@acme.com (ADMIN)',
        'admin.eng@acme.com (ADMIN - Engineering)',
        'viewer.eng@acme.com (VIEWER - Engineering)',
        'viewer.marketing@acme.com (VIEWER - Marketing)',
      ],
      password: 'password123',
    };
  }
}
