'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useAuthStore } from '@/lib/store/useAuthStore';
import { LogOut, User } from 'lucide-react';

export function Navbar() {
  const { user, isAuthenticated, logout } = useAuthStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);
  return (
    <header className="sticky top-0 z-50 border-b border-zinc-800/80 bg-zinc-950/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
        <Link href="/" className="flex items-center gap-3">
          <div className="flex h-10 w-10 overflow-hidden rounded-lg shadow-md border border-green-500/20">
            <img src="/logo.png" alt="Deck Assemble Logo" className="w-full h-full object-cover" />
          </div>
          <span className="text-lg font-bold tracking-tight text-white">
            Deck Assemble <span className="text-xs font-semibold text-green-500">Marvel MTG</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-6 md:flex text-sm font-medium text-zinc-300">
          <Link href="/cards" className="hover:text-green-400 transition-colors">
            Browse Cards
          </Link>
          <Link href="/collection" className="hover:text-green-400 transition-colors">
            My Collection
          </Link>
          <Link href="/decks" className="hover:text-green-400 transition-colors">
            Decks
          </Link>
          <Link href="/recommendations" className="hover:text-green-400 transition-colors">
            Recommendations
          </Link>
          <Link href="/learn" className="hover:text-green-400 transition-colors">
            Learn MTG
          </Link>
        </nav>

        <div className="flex items-center gap-3">
          <Link
            href="/deck-builder"
            className="hidden md:flex rounded-lg bg-green-600 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-green-500 shadow-sm transition-all"
          >
            Build Deck
          </Link>
          
          {mounted && isAuthenticated ? (
            <div className="flex items-center gap-4 ml-2 border-l border-zinc-800 pl-4">
              <span className="text-sm font-medium text-zinc-300 flex items-center gap-2">
                <div className="w-6 h-6 bg-purple-900/50 rounded-full flex items-center justify-center border border-purple-500/50">
                  <User className="w-3 h-3 text-purple-400" />
                </div>
                {user?.name}
              </span>
              <button
                onClick={logout}
                className="text-zinc-500 hover:text-red-400 transition-colors p-1 rounded-md"
                title="Log out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : mounted ? (
            <div className="flex items-center gap-3 ml-2 border-l border-zinc-800 pl-4">
              <Link
                href="/login"
                className="text-sm font-medium text-zinc-400 hover:text-white transition-colors"
              >
                Log In
              </Link>
              <Link
                href="/register"
                className="rounded-lg bg-purple-600 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-purple-500 shadow-sm transition-all"
              >
                Sign Up
              </Link>
            </div>
          ) : (
            <div className="w-24 h-8"></div>
          )}
        </div>
      </div>
    </header>
  );
}
