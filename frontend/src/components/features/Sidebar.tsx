'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const navItems = [
    { href: '/dashboard', label: 'Dashboard', icon: '🏠' },
    { href: '/dashboard/tasks', label: 'Tasks', icon: '📋' },
    { href: '/dashboard/leaderboard', label: 'Leaderboard', icon: '🏆' },
    { href: '/dashboard/profile', label: 'Profile', icon: '👤' },
];

const adminItems = [
    { href: '/dashboard/admin/submissions', label: 'Review Submissions', icon: '✅' },
];

export function Sidebar() {
    const pathname = usePathname();
    const { user, logout } = useAuth();

    const isAdmin = user?.role === 'ADMIN' || user?.role === 'MODERATOR';

    return (
        <aside className="fixed left-0 top-0 h-screen w-64 bg-slate-800/50 backdrop-blur-xl border-r border-slate-700/50 flex flex-col">
            {/* Logo */}
            <div className="p-6 border-b border-slate-700/50">
                <Link href="/dashboard" className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
                        <span className="text-xl">🎮</span>
                    </div>
                    <span className="text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                        TaskQuest
                    </span>
                </Link>
            </div>

            {/* User Info */}
            <div className="p-4 border-b border-slate-700/50">
                <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10 border-2 border-purple-500/50">
                        <AvatarImage src={user?.avatarUrl} />
                        <AvatarFallback className="bg-gradient-to-r from-purple-600 to-pink-600 text-white">
                            {user?.username?.charAt(0).toUpperCase()}
                        </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-white truncate">{user?.username}</p>
                        <Badge variant="outline" className="text-xs border-purple-500/50 text-purple-400">
                            {user?.currentRank || 'BRONZE'}
                        </Badge>
                    </div>
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-4 space-y-2">
                {navItems.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${isActive
                                    ? 'bg-gradient-to-r from-purple-600/20 to-pink-600/20 border border-purple-500/30 text-white'
                                    : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
                                }`}
                        >
                            <span className="text-lg">{item.icon}</span>
                            <span className="font-medium">{item.label}</span>
                        </Link>
                    );
                })}

                {isAdmin && (
                    <>
                        <div className="pt-4 pb-2">
                            <p className="px-4 text-xs font-semibold text-slate-500 uppercase">Admin</p>
                        </div>
                        {adminItems.map((item) => {
                            const isActive = pathname === item.href;
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${isActive
                                            ? 'bg-gradient-to-r from-orange-600/20 to-red-600/20 border border-orange-500/30 text-white'
                                            : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
                                        }`}
                                >
                                    <span className="text-lg">{item.icon}</span>
                                    <span className="font-medium">{item.label}</span>
                                </Link>
                            );
                        })}
                    </>
                )}
            </nav>

            {/* Logout */}
            <div className="p-4 border-t border-slate-700/50">
                <Button
                    variant="ghost"
                    className="w-full justify-start text-slate-400 hover:text-white hover:bg-slate-700/50"
                    onClick={logout}
                >
                    <span className="text-lg mr-3">🚪</span>
                    Logout
                </Button>
            </div>
        </aside>
    );
}
