'use client';

import { useEffect, useState } from 'react';
import { api, UserTask } from '@/lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { toast } from 'sonner';

export default function AdminSubmissionsPage() {
    const [submissions, setSubmissions] = useState<UserTask[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [processingId, setProcessingId] = useState<string | null>(null);

    const fetchSubmissions = async () => {
        try {
            const data = await api.getPendingSubmissions();
            setSubmissions(data);
        } catch (error) {
            console.error('Failed to fetch submissions:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchSubmissions();
    }, []);

    const handleReview = async (id: string, status: 'APPROVED' | 'REJECTED') => {
        setProcessingId(id);
        try {
            await api.reviewSubmission(id, status);
            toast.success(`Submission ${status.toLowerCase()}`);
            setSubmissions(prev => prev.filter(s => s.id !== id));
        } catch (error) {
            toast.error(error instanceof Error ? error.message : 'Review failed');
        } finally {
            setProcessingId(null);
        }
    };

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
                    <span>✅</span> Review Submissions
                </h1>
                <p className="text-slate-400 mt-1">Approve or reject user task submissions</p>
            </div>

            <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur-xl">
                <CardHeader>
                    <CardTitle className="text-white">Pending Submissions ({submissions.length})</CardTitle>
                    <CardDescription className="text-slate-400">Tasks waiting for your review</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {submissions.length === 0 ? (
                        <div className="py-12 text-center">
                            <span className="text-4xl mb-4 block">🎉</span>
                            <p className="text-slate-400">All caught up! No pending submissions.</p>
                        </div>
                    ) : (
                        submissions.map((submission) => (
                            <div
                                key={submission.id}
                                className="p-6 rounded-lg bg-slate-700/30 border border-slate-600/50"
                            >
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex items-center gap-4">
                                        <Avatar className="h-12 w-12 border-2 border-slate-600">
                                            <AvatarImage src={submission.user?.avatarUrl} />
                                            <AvatarFallback className="bg-gradient-to-r from-purple-600 to-pink-600 text-white">
                                                {submission.user?.username?.charAt(0).toUpperCase()}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <p className="font-semibold text-white">{submission.user?.username}</p>
                                            <p className="text-sm text-slate-400">{submission.user?.email}</p>
                                        </div>
                                    </div>
                                    <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/50">
                                        PENDING
                                    </Badge>
                                </div>

                                <div className="mb-4">
                                    <h3 className="font-semibold text-white text-lg">{submission.task?.title}</h3>
                                    <p className="text-sm text-slate-400">{submission.task?.description}</p>
                                    <div className="flex items-center gap-4 mt-2">
                                        <Badge variant="outline" className="border-purple-500/50 text-purple-400">
                                            {submission.task?.difficulty}
                                        </Badge>
                                        <span className="text-yellow-400 font-semibold">+{submission.task?.basePoints} points</span>
                                    </div>
                                </div>

                                {/* Proof */}
                                <div className="mb-4 p-4 bg-slate-800/50 rounded-lg">
                                    <p className="text-sm text-slate-400 mb-2">Proof submitted:</p>
                                    {submission.proofUrl && (
                                        <a
                                            href={submission.proofUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-purple-400 hover:text-purple-300 underline break-all"
                                        >
                                            {submission.proofUrl}
                                        </a>
                                    )}
                                    <p className="text-xs text-slate-500 mt-2">
                                        Submitted: {submission.submittedAt ? new Date(submission.submittedAt).toLocaleString() : 'N/A'}
                                    </p>
                                </div>

                                {/* Actions */}
                                <div className="flex gap-3">
                                    <Button
                                        onClick={() => handleReview(submission.id, 'APPROVED')}
                                        disabled={processingId === submission.id}
                                        className="flex-1 bg-green-600 hover:bg-green-700"
                                    >
                                        {processingId === submission.id ? 'Processing...' : '✓ Approve'}
                                    </Button>
                                    <Button
                                        onClick={() => handleReview(submission.id, 'REJECTED')}
                                        disabled={processingId === submission.id}
                                        variant="destructive"
                                        className="flex-1"
                                    >
                                        {processingId === submission.id ? 'Processing...' : '✗ Reject'}
                                    </Button>
                                </div>
                            </div>
                        ))
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
