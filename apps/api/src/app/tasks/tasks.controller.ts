import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { TasksService } from './tasks.service';
import { CreateTaskDto, UpdateTaskDto } from '@dluzardo-bc98b939-55ec-4467-bf50-571c855bd2cb/data';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard, Roles, UserRole } from '@dluzardo-bc98b939-55ec-4467-bf50-571c855bd2cb/auth';
import { User as UserParam } from './user.decorator';

@Controller('tasks')
@UseGuards(JwtAuthGuard)
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Get()
  findAll(@UserParam() user: any) {
    return this.tasksService.findAll(user);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @UserParam() user: any) {
    return this.tasksService.findOne(id, user);
  }

  @Post()
  @UseGuards(RolesGuard)
  @Roles(UserRole.OWNER, UserRole.ADMIN)
  create(@Body() dto: CreateTaskDto, @UserParam() user: any) {
    return this.tasksService.create(dto, user);
  }

  @Put(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.OWNER, UserRole.ADMIN)
  update(
    @Param('id') id: string,
    @Body() dto: UpdateTaskDto,
    @UserParam() user: any,
  ) {
    return this.tasksService.update(id, dto, user);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.OWNER, UserRole.ADMIN)
  remove(@Param('id') id: string, @UserParam() user: any) {
    return this.tasksService.remove(id, user);
  }
}
