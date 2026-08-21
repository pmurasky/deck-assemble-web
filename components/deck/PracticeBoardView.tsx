'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Loader2, AlertCircle } from 'lucide-react';
import { BoardControls } from './practice/BoardControls';
import { BattlefieldZone } from './practice/BattlefieldZone';
import { HandZone } from './practice/HandZone';
import type { PracticeCard, PracticeSessionResponse } from '@/types/m3';

interface PracticeBoardViewProps {
  deckId: number | string;
}

async function extractErrorMessage(res: Response, fallback: string): Promise<string> {
  try {
    const json = await res.json();
    return json.error?.message || json.message || fallback;
  } catch {
    return fallback;
  }
}

export function PracticeBoardView({ deckId }: PracticeBoardViewProps) {
  const [session, setSession] = useState<PracticeSessionResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const startSession = useCallback(async () => {
    try {
      const res = await fetch(`/api/v1/decks/${deckId}/practice-sessions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      if (!res.ok) {
        const msg = await extractErrorMessage(res, 'Failed to start practice session');
        setError(msg);
        setSession(null);
        return;
      }
      const json = await res.json();
      setSession(json.data ?? json);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start practice session');
      setSession(null);
    } finally {
      setIsLoading(false);
    }
  }, [deckId]);

  const handleRetry = () => {
    setIsLoading(true);
    setError(null);
    startSession();
  };

  useEffect(() => {
    let isMounted = true;
    const init = async () => {
      try {
        const res = await fetch(`/api/v1/decks/${deckId}/practice-sessions`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        });
        if (!res.ok) {
          const msg = await extractErrorMessage(res, 'Failed to start practice session');
          if (isMounted) {
            setError(msg);
            setSession(null);
          }
          return;
        }
        const json = await res.json();
        if (isMounted) setSession(json.data ?? json);
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err.message : 'Failed to start practice session');
          setSession(null);
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };
    init();
    return () => {
      isMounted = false;
    };
  }, [deckId]);

  const handlePlayCard = async (card: PracticeCard) => {
    if (!session) return;
    setError(null);
    try {
      const res = await fetch(`/api/v1/decks/${deckId}/practice-sessions/${session.sessionId}/play`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ printingId: card.printingId ?? 0 }),
      });
      if (!res.ok) {
        const msg = await extractErrorMessage(res, 'Failed to play card');
        setError(msg);
        return;
      }
      const json = await res.json();
      setSession(json.data ?? json);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to play card');
    }
  };

  const handleToggleTap = async (card: PracticeCard) => {
    if (!session) return;
    setError(null);
    try {
      const res = await fetch(`/api/v1/decks/${deckId}/practice-sessions/${session.sessionId}/tap`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ printingId: card.printingId ?? 0 }),
      });
      if (!res.ok) {
        const msg = await extractErrorMessage(res, 'Failed to tap permanent');
        setError(msg);
        return;
      }
      const json = await res.json();
      setSession(json.data ?? json);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to tap permanent');
    }
  };

  const handleNextTurn = async () => {
    if (!session) return;
    setError(null);
    try {
      const res = await fetch(`/api/v1/decks/${deckId}/practice-sessions/${session.sessionId}/steps`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      if (!res.ok) {
        const msg = await extractErrorMessage(res, 'Failed to advance turn');
        setError(msg);
        return;
      }
      const json = await res.json();
      setSession(json.data ?? json);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to advance turn');
    }
  };

  const handleReset = async () => {
    if (!session) return;
    setError(null);
    try {
      const res = await fetch(`/api/v1/decks/${deckId}/practice-sessions/${session.sessionId}/reset`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      if (!res.ok) {
        const msg = await extractErrorMessage(res, 'Failed to reset practice session');
        setError(msg);
        return;
      }
      const json = await res.json();
      setSession(json.data ?? json);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reset practice session');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12 text-amber-400">
        <Loader2 className="w-6 h-6 animate-spin mr-2" />
        <span className="text-sm">Starting practice board session...</span>
      </div>
    );
  }

  if (error && !session) {
    return (
      <div className="p-4 bg-red-950/40 border border-red-800 text-red-300 rounded-lg text-sm flex items-center justify-between">
        <div className="flex items-center gap-2">
          <AlertCircle className="w-4 h-4" />
          <span>{error}</span>
        </div>
        <button onClick={handleRetry} className="px-3 py-1 bg-red-900 rounded font-semibold text-xs cursor-pointer">
          Retry
        </button>
      </div>
    );
  }

  if (!session) return null;

  return (
    <div className="space-y-4" data-testid="practice-mode-board">
      {error && (
        <div className="p-3 bg-red-950/60 border border-red-800 text-red-300 rounded-lg text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <BoardControls
        turn={session.turn}
        landPlayed={session.landPlayedThisTurn}
        landsInPlay={session.landsInPlay}
        onNextTurn={handleNextTurn}
        onReset={handleReset}
      />

      <BattlefieldZone battlefield={session.battlefield} onToggleTap={handleToggleTap} />

      <HandZone hand={session.hand} castableSpells={session.castableSpells} onPlay={handlePlayCard} />
    </div>
  );
}
