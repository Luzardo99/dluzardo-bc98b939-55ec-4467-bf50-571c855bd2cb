import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { User, Organization, Task, AuditLog } from '@dluzardo-bc98b939-55ec-4467-bf50-571c855bd2cb/data';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { SeedController } from './seed.controller';
import { AuthModule } from './auth/auth.module';
import { TasksModule } from './tasks/tasks.module';
import { JwtAuthGuard } from './auth/jwt-auth.guard';

@Module({
  imports: [
    AuthModule,
    TasksModule,
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: 'apps/api/.env',
    }),
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: 'data/task-management.db',
      entities: [User, Organization, Task, AuditLog],
      synchronize: true,
      logging: ['error', 'warn'],
    }),
    TypeOrmModule.forFeature([User, Organization, Task, AuditLog]),
  ],
  controllers: [AppController, SeedController],
  providers: [
    AppService,
    { provide: APP_GUARD, useClass: JwtAuthGuard },
  ],
})
export class AppModule {}
