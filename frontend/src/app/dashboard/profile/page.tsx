'use client';

import { useEffect, useState } from 'react';
import { api, UserStats, UserTask } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const rankColors: Record<string, string> = {
    BRONZE: 'from-amber-700 to-amber-500',
    SILVER: 'from-slate-400 to-slate-300',
    GOLD: 'from-yellow-500 to-yellow-300',
    PLATINUM: 'from-cyan-400 to-cyan-200',
    DIAMOND: 'from-blue-500 to-purple-400',
    MASTER: 'from-purple-600 to-pink-500',
};

const statusColors: Record<string, string> = {
    IN_PROGRESS: 'bg-blue-500/20 text-blue-400 border-blue-500/50',
    SUBMITTED: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50',
    APPROVED: 'bg-green-500/20 text-green-400 border-green-500/50',
    REJECTED: 'bg-red-500/20 text-red-400 border-red-500/50',
};

export default function ProfilePage() {
    const { user } = useAuth();
    const [stats, setStats] = useState<UserStats | null>(null);
    const [submissions, setSubmissions] = useState<UserTask[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [statsData, submissionsData] = await Promise.all([
                    api.getMyStats(),
                    api.getMySubmissions(),
                ]);
                setStats(statsData);
                setSubmissions(submissionsData);
            } catch (error) {
                console.error('Failed to fetch profile data:', error);
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
        <div className="space-y-6">
            {/* Profile Header */}
            <Card className="bg-gradient-to-r from-purple-900/50 to-pink-900/50 border-purple-500/30 backdrop-blur-xl">
                <CardContent className="pt-8 pb-8">
                    <div className="flex items-center gap-6">
                        <Avatar className="h-24 w-24 border-4 border-purple-500">
                            <AvatarImage src={user?.avatarUrl} />
                            <AvatarFallback className="bg-gradient-to-r from-purple-600 to-pink-600 text-white text-3xl">
                                {user?.username?.charAt(0).toUpperCase()}
                            </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                            <h1 className="text-3xl font-bold text-white">{user?.username}</h1>
                            <p className="text-slate-400">{user?.email}</p>
                            <div className="flex items-center gap-4 mt-3">
                                <Badge className={`bg-gradient-to-r ${rankColor} text-white px-4 py-1 text-lg`}>
                                    {stats?.currentRank || 'BRONZE'}
                                </Badge>
                                <span className="text-slate-400">Global Rank: #{stats?.globalRank || '-'}</span>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="text-5xl font-bold text-yellow-400">{stats?.totalPoints.toLocaleString() || 0}</p>
                            <p className="text-slate-400">Total Points</p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur-xl">
                    <CardContent className="pt-6 text-center">
                        <p className="text-4xl font-bold text-white">{stats?.completedTasks || 0}</p>
                        <p className="text-slate-400 mt-1">Tasks Completed</p>
                    </CardContent>
                </Card>
                <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur-xl">
                    <CardContent className="pt-6 text-center">
                        <p className="text-4xl font-bold text-white">{submissions.filter(s => s.status === 'SUBMITTED').length}</p>
                        <p className="text-slate-400 mt-1">Pending Review</p>
                    </CardContent>
                </Card>
                <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur-xl">
                    <CardContent className="pt-6 text-center">
                        <p className="text-4xl font-bold text-white">{submissions.length}</p>
                        <p className="text-slate-400 mt-1">Total Submissions</p>
                    </CardContent>
                </Card>
            </div>

            {/* Submissions History */}
            <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur-xl">
                <CardHeader>
                    <CardTitle className="text-white">My Submissions</CardTitle>
                    <CardDescription className="text-slate-400">Your task submission history</CardDescription>
                </CardHeader>
                <CardContent>
                    <Tabs defaultValue="all" className="w-full">
                        <TabsList className="bg-slate-700/50 border-slate-600">
                            <TabsTrigger value="all">All</TabsTrigger>
                            <TabsTrigger value="pending">Pending</TabsTrigger>
                            <TabsTrigger value="approved">Approved</TabsTrigger>
                            <TabsTrigger value="rejected">Rejected</TabsTrigger>
                        </TabsList>

                        {['all', 'pending', 'approved', 'rejected'].map((tab) => (
                            <TabsContent key={tab} value={tab} className="space-y-3 mt-4">
                                {submissions
                                    .filter(s => tab === 'all' ||
                                        (tab === 'pending' && s.status === 'SUBMITTED') ||
                                        (tab === 'approved' && s.status === 'APPROVED') ||
                                        (tab === 'rejected' && s.status === 'REJECTED')
                                    )
                                    .map((submission) => (
                                        <div
                                            key={submission.id}
                                            className="flex items-center justify-between p-4 rounded-lg bg-slate-700/30"
                                        >
                                            <div>
                                                <p className="font-medium text-white">{submission.task?.title}</p>
                                                <p className="text-sm text-slate-400">
                                                    Submitted: {submission.submittedAt ? new Date(submission.submittedAt).toLocaleDateString() : 'N/A'}
                                                </p>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <Badge className={statusColors[submission.status]}>
                                                    {submission.status}
                                                </Badge>
                                                {submission.status === 'APPROVED' && (
                                                    <span className="text-green-400 font-semibold">+{submission.task?.basePoints}</span>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                {submissions.filter(s => tab === 'all' ||
                                    (tab === 'pending' && s.status === 'SUBMITTED') ||
                                    (tab === 'approved' && s.status === 'APPROVED') ||
                                    (tab === 'rejected' && s.status === 'REJECTED')
                                ).length === 0 && (
                                        <p className="text-slate-500 text-center py-8">No submissions found</p>
                                    )}
                            </TabsContent>
                        ))}
                    </Tabs>
                </CardContent>
            </Card>
        </div>
    );
}
