'use client';

import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Coffee, Droplets, Moon } from 'lucide-react';

const REMINDERS = [
    { icon: Droplets, text: "Sip some water", color: "text-blue-400", bg: "bg-blue-400/10" },
    { icon: Moon, text: "Take a deep breath", color: "text-indigo-400", bg: "bg-indigo-400/10" },
    { icon: Coffee, text: "Stretch your legs", color: "text-orange-400", bg: "bg-orange-400/10" },
];

export function BioBreak() {
    const [isVisible, setIsVisible] = useState(true);
    const [reminder, setReminder] = useState(REMINDERS[0]);

    useEffect(() => {
        // Randomize reminder on mount
        setReminder(REMINDERS[Math.floor(Math.random() * REMINDERS.length)]);
    }, []);

    if (!isVisible) return null;

    const Icon = reminder.icon;

    return (
        <div className={cn(
            "fixed bottom-24 right-6 z-40 animate-in slide-in-from-bottom-10 fade-in duration-1000",
            "flex items-center gap-3 p-4 pr-6 rounded-full shadow-lg backdrop-blur-md border border-border/50",
            "bg-background/80 hover:bg-background/90 transition-colors cursor-pointer"
        )} onClick={() => setIsVisible(false)}>
            <div className={cn("p-2 rounded-full", reminder.bg)}>
                <Icon className={cn("w-5 h-5", reminder.color)} />
            </div>
            <div>
                <p className="text-sm font-medium text-foreground">Check-in</p>
                <p className="text-xs text-muted-foreground">{reminder.text}</p>
            </div>
        </div>
    );
}
