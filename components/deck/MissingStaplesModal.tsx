'use client';

import React from 'react';
import { X, Sparkles, Layers, CheckCircle2, Loader2, AlertCircle } from 'lucide-react';
import type { CommanderSuggestion, WishlistItem } from '@/types/builder';

interface MissingStaplesModalProps {
  isOpen: boolean;
  onClose: () => void;
  commander: CommanderSuggestion | null;
  isLoading: boolean;
  error: string | null;
  wishlistItems: WishlistItem[];
  onBuildFullDeck: () => void;
}

export function MissingStaplesModal({
  isOpen,
  onClose,
  commander,
  isLoading,
  error,
  wishlistItems,
  onBuildFullDeck,
}: MissingStaplesModalProps) {
  if (!isOpen || !commander) return null;

  const totalCost = wishlistItems.reduce((sum, item) => sum + (item.estimatedPrice || 0) * item.quantity, 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full p-6 text-slate-100 shadow-2xl relative animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-violet-600/20 border border-violet-500/30 flex items-center justify-center text-violet-400">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                Missing Staples Preview
              </h2>
              <p className="text-xs text-slate-400">
                Staples needed for <span className="text-violet-300 font-semibold">{commander.name}</span>
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Commander Overview Stats */}
        <div className="grid grid-cols-3 gap-3 mb-5 p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-xs">
          <div>
            <span className="text-slate-400 block text-[11px]">Ownership Coverage</span>
            <span className="font-bold text-emerald-400">{commander.ownershipCoverage}% Owned</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[11px]">Missing Cards</span>
            <span className="font-bold text-amber-400">{commander.missingStaplesCount} Cards</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[11px]">Est. Completion Cost</span>
            <span className="font-bold text-indigo-300">
              ${(totalCost > 0 ? totalCost : commander.estimatedCostToComplete).toFixed(2)}
            </span>
          </div>
        </div>

        {/* Content Body */}
        {isLoading ? (
          <div className="py-12 text-center text-slate-400 space-y-3">
            <Loader2 className="w-8 h-8 animate-spin text-violet-400 mx-auto" />
            <p className="text-sm font-medium">Analyzing deck construction & missing staples...</p>
          </div>
        ) : error ? (
          <div className="p-4 rounded-xl bg-rose-950/40 border border-rose-500/40 text-rose-300 flex items-center gap-3 text-sm mb-4">
            <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
            <div>
              <span className="font-bold">Could not load list: </span>
              <span>{error}</span>
            </div>
          </div>
        ) : wishlistItems.length === 0 ? (
          <div className="py-8 text-center text-slate-400 space-y-2">
            <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
            <p className="text-sm font-semibold text-slate-200">You already own all key staples for this commander!</p>
            <p className="text-xs text-slate-500">Build the deck to generate full 100-card synergy breakdown.</p>
          </div>
        ) : (
          <div className="max-h-80 overflow-y-auto space-y-2 pr-1 mb-6">
            {wishlistItems.map((item) => (
              <div
                key={item.card.id}
                className="flex items-center justify-between p-3 rounded-xl bg-slate-950/40 border border-slate-800/80 hover:border-slate-700 transition-colors"
              >
                <div className="flex items-center gap-3">
                  {item.card.imageUrl ? (
                    <img
                      src={item.card.imageUrl}
                      alt={item.card.name}
                      className="w-9 h-12 rounded object-cover border border-slate-800"
                    />
                  ) : (
                    <div className="w-9 h-12 rounded bg-slate-800 flex items-center justify-center text-[10px] text-slate-500 font-mono">
                      MTG
                    </div>
                  )}
                  <div>
                    <h4 className="text-sm font-semibold text-slate-200">{item.card.name}</h4>
                    <p className="text-xs text-slate-400">{item.card.typeLine}</p>
                  </div>
                </div>

                <div className="text-right flex items-center gap-4">
                  <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-amber-950/60 text-amber-300 border border-amber-500/30">
                    {item.priority}
                  </span>
                  <span className="text-xs font-semibold text-slate-300">
                    ${item.estimatedPrice ? item.estimatedPrice.toFixed(2) : '0.00'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold transition-colors"
          >
            Close Preview
          </button>

          <button
            type="button"
            onClick={() => {
              onClose();
              onBuildFullDeck();
            }}
            className="flex items-center gap-2 px-5 py-2.5 bg-violet-600 hover:bg-violet-500 text-white rounded-xl text-xs font-bold transition-all shadow-lg hover:shadow-violet-600/30 active:scale-95"
          >
            <Sparkles className="w-4 h-4" />
            <span>Build Full 100-Card Deck</span>
          </button>
        </div>
      </div>
    </div>
  );
}
