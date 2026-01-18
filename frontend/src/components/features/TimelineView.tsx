'use client';

import { Task } from "@/lib/api";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface TimelineViewProps {
    tasks: Task[];
    onTaskClick: (task: Task) => void;
}

export function TimelineView({ tasks, onTaskClick }: TimelineViewProps) {
    // Separate tasks into "Scheduled" and "Anytime"
    // For now, since most don't have time, we put them in "Today's Flow"

    return (
        <div className="relative space-y-8 pl-8 before:absolute before:inset-0 before:ml-5 before:h-full before:w-0.5 before:-translate-x-1/2 before:bg-gradient-to-b before:from-transparent before:via-muted-foreground/20 before:to-transparent">

            {/* Context Header */}
            <div className="relative">
                <span className="absolute -left-8 -top-1 flex h-6 w-6 items-center justify-center rounded-full ring-4 ring-background bg-primary/20">
                    <span className="h-2 w-2 rounded-full bg-primary" />
                </span>
                <h3 className="text-lg font-semibold text-primary mb-4">Today's Flow</h3>
            </div>

            <div className="space-y-4">
                {tasks.length === 0 ? (
                    <div className="p-4 rounded-2xl bg-muted/50 text-center text-muted-foreground italic border-2 border-dashed border-muted">
                        No tasks yet. Take a deep breath or add one!
                    </div>
                ) : (
                    tasks.map((task, index) => (
                        <div
                            key={task.id}
                            onClick={() => onTaskClick(task)}
                            className="group relative cursor-pointer transition-all hover:-translate-y-1"
                        >
                            {/* Connector Line Dot */}
                            <span className={cn(
                                "absolute -left-9 top-6 flex h-4 w-4 items-center justify-center rounded-full ring-4 ring-background transition-colors",
                                task.difficulty === 'EASY' ? "bg-green-400" :
                                    task.difficulty === 'MEDIUM' ? "bg-yellow-400" :
                                        task.difficulty === 'HARD' ? "bg-orange-400" : "bg-purple-400"
                            )} />

                            <div className={cn(
                                "rounded-2xl p-5 border shadow-sm transition-all hover:shadow-md",
                                "bg-card border-border/50",
                                // Pastel background tints based on category or just alternating
                                index % 3 === 0 ? "bg-[oklch(0.98_0.01_350)] dark:bg-[oklch(0.2_0.02_350)]" : // Pinkish
                                    index % 3 === 1 ? "bg-[oklch(0.98_0.01_160)] dark:bg-[oklch(0.2_0.02_160)]" : // Mint
                                        "bg-[oklch(0.98_0.01_240)] dark:bg-[oklch(0.2_0.02_240)]" // Blue
                            )}>
                                <div className="flex justify-between items-start mb-2">
                                    <div className="flex flex-col">
                                        <span className="text-lg font-bold text-foreground group-hover:text-primary transition-colors">
                                            {task.title}
                                        </span>
                                        <span className="text-sm text-muted-foreground">
                                            {task.duration ? `${task.duration} min` : 'Anytime'} • {task.category?.name}
                                        </span>
                                    </div>
                                    <span className="font-bold text-primary/80">+{task.basePoints}</span>
                                </div>

                                {task.description && (
                                    <p className="text-sm text-muted-foreground line-clamp-2">
                                        {task.description}
                                    </p>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Future Indicator */}
            <div className="relative pt-4">
                <span className="absolute -left-8 top-5 flex h-4 w-4 items-center justify-center rounded-full ring-4 ring-background bg-muted"></span>
                <span className="text-sm text-muted-foreground italic">More coming tomorrow...</span>
            </div>
        </div>
    );
}
