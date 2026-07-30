'use client';

import React from 'react';
import Link from 'next/link';
import { Lock, ArrowRight, ShieldCheck } from 'lucide-react';

export interface AuthGateProps {
  title?: string;
  description?: string;
  features?: string[];
  icon?: React.ReactNode;
}

export function AuthGate({
  title = 'Authentication Required',
  description = 'Log in to access your personal card collection, saved decks, and personalized recommendations.',
  features = [
    'Track your physical MTG card collection & foils',
    'Build, save, and analyze custom Commander decks',
    'Get tailored card recommendations based on your cards',
  ],
  icon,
}: AuthGateProps) {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-lg bg-zinc-900/90 border border-zinc-800 rounded-2xl p-8 sm:p-10 shadow-2xl backdrop-blur-md text-center space-y-6">
        <div className="mx-auto w-16 h-16 rounded-2xl bg-purple-950/60 border border-purple-500/30 flex items-center justify-center text-purple-400 shadow-lg shadow-purple-950/40">
          {icon || <Lock className="w-8 h-8" />}
        </div>

        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">{title}</h2>
          <p className="text-zinc-400 text-sm sm:text-base mt-2 leading-relaxed">{description}</p>
        </div>

        {features.length > 0 && (
          <div className="bg-zinc-950/80 border border-zinc-800/80 rounded-xl p-4 text-left space-y-2.5">
            {features.map((feat, idx) => (
              <div key={idx} className="flex items-center gap-2.5 text-xs sm:text-sm text-zinc-300">
                <ShieldCheck className="w-4 h-4 text-green-400 shrink-0" />
                <span>{feat}</span>
              </div>
            ))}
          </div>
        )}

        <div className="pt-2 flex flex-col sm:flex-row gap-3">
          <Link
            href="/login"
            className="flex-1 bg-green-600 hover:bg-green-500 text-white font-bold py-3 px-6 rounded-xl transition-all shadow-md flex items-center justify-center gap-2 group"
          >
            <span>Log In</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
          <Link
            href="/register"
            className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-semibold py-3 px-6 rounded-xl transition-colors border border-zinc-700/60 flex items-center justify-center"
          >
            Sign Up
          </Link>
        </div>
      </div>
    </div>
  );
}
