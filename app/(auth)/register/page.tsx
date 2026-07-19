'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store/useAuthStore';
import { UserPlus, ArrowRight } from 'lucide-react';

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  
  const register = useAuthStore(state => state.register);
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password) {
      setError('Please fill in all fields');
      return;
    }
    
    // In our mock auth, we just create the session
    register(name, email);
    router.push('/decks'); // redirect to dashboard
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md bg-zinc-900/80 backdrop-blur-md border border-purple-500/30 rounded-2xl p-8 shadow-2xl shadow-purple-900/20">
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-purple-950 border-2 border-purple-500 rounded-2xl flex items-center justify-center mb-4 transform -rotate-12">
            <UserPlus className="w-8 h-8 text-purple-400 rotate-12" />
          </div>
          <h1 className="text-3xl font-extrabold text-white text-center">Join the Team</h1>
          <p className="text-zinc-400 text-center mt-2">Create your Deck Assemble account</p>
        </div>

        {error && (
          <div className="bg-red-950/50 border border-red-500/50 text-red-400 p-3 rounded-lg text-sm mb-6 text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-1.5" htmlFor="name">
              Hero Name (Username)
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 rounded-xl px-4 py-3 text-white transition-all outline-none"
              placeholder="Tony Stark"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-1.5" htmlFor="email">
              Email Address
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 rounded-xl px-4 py-3 text-white transition-all outline-none"
              placeholder="ironman@avengers.com"
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
              className="w-full bg-zinc-950 border border-zinc-800 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 rounded-xl px-4 py-3 text-white transition-all outline-none"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-purple-600 hover:bg-purple-500 text-white font-bold py-3.5 rounded-xl transition-all shadow-[0_0_15px_rgba(168,85,247,0.3)] hover:shadow-[0_0_25px_rgba(168,85,247,0.5)] flex items-center justify-center gap-2 group"
          >
            Create Account
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
        </form>

        <div className="mt-8 text-center text-zinc-500 text-sm">
          Already have an account?{' '}
          <Link href="/login" className="text-green-400 hover:text-green-300 font-semibold transition-colors">
            Log in
          </Link>
        </div>
      </div>
    </div>
  );
}
