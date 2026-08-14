'use client';

import React, { useEffect, useState } from 'react';
import {
  ShoppingCart,
  CheckCircle2,
  Download,
  FileText,
  DollarSign,
  RefreshCw,
  Sparkles,
  ArrowLeft,
  Layers,
} from 'lucide-react';
import {
  fetchDeckWishlist,
  syncDeckOwnershipClient,
  acquireDeckCardClient,
} from '@/lib/api/decks';
import type { DeckWishlistItem, DeckWishlistResponse } from '@/types/builder';

interface DeckWishlistPanelProps {
  deckId: number | string;
  onBackToDeck?: () => void;
}

export function DeckWishlistPanel({ deckId, onBackToDeck }: DeckWishlistPanelProps) {
  const [data, setData] = useState<DeckWishlistResponse | null>(null);
  const [acquiredIds, setAcquiredIds] = useState<Set<number>>(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copiedNotification, setCopiedNotification] = useState<string | null>(null);

  const loadWishlist = async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Step 1: Sync deck ownership against user's collections
      setIsSyncing(true);
      await syncDeckOwnershipClient(Number(deckId)).catch(() => null);
      setIsSyncing(false);

      // Step 2: Fetch latest wishlist
      const wishlist = await fetchDeckWishlist(Number(deckId));
      setData(wishlist);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load deck wishlist');
    } finally {
      setIsLoading(false);
      setIsSyncing(false);
    }
  };

  useEffect(() => {
    if (deckId) {
      loadWishlist();
    }
  }, [deckId]);

  const handleAcquire = async (deckCardId: number) => {
    try {
      await acquireDeckCardClient(Number(deckId), deckCardId);
      setAcquiredIds((prev) => new Set(prev).add(deckCardId));
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to mark card as acquired');
    }
  };

  const activeItems = (data?.items || []).filter((item) => !acquiredIds.has(item.deckCardId));
  const acquiredItems = (data?.items || []).filter((item) => acquiredIds.has(item.deckCardId));

  const totalCost = activeItems.reduce(
    (sum, item) => sum + (item.lineTotalUsd ?? (item.unitPriceUsd ? item.unitPriceUsd * item.quantity : 0)),
    0
  );

  const exportAsText = () => {
    const textLines = activeItems
      .map((item) => `${item.quantity} ${item.cardName}`)
      .join('\n');
    navigator.clipboard.writeText(textLines);
    setCopiedNotification('Wishlist copied as text to clipboard!');
    setTimeout(() => setCopiedNotification(null), 3000);
  };

  const exportAsCSV = () => {
    const header = 'Card Name,Quantity,Unit Price (USD),Line Total (USD)\n';
    const csvLines = activeItems
      .map(
        (item) =>
          `"${item.cardName}",${item.quantity},${(item.unitPriceUsd ?? 0).toFixed(2)},${(item.lineTotalUsd ?? 0).toFixed(2)}`
      )
      .join('\n');
    const blob = new Blob([header + csvLines], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `deck_${deckId}_wishlist.csv`;
    link.click();
    URL.revokeObjectURL(url);
    setCopiedNotification('Downloaded CSV file!');
    setTimeout(() => setCopiedNotification(null), 3000);
  };

  if (isLoading) {
    return (
      <div className="p-12 text-center border border-zinc-800 rounded-2xl bg-zinc-900/40">
        <RefreshCw className="w-8 h-8 text-amber-500 animate-spin mx-auto mb-3" />
        <p className="text-zinc-400 text-sm font-medium">
          {isSyncing ? 'Syncing collection ownership...' : 'Loading deck wishlist...'}
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-red-950/30 border border-red-800/40 rounded-2xl text-red-300 text-sm flex items-center justify-between">
        <div>
          <p className="font-semibold">{error}</p>
        </div>
        <button
          onClick={loadWishlist}
          className="px-3 py-1.5 bg-red-900/50 hover:bg-red-800 text-white rounded-lg text-xs font-semibold transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6" data-testid="deck-wishlist-panel">
      {/* Top Action Bar */}
      <div className="p-6 rounded-2xl bg-zinc-900 border border-zinc-800 shadow-xl space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            {onBackToDeck && (
              <button
                type="button"
                onClick={onBackToDeck}
                className="p-2 rounded-lg bg-zinc-950 border border-zinc-800 text-zinc-300 hover:text-white hover:border-zinc-700 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
            )}
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold text-amber-400 uppercase tracking-wider">
                <ShoppingCart className="w-3.5 h-3.5" />
                <span>Deck Wishlist</span>
              </div>
              <h2 className="text-2xl font-black text-zinc-100 mt-0.5">
                Acquisition Wishlist
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={loadWishlist}
              className="px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 hover:border-zinc-700 text-zinc-200 text-xs font-semibold flex items-center gap-1.5 transition-all"
              title="Sync Ownership and Refresh"
            >
              <RefreshCw className="w-4 h-4 text-purple-400" />
              <span>Sync Ownership</span>
            </button>

            <button
              type="button"
              onClick={exportAsText}
              aria-label="Export Text"
              className="px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 hover:border-zinc-700 text-zinc-200 text-xs font-semibold flex items-center gap-1.5 transition-all"
            >
              <FileText className="w-4 h-4 text-violet-400" />
              <span>Export Text</span>
            </button>

            <button
              type="button"
              onClick={exportAsCSV}
              aria-label="Export CSV"
              className="px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 hover:border-zinc-700 text-zinc-200 text-xs font-semibold flex items-center gap-1.5 transition-all"
            >
              <Download className="w-4 h-4 text-emerald-400" />
              <span>Export CSV</span>
            </button>
          </div>
        </div>

        {copiedNotification && (
          <div className="p-2.5 rounded-lg bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 text-xs font-medium">
            {copiedNotification}
          </div>
        )}

        {/* Total Cost Summary Card */}
        <div className="flex items-center justify-between p-4 rounded-xl bg-zinc-950 border border-zinc-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-amber-950/60 border border-amber-500/30 text-amber-400">
              <DollarSign className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs text-zinc-400 uppercase font-semibold">Total Estimated Wishlist Cost</span>
              <div className="text-2xl font-black text-amber-300">${totalCost.toFixed(2)}</div>
            </div>
          </div>

          <div className="text-right text-xs text-zinc-400">
            <span className="font-bold text-zinc-200">{activeItems.length}</span> unowned cards remaining
          </div>
        </div>
      </div>

      {/* Wishlist Items List */}
      {activeItems.length === 0 && acquiredItems.length === 0 ? (
        <div className="p-12 text-center border-2 border-dashed border-zinc-800 rounded-2xl bg-zinc-900/20">
          <CheckCircle2 className="w-14 h-14 text-emerald-500 mx-auto mb-3" />
          <h3 className="text-xl font-bold text-zinc-200">Deck is 100% Owned!</h3>
          <p className="text-zinc-400 text-sm mt-1">
            All cards in this deck are currently marked as owned in your collections.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="divide-y divide-zinc-800/80 rounded-xl bg-zinc-900 border border-zinc-800 overflow-hidden">
            {activeItems.map((item) => (
              <div
                key={item.deckCardId}
                className="flex items-center justify-between p-4 hover:bg-zinc-800/60 transition-colors group"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className="font-mono text-xs text-zinc-500 font-bold w-6">
                    {item.quantity}x
                  </span>
                  <div className="min-w-0">
                    <span className="text-sm font-bold text-zinc-100 group-hover:text-amber-300 transition-colors truncate block">
                      {item.cardName}
                    </span>
                    {item.unitPriceUsd !== null && item.unitPriceUsd !== undefined && (
                      <span className="text-xs text-zinc-500 font-mono">
                        ${item.unitPriceUsd.toFixed(2)} each
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <span className="font-mono text-sm font-bold text-amber-300">
                    ${((item.lineTotalUsd ?? (item.unitPriceUsd ? item.unitPriceUsd * item.quantity : 0))).toFixed(2)}
                  </span>

                  <button
                    type="button"
                    onClick={() => handleAcquire(item.deckCardId)}
                    aria-label={`Acquire ${item.cardName}`}
                    className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-md active:scale-95"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Acquire</span>
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Acquired Items Section */}
          {acquiredItems.length > 0 && (
            <div className="pt-4 space-y-2 border-t border-zinc-800">
              <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Marked as Acquired in this session ({acquiredItems.length})</span>
              </h3>

              <div className="divide-y divide-zinc-800/40 rounded-xl bg-zinc-950/60 border border-zinc-800/60 overflow-hidden">
                {acquiredItems.map((item) => (
                  <div
                    key={item.deckCardId}
                    className="flex items-center justify-between p-3 opacity-60 text-xs"
                  >
                    <span className="font-medium text-zinc-300 line-through">
                      {item.quantity}x {item.cardName}
                    </span>
                    <span className="text-emerald-400 font-semibold flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      Acquired
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
