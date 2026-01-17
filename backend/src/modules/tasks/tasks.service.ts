import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';

@Injectable()
export class TasksService {
    constructor(private prisma: PrismaService) { }

    async create(createTaskDto: CreateTaskDto) {
        return this.prisma.task.create({
            data: {
                ...createTaskDto,
                requiresPhoto: createTaskDto.requiresPhoto ?? true,
                requiresGps: createTaskDto.requiresGps ?? false,
            },
        });
    }

    async findAll() {
        return this.prisma.task.findMany({
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
