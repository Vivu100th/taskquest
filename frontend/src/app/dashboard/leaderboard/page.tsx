'use client';

import { useEffect, useState } from 'react';
import { api, LeaderboardEntry } from '@/lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';

const rankColors: Record<string, string> = {
    BRONZE: 'from-amber-700 to-amber-500',
    SILVER: 'from-slate-400 to-slate-300',
    GOLD: 'from-yellow-500 to-yellow-300',
    PLATINUM: 'from-cyan-400 to-cyan-200',
    DIAMOND: 'from-blue-500 to-purple-400',
    MASTER: 'from-purple-600 to-pink-500',
};

export default function LeaderboardPage() {
    const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const data = await api.getLeaderboard(50);
                setLeaderboard(data);
            } catch (error) {
                console.error('Failed to fetch leaderboard:', error);
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

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                    <span>🏆</span> Leaderboard
                </h1>
                <p className="text-slate-400 mt-1">Top players ranked by total points</p>
            </div>

            {/* Top 3 Podium */}
            {leaderboard.length >= 3 && (
                <div className="grid grid-cols-3 gap-4 mb-8">
                    {/* 2nd Place */}
                    <div className="order-1 pt-8">
                        <Card className="bg-gradient-to-b from-slate-500/20 to-slate-600/10 border-slate-500/30 text-center">
                            <CardContent className="pt-6">
                                <div className="relative">
                                    <Avatar className="h-20 w-20 mx-auto border-4 border-slate-400">
                                        <AvatarImage src={leaderboard[1]?.avatarUrl} />
                                        <AvatarFallback className="bg-gradient-to-r from-slate-400 to-slate-300 text-slate-800 text-2xl">
                                            {leaderboard[1]?.username.charAt(0).toUpperCase()}
                                        </AvatarFallback>
                                    </Avatar>
                                    <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 text-3xl">🥈</span>
                                </div>
                                <h3 className="mt-6 font-bold text-white text-lg">{leaderboard[1]?.username}</h3>
                                <Badge className={`bg-gradient-to-r ${rankColors[leaderboard[1]?.currentRank] || rankColors.BRONZE} text-white mt-2`}>
                                    {leaderboard[1]?.currentRank}
                                </Badge>
                                <p className="text-2xl font-bold text-yellow-400 mt-3">{leaderboard[1]?.totalPoints.toLocaleString()}</p>
                            </CardContent>
                        </Card>
                    </div>

                    {/* 1st Place */}
                    <div className="order-2">
                        <Card className="bg-gradient-to-b from-yellow-500/20 to-yellow-600/10 border-yellow-500/30 text-center transform scale-105">
                            <CardContent className="pt-6">
                                <div className="relative">
                                    <Avatar className="h-24 w-24 mx-auto border-4 border-yellow-400">
                                        <AvatarImage src={leaderboard[0]?.avatarUrl} />
                                        <AvatarFallback className="bg-gradient-to-r from-yellow-500 to-yellow-300 text-yellow-900 text-3xl">
                                            {leaderboard[0]?.username.charAt(0).toUpperCase()}
                                        </AvatarFallback>
                                    </Avatar>
                                    <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 text-4xl">🥇</span>
                                </div>
                                <h3 className="mt-6 font-bold text-white text-xl">{leaderboard[0]?.username}</h3>
                                <Badge className={`bg-gradient-to-r ${rankColors[leaderboard[0]?.currentRank] || rankColors.BRONZE} text-white mt-2`}>
                                    {leaderboard[0]?.currentRank}
                                </Badge>
                                <p className="text-3xl font-bold text-yellow-400 mt-3">{leaderboard[0]?.totalPoints.toLocaleString()}</p>
                            </CardContent>
                        </Card>
                    </div>

                    {/* 3rd Place */}
                    <div className="order-3 pt-12">
                        <Card className="bg-gradient-to-b from-amber-700/20 to-amber-800/10 border-amber-700/30 text-center">
                            <CardContent className="pt-6">
                                <div className="relative">
                                    <Avatar className="h-16 w-16 mx-auto border-4 border-amber-600">
                                        <AvatarImage src={leaderboard[2]?.avatarUrl} />
                                        <AvatarFallback className="bg-gradient-to-r from-amber-700 to-amber-500 text-white text-xl">
                                            {leaderboard[2]?.username.charAt(0).toUpperCase()}
                                        </AvatarFallback>
                                    </Avatar>
                                    <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 text-2xl">🥉</span>
                                </div>
                                <h3 className="mt-6 font-bold text-white">{leaderboard[2]?.username}</h3>
                                <Badge className={`bg-gradient-to-r ${rankColors[leaderboard[2]?.currentRank] || rankColors.BRONZE} text-white mt-2`}>
                                    {leaderboard[2]?.currentRank}
                                </Badge>
                                <p className="text-xl font-bold text-yellow-400 mt-3">{leaderboard[2]?.totalPoints.toLocaleString()}</p>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            )}

            {/* Full Leaderboard */}
            <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur-xl">
                <CardHeader>
                    <CardTitle className="text-white">All Rankings</CardTitle>
                    <CardDescription className="text-slate-400">Complete leaderboard</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-2">
                        {leaderboard.map((entry, index) => (
                            <div
                                key={entry.id}
                                className={`flex items-center gap-4 p-4 rounded-lg transition-colors ${index < 3 ? 'bg-gradient-to-r from-purple-500/10 to-pink-500/10' : 'bg-slate-700/30 hover:bg-slate-700/50'
                                    }`}
                            >
                                <span className="text-2xl w-12 text-center font-bold text-slate-400">
                                    {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${index + 1}`}
                                </span>
                                <Avatar className="h-12 w-12 border-2 border-slate-600">
                                    <AvatarImage src={entry.avatarUrl} />
                                    <AvatarFallback className="bg-gradient-to-r from-purple-600 to-pink-600 text-white">
                                        {entry.username.charAt(0).toUpperCase()}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="flex-1">
                                    <p className="font-semibold text-white">{entry.username}</p>
                                    <Badge className={`bg-gradient-to-r ${rankColors[entry.currentRank] || rankColors.BRONZE} text-white text-xs`}>
                                        {entry.currentRank}
                                    </Badge>
                                </div>
                                <div className="text-right">
                                    <p className="text-2xl font-bold text-yellow-400">{entry.totalPoints.toLocaleString()}</p>
                                    <p className="text-xs text-slate-500">points</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {leaderboard.length === 0 && (
                <Card className="bg-slate-800/50 border-slate-700/50">
                    <CardContent className="py-12 text-center">
                        <p className="text-slate-400">No players yet. Be the first!</p>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
