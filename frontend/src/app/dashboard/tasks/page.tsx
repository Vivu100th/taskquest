'use client';

import { useEffect, useState } from 'react';
import { api, Task, CreateTaskDto } from '@/lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Plus } from 'lucide-react';

const difficultyColors: Record<string, string> = {
    EASY: 'bg-green-500/20 text-green-400 border-green-500/50',
    MEDIUM: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50',
    HARD: 'bg-orange-500/20 text-orange-400 border-orange-500/50',
    EPIC: 'bg-purple-500/20 text-purple-400 border-purple-500/50',
};

const CATEGORIES = [
    { id: 'cat-health', name: 'Health & Fitness' },
    { id: 'cat-learning', name: 'Learning' },
    { id: 'cat-productivity', name: 'Productivity' },
    { id: 'cat-social', name: 'Social' },
];

export default function TasksPage() {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedTask, setSelectedTask] = useState<Task | null>(null);
    const [proofUrl, setProofUrl] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Create Task State
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [newTask, setNewTask] = useState<CreateTaskDto>({
        title: '',
        description: '',
        categoryId: 'cat-health',
        difficulty: 'EASY',
        basePoints: 10,
        requiresPhoto: true,
    });

    const fetchTasks = async () => {
        try {
            const data = await api.getTasks();
            setTasks(data);
        } catch (error) {
            console.error('Failed to fetch tasks:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchTasks();
    }, []);

    const handleSubmit = async () => {
        if (!selectedTask || !proofUrl) {
            toast.error('Please provide proof URL');
            return;
        }

        setIsSubmitting(true);
        try {
            await api.submitTask(selectedTask.id, { proofUrl });
            toast.success('Task submitted for review!');
            setSelectedTask(null);
            setProofUrl('');
        } catch (error) {
            toast.error(error instanceof Error ? error.message : 'Submission failed');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleCreateTask = async () => {
        if (!newTask.title) {
            toast.error('Please enter a task title');
            return;
        }

        setIsSubmitting(true);
        try {
            await api.createTask({
                ...newTask,
                basePoints: Number(newTask.basePoints),
            });
            toast.success('Task created successfully!');
            setIsCreateOpen(false);
            fetchTasks(); // Refresh list
            // Reset form
            setNewTask({
                title: '',
                description: '',
                categoryId: 'cat-health',
                difficulty: 'EASY',
                basePoints: 10,
                requiresPhoto: true,
            });
        } catch (error) {
            toast.error('Failed to create task');
        } finally {
            setIsSubmitting(false);
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
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-white">Available Tasks</h1>
                    <p className="text-slate-400 mt-1">Complete tasks to earn points and climb the leaderboard</p>
                </div>

                <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                    <DialogTrigger asChild>
                        <Button className="bg-purple-600 hover:bg-purple-700">
                            <Plus className="w-4 h-4 mr-2" />
                            Create Task
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="bg-slate-900 border-slate-700 max-w-md">
                        <DialogHeader>
                            <DialogTitle className="text-white">Create New Task</DialogTitle>
                            <DialogDescription>Define your own goal and earn points for completing it.</DialogDescription>
                        </DialogHeader>

                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label>Title</Label>
                                <Input
                                    value={newTask.title}
                                    onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                                    placeholder="e.g. Meditate for 10 mins"
                                    className="bg-slate-800 border-slate-700"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label>Category</Label>
                                <Select
                                    value={newTask.categoryId}
                                    onValueChange={(val) => setNewTask({ ...newTask, categoryId: val })}
                                >
                                    <SelectTrigger className="bg-slate-800 border-slate-700">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent className="bg-slate-800 border-slate-700">
                                        {CATEGORIES.map(cat => (
                                            <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Difficulty</Label>
                                    <Select
                                        value={newTask.difficulty}
                                        onValueChange={(val: any) => setNewTask({ ...newTask, difficulty: val })}
                                    >
                                        <SelectTrigger className="bg-slate-800 border-slate-700">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent className="bg-slate-800 border-slate-700">
                                            <SelectItem value="EASY">Easy (1.0x)</SelectItem>
                                            <SelectItem value="MEDIUM">Medium (1.5x)</SelectItem>
                                            <SelectItem value="HARD">Hard (2.0x)</SelectItem>
                                            <SelectItem value="EPIC">Epic (3.0x)</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label>Base Points</Label>
                                    <Input
                                        type="number"
                                        value={newTask.basePoints}
                                        onChange={(e) => setNewTask({ ...newTask, basePoints: Number(e.target.value) })}
                                        className="bg-slate-800 border-slate-700"
                                    />
                                </div>
                            </div>
                        </div>

                        <DialogFooter>
                            <Button onClick={handleCreateTask} disabled={isSubmitting} className="w-full bg-purple-600 hover:bg-purple-700">
                                {isSubmitting ? 'Creating...' : 'Create Task'}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {tasks.map((task) => (
                    <Card key={task.id} className="bg-slate-800/50 border-slate-700/50 backdrop-blur-xl hover:border-purple-500/50 transition-all">
                        <CardHeader>
                            <div className="flex items-start justify-between">
                                <div>
                                    <CardTitle className="text-white text-lg">{task.title}</CardTitle>
                                    <CardDescription className="text-slate-400">{task.category?.name}</CardDescription>
                                </div>
                                <Badge className={difficultyColors[task.difficulty]}>
                                    {task.difficulty}
                                </Badge>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {task.description && (
                                <p className="text-slate-400 text-sm">{task.description}</p>
                            )}

                            <div className="flex items-center gap-4 text-sm text-slate-400">
                                {task.requiresPhoto && <span>📷 Photo required</span>}
                                {task.requiresGps && <span>📍 Location required</span>}
                            </div>

                            <div className="flex items-center justify-between pt-4 border-t border-slate-700/50">
                                <div className="flex items-center gap-2">
                                    <span className="text-yellow-400 font-bold text-xl">+{task.basePoints}</span>
                                    <span className="text-slate-500 text-sm">points</span>
                                </div>

                                <Dialog>
                                    <DialogTrigger asChild>
                                        <Button
                                            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                                            onClick={() => setSelectedTask(task)}
                                        >
                                            Start Task
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent className="bg-slate-900 border-slate-700">
                                        <DialogHeader>
                                            <DialogTitle className="text-white">Submit Proof</DialogTitle>
                                            <DialogDescription className="text-slate-400">
                                                Upload your proof to complete: {selectedTask?.title}
                                            </DialogDescription>
                                        </DialogHeader>

                                        <div className="space-y-4 py-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="proofUrl" className="text-slate-200">Proof URL</Label>
                                                <Input
                                                    id="proofUrl"
                                                    placeholder="https://example.com/image.jpg"
                                                    value={proofUrl}
                                                    onChange={(e) => setProofUrl(e.target.value)}
                                                    className="bg-slate-800/50 border-slate-700 focus:border-purple-500"
                                                />
                                                <p className="text-xs text-slate-500">
                                                    Upload your image to a hosting service and paste the URL here
                                                </p>
                                            </div>
                                        </div>

                                        <DialogFooter>
                                            <Button
                                                onClick={handleSubmit}
                                                disabled={isSubmitting}
                                                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                                            >
                                                {isSubmitting ? 'Submitting...' : 'Submit for Review'}
                                            </Button>
                                        </DialogFooter>
                                    </DialogContent>
                                </Dialog>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {tasks.length === 0 && (
                <Card className="bg-slate-800/50 border-slate-700/50">
                    <CardContent className="py-12 text-center">
                        <p className="text-slate-400">No tasks available at the moment</p>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
