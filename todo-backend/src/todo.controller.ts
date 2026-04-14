import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  ParseIntPipe,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Request } from 'express';
import { TodoService } from './todo.service';
import { Todo } from '@prisma/client';
import { JwtAuthGuard } from './auth/jwt-auth.guard';

// Helper to convert snake_case to camelCase for API responses
function formatTodo(todo: any) {
  return {
    id: todo.id,
    title: todo.title,
    completed: todo.is_completed ?? todo.completed ?? false,
    createdAt: todo.created_at ?? todo.createdAt,
    updatedAt: todo.updated_at ?? todo.updatedAt,
    assignee: todo.assignee
      ? {
          id: todo.assignee.id,
          fullName: todo.assignee.profile?.fullName ?? null,
          avatarUrl: todo.assignee.profile?.avatarUrl ?? null,
          email: todo.assignee.email,
        }
      : null,
  };
}

type AuthenticatedRequest = Request & {
  user: {
    id: string;
    email?: string;
  };
};

@Controller('todos')
@UseGuards(JwtAuthGuard)
export class TodoController {
  constructor(private readonly todoService: TodoService) {}

  @Get()
  async findAll(): Promise<any[]> {
    const todos = await this.todoService.findAll();
    return todos.map(formatTodo);
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<any> {
    const todo = await this.todoService.findOne(id);
    return formatTodo(todo);
  }

  @Post()
  async create(
    @Req() req: AuthenticatedRequest,
    @Body() data: { title: string; assignedToId?: string | null },
  ): Promise<any> {
    const todo = await this.todoService.create(req.user, data);
    return formatTodo(todo);
  }

  @Put(':id')
  async update(
    @Req() req: AuthenticatedRequest,
    @Param('id', ParseIntPipe) id: number,
    @Body() data: { title?: string; completed?: boolean; assignedToId?: string | null },
  ): Promise<any> {
    const todo = await this.todoService.update(req.user, id, data);
    return formatTodo(todo);
  }

  @Delete(':id')
  async delete(@Param('id', ParseIntPipe) id: number): Promise<any> {
    const todo = await this.todoService.delete(id);
    return formatTodo(todo);
  }
}
