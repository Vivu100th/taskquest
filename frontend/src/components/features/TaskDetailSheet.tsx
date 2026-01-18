'use client';

import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Task } from "@/lib/api";
import { Play, CheckCircle2, Clock, MapPin, Camera } from "lucide-react";

interface TaskDetailSheetProps {
    task: Task | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onStart: (task: Task) => void;
}

export function TaskDetailSheet({ task, open, onOpenChange, onStart }: TaskDetailSheetProps) {
    if (!task) return null;

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent className="w-full sm:max-w-md bg-background border-l border-border/50">
                <SheetHeader className="space-y-4">
                    <div className="flex items-center justify-between">
                        <Badge variant="outline" className={`
                            px-3 py-1 text-sm font-medium rounded-full
                            ${task.difficulty === 'EASY' ? 'bg-green-500/10 text-green-500 border-green-500/20' : ''}
                            ${task.difficulty === 'MEDIUM' ? 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20' : ''}
                            ${task.difficulty === 'HARD' ? 'bg-orange-500/10 text-orange-500 border-orange-500/20' : ''}
                            ${task.difficulty === 'EPIC' ? 'bg-purple-500/10 text-purple-500 border-purple-500/20' : ''}
                        `}>
                            {task.difficulty}
                        </Badge>
                        <span className="text-2xl font-bold text-primary">+{task.basePoints} pts</span>
                    </div>

                    <div>
                        <SheetTitle className="text-2xl font-bold">{task.title}</SheetTitle>
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
                        className="w-full h-14 text-lg font-bold rounded-2xl shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all"
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
