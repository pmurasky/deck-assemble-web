'use client';

import React, { useState } from 'react';
import type { SharedDeckResponse } from '@/types/m3';

interface SharedDeckClientProps {
  deck: SharedDeckResponse;
}

export function SharedDeckClient({ deck }: SharedDeckClientProps) {
  const [forking, setForking] = useState(false);
  const [forkMessage, setForkMessage] = useState<string | null>(null);
  const [forkError, setForkError] = useState<string | null>(null);

  const handleFork = async () => {
    setForking(true);
    setForkMessage(null);
    setForkError(null);
    try {
      const res = await fetch(`/api/v1/shared/decks/${encodeURIComponent(deck.slug)}/fork`, {
        method: 'POST',
      });
      const payload = await res.json();
      if (!res.ok) {
        throw new Error(payload.error?.message || 'Failed to fork deck');
      }
      setForkMessage(`Deck forked successfully! Created new private deck #${payload.data.newDeckId}.`);
    } catch (err: unknown) {
      setForkError(err instanceof Error ? err.message : 'Error forking deck');
    } finally {
      setForking(false);
    }
  };

  const renderSanitizedMarkdown = (source?: string) => {
    if (!source) return <p className="text-slate-500 italic">No primer published with this deck.</p>;
    const escaped = source.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    const lines = escaped.split('\n');
    return (
      <div className="space-y-2 text-slate-200 text-sm">
        {lines.map((line, idx) => {
          if (line.startsWith('# ')) return <h1 key={idx} className="text-xl font-bold text-amber-400 border-b border-slate-800 pb-1">{line.slice(2)}</h1>;
          if (line.startsWith('## ')) return <h2 key={idx} className="text-lg font-semibold text-amber-300">{line.slice(3)}</h2>;
          if (line.startsWith('- ') || line.startsWith('* ')) return <li key={idx} className="ml-4 list-disc text-slate-300">{line.slice(2)}</li>;
          if (!line.trim()) return <div key={idx} className="h-2" />;
          return <p key={idx} className="leading-relaxed">{line}</p>;
        })}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white p-6 max-w-5xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-extrabold text-amber-400">{deck.name}</h1>
            <span className="text-xs px-2.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 uppercase font-mono font-semibold">
              {deck.formatCode}
            </span>
          </div>
          {deck.commanderName && (
            <p className="text-sm text-slate-300 mt-1">Commander: <span className="font-semibold text-amber-300">{deck.commanderName}</span></p>
          )}
          <p className="text-xs text-slate-500 mt-1">
            Pinned Revision #{deck.publishedRevisionNumber} &bull; Published {new Date(deck.publishedAt).toLocaleDateString()}
          </p>
        </div>

        <button
          onClick={handleFork}
          disabled={forking}
          className="px-5 py-2.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm shadow-lg shadow-amber-500/10 transition-all disabled:opacity-50"
        >
          {forking ? 'Forking...' : 'Fork Deck'}
        </button>
      </div>

      {forkMessage && (
        <div className="p-4 bg-emerald-950/80 border border-emerald-800 text-emerald-300 rounded-lg text-sm">
          {forkMessage}
        </div>
      )}

      {forkError && (
        <div className="p-4 bg-red-950/80 border border-red-800 text-red-300 rounded-lg text-sm">
          {forkError}
        </div>
      )}

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column: Card List */}
        <div className="md:col-span-1 bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
          <h2 className="text-base font-bold text-slate-200 border-b border-slate-800 pb-2">
            Deck Cards ({deck.cards?.length ?? 0})
          </h2>
          {deck.cards?.length === 0 ? (
            <p className="text-xs text-slate-500">No cards in this deck snapshot.</p>
          ) : (
            <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
              {(deck.cards || []).map((c, idx) => (
                <div key={idx} className="flex justify-between items-center text-xs p-2 rounded bg-slate-950/60 border border-slate-800/80">
                  <span className="text-slate-200 font-medium">
                    {c.quantity}x {c.card?.name ?? 'Card'}
                  </span>
                  {c.card?.manaCost && (
                    <span className="text-amber-400 font-mono text-[11px]">{c.card.manaCost}</span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Primer */}
        <div className="md:col-span-2 bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
          <h2 className="text-base font-bold text-slate-200 border-b border-slate-800 pb-2">
            {deck.primer?.title || 'Strategy Primer & Guide'}
          </h2>
          <div className="p-4 bg-slate-950 rounded-lg border border-slate-800 min-h-[300px]">
            {renderSanitizedMarkdown(deck.primer?.content)}
          </div>
        </div>
      </div>
    </div>
  );
}
