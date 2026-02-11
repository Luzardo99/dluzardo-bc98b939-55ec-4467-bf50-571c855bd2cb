import {
  Controller,
  Get,
  Query,
  UseGuards,
  ParseIntPipe,
  DefaultValuePipe,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { AuditLog, Organization } from '@dluzardo-bc98b939-55ec-4467-bf50-571c855bd2cb/data';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import {
  RolesGuard,
  Roles,
  UserRole,
  getAccessibleOrgIds,
  type OrgWithChildren,
} from '@dluzardo-bc98b939-55ec-4467-bf50-571c855bd2cb/auth';
import { UserParam } from '../tasks/user.decorator';
import { User } from '@dluzardo-bc98b939-55ec-4467-bf50-571c855bd2cb/data';

@Controller('audit-log')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.OWNER, UserRole.ADMIN)
export class AuditLogController {
  constructor(
    @InjectRepository(AuditLog)
    private auditRepo: Repository<AuditLog>,
    @InjectRepository(Organization)
    private orgRepo: Repository<Organization>,
  ) {}

  /**
   * List audit logs scoped by user's accessible orgs.
   * Paginated to prevent large result sets (max 100 per request).
   */
  @Get()
  async findAll(
    @UserParam() user: User,
    @Query('limit', new DefaultValuePipe(50), new ParseIntPipe())
    limit: number,
    @Query('offset', new DefaultValuePipe(0), new ParseIntPipe()) offset: number,
  ) {
    const orgIds = await this.getAccessibleOrgIdsForUser(user);
    const [items, total] = await this.auditRepo.findAndCount({
      where: { organizationId: In(orgIds) },
      order: { timestamp: 'DESC' },
      take: Math.max(1, Math.min(limit, 100)),
      skip: Math.max(0, offset),
    });
    return { items, total };
  }

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
}
