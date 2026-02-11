import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuditLog, Organization } from '@dluzardo-bc98b939-55ec-4467-bf50-571c855bd2cb/data';
import { RolesGuard } from '@dluzardo-bc98b939-55ec-4467-bf50-571c855bd2cb/auth';
import { AuditLogController } from './audit.controller';
import { AuditService } from './audit.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([AuditLog, Organization]),
  ],
  controllers: [AuditLogController],
  providers: [AuditService, RolesGuard],
  exports: [AuditService],
})
export class AuditModule {}
