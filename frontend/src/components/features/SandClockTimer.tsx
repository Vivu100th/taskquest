import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Play, Pause, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface SandClockTimerProps {
    initialMinutes?: number;
    onComplete?: () => void;
    onClose?: () => void;
}

export function SandClockTimer({ initialMinutes = 25, onComplete, onClose }: SandClockTimerProps) {
    const MAX_MINUTES = 60;
    const RADIUS = 130;
    const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

    const [totalSeconds, setTotalSeconds] = useState(initialMinutes * 60);
    const [currentSeconds, setCurrentSeconds] = useState(initialMinutes * 60);
    const [isRunning, setIsRunning] = useState(false);
    const [isDragging, setIsDragging] = useState(false);

    const knobContainerRef = useRef<HTMLDivElement>(null);
    const alarmAudioRef = useRef<HTMLAudioElement | null>(null);

    // Initialize audio
    useEffect(() => {
        if (typeof window !== 'undefined') {
            alarmAudioRef.current = new Audio('https://actions.google.com/sounds/v1/alarms/beep_short.ogg');
        }
    }, []);

    // Timer Logic
    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (isRunning && currentSeconds > 0) {
            interval = setInterval(() => {
                setCurrentSeconds(prev => {
                    if (prev <= 1) {
                        setIsRunning(false);
                        if (onComplete) onComplete();
                        alarmAudioRef.current?.play().catch(() => { });
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        } else if (currentSeconds === 0 && isRunning) {
            setIsRunning(false);
            if (onComplete) onComplete();
        }
        return () => clearInterval(interval);
    }, [isRunning, currentSeconds, onComplete]);

    // Calculations for display
    const minutes = Math.floor(currentSeconds / 60);
    const seconds = currentSeconds % 60;
    const displayTime = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

    const percentCircle = Math.min(currentSeconds / (MAX_MINUTES * 60), 1);
    const offset = CIRCUMFERENCE - (percentCircle * CIRCUMFERENCE);

    // Knob Position
    const angle = percentCircle * 2 * Math.PI;
    const knobX = 150 + 130 * Math.sin(angle);
    const knobY = 150 - 130 * Math.cos(angle);

    // Sand Gradient Logic
    const sessionProgress = totalSeconds > 0 ? 1 - (currentSeconds / totalSeconds) : 0;
    const topLevel = `${sessionProgress * 100}%`;
    const bottomLevel = `${100 - (sessionProgress * 100)}%`;

    // Drag Handlers
    const handleDrag = useCallback((clientX: number, clientY: number) => {
        if (!knobContainerRef.current) return;
        const rect = knobContainerRef.current.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;

        const dx = clientX - centerX;
        const dy = clientY - centerY;

        let angleRad = Math.atan2(dy, dx);
        angleRad += Math.PI / 2; // Shift to 12 o'clock

        if (angleRad < 0) angleRad += 2 * Math.PI;

        const percent = angleRad / (2 * Math.PI);
        let mins = percent * MAX_MINUTES;
        mins = Math.round(mins);
        if (mins < 1) mins = 1;

        const newSeconds = mins * 60;
        setCurrentSeconds(newSeconds);
        if (!isRunning) {
            setTotalSeconds(newSeconds);
        }
    }, [isRunning]);

    const onMouseDown = (e: React.MouseEvent) => {
        setIsDragging(true);
        setIsRunning(false);
        handleDrag(e.clientX, e.clientY);
    };

    const onTouchStart = (e: React.TouchEvent) => {
        setIsDragging(true);
        setIsRunning(false);
        handleDrag(e.touches[0].clientX, e.touches[0].clientY);
    };

    useEffect(() => {
        const onMove = (e: MouseEvent) => {
            if (isDragging) handleDrag(e.clientX, e.clientY);
        };
        const onUp = () => setIsDragging(false);

        const onTouchMove = (e: TouchEvent) => {
            if (isDragging) {
                e.preventDefault();
                handleDrag(e.touches[0].clientX, e.touches[0].clientY);
            }
        };
        const onTouchEnd = () => setIsDragging(false);

        if (isDragging) {
            window.addEventListener('mousemove', onMove);
            window.addEventListener('mouseup', onUp);
            window.addEventListener('touchmove', onTouchMove, { passive: false });
            window.addEventListener('touchend', onTouchEnd);
        }
        return () => {
            window.removeEventListener('mousemove', onMove);
            window.removeEventListener('mouseup', onUp);
            window.removeEventListener('touchmove', onTouchMove);
            window.removeEventListener('touchend', onTouchEnd);
        };
    }, [isDragging, handleDrag]);

    return (
        <div className="flex flex-col items-center gap-8 p-8 bg-card/95 backdrop-blur-xl rounded-[40px] shadow-2xl relative w-full h-full max-w-md mx-auto border border-border/50">
            {/* Removed top right close button to fix duplicate */}

            <div className="text-center space-y-2">
                <h1 className="text-2xl font-bold tracking-widest text-primary uppercase">Focus Mode</h1>
                <p className="text-muted-foreground text-sm">Drag ring to set timer</p>
            </div>

            {/* Timer Circle */}
            <div className="relative w-[300px] h-[300px] flex items-center justify-center shrink-0">
                {/* SVG Background Ring */}
                <svg className="absolute top-0 left-0 w-full h-full transform -rotate-90 pointer-events-none" viewBox="0 0 300 300">
                    <circle cx="150" cy="150" r="130" fill="none" stroke="currentColor" className="text-muted/30" strokeWidth="12" strokeLinecap="round" />
                </svg>

                {/* SVG Progress Ring */}
                <svg className="absolute top-0 left-0 w-full h-full transform -rotate-90 pointer-events-none drop-shadow-[0_0_15px_rgba(99,102,241,0.3)]" viewBox="0 0 300 300">
                    <circle
                        cx="150" cy="150" r="130"
                        fill="none"
                        stroke="currentColor"
                        className="text-primary transition-all duration-75 ease-linear"
                        strokeWidth="12"
                        strokeLinecap="round"
                        strokeDasharray={CIRCUMFERENCE}
                        strokeDashoffset={offset}
                    />
                </svg>

                {/* Knob */}
                <div
                    ref={knobContainerRef}
                    className="absolute w-full h-full cursor-grab active:cursor-grabbing rounded-full touch-none z-20"
                    onMouseDown={onMouseDown}
                    onTouchStart={onTouchStart}
                >
                    <div
                        className={cn(
                            "absolute w-8 h-8 bg-background border-4 border-primary rounded-full shadow-[0_0_20px_rgba(99,102,241,0.4)] transform -translate-x-1/2 -translate-y-1/2 transition-transform",
                            isDragging && "scale-125 ring-4 ring-primary/20"
                        )}
                        style={{ left: knobX, top: knobY }}
                    />
                </div>

                {/* Center Content: Hourglass & Time */}
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-10">

                    {/* Hourglass SVG */}
                    <div className="w-16 h-20 relative mb-4 opacity-90 scale-90">
                        <svg viewBox="0 0 100 160" className="w-full h-full drop-shadow-md">
                            <defs>
                                <linearGradient id="sandTop" x1="0%" y1="0%" x2="0%" y2="100%">
                                    <stop offset="0%" stopColor="currentColor" className="text-primary" />
                                    <stop offset={topLevel} stopColor="currentColor" className="text-primary" />
                                    <stop offset={topLevel} stopColor="transparent" />
                                </linearGradient>
                                <linearGradient id="sandBottom" x1="0%" y1="100%" x2="0%" y2="0%">
                                    <stop offset="0%" stopColor="currentColor" className="text-primary" />
                                    <stop offset={bottomLevel} stopColor="currentColor" className="text-primary" />
                                    <stop offset={bottomLevel} stopColor="transparent" />
                                </linearGradient>
                            </defs>

                            {/* Frame */}
                            <path d="M10,2 L90,2 C95,2 95,5 92,10 L72,70 C70,75 70,85 72,90 L92,150 C95,155 95,158 90,158 L10,158 C5,158 5,155 8,150 L28,90 C30,85 30,75 28,70 L8,10 C5,5 5,2 10,2 Z"
                                fill="none"
                                stroke="currentColor"
                                className="text-muted-foreground/50"
                                strokeWidth="4"
                            />

                            {/* Top Sand */}
                            <path d="M10,5 L90,5 L70,75 L30,75 Z" fill="url(#sandTop)" opacity="0.9" />

                            {/* Stream */}
                            <rect x="48" y="70" width="4" height="20" fill="currentColor" className={cn("text-primary transition-opacity duration-300", isRunning ? "opacity-100" : "opacity-0")} />

                            {/* Bottom Sand */}
                            <path d="M30,85 L70,85 L90,155 L10,155 Z" fill="url(#sandBottom)" opacity="0.9" />
                        </svg>
                    </div>

                    <div className="text-5xl font-mono font-bold text-foreground tracking-tighter tabular-nums">{displayTime}</div>
                    <div className={cn(
                        "text-xs font-bold uppercase tracking-[0.2em] mt-2 transition-colors",
                        isRunning ? "text-primary animate-pulse" : "text-muted-foreground"
                    )}>
                        {isRunning ? "Focusing..." : "Ready"}
                    </div>
                </div>
            </div>

            {/* Controls */}
            <div className="flex gap-6 z-30">
                <Button
                    variant="outline"
                    size="icon"
                    className="h-14 w-14 rounded-full border-2 border-muted hover:border-primary/50 hover:bg-primary/5 transition-all text-muted-foreground hover:text-primary"
                    onClick={() => {
                        setIsRunning(false);
                        const resetVal = Math.max(totalSeconds, 60);
                        setCurrentSeconds(resetVal);
                    }}
                >
                    <RotateCcw className="w-6 h-6" />
                </Button>

                <Button
                    size="icon"
                    className={cn(
                        "h-20 w-20 rounded-full transition-all transform hover:scale-105 shadow-xl shadow-primary/20",
                        isRunning ? "bg-amber-500 hover:bg-amber-600 text-white" : "bg-primary hover:bg-primary/90 text-primary-foreground"
                    )}
                    onClick={() => setIsRunning(!isRunning)}
                >
                    {isRunning ? <Pause className="w-8 h-8 fill-current" /> : <Play className="w-8 h-8 fill-current ml-1" />}
                </Button>
            </div>

            {/* Quick Presets */}
            <div className="flex gap-2 text-sm z-30">
                {[5, 15, 25, 45].map(min => (
                    <button
                        key={min}
                        onClick={() => {
                            setIsRunning(false);
                            setTotalSeconds(min * 60);
                            setCurrentSeconds(min * 60);
                        }}
                        className={cn(
                            "px-4 py-2 rounded-full font-medium transition-all text-muted-foreground hover:text-foreground",
                            totalSeconds === min * 60 ? "bg-primary/10 text-primary font-bold" : "bg-muted/50 hover:bg-muted"
                        )}
                    >
                        {min}m
                    </button>
                ))}
            </div>
        </div>
    );
}
