'use client';

import { useEffect, useState } from 'react';
import { api, Task, CreateTaskDto } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Plus } from 'lucide-react';
import { TimelineView } from '@/components/features/TimelineView';
import { TaskDetailSheet } from '@/components/features/TaskDetailSheet';

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
        <div className="space-y-8 max-w-2xl mx-auto pb-20">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-foreground">My Day</h1>
                    <p className="text-muted-foreground mt-1 text-lg">Focus on what matters now.</p>
                </div>

                <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                    <DialogTrigger asChild>
                        <Button size="icon" className="h-12 w-12 rounded-full shadow-lg bg-primary hover:bg-primary/90 text-primary-foreground">
                            <Plus className="w-6 h-6" />
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="bg-card border-border sm:max-w-md">
                        <DialogHeader>
                            <DialogTitle>Quick Add</DialogTitle>
                            <DialogDescription>Brain dump your task. We'll help you organize it.</DialogDescription>
                        </DialogHeader>

                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label>What needs doing?</Label>
                                <Input
                                    value={newTask.title}
                                    onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                                    placeholder="e.g. Clean the room"
                                    className="bg-input border-transparent text-lg h-12"
                                    autoFocus
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Category</Label>
                                    <Select
                                        value={newTask.categoryId}
                                        onValueChange={(val) => setNewTask({ ...newTask, categoryId: val })}
                                    >
                                        <SelectTrigger className="bg-input border-transparent">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {CATEGORIES.map(cat => (
                                                <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label>Difficulty</Label>
                                    <Select
                                        value={newTask.difficulty}
                                        onValueChange={(val: any) => setNewTask({ ...newTask, difficulty: val })}
                                    >
                                        <SelectTrigger className="bg-input border-transparent">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="EASY">Easy</SelectItem>
                                            <SelectItem value="MEDIUM">Medium</SelectItem>
                                            <SelectItem value="HARD">Hard</SelectItem>
                                            <SelectItem value="EPIC">Epic</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </div>

                        <DialogFooter>
                            <Button onClick={handleCreateTask} disabled={isSubmitting} className="w-full h-12 text-lg rounded-xl">
                                {isSubmitting ? 'Adding...' : 'Add to Timeline'}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            <TimelineView
                tasks={tasks}
                onTaskClick={setSelectedTask}
            />

            <TaskDetailSheet
                task={selectedTask}
                open={!!selectedTask}
                onOpenChange={(open) => !open && setSelectedTask(null)}
                onStart={() => {
                    toast.info("Task Started! Good luck.");
                }}
            />

            {/* Hidden dialog for submission logic re-use if needed later */}
            <Dialog open={!!(selectedTask && proofUrl === 'TRIGGER_SUBMIT')} onOpenChange={() => setProofUrl('')}>
            </Dialog>
        </div >
    );
}
