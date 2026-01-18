import { Injectable } from '@nestjs/common';
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
                startTime: createTaskDto.startTime ? new Date(createTaskDto.startTime) : null,
                endTime: createTaskDto.endTime ? new Date(createTaskDto.endTime) : null,
                creatorId: userId,
            },
        });
    }

    async findAll(userId?: string) {
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
}
