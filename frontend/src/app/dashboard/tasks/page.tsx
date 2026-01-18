'use client';

import { useEffect, useState } from 'react';
import { api, Task, CreateTaskDto } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { Plus, X } from 'lucide-react';
import { TimelineView } from '@/components/features/TimelineView';
import { TaskDetailSheet } from '@/components/features/TaskDetailSheet';
import { BioBreak } from '@/components/features/BioBreak';
import { IconPicker } from '@/components/features/IconPicker';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

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
        categoryId: 'cat-productivity',
        difficulty: 'EASY',
        basePoints: 10,
        requiresPhoto: true,
        icon: '📝',
        duration: 60,
        isAllDay: false,
        startTime: new Date().toISOString(),
    });

    const [timeChip, setTimeChip] = useState<'ALL_DAY' | 'MORNING' | 'NOON' | 'AFTERNOON'>('MORNING');

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

    // Handle Time Chip Selection
    const handleTimeChip = (chip: typeof timeChip) => {
        setTimeChip(chip);
        const now = new Date();
        const start = new Date(newTask.startTime || now);

        if (chip === 'ALL_DAY') {
            setNewTask({ ...newTask, isAllDay: true });
        } else {
            if (chip === 'MORNING') start.setHours(9, 0, 0, 0);
            if (chip === 'NOON') start.setHours(12, 0, 0, 0);
            if (chip === 'AFTERNOON') start.setHours(14, 0, 0, 0);
            setNewTask({ ...newTask, isAllDay: false, startTime: start.toISOString() });
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
                categoryId: 'cat-productivity',
                difficulty: 'EASY',
                basePoints: 10,
                requiresPhoto: true,
                icon: '📝',
                duration: 60,
                isAllDay: false,
                startTime: new Date().toISOString(),
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
                        <Button size="icon" className="h-14 w-14 rounded-full shadow-xl bg-primary hover:bg-primary/90 text-primary-foreground transition-transform hover:scale-105">
                            <Plus className="w-7 h-7" />
                        </Button>
                    </DialogTrigger>
                    {/* Concetp.html inspired Dialog */}
                    <DialogContent className="bg-background border-none rounded-[40px] p-0 overflow-hidden sm:max-w-[450px] shadow-[0_30px_60px_rgba(0,0,0,0.12)]">
                        <div className="p-6 pb-2 flex justify-between items-center bg-white dark:bg-slate-900/50">
                            <h3 className="text-xl font-extrabold text-slate-800 dark:text-slate-100">Task Info</h3>
                        </div>

                        <div className="px-6 py-4 space-y-6 max-h-[80vh] overflow-y-auto custom-scrollbar">

                            {/* Icon & Title Row */}
                            <div className="flex gap-4 items-start">
                                <IconPicker
                                    icon={newTask.icon || '📝'}
                                    onChange={(icon) => setNewTask({ ...newTask, icon })}
                                />
                                <div className="flex-1 space-y-2">
                                    <Label className="text-xs font-bold text-slate-500 uppercase tracking-wide ml-1">Task Name</Label>
                                    <Input
                                        value={newTask.title}
                                        onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                                        placeholder="E.g. Finish Web Design"
                                        className="bg-slate-50 border-slate-100 rounded-2xl h-14 text-lg focus-visible:ring-indigo-500"
                                        autoFocus
                                    />
                                </div>
                            </div>

                            {/* Time Chips */}
                            <div className="space-y-2">
                                <Label className="text-xs font-bold text-slate-500 uppercase tracking-wide ml-1">Time of Day</Label>
                                <div className="flex flex-wrap gap-2">
                                    {['ALL_DAY', 'MORNING', 'NOON', 'AFTERNOON'].map((t) => (
                                        <div
                                            key={t}
                                            onClick={() => handleTimeChip(t as any)}
                                            className={cn(
                                                "px-4 py-2.5 rounded-2xl text-sm font-bold cursor-pointer transition-all border-2",
                                                timeChip === t
                                                    ? "bg-indigo-50/50 text-indigo-600 border-indigo-500"
                                                    : "bg-slate-50 text-slate-500 border-transparent hover:bg-slate-100"
                                            )}
                                        >
                                            {t === 'ALL_DAY' ? 'All Day' : t === 'MORNING' ? 'Morning' : t === 'NOON' ? 'Noon' : 'Afternoon'}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Date & Duration Grid */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label className="text-xs font-bold text-slate-500 uppercase tracking-wide ml-1">Date</Label>
                                    <Input
                                        type="date"
                                        value={newTask.startTime ? format(new Date(newTask.startTime), 'yyyy-MM-dd') : ''}
                                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                            const d = new Date(e.target.value);
                                            // Preserve time
                                            const current = new Date(newTask.startTime || new Date());
                                            d.setHours(current.getHours(), current.getMinutes());
                                            setNewTask({ ...newTask, startTime: d.toISOString() });
                                        }}
                                        className="bg-slate-50 border-slate-100 rounded-2xl h-12"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-xs font-bold text-slate-500 uppercase tracking-wide ml-1">Duration (Min)</Label>
                                    <Input
                                        type="number"
                                        value={newTask.duration}
                                        onChange={(e) => setNewTask({ ...newTask, duration: Number(e.target.value) })}
                                        className="bg-slate-50 border-slate-100 rounded-2xl h-12"
                                    />
                                </div>
                            </div>

                            {/* Description / Notes */}
                            <div className="space-y-2">
                                <Label className="text-xs font-bold text-slate-500 uppercase tracking-wide ml-1">Notes</Label>
                                <Textarea
                                    value={newTask.description}
                                    onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                                    placeholder="Add details..."
                                    className="bg-slate-50 border-slate-100 rounded-2xl min-h-[100px] resize-none focus-visible:ring-indigo-500"
                                />
                            </div>

                        </div>

                        <div className="p-6 pt-2 bg-background">
                            <Button
                                onClick={handleCreateTask}
                                disabled={isSubmitting}
                                className="w-full h-14 text-lg font-bold rounded-2xl bg-indigo-500 hover:bg-indigo-600 shadow-lg shadow-indigo-200 dark:shadow-none"
                            >
                                {isSubmitting ? 'Creating...' : 'Create Task'}
                            </Button>
                        </div>
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
                onDelete={fetchTasks}
            />

            {/* Hidden dialog for submission logic re-use if needed later */}
            <Dialog open={!!(selectedTask && proofUrl === 'TRIGGER_SUBMIT')} onOpenChange={() => setProofUrl('')}>
            </Dialog>
            <BioBreak />
        </div >
    );
}
