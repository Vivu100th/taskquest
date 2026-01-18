import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Play, Pause, RotateCcw, X } from 'lucide-react';
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
        alarmAudioRef.current = new Audio('https://actions.google.com/sounds/v1/alarms/beep_short.ogg');
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
                        alarmAudioRef.current?.play().catch(e => console.log('Audio play failed', e));
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

    // Progress for Ring (Time / MAX_MINUTES) - mimics clock position
    // If we want the ring to represent "Time Left in Session", we would use current/total.
    // But the HTML original used it as a "Set Time" knob, scaling 0-60 mins.
    // So visual position = currentMinutes / 60.
    const percentCircle = Math.min(currentSeconds / (MAX_MINUTES * 60), 1);
    const offset = CIRCUMFERENCE - (percentCircle * CIRCUMFERENCE);

    // Knob Position
    const angle = percentCircle * 2 * Math.PI;
    // -90 deg rotation in SVG means 0 is at 12 o'clock.
    // SVG standard: 0 is 3 o'clock. CSS rotate(-90deg) shifts it.
    // To match SVG stroke, we calculate angle from 12 o'clock (0 rad).
    // Math: x = cx + r * sin(a), y = cy - r * cos(a)
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

        // Atan2: 0 is 3 o'clock. We want 0 to be 12 o'clock.
        let angleRad = Math.atan2(dy, dx);
        angleRad += Math.PI / 2; // Shift to 12 o'clock

        if (angleRad < 0) angleRad += 2 * Math.PI;

        const percent = angleRad / (2 * Math.PI);
        let mins = percent * MAX_MINUTES;
        // Snap to nearest minute
        mins = Math.round(mins);
        if (mins < 1) mins = 1; // Minimum 1 min

        const newSeconds = mins * 60;
        setCurrentSeconds(newSeconds);
        // Only update total if not running (resetting the session length)
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
        <div className="flex flex-col items-center gap-8 p-6 bg-slate-900 rounded-3xl shadow-2xl relative w-full h-full max-w-md mx-auto">
            {onClose && (
                <Button
                    variant="ghost"
                    size="icon"
                    className="absolute top-4 right-4 text-slate-400 hover:text-white"
                    onClick={onClose}
                >
                    <X className="w-6 h-6" />
                </Button>
            )}

            <div className="text-center space-y-1">
                <h1 className="text-2xl font-bold tracking-widest text-cyan-400 uppercase">Focus Mode</h1>
                <p className="text-slate-400 text-sm">Drag ring to set timer</p>
            </div>

            {/* Timer Circle */}
            <div className="relative w-[300px] h-[300px] flex items-center justify-center shrink-0">
                {/* SVG Background Ring */}
                <svg className="absolute top-0 left-0 w-full h-full transform -rotate-90 pointer-events-none" viewBox="0 0 300 300">
                    <circle cx="150" cy="150" r="130" fill="none" stroke="#1e293b" strokeWidth="12" strokeLinecap="round" />
                </svg>

                {/* SVG Progress Ring */}
                <svg className="absolute top-0 left-0 w-full h-full transform -rotate-90 pointer-events-none drop-shadow-[0_0_10px_rgba(34,211,238,0.5)]" viewBox="0 0 300 300">
                    <circle
                        cx="150" cy="150" r="130"
                        fill="none" stroke="#22d3ee" strokeWidth="12"
                        strokeLinecap="round"
                        strokeDasharray={CIRCUMFERENCE}
                        strokeDashoffset={offset}
                        className="transition-all duration-75 ease-linear"
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
                            "absolute w-8 h-8 bg-white rounded-full shadow-[0_0_15px_rgba(255,255,255,0.8)] transform -translate-x-1/2 -translate-y-1/2 transition-transform hover:bg-cyan-50",
                            isDragging && "scale-125"
                        )}
                        style={{ left: knobX, top: knobY }}
                    />
                </div>

                {/* Center Content: Hourglass & Time */}
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-10">

                    {/* Hourglass SVG */}
                    <div className="w-12 h-16 relative mb-2 opacity-90">
                        <svg viewBox="0 0 100 160" className="w-full h-full drop-shadow-lg">
                            <defs>
                                <linearGradient id="sandTop" x1="0%" y1="0%" x2="0%" y2="100%">
                                    <stop offset="0%" stopColor="#22d3ee" />
                                    <stop offset={topLevel} stopColor="#22d3ee" />
                                    <stop offset={topLevel} stopColor="transparent" />
                                </linearGradient>
                                <linearGradient id="sandBottom" x1="0%" y1="100%" x2="0%" y2="0%">
                                    <stop offset="0%" stopColor="#22d3ee" />
                                    <stop offset={bottomLevel} stopColor="#22d3ee" />
                                    <stop offset={bottomLevel} stopColor="transparent" />
                                </linearGradient>
                            </defs>

                            {/* Frame */}
                            <path d="M10,2 L90,2 C95,2 95,5 92,10 L72,70 C70,75 70,85 72,90 L92,150 C95,155 95,158 90,158 L10,158 C5,158 5,155 8,150 L28,90 C30,85 30,75 28,70 L8,10 C5,5 5,2 10,2 Z" fill="none" stroke="#4b5563" strokeWidth="4" />

                            {/* Top Sand */}
                            <path d="M10,5 L90,5 L70,75 L30,75 Z" fill="url(#sandTop)" opacity="0.9" />

                            {/* Stream */}
                            <rect x="48" y="70" width="4" height="20" fill="#22d3ee" className={cn("transition-opacity duration-300", isRunning ? "opacity-100" : "opacity-0")} />

                            {/* Bottom Sand */}
                            <path d="M30,85 L70,85 L90,155 L10,155 Z" fill="url(#sandBottom)" opacity="0.9" />
                        </svg>
                    </div>

                    <div className="text-4xl font-mono font-bold text-white tracking-wider">{displayTime}</div>
                    <div className={cn(
                        "text-xs font-medium uppercase tracking-widest mt-1",
                        isRunning ? "text-green-400" : "text-cyan-500"
                    )}>
                        {isRunning ? "Focusing..." : "Ready"}
                    </div>
                </div>
            </div>

            {/* Controls */}
            <div className="flex gap-6 z-30">
                <Button
                    variant="secondary"
                    size="icon"
                    className="h-12 w-12 rounded-full bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white"
                    onClick={() => {
                        setIsRunning(false);
                        const resetVal = Math.max(totalSeconds, 60); // min 1 min
                        setCurrentSeconds(resetVal);
                    }}
                >
                    <RotateCcw className="w-5 h-5" />
                </Button>

                <Button
                    size="icon"
                    className={cn(
                        "h-16 w-16 rounded-full transition-all transform active:scale-95 shadow-lg shadow-cyan-500/20",
                        isRunning ? "bg-amber-500 hover:bg-amber-600" : "bg-cyan-500 hover:bg-cyan-400"
                    )}
                    onClick={() => setIsRunning(!isRunning)}
                >
                    {isRunning ? <Pause className="w-8 h-8 fill-current" /> : <Play className="w-8 h-8 fill-current ml-1" />}
                </Button>
            </div>

            {/* Quick Presets */}
            <div className="flex gap-3 text-sm z-30">
                {[5, 15, 25, 45].map(min => (
                    <button
                        key={min}
                        onClick={() => {
                            setIsRunning(false);
                            setTotalSeconds(min * 60);
                            setCurrentSeconds(min * 60);
                        }}
                        className="px-3 py-1 bg-slate-800 rounded-full hover:bg-slate-700 text-slate-300 transition"
                    >
                        {min}'
                    </button>
                ))}
            </div>
        </div>
    );
}
