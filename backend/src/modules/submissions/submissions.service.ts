import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { SubmitTaskDto, ReviewTaskDto } from '../tasks/dto/submit-task.dto';
import { GamificationService } from '../gamification/gamification.service';

@Injectable()
export class SubmissionsService {
    constructor(
        private prisma: PrismaService,
        private gamificationService: GamificationService,
    ) { }

    async submitTask(userId: string, taskId: string, submitDto: SubmitTaskDto) {
        // Check if task exists
        const task = await this.prisma.task.findUnique({ where: { id: taskId } });
        if (!task) throw new NotFoundException('Task not found');

        // Check if already submitted
        const existing = await this.prisma.userTask.findUnique({
            where: { userId_taskId: { userId, taskId } },
        });

        if (existing && existing.status !== 'REJECTED') {
            throw new BadRequestException('Task already submitted or approved');
        }

        // Create or update submission
        return this.prisma.userTask.upsert({
            where: { userId_taskId: { userId, taskId } },
            create: {
                userId,
                taskId,
                status: 'SUBMITTED',
                proofUrl: submitDto.proofUrl,
                proofMeta: submitDto.proofMeta ?? {},
                submittedAt: new Date(),
            },
            update: {
                status: 'SUBMITTED',
                proofUrl: submitDto.proofUrl,
                proofMeta: submitDto.proofMeta ?? {},
                submittedAt: new Date(),
            },
        });
    }

    async reviewSubmission(submissionId: string, reviewDto: ReviewTaskDto, adminId: string) {
        const submission = await this.prisma.userTask.findUnique({
            where: { id: submissionId },
            include: { task: true },
        });

        if (!submission) throw new NotFoundException('Submission not found');
        if (submission.status !== 'SUBMITTED') {
            throw new BadRequestException('Submission is not pending review');
        }

        const updatedSubmission = await this.prisma.userTask.update({
            where: { id: submissionId },
            data: {
                status: reviewDto.status,
                reviewedAt: new Date(),
                reviewedBy: adminId,
            },
        });

        // If approved, award points
        if (reviewDto.status === 'APPROVED') {
            await this.gamificationService.awardPoints(
                submission.userId,
                submission.task.basePoints,
                submission.task.difficulty,
                `Completed task: ${submission.task.title}`,
            );
        }

        return updatedSubmission;
    }

    async getPendingSubmissions() {
        return this.prisma.userTask.findMany({
            where: { status: 'SUBMITTED' },
            include: { user: true, task: true },
            orderBy: { submittedAt: 'asc' },
        });
    }

    async getUserSubmissions(userId: string) {
        return this.prisma.userTask.findMany({
            where: { userId },
            include: { task: true },
            orderBy: { createdAt: 'desc' },
        });
    }
}
