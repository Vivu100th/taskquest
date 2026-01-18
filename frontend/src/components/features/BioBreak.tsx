'use client';

import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

const REMINDERS = [
    { text: "Sip some water", color: "text-blue-400", bg: "bg-blue-400/20" },
    { text: "Take a deep breath", color: "text-indigo-400", bg: "bg-indigo-400/20" },
    { text: "Stretch your legs", color: "text-orange-400", bg: "bg-orange-400/20" },
];

export function BioBreak() {
    const [isVisible, setIsVisible] = useState(true);
    const [reminder, setReminder] = useState(REMINDERS[0]);

    useEffect(() => {
        // Randomize reminder on mount
        setReminder(REMINDERS[Math.floor(Math.random() * REMINDERS.length)]);
    }, []);

    if (!isVisible) return null;

    return (
        <div className={cn(
            "fixed bottom-24 right-6 z-40 animate-in slide-in-from-bottom-10 fade-in duration-1000",
            "flex items-center gap-3 p-4 pr-6 rounded-full shadow-sm backdrop-blur-md border border-border/50",
            "bg-background/90 hover:bg-background transition-colors cursor-pointer"
        )} onClick={() => setIsVisible(false)}>
            <div className={cn("h-3 w-3 rounded-full ml-1", reminder.bg.replace('/20', ''))} />
            <div>
                <p className="text-sm font-medium text-foreground">Check-in</p>
                <p className="text-xs text-muted-foreground">{reminder.text}</p>
            </div>
        </div>
    );
}
