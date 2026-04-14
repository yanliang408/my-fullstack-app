import { ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { Todo } from '@prisma/client';

@Injectable()
export class TodoService {
  constructor(private prismaService: PrismaService) {}

  private async ensureUser(user: { id: string; email?: string }) {
    return this.prismaService.prisma.user.upsert({
      where: { id: user.id },
      update: { email: user.email ?? '' },
      create: {
        id: user.id,
        email: user.email ?? `${user.id}@unknown.local`,
      },
    });
  }

  async findAll(): Promise<any[]> {
    return this.prismaService.prisma.todo.findMany({
      orderBy: { id: 'desc' },
      include: {
        assignee: {
          include: { profile: true },
        },
      },
    });
  }

  async findOne(id: number): Promise<any> {
    return this.prismaService.prisma.todo.findUniqueOrThrow({
      where: { id },
      include: {
        assignee: {
          include: { profile: true },
        },
      },
    });
  }

  async create(
    authUser: { id: string; email?: string },
    data: { title: string; assignedToId?: string | null },
  ): Promise<Todo> {
    await this.ensureUser(authUser);

    if (data.assignedToId) {
      const [creator, assignee] = await Promise.all([
        this.prismaService.prisma.user.findUniqueOrThrow({
          where: { id: authUser.id },
          select: { companyId: true },
        }),
        this.prismaService.prisma.user.findUniqueOrThrow({
          where: { id: data.assignedToId },
          select: { companyId: true },
        }),
      ]);

      if (!creator.companyId || creator.companyId !== assignee.companyId) {
        throw new ForbiddenException('Assignee must be in the same company');
      }
    }

    return this.prismaService.prisma.todo.create({
      data: {
        title: data.title,
        creatorId: authUser.id,
        assignedToId: data.assignedToId ?? null,
      },
    });
  }

  async update(
    authUser: { id: string; email?: string },
    id: number,
    data: { title?: string; completed?: boolean; assignedToId?: string | null },
  ): Promise<Todo> {
    await this.ensureUser(authUser);

    // Map camelCase to snake_case for the database
    const updateData: any = {};
    if (data.title !== undefined) updateData.title = data.title;
    if (data.completed !== undefined) updateData.is_completed = data.completed;
    if (data.assignedToId !== undefined) {
      if (data.assignedToId === null) {
        updateData.assignedToId = null;
      } else {
        const [creator, assignee] = await Promise.all([
          this.prismaService.prisma.user.findUniqueOrThrow({
            where: { id: authUser.id },
            select: { companyId: true },
          }),
          this.prismaService.prisma.user.findUniqueOrThrow({
            where: { id: data.assignedToId },
            select: { companyId: true },
          }),
        ]);
        if (!creator.companyId || creator.companyId !== assignee.companyId) {
          throw new ForbiddenException('Assignee must be in the same company');
        }
        updateData.assignedToId = data.assignedToId;
      }
    }
    
    return this.prismaService.prisma.todo.update({
      where: { id },
      data: updateData,
    });
  }

  async delete(id: number): Promise<Todo> {
    return this.prismaService.prisma.todo.delete({
      where: { id },
    });
  }
}
