import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuditLog, AuditAction } from '@dluzardo-bc98b939-55ec-4467-bf50-571c855bd2cb/data';

/** Safe metadata - never log passwords, tokens, or PII */
export interface AuditMetadata {
  title?: string;
  [key: string]: string | number | boolean | undefined;
}

@Injectable()
export class AuditService {
  constructor(
    @InjectRepository(AuditLog)
    private auditRepo: Repository<AuditLog>,
  ) {}

  /**
   * Log an audit event. Metadata is constrained to non-sensitive fields only.
   */
  async log(params: {
    userId: string;
    action: AuditAction;
    resourceType: string;
    resourceId: string | null;
    organizationId: string | null;
    metadata?: AuditMetadata | null;
  }): Promise<AuditLog> {
    return this.auditRepo.save({
      userId: params.userId,
      action: params.action,
      resourceType: params.resourceType,
      resourceId: params.resourceId,
      organizationId: params.organizationId,
      metadata: params.metadata ?? null,
    });
  }
}
