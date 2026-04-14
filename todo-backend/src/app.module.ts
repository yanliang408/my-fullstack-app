import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaService } from './prisma.service';
import { TodoService } from './todo.service';
import { TodoController } from './todo.controller';
import { AuthModule } from './auth/auth.module';
import { ProfileController } from './profile.controller';
import { ProfileService } from './profile.service';

@Module({
  imports: [AuthModule],
  controllers: [AppController, TodoController, ProfileController],
  providers: [AppService, PrismaService, TodoService, ProfileService],
})
export class AppModule {}
