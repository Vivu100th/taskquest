'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { Smile, Image as ImageIcon } from 'lucide-react';

interface IconPickerProps {
    icon: string;
    onChange: (icon: string) => void;
}

const PRESET_ICONS = ['📝', '💻', '🏃', '🥗', '💊', '💧', '💤', '🎉', '🛒', '🧹'];

export function IconPicker({ icon, onChange }: IconPickerProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [customInput, setCustomInput] = useState('');

    const handleCustomSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (customInput) {
            onChange(customInput);
            setIsOpen(false);
            setCustomInput('');
        }
    };

    return (
        <Popover open={isOpen} onOpenChange={setIsOpen}>
            <PopoverTrigger asChild>
                <button className="w-14 h-14 rounded-full bg-gradient-to-br from-indigo-50 to-indigo-100 border-2 border-dashed border-indigo-200 flex items-center justify-center text-3xl shadow-sm hover:scale-105 transition-transform">
                    {icon || <span className="text-xl opacity-50">✨</span>}
                </button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-4 rounded-3xl" align="start">
                <div className="space-y-4">
                    <h4 className="font-semibold text-center text-foreground">Choose Icon</h4>

                    {/* Presets */}
                    <div className="grid grid-cols-5 gap-2">
                        {PRESET_ICONS.map((p) => (
                            <button
                                key={p}
                                onClick={() => { onChange(p); setIsOpen(false); }}
                                className={cn(
                                    "h-10 w-10 flex items-center justify-center text-xl rounded-xl hover:bg-muted transition-colors",
                                    icon === p && "bg-primary/20 ring-2 ring-primary"
                                )}
                            >
                                {p}
                            </button>
                        ))}
                    </div>

                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-background px-2 text-muted-foreground">Or custom</span>
                        </div>
                    </div>

                    {/* Custom Input */}
                    <form onSubmit={handleCustomSubmit} className="flex gap-2">
                        <Input
                            placeholder="Type emoji..."
                            value={customInput}
                            onChange={(e) => setCustomInput(e.target.value)}
                            className="rounded-xl"
                        />
                        <Button type="submit" size="sm" className="rounded-xl bg-indigo-500 hover:bg-indigo-600">
                            Set
                        </Button>
                    </form>
                </div>
            </PopoverContent>
        </Popover>
    );
}
