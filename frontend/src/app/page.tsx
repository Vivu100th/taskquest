import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { api } from '@/lib/api';

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      router.push('/dashboard');
    }
  }, [router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex flex-col">
      <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]"></div>

      {/* Header */}
      <header className="relative z-10 p-6 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
            <span className="text-xl">🎮</span>
          </div>
          <span className="text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            TaskQuest
          </span>
        </div>
        <div className="flex gap-4">
          <Link href="/login">
            <Button variant="ghost" className="text-white hover:text-purple-400">
              Sign In
            </Button>
          </Link>
          <Link href="/register">
            <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
              Get Started
            </Button>
          </Link>
        </div>
      </header>

      {/* Hero */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center text-center px-4">
        <div className="mb-8">
          <span className="inline-block px-4 py-2 rounded-full bg-purple-500/20 border border-purple-500/30 text-purple-400 text-sm">
            🚀 Gamify your productivity
          </span>
        </div>

        <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 max-w-4xl">
          Complete tasks.{' '}
          <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            Earn rewards.
          </span>{' '}
          Rise to the top.
        </h1>

        <p className="text-xl text-slate-400 mb-12 max-w-2xl">
          Transform your task management into an exciting journey. Complete challenges,
          collect points, unlock achievements, and compete with others on the global leaderboard.
        </p>

        <div className="flex gap-4">
          <Link href="/register">
            <Button size="lg" className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-lg px-8 py-6">
              Start Your Quest
            </Button>
          </Link>
          <Link href="/login">
            <Button size="lg" variant="outline" className="border-purple-500/50 text-purple-400 hover:bg-purple-500/10 text-lg px-8 py-6">
              Sign In
            </Button>
          </Link>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-24 max-w-5xl">
          <div className="p-6 rounded-2xl bg-slate-800/30 border border-slate-700/50 backdrop-blur-xl">
            <div className="text-4xl mb-4">📋</div>
            <h3 className="text-xl font-bold text-white mb-2">Complete Tasks</h3>
            <p className="text-slate-400">Take on challenges with varying difficulties and earn points based on your achievements.</p>
          </div>
          <div className="p-6 rounded-2xl bg-slate-800/30 border border-slate-700/50 backdrop-blur-xl">
            <div className="text-4xl mb-4">🏆</div>
            <h3 className="text-xl font-bold text-white mb-2">Climb Rankings</h3>
            <p className="text-slate-400">Progress through ranks from Bronze to Master and compete on the global leaderboard.</p>
          </div>
          <div className="p-6 rounded-2xl bg-slate-800/30 border border-slate-700/50 backdrop-blur-xl">
            <div className="text-4xl mb-4">🎁</div>
            <h3 className="text-xl font-bold text-white mb-2">Earn Rewards</h3>
            <p className="text-slate-400">Unlock badges, titles, and exclusive features as you level up your productivity.</p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 p-6 text-center text-slate-500 text-sm">
        © 2026 TaskQuest. Built with ❤️ for productivity enthusiasts.
      </footer>
    </div>
  );
}
