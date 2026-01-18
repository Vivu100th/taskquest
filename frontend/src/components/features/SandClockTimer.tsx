import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Play, Pause, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface SandClockTimerProps {
    initialMinutes?: number;
    onComplete?: () => void;
    onClose?: () => void;
}

export function SandClockTimer({ initialMinutes = 25, onComplete, onClose }: SandClockTimerProps) {
    const MAX_MINUTES = 60;
    const RADIUS = 140;
    const STROKE_WIDTH = 16;
    const CENTER = 160;
    const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

    const [totalSeconds, setTotalSeconds] = useState(initialMinutes * 60);
    const [currentSeconds, setCurrentSeconds] = useState(initialMinutes * 60);
    const [isRunning, setIsRunning] = useState(false);
    const [isDragging, setIsDragging] = useState(false);

    const containerRef = useRef<HTMLDivElement>(null);
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

    // Calculations
    const minutes = Math.ceil(currentSeconds / 60);
    const progressPercent = currentSeconds / (MAX_MINUTES * 60);
    const progressOffset = CIRCUMFERENCE - (progressPercent * CIRCUMFERENCE);

    // Knob position (angle from top, clockwise)
    const angle = progressPercent * 2 * Math.PI - Math.PI / 2;
    const knobX = CENTER + RADIUS * Math.cos(angle);
    const knobY = CENTER + RADIUS * Math.sin(angle);

    // Generate tick marks
    const ticks = [];
    for (let i = 0; i < 60; i++) {
        const tickAngle = (i / 60) * 2 * Math.PI - Math.PI / 2;
        const isMainTick = i % 15 === 0;
        const innerRadius = isMainTick ? RADIUS - 20 : RADIUS - 12;
        const outerRadius = RADIUS - 4;

        const x1 = CENTER + innerRadius * Math.cos(tickAngle);
        const y1 = CENTER + innerRadius * Math.sin(tickAngle);
        const x2 = CENTER + outerRadius * Math.cos(tickAngle);
        const y2 = CENTER + outerRadius * Math.sin(tickAngle);

        ticks.push(
            <line
                key={i}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke="currentColor"
                strokeWidth={isMainTick ? 2 : 1}
                className="text-violet-400"
                opacity={0.6}
            />
        );
    }

    // Labels (60, 15, 30, 45)
    const labels = [
        { value: 60, angle: -Math.PI / 2 },
        { value: 15, angle: 0 },
        { value: 30, angle: Math.PI / 2 },
        { value: 45, angle: Math.PI },
    ];

    // Drag Handlers
    const handleDrag = useCallback((clientX: number, clientY: number) => {
        if (!containerRef.current) return;
        const rect = containerRef.current.getBoundingClientRect();
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
        if (mins > MAX_MINUTES) mins = MAX_MINUTES;

        const newSeconds = mins * 60;
        setCurrentSeconds(newSeconds);
        if (!isRunning) {
            setTotalSeconds(newSeconds);
        }
    }, [isRunning]);

    const onMouseDown = (e: React.MouseEvent) => {
        if (isRunning) return;
        setIsDragging(true);
        handleDrag(e.clientX, e.clientY);
    };

    const onTouchStart = (e: React.TouchEvent) => {
        if (isRunning) return;
        setIsDragging(true);
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
        <div className="flex flex-col items-center gap-6 p-10 bg-slate-50 dark:bg-slate-900 rounded-3xl shadow-2xl relative min-w-[380px]">
            {/* Close Button */}
            {onClose && (
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors text-slate-500"
                >
                    <X className="w-5 h-5" />
                </button>
            )}

            {/* Title */}
            <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
                Focus
            </h1>

            {/* Timer Circle */}
            <div
                ref={containerRef}
                className={cn(
                    "relative w-[320px] h-[320px] flex items-center justify-center",
                    !isRunning && "cursor-grab",
                    isDragging && "cursor-grabbing"
                )}
                onMouseDown={onMouseDown}
                onTouchStart={onTouchStart}
            >
                <svg
                    viewBox="0 0 320 320"
                    className="absolute inset-0 w-full h-full"
                >
                    {/* Background Ring */}
                    <circle
                        cx={CENTER}
                        cy={CENTER}
                        r={RADIUS}
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={STROKE_WIDTH}
                        className="text-violet-200 dark:text-violet-900/50"
                    />

                    {/* Progress Ring */}
                    <circle
                        cx={CENTER}
                        cy={CENTER}
                        r={RADIUS}
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={STROKE_WIDTH}
                        strokeLinecap="round"
                        strokeDasharray={CIRCUMFERENCE}
                        strokeDashoffset={progressOffset}
                        className="text-violet-500 transition-all duration-100 ease-linear"
                        transform={`rotate(-90 ${CENTER} ${CENTER})`}
                    />

                    {/* Tick Marks */}
                    <g className="pointer-events-none">
                        {ticks}
                    </g>

                    {/* Labels */}
                    {labels.map(({ value, angle: labelAngle }) => {
                        const labelRadius = RADIUS + 28;
                        const x = CENTER + labelRadius * Math.cos(labelAngle);
                        const y = CENTER + labelRadius * Math.sin(labelAngle);
                        return (
                            <text
                                key={value}
                                x={x}
                                y={y}
                                textAnchor="middle"
                                dominantBaseline="middle"
                                className="text-sm font-medium fill-slate-400 dark:fill-slate-500 select-none"
                            >
                                {value}
                            </text>
                        );
                    })}

                    {/* Knob Handle */}
                    {!isRunning && (
                        <circle
                            cx={knobX}
                            cy={knobY}
                            r={isDragging ? 14 : 12}
                            fill="currentColor"
                            className={cn(
                                "text-violet-600 transition-all duration-150",
                                isDragging && "text-violet-700"
                            )}
                            style={{
                                filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))'
                            }}
                        />
                    )}
                </svg>

                {/* Center Content */}
                <div className="relative z-10 flex flex-col items-center justify-center pointer-events-none">
                    <span className="text-6xl font-bold text-slate-900 dark:text-slate-100 tabular-nums">
                        {isRunning ? Math.floor(currentSeconds / 60).toString().padStart(2, '0') + ':' + (currentSeconds % 60).toString().padStart(2, '0') : minutes}
                    </span>
                    <span className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-widest mt-1">
                        {isRunning ? '' : 'MINS'}
                    </span>
                </div>
            </div>

            {/* Start/Pause Button */}
            <Button
                onClick={() => setIsRunning(!isRunning)}
                className={cn(
                    "px-8 py-6 text-lg font-semibold rounded-2xl transition-all shadow-lg",
                    isRunning
                        ? "bg-slate-800 hover:bg-slate-700 text-white dark:bg-slate-200 dark:hover:bg-slate-300 dark:text-slate-900"
                        : "bg-slate-800 hover:bg-slate-700 text-white dark:bg-slate-200 dark:hover:bg-slate-300 dark:text-slate-900"
                )}
            >
                {isRunning ? (
                    <>
                        <Pause className="w-5 h-5 mr-2 fill-current" />
                        Pause
                    </>
                ) : (
                    <>
                        <span>Start</span>
                        <Play className="w-5 h-5 ml-2 fill-current" />
                    </>
                )}
            </Button>
        </div>
    );
}
