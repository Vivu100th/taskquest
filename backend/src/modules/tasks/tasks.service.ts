import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';

@Injectable()
export class TasksService {
    constructor(private prisma: PrismaService) { }

    async create(createTaskDto: CreateTaskDto, userId: string) {
        return this.prisma.task.create({
            data: {
                ...createTaskDto,
                requiresPhoto: createTaskDto.requiresPhoto ?? true,
                requiresGps: createTaskDto.requiresGps ?? false,
                isAllDay: createTaskDto.isAllDay ?? false,
                icon: createTaskDto.icon,
                startTime: createTaskDto.startTime ? new Date(createTaskDto.startTime) : null,
                endTime: createTaskDto.endTime ? new Date(createTaskDto.endTime) : null,
                creatorId: userId,
            },
        });
    }

    async findAll(userId?: string, role?: string) {
        if (role === 'ADMIN') {
            return this.prisma.task.findMany({
                include: { category: true, creator: true },
            });
        }

        return this.prisma.task.findMany({
            where: {
                OR: [
                    { creatorId: null }, // Global system tasks
                    { creatorId: userId }, // User's personal tasks
                ],
            },
            include: { category: true },
        });
    }

    async findOne(id: string) {
        return this.prisma.task.findUnique({
            where: { id },
            include: { category: true },
        });
    }

    async update(id: string, updateTaskDto: UpdateTaskDto) {
        return this.prisma.task.update({
            where: { id },
            data: updateTaskDto,
        });
    }

    async remove(id: string) {
        return this.prisma.task.delete({
            where: { id },
        });
    }

    // ===== Timer Management =====

    async startTask(taskId: string, userId: string, durationSeconds: number) {
        // Check if user already has an active task
        const existingActive = await this.getActiveTask(userId);
        if (existingActive && existingActive.taskId !== taskId) {
            throw new BadRequestException('You already have an active task. Complete or pause it first.');
        }

        // Create or update UserTask
        return this.prisma.userTask.upsert({
            where: {
                userId_taskId: { userId, taskId },
            },
            create: {
                userId,
                taskId,
                status: 'IN_PROGRESS',
                timerStartedAt: new Date(),
                timerDuration: durationSeconds,
                timerPausedAt: null,
                timerRemainingSeconds: null,
            },
            update: {
                status: 'IN_PROGRESS',
                timerStartedAt: new Date(),
                timerDuration: durationSeconds,
                timerPausedAt: null,
                timerRemainingSeconds: null,
            },
            include: { task: { include: { category: true } } },
        });
    }

    async pauseTask(taskId: string, userId: string) {
        const userTask = await this.prisma.userTask.findUnique({
            where: { userId_taskId: { userId, taskId } },
        });

        if (!userTask || !userTask.timerStartedAt) {
            throw new NotFoundException('No active timer found for this task');
        }

        // Calculate remaining time
        const elapsed = Math.floor((Date.now() - userTask.timerStartedAt.getTime()) / 1000);
        const remaining = Math.max(0, (userTask.timerDuration || 0) - elapsed);

        return this.prisma.userTask.update({
            where: { userId_taskId: { userId, taskId } },
            data: {
                timerPausedAt: new Date(),
                timerRemainingSeconds: remaining,
            },
            include: { task: { include: { category: true } } },
        });
    }

    async resumeTask(taskId: string, userId: string) {
        const userTask = await this.prisma.userTask.findUnique({
            where: { userId_taskId: { userId, taskId } },
        });

        if (!userTask || !userTask.timerPausedAt || userTask.timerRemainingSeconds === null) {
            throw new NotFoundException('No paused timer found for this task');
        }

        return this.prisma.userTask.update({
            where: { userId_taskId: { userId, taskId } },
            data: {
                timerStartedAt: new Date(),
                timerDuration: userTask.timerRemainingSeconds,
                timerPausedAt: null,
                timerRemainingSeconds: null,
            },
            include: { task: { include: { category: true } } },
        });
    }

    async getActiveTask(userId: string) {
        return this.prisma.userTask.findFirst({
            where: {
                userId,
                status: 'IN_PROGRESS',
                timerStartedAt: { not: null },
            },
            include: { task: { include: { category: true } } },
            orderBy: { updatedAt: 'desc' },
        });
    }

    async completeTask(taskId: string, userId: string) {
        // Complete the timer (mark as SUBMITTED)
        await this.prisma.userTask.update({
            where: { userId_taskId: { userId, taskId } },
            data: {
                status: 'SUBMITTED',
                submittedAt: new Date(),
                timerStartedAt: null,
                timerDuration: null,
                timerPausedAt: null,
                timerRemainingSeconds: null,
            },
        });

        // Delete the task
        return this.prisma.task.delete({
            where: { id: taskId },
        });
    }
}
