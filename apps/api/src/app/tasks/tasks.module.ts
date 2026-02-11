import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Task, Organization } from '@dluzardo-bc98b939-55ec-4467-bf50-571c855bd2cb/data';
import { RolesGuard } from '@dluzardo-bc98b939-55ec-4467-bf50-571c855bd2cb/auth';
import { TasksController } from './tasks.controller';
import { TasksService } from './tasks.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Task, Organization]),
  ],
  controllers: [TasksController],
  providers: [TasksService, RolesGuard],
  exports: [TasksService],
})
export class TasksModule {}
