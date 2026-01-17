import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

// Difficulty multipliers
const DIFFICULTY_MULTIPLIER: Record<string, number> = {
    EASY: 1.0,
    MEDIUM: 1.5,
    HARD: 2.0,
    EPIC: 3.0,
};

// Rank thresholds
const RANKS = [
    { name: 'BRONZE', minPoints: 0 },
    { name: 'SILVER', minPoints: 500 },
    { name: 'GOLD', minPoints: 1500 },
    { name: 'PLATINUM', minPoints: 3500 },
    { name: 'DIAMOND', minPoints: 7000 },
    { name: 'MASTER', minPoints: 15000 },
];

@Injectable()
export class GamificationService {
    constructor(private prisma: PrismaService) { }

    async awardPoints(userId: string, basePoints: number, difficulty: string, reason: string) {
        const multiplier = DIFFICULTY_MULTIPLIER[difficulty] || 1.0;
        const points = Math.round(basePoints * multiplier);

        // Update user's total points
        const user = await this.prisma.user.update({
            where: { id: userId },
            data: { totalPoints: { increment: points } },
        });

        // Log point history
        await this.prisma.pointHistory.create({
            data: { userId, amount: points, reason },
        });

        // Check and update rank
        const newRank = this.calculateRank(user.totalPoints);
        if (newRank !== user.currentRank) {
            await this.prisma.user.update({
                where: { id: userId },
                data: { currentRank: newRank },
            });
        }

        return { pointsAwarded: points, totalPoints: user.totalPoints, rank: newRank };
    }

    calculateRank(totalPoints: number): string {
        let rank = 'BRONZE';
        for (const r of RANKS) {
            if (totalPoints >= r.minPoints) {
                rank = r.name;
            }
        }
        return rank;
    }

    async getLeaderboard(limit = 10) {
        return this.prisma.user.findMany({
            select: {
                id: true,
                username: true,
                avatarUrl: true,
                totalPoints: true,
                currentRank: true,
            },
            orderBy: { totalPoints: 'desc' },
            take: limit,
        });
    }

    async getUserStats(userId: string) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            select: {
                totalPoints: true,
                currentRank: true,
                _count: { select: { tasks: true } },
            },
        });

        const completedTasks = await this.prisma.userTask.count({
            where: { userId, status: 'APPROVED' },
        });

        const rank = await this.prisma.user.count({
            where: { totalPoints: { gt: user?.totalPoints ?? 0 } },
        });

        return {
            ...user,
            completedTasks,
            globalRank: rank + 1,
        };
    }
}
