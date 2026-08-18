'use client';

import React, { useEffect, useState } from 'react';
import { User, Settings, Save, CheckCircle2, RefreshCw, Mail, Compass } from 'lucide-react';
import { fetchProfile, saveProfile } from '@/lib/api/profile';
import { useOnboardingStore } from '@/lib/store/useOnboardingStore';
import type { ProfileResponse } from '@/types/profile';

export function SettingsClient() {
  const [profile, setProfile] = useState<ProfileResponse | null>(null);
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [preferredFormat, setPreferredFormat] = useState('Commander');
  const [experienceLevel, setExperienceLevel] = useState('CASUAL');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const openTour = useOnboardingStore((state) => state.openTour);

  useEffect(() => {
    let isMounted = true;
    fetchProfile()
      .then((data) => {
        if (isMounted) {
          setProfile(data);
          setDisplayName(data.displayName || '');
          setEmail(data.email || '');
          setPreferredFormat(data.preferredFormat || 'Commander');
          setExperienceLevel(data.experienceLevel || 'CASUAL');
          setIsLoading(false);
        }
      })
      .catch((err: unknown) => {
        if (isMounted) {
          setError(err instanceof Error ? err.message : 'Failed to load profile');
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError(null);
    setSuccessMessage(null);
    try {
      const updated = await saveProfile({
        displayName: displayName.trim(),
        email: email.trim(),
        preferredFormat,
        experienceLevel,
      });
      setProfile(updated);
      setSuccessMessage('Profile updated successfully!');
      setTimeout(() => setSuccessMessage(null), 4000);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="p-16 text-center border border-zinc-800 rounded-3xl bg-zinc-900/40">
        <RefreshCw className="w-8 h-8 text-purple-500 animate-spin mx-auto mb-3" />
        <p className="text-zinc-400 text-sm font-medium">Loading user settings...</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center gap-4 border-b border-zinc-800 pb-6">
        <div className="p-3 bg-purple-950/60 border border-purple-500/30 rounded-2xl text-purple-400">
          <Settings className="w-8 h-8" />
        </div>
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight">Account & Settings</h1>
          <p className="text-sm text-zinc-400 mt-1">
            Manage your builder preferences, default formats, and account profile.
          </p>
        </div>
      </div>

      {successMessage && (
        <div className="p-4 rounded-xl bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 text-sm font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-xl bg-red-950/80 border border-red-500/40 text-red-300 text-sm font-semibold flex items-center gap-2">
          <span>{error}</span>
        </div>
      )}

      {/* Form Card */}
      <form onSubmit={handleSubmit} className="bg-zinc-900/90 border border-zinc-800 rounded-2xl p-6 sm:p-8 space-y-6 shadow-xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="displayName" className="block text-xs font-bold text-zinc-300 uppercase tracking-wider mb-2">
              Display Name
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-3 text-zinc-500">
                <User className="w-4 h-4" />
              </span>
              <input
                id="displayName"
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                required
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-purple-500 transition-colors"
                placeholder="Your username"
              />
            </div>
          </div>

          <div>
            <label htmlFor="email" className="block text-xs font-bold text-zinc-300 uppercase tracking-wider mb-2">
              Email Address
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-3 text-zinc-500">
                <Mail className="w-4 h-4" />
              </span>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-purple-500 transition-colors"
                placeholder="you@example.com"
              />
            </div>
          </div>

          <div>
            <label htmlFor="preferredFormat" className="block text-xs font-bold text-zinc-300 uppercase tracking-wider mb-2">
              Preferred Format
            </label>
            <select
              id="preferredFormat"
              value={preferredFormat}
              onChange={(e) => setPreferredFormat(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-2.5 px-4 text-sm text-white focus:outline-none focus:border-purple-500 transition-colors"
            >
              <option value="Commander">Commander / EDH</option>
              <option value="Modern">Modern</option>
              <option value="Standard">Standard</option>
              <option value="Pioneer">Pioneer</option>
              <option value="Legacy">Legacy</option>
              <option value="Vintage">Vintage</option>
              <option value="Pauper">Pauper</option>
              <option value="Oathbreaker">Oathbreaker</option>
            </select>
          </div>

          <div>
            <label htmlFor="experienceLevel" className="block text-xs font-bold text-zinc-300 uppercase tracking-wider mb-2">
              Experience Level
            </label>
            <select
              id="experienceLevel"
              value={experienceLevel}
              onChange={(e) => setExperienceLevel(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-2.5 px-4 text-sm text-white focus:outline-none focus:border-purple-500 transition-colors"
            >
              <option value="BEGINNER">Beginner</option>
              <option value="CASUAL">Casual</option>
              <option value="COMPETITIVE">Competitive</option>
              <option value="EXPERT">Expert</option>
            </select>
          </div>
        </div>

        {/* Metadata section */}
        {profile && (
          <div className="pt-4 border-t border-zinc-800/80 flex flex-wrap justify-between items-center text-xs text-zinc-500">
            <span>Account created: {new Date(profile.createdAt).toLocaleDateString()}</span>
            <span>Last updated: {new Date(profile.updatedAt).toLocaleDateString()}</span>
          </div>
        )}

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={isSaving}
            className="px-6 py-3 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white font-bold rounded-xl text-sm transition-all shadow-lg flex items-center gap-2 active:scale-95"
          >
            {isSaving ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Save Changes</span>
              </>
            )}
          </button>
        </div>
      </form>

      {/* Guided Tour & Onboarding Section */}
      <div className="bg-zinc-900/90 border border-zinc-800 rounded-2xl p-6 sm:p-8 space-y-4 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-purple-950/50 border border-purple-500/30 rounded-xl text-purple-400">
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Guided Onboarding Tour</h2>
              <p className="text-xs text-zinc-400 mt-0.5">
                Review the core workflows for deck building, collection management, and rules lookup.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => openTour({ isReplay: true })}
            className="px-4 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 hover:text-white font-bold rounded-xl text-xs transition-colors border border-zinc-700 flex items-center justify-center gap-2 shrink-0"
          >
            <Compass className="w-4 h-4 text-purple-400" />
            <span>Replay Tour</span>
          </button>
        </div>
      </div>
    </div>
  );
}

