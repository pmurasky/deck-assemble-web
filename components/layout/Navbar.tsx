'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useUser } from '@auth0/nextjs-auth0/client';
import { LogOut, User, Menu, X, Hammer, Layers, Library, Sparkles, BookOpen } from 'lucide-react';
import { isAdmin } from '@/lib/utils/permissions';

export function Navbar() {
  const { user, isLoading } = useUser();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => setIsMobileMenuOpen((prev) => !prev);
  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  return (
    <header className="sticky top-0 z-50 border-b border-zinc-800/80 bg-zinc-950/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
        <Link href="/" onClick={closeMobileMenu} className="flex items-center gap-3">
          <div className="flex h-10 w-10 overflow-hidden rounded-lg shadow-md border border-green-500/20">
            <img src="/logo.png" alt="Deck Assemble Logo" className="w-full h-full object-cover" />
          </div>
          <span className="text-lg font-bold tracking-tight text-white">
            Deck Assemble <span className="text-xs font-semibold text-green-500">Marvel MTG</span>
          </span>
        </Link>

        {/* Desktop Navigation */}
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
          {isAdmin(user) && (
            <Link href="/admin/imports" className="hover:text-purple-400 transition-colors font-semibold text-purple-500">
              Admin
            </Link>
          )}
        </nav>

        {/* Desktop Actions */}
        <div className="hidden md:flex items-center gap-3">
          <Link
            href="/deck-builder"
            className="rounded-lg bg-green-600 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-green-500 shadow-sm transition-all"
          >
            Build Deck
          </Link>
          
          {!isLoading && user ? (
            <div className="flex items-center gap-4 ml-2 border-l border-zinc-800 pl-4">
              <span className="text-sm font-medium text-zinc-300 flex items-center gap-2">
                <div className="w-6 h-6 bg-purple-900/50 rounded-full flex items-center justify-center border border-purple-500/50">
                  <User className="w-3 h-3 text-purple-400" />
                </div>
                {user.name}
              </span>
              <a
                href="/auth/logout"
                className="text-zinc-500 hover:text-red-400 transition-colors p-1 rounded-md"
                title="Log out"
              >
                <LogOut className="w-4 h-4" />
              </a>
            </div>
          ) : !isLoading ? (
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

        {/* Mobile Hamburger Toggle */}
        <div className="flex md:hidden items-center gap-2">
          <Link
            href="/deck-builder"
            onClick={closeMobileMenu}
            className="rounded-lg bg-green-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-green-500 shadow-sm transition-all flex items-center gap-1"
          >
            <Hammer className="w-3.5 h-3.5" />
            Build
          </Link>
          <button
            type="button"
            onClick={toggleMobileMenu}
            aria-label={isMobileMenuOpen ? 'Close mobile menu' : 'Open mobile menu'}
            className="p-2 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white hover:bg-zinc-800 transition-colors focus:outline-none"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-zinc-800/80 bg-zinc-950/95 backdrop-blur-xl px-4 py-5 shadow-2xl animate-in slide-in-from-top duration-200">
          <nav className="flex flex-col gap-3 font-medium text-sm">
            <Link
              href="/cards"
              onClick={closeMobileMenu}
              className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-zinc-900 text-zinc-200 hover:text-green-400 transition-colors border border-transparent hover:border-zinc-800"
            >
              <Library className="w-4 h-4 text-green-500" />
              Browse Cards
            </Link>
            <Link
              href="/collection"
              onClick={closeMobileMenu}
              className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-zinc-900 text-zinc-200 hover:text-green-400 transition-colors border border-transparent hover:border-zinc-800"
            >
              <Layers className="w-4 h-4 text-green-500" />
              My Collection
            </Link>
            <Link
              href="/decks"
              onClick={closeMobileMenu}
              className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-zinc-900 text-zinc-200 hover:text-green-400 transition-colors border border-transparent hover:border-zinc-800"
            >
              <Hammer className="w-4 h-4 text-purple-400" />
              Decks
            </Link>
            <Link
              href="/recommendations"
              onClick={closeMobileMenu}
              className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-zinc-900 text-zinc-200 hover:text-green-400 transition-colors border border-transparent hover:border-zinc-800"
            >
              <Sparkles className="w-4 h-4 text-amber-400" />
              Recommendations
            </Link>
            <Link
              href="/learn"
              onClick={closeMobileMenu}
              className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-zinc-900 text-zinc-200 hover:text-green-400 transition-colors border border-transparent hover:border-zinc-800"
            >
              <BookOpen className="w-4 h-4 text-blue-400" />
              Learn MTG
            </Link>
            {isAdmin(user) && (
              <Link
                href="/admin/imports"
                onClick={closeMobileMenu}
                className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-zinc-900 text-purple-400 font-semibold transition-colors border border-transparent hover:border-zinc-800"
              >
                Admin Panel
              </Link>
            )}

            <div className="my-2 border-t border-zinc-800/80 pt-3">
              {!isLoading && user ? (
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-zinc-900/60 border border-zinc-800">
                  <span className="text-sm font-semibold text-zinc-200 flex items-center gap-2">
                    <User className="w-4 h-4 text-purple-400" />
                    {user.name}
                  </span>
                  <a
                    href="/auth/logout"
                    onClick={closeMobileMenu}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-800 text-xs font-bold text-red-400 hover:bg-red-950/40 transition-colors"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    Log Out
                  </a>
                </div>
              ) : !isLoading ? (
                <div className="grid grid-cols-2 gap-3 pt-1">
                  <Link
                    href="/login"
                    onClick={closeMobileMenu}
                    className="flex items-center justify-center py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-sm font-semibold text-zinc-200 hover:text-white"
                  >
                    Log In
                  </Link>
                  <Link
                    href="/register"
                    onClick={closeMobileMenu}
                    className="flex items-center justify-center py-2.5 rounded-xl bg-purple-600 text-sm font-semibold text-white hover:bg-purple-500 shadow-md"
                  >
                    Sign Up
                  </Link>
                </div>
              ) : null}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}

