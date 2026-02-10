import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { User, Organization, Task, AuditLog } from '@dluzardo-bc98b939-55ec-4467-bf50-571c855bd2cb/data';

import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: 'apps/api/.env',
    }),
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: 'data/task-management.db',
      entities: [User, Organization, Task, AuditLog],
      synchronize: true, // Only for development!
      logging: ['error', 'warn'],
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
