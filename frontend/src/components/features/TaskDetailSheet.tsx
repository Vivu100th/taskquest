'use client';

import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Task } from "@/lib/api";
import { Play, CheckCircle2, Clock, MapPin, Camera, Trash2 } from "lucide-react";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { useState } from "react";

interface TaskDetailSheetProps {
    task: Task | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onStart: (task: Task) => void;
    onDelete?: () => void; // Callback to refresh list
}

export function TaskDetailSheet({ task, open, onOpenChange, onStart, onDelete }: TaskDetailSheetProps) {
    const [isDeleting, setIsDeleting] = useState(false);

    if (!task) return null;

    const handleDelete = async () => {
        if (!confirm('Are you sure you want to delete this task?')) return;

        setIsDeleting(true);
        try {
            await api.deleteTask(task.id);
            toast.success('Task deleted successfully');
            onOpenChange(false);
            if (onDelete) onDelete();
        } catch (error) {
            toast.error('Failed to delete task');
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent className="w-full sm:max-w-md bg-background border-l border-border/50">
                <SheetHeader className="space-y-4">
                    <div className="flex items-center justify-between pr-10">
                        <Badge variant="outline" className={`
                            px-3 py-1 text-sm font-medium rounded-full
                            ${task.difficulty === 'EASY' ? 'bg-green-500/10 text-green-500 border-green-500/20' : ''}
                            ${task.difficulty === 'MEDIUM' ? 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20' : ''}
                            ${task.difficulty === 'HARD' ? 'bg-orange-500/10 text-orange-500 border-orange-500/20' : ''}
                            ${task.difficulty === 'EPIC' ? 'bg-purple-500/10 text-purple-500 border-purple-500/20' : ''}
                        `}>
                            {task.difficulty}
                        </Badge>
                        <div className="flex items-center gap-3">
                            <span className="text-2xl font-bold text-primary">+{task.basePoints} pts</span>

                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={handleDelete}
                                disabled={isDeleting || !task.creatorId}
                                className={`h-8 w-8 rounded-full transition-colors relative z-50 ${task.creatorId
                                    ? "text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                                    : "text-muted-foreground/30 cursor-not-allowed"
                                    }`}
                                title={task.creatorId ? "Delete Task" : "Cannot delete system tasks"}
                            >
                                <Trash2 className="w-5 h-5" />
                            </Button>
                        </div>
                    </div>

                    <div>
                        <SheetTitle className="text-2xl font-bold text-foreground">{task.title}</SheetTitle>
                        <SheetDescription className="text-base text-muted-foreground mt-2">
                            {task.description || "No description provided."}
                        </SheetDescription>
                    </div>
                </SheetHeader>

                <div className="py-8 space-y-6">
                    {/* Requirements */}
                    <div className="flex gap-4">
                        {task.requiresPhoto && (
                            <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted px-3 py-1.5 rounded-full">
                                <Camera className="w-4 h-4" />
                                Photo Required
                            </div>
                        )}
                        {task.requiresGps && (
                            <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted px-3 py-1.5 rounded-full">
                                <MapPin className="w-4 h-4" />
                                GPS Required
                            </div>
                        )}
                    </div>

                    {/* Breakdown / Checklist Placeholder (AI feature would go here) */}
                    <div className="space-y-3">
                        <h4 className="font-semibold text-foreground flex items-center gap-2">
                            <CheckCircle2 className="w-5 h-5 text-primary" />
                            Steps
                        </h4>
                        <div className="space-y-2 pl-2 border-l-2 border-muted">
                            <div className="pl-4 py-2 text-muted-foreground text-sm">
                                1. Prepare materials
                            </div>
                            <div className="pl-4 py-2 text-muted-foreground text-sm">
                                2. Execute task
                            </div>
                            <div className="pl-4 py-2 text-muted-foreground text-sm">
                                3. Upload proof
                            </div>
                        </div>
                    </div>
                </div>

                <SheetFooter className="absolute bottom-6 left-6 right-6">
                    <Button
                        size="lg"
                        className="w-full h-14 text-lg font-bold rounded-2xl bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all"
                        onClick={() => onStart(task)}
                    >
                        <Play className="w-5 h-5 mr-2 fill-current" />
                        Start Now
                    </Button>
                </SheetFooter>
            </SheetContent>
        </Sheet>
    );
}
