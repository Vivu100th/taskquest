import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './modules/users/users.module';
import { TasksModule } from './modules/tasks/tasks.module';
import { AuthModule } from './modules/auth/auth.module';
import { GamificationModule } from './modules/gamification/gamification.module';
import { SubmissionsModule } from './modules/submissions/submissions.module';
import { PrismaModule } from './prisma/prisma.module';

@Module({
  imports: [UsersModule, TasksModule, AuthModule, GamificationModule, SubmissionsModule, PrismaModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
