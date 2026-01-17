'use client';

import { useEffect, useState } from 'react';
import { api, Task, UserStats, LeaderboardEntry } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

const rankColors: Record<string, string> = {
    BRONZE: 'from-amber-700 to-amber-500',
    SILVER: 'from-slate-400 to-slate-300',
    GOLD: 'from-yellow-500 to-yellow-300',
    PLATINUM: 'from-cyan-400 to-cyan-200',
    DIAMOND: 'from-blue-500 to-purple-400',
    MASTER: 'from-purple-600 to-pink-500',
};

export default function DashboardPage() {
    const { user } = useAuth();
    const [stats, setStats] = useState<UserStats | null>(null);
    const [tasks, setTasks] = useState<Task[]>([]);
    const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [statsData, tasksData, leaderboardData] = await Promise.all([
                    api.getMyStats(),
                    api.getTasks(),
                    api.getLeaderboard(5),
                ]);
                setStats(statsData);
                setTasks(tasksData);
                setLeaderboard(leaderboardData);
            } catch (error) {
                console.error('Failed to fetch dashboard data:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, []);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
            </div>
        );
    }

    const rankColor = rankColors[stats?.currentRank || 'BRONZE'] || rankColors.BRONZE;

    return (
        <div className="space-y-8">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-white">
                    Welcome back, <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">{user?.username}</span>!
                </h1>
                <p className="text-slate-400 mt-1">Here&apos;s your progress overview</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur-xl">
                    <CardHeader className="pb-2">
                        <CardDescription className="text-slate-400">Total Points</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-white">{stats?.totalPoints.toLocaleString() || 0}</div>
                    </CardContent>
                </Card>

                <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur-xl">
                    <CardHeader className="pb-2">
                        <CardDescription className="text-slate-400">Current Rank</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Badge className={`bg-gradient-to-r ${rankColor} text-white text-lg px-4 py-1`}>
                            {stats?.currentRank || 'BRONZE'}
                        </Badge>
                    </CardContent>
                </Card>

                <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur-xl">
                    <CardHeader className="pb-2">
                        <CardDescription className="text-slate-400">Tasks Completed</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-white">{stats?.completedTasks || 0}</div>
                    </CardContent>
                </Card>

                <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur-xl">
                    <CardHeader className="pb-2">
                        <CardDescription className="text-slate-400">Global Rank</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-white">#{stats?.globalRank || '-'}</div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Available Tasks */}
                <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur-xl">
                    <CardHeader>
                        <CardTitle className="text-white flex items-center gap-2">
                            <span>📋</span> Available Tasks
                        </CardTitle>
                        <CardDescription className="text-slate-400">Complete tasks to earn points</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {tasks.length === 0 ? (
                            <p className="text-slate-500 text-center py-4">No tasks available</p>
                        ) : (
                            tasks.slice(0, 5).map((task) => (
                                <div
                                    key={task.id}
                                    className="flex items-center justify-between p-3 rounded-lg bg-slate-700/30 hover:bg-slate-700/50 transition-colors"
                                >
                                    <div>
                                        <p className="font-medium text-white">{task.title}</p>
                                        <p className="text-sm text-slate-400">{task.category?.name}</p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Badge variant="outline" className="border-purple-500/50 text-purple-400">
                                            {task.difficulty}
                                        </Badge>
                                        <span className="text-yellow-400 font-semibold">+{task.basePoints}</span>
                                    </div>
                                </div>
                            ))
                        )}
                    </CardContent>
                </Card>

                {/* Leaderboard */}
                <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur-xl">
                    <CardHeader>
                        <CardTitle className="text-white flex items-center gap-2">
                            <span>🏆</span> Top Players
                        </CardTitle>
                        <CardDescription className="text-slate-400">Global leaderboard</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {leaderboard.length === 0 ? (
                            <p className="text-slate-500 text-center py-4">No players yet</p>
                        ) : (
                            leaderboard.map((entry, index) => (
                                <div
                                    key={entry.id}
                                    className="flex items-center gap-4 p-3 rounded-lg bg-slate-700/30"
                                >
                                    <span className="text-2xl w-8 text-center">
                                        {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${index + 1}`}
                                    </span>
                                    <Avatar className="h-10 w-10 border-2 border-slate-600">
                                        <AvatarImage src={entry.avatarUrl} />
                                        <AvatarFallback className="bg-gradient-to-r from-purple-600 to-pink-600 text-white">
                                            {entry.username.charAt(0).toUpperCase()}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1">
                                        <p className="font-medium text-white">{entry.username}</p>
                                        <Badge variant="outline" className="text-xs border-slate-600 text-slate-400">
                                            {entry.currentRank}
                                        </Badge>
                                    </div>
                                    <div className="text-yellow-400 font-bold">{entry.totalPoints.toLocaleString()}</div>
                                </div>
                            ))
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
