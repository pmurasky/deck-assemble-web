'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store/useAuthStore';
import { ShieldAlert, ArrowRight } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const login = useAuthStore(state => state.login);
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }
    
    // In our mock auth, we just accept any non-empty credentials
    login(email);
    router.push('/decks'); // redirect to dashboard after login
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md bg-zinc-900/80 backdrop-blur-md border border-green-500/30 rounded-2xl p-8 shadow-2xl shadow-green-900/20">
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-green-950 border-2 border-green-500 rounded-2xl flex items-center justify-center mb-4 transform rotate-12">
            <ShieldAlert className="w-8 h-8 text-green-400 -rotate-12" />
          </div>
          <h1 className="text-3xl font-extrabold text-white text-center">Welcome Back</h1>
          <p className="text-zinc-400 text-center mt-2">Log in to your Deck Assemble account</p>
        </div>

        {error && (
          <div className="bg-red-950/50 border border-red-500/50 text-red-400 p-3 rounded-lg text-sm mb-6 text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-1.5" htmlFor="email">
              Email Address
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 focus:border-green-500 focus:ring-1 focus:ring-green-500 rounded-xl px-4 py-3 text-white transition-all outline-none"
              placeholder="bruce.banner@avengers.com"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-1.5" htmlFor="password">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 focus:border-green-500 focus:ring-1 focus:ring-green-500 rounded-xl px-4 py-3 text-white transition-all outline-none"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-green-600 hover:bg-green-500 text-white font-bold py-3.5 rounded-xl transition-all shadow-[0_0_15px_rgba(34,197,94,0.3)] hover:shadow-[0_0_25px_rgba(34,197,94,0.5)] flex items-center justify-center gap-2 group"
          >
            Log In
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
        </form>

        <div className="mt-8 text-center text-zinc-500 text-sm">
          Don't have an account?{' '}
          <Link href="/register" className="text-purple-400 hover:text-purple-300 font-semibold transition-colors">
            Sign up
          </Link>
        </div>
      </div>
    </div>
  );
}
