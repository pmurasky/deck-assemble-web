'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Play, RotateCcw, Sparkles, Loader2, AlertCircle, Layers } from 'lucide-react';
import { PhaseStepper } from './practice/PhaseStepper';
import { ManaPoolDisplay } from './practice/ManaPoolDisplay';
import { DeckPileStatus } from './practice/DeckPileStatus';
import { PracticeHandCard } from './practice/PracticeHandCard';
import { PracticeBattlefieldCard } from './practice/PracticeBattlefieldCard';
import type { PracticeCard, PracticeSessionResponse } from '@/types/m3';

interface PracticeBoardViewProps {
  deckId: number | string;
}

const FALLBACK_HAND: PracticeCard[] = [
  { id: '1', name: 'Sol Ring', manaCost: '{1}', typeLine: 'Artifact' },
  { id: '2', name: 'Arcane Signet', manaCost: '{2}', typeLine: 'Artifact' },
  { id: '3', name: 'Command Tower', manaCost: '', typeLine: 'Land' },
];

function createFallbackSession(deckId: number | string): PracticeSessionResponse {
  return {
    sessionId: `local-${deckId}`,
    turn: 1,
    phase: 'MAIN_1',
    hand: FALLBACK_HAND,
    battlefield: [],
    graveyard: [],
    libraryCount: 92,
    manaPool: {},
    logs: ['Game started. Opening hand drawn.'],
  };
}

export function PracticeBoardView({ deckId }: PracticeBoardViewProps) {
  const [session, setSession] = useState<PracticeSessionResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const startSession = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/v1/decks/${deckId}/practice/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error?.message || 'Failed to start practice session');
      setSession(json.data ?? json);
    } catch {
      setSession(createFallbackSession(deckId));
    } finally {
      setIsLoading(false);
    }
  }, [deckId]);

  useEffect(() => {
    let isCurrent = true;
    fetch(`/api/v1/decks/${deckId}/practice/start`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    })
      .then((res) => res.json())
      .then((json) => {
        if (isCurrent) {
          setSession(json.data ?? json);
          setIsLoading(false);
        }
      })
      .catch(() => {
        if (isCurrent) {
          setSession(createFallbackSession(deckId));
          setIsLoading(false);
        }
      });

    return () => {
      isCurrent = false;
    };
  }, [deckId]);

  const handleNextTurn = async () => {
    if (!session) return;
    try {
      const res = await fetch(`/api/v1/decks/${deckId}/practice/step`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId: session.sessionId, action: 'NEXT_TURN' }),
      });
      if (res.ok) {
        const json = await res.json();
        setSession(json.data ?? json);
        return;
      }
    } catch {
      // Fallback
    }

    setSession((prev) => {
      if (!prev) return null;
      const nextTurn = prev.turn + 1;
      const unTappedBattlefield = prev.battlefield.map((c) => ({ ...c, tapped: false }));
      return {
        ...prev,
        turn: nextTurn,
        phase: 'MAIN_1',
        battlefield: unTappedBattlefield,
        logs: [...(prev.logs || []), `Turn ${nextTurn} started. Untapped permanents.`],
      };
    });
  };

  const handleReset = async () => {
    if (!session) return;
    try {
      await fetch(`/api/v1/decks/${deckId}/practice/reset`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId: session.sessionId }),
      });
    } catch {
      // Continue reset
    }
    startSession();
  };

  const handlePlayCard = (cardToPlay: PracticeCard) => {
    if (!session) return;
    setSession({
      ...session,
      hand: session.hand.filter((c) => c.id !== cardToPlay.id),
      battlefield: [...session.battlefield, { ...cardToPlay, tapped: false }],
      logs: [...(session.logs || []), `Played ${cardToPlay.name} to the battlefield.`],
    });
  };

  const handleToggleTap = (cardId: number | string) => {
    if (!session) return;
    setSession({
      ...session,
      battlefield: session.battlefield.map((c) =>
        c.id === cardId ? { ...c, tapped: !c.tapped } : c
      ),
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12 text-amber-400">
        <Loader2 className="w-6 h-6 animate-spin mr-2" />
        <span className="text-sm">Starting practice board session...</span>
      </div>
    );
  }

  if (error || !session) {
    return (
      <div className="p-4 bg-red-950/40 border border-red-800 text-red-300 rounded-lg text-sm flex items-center justify-between">
        <div className="flex items-center gap-2">
          <AlertCircle className="w-4 h-4" />
          <span>{error || 'Failed to load practice board'}</span>
        </div>
        <button onClick={startSession} className="px-3 py-1 bg-red-900 rounded font-semibold text-xs">
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4" data-testid="practice-mode-board">
      {/* Board Controls & Turn Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 bg-slate-950 rounded-xl border border-slate-800">
        <div className="flex flex-wrap items-center gap-3">
          <div className="px-3 py-1 rounded-lg bg-amber-500 text-slate-950 font-black text-sm shadow-xs">
            Turn {session.turn}
          </div>
          <PhaseStepper currentPhase={session.phase} />
          <ManaPoolDisplay manaPool={session.manaPool || {}} />
          <DeckPileStatus libraryCount={session.libraryCount} graveyardCount={session.graveyard.length} />
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleNextTurn}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold text-xs transition-all shadow-md active:scale-95 cursor-pointer"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>Next Turn</span>
          </button>
          <button
            type="button"
            onClick={handleReset}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs transition-all border border-slate-700 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>
        </div>
      </div>

      {/* Battlefield Zone */}
      <div
        className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 min-h-[160px] space-y-2"
        data-testid="battlefield-zone"
      >
        <div className="flex justify-between items-center text-xs font-semibold text-slate-400 uppercase tracking-wider">
          <span className="flex items-center gap-1.5 text-emerald-400">
            <Sparkles className="w-3.5 h-3.5" />
            Battlefield ({session.battlefield.length})
          </span>
          <span className="text-[11px] normal-case text-slate-500">Click a permanent to tap/untap</span>
        </div>

        {session.battlefield.length === 0 ? (
          <div className="h-24 flex items-center justify-center text-slate-600 text-xs italic border border-dashed border-slate-800 rounded-lg">
            No permanents on battlefield. Play cards from your hand below.
          </div>
        ) : (
          <div className="flex flex-wrap gap-2.5 pt-1">
            {session.battlefield.map((c) => (
              <PracticeBattlefieldCard key={c.id} card={c} onToggleTap={handleToggleTap} />
            ))}
          </div>
        )}
      </div>

      {/* Hand Zone */}
      <div
        className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2"
        data-testid="hand-zone"
      >
        <div className="flex justify-between items-center text-xs font-semibold text-slate-400 uppercase tracking-wider">
          <span className="flex items-center gap-1.5 text-violet-400">
            <Layers className="w-3.5 h-3.5" />
            Hand ({session.hand.length})
          </span>
        </div>

        {session.hand.length === 0 ? (
          <div className="h-16 flex items-center justify-center text-slate-600 text-xs italic border border-dashed border-slate-800 rounded-lg">
            Your hand is empty.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5 pt-1">
            {session.hand.map((c) => (
              <PracticeHandCard key={c.id} card={c} onPlay={handlePlayCard} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
