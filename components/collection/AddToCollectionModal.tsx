'use client';

import React, { useState } from 'react';
import type { Card } from '@/types/card';
import { Sparkles, Plus, Minus, X } from 'lucide-react';

interface AddToCollectionModalProps {
  card: Card;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (regularQuantity: number, foilQuantity: number) => Promise<void>;
}

export function AddToCollectionModal({
  card,
  isOpen,
  onClose,
  onConfirm,
}: AddToCollectionModalProps) {
  const [regularQuantity, setRegularQuantity] = useState(1);
  const [foilQuantity, setFoilQuantity] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (regularQuantity < 0 || regularQuantity > 9999 || foilQuantity < 0 || foilQuantity > 9999) {
      setError('Quantities must be between 0 and 9999.');
      return;
    }
    if (regularQuantity === 0 && foilQuantity === 0) {
      setError('Please specify at least 1 regular or 1 foil copy.');
      return;
    }

    setError(null);
    setIsSubmitting(true);
    try {
      await onConfirm(regularQuantity, foilQuantity);
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to add card');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4">
      <div className="relative w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-2xl space-y-6">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-zinc-400 hover:text-white p-1 rounded-lg hover:bg-zinc-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div>
          <h3 className="text-xl font-extrabold text-white flex items-center gap-2">
            Add to Collection
          </h3>
          <p className="text-sm text-zinc-400 mt-1 font-medium">{card.name}</p>
        </div>

        {/* Visual Preview */}
        <div className="relative p-4 rounded-xl bg-zinc-950/60 border border-zinc-800 flex items-center gap-4">
          {card.imageUrl ? (
            <div className="relative w-16 aspect-[2.5/3.5] rounded-md overflow-hidden flex-shrink-0">
              <img src={card.imageUrl} alt={card.name} className="w-full h-full object-cover" />
              {foilQuantity > 0 && (
                <div className="absolute inset-0 bg-gradient-to-tr from-amber-400/30 via-purple-500/30 to-cyan-400/30 animate-pulse pointer-events-none" />
              )}
            </div>
          ) : (
            <div className="w-16 aspect-[2.5/3.5] rounded-md bg-zinc-900 border border-zinc-800 flex items-center justify-center flex-shrink-0 text-xs font-bold text-zinc-500">
              Card
            </div>
          )}

          <div className="space-y-1">
            <div className="text-sm font-semibold text-zinc-200">{card.typeLine}</div>
            <div className="flex gap-2">
              {regularQuantity > 0 && (
                <span className="text-xs px-2 py-0.5 rounded-md bg-zinc-800 text-zinc-300 font-mono">
                  {regularQuantity} Regular
                </span>
              )}
              {foilQuantity > 0 && (
                <span className="text-xs px-2 py-0.5 rounded-md bg-gradient-to-r from-amber-500/20 via-purple-500/20 to-blue-500/20 border border-amber-500/40 text-amber-300 font-mono font-bold flex items-center gap-1 shadow-[0_0_10px_rgba(245,158,11,0.2)]">
                  <Sparkles className="w-3 h-3 text-amber-400" />
                  {foilQuantity} Foil
                </span>
              )}
            </div>
          </div>
        </div>

        {error && (
          <div className="p-3 bg-red-950/50 border border-red-800 rounded-lg text-xs text-red-400">
            {error}
          </div>
        )}

        <form onSubmit={handleAdd} className="space-y-5">
          {/* Regular Quantity Input */}
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
              Regular Quantity
            </label>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setRegularQuantity(Math.max(0, regularQuantity - 1))}
                className="w-10 h-10 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 flex items-center justify-center transition-colors"
              >
                <Minus className="w-4 h-4" />
              </button>
              <input
                type="number"
                min="0"
                max="9999"
                value={regularQuantity}
                onChange={(e) => setRegularQuantity(Math.max(0, parseInt(e.target.value || '0', 10)))}
                className="w-full text-center py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-white font-mono text-lg focus:outline-none focus:ring-2 focus:ring-green-500/50"
              />
              <button
                type="button"
                onClick={() => setRegularQuantity(Math.min(9999, regularQuantity + 1))}
                className="w-10 h-10 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 flex items-center justify-center transition-colors"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Foil Quantity Input */}
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              Foil Quantity
            </label>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setFoilQuantity(Math.max(0, foilQuantity - 1))}
                className="w-10 h-10 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-amber-300 flex items-center justify-center transition-colors"
              >
                <Minus className="w-4 h-4" />
              </button>
              <input
                type="number"
                min="0"
                max="9999"
                value={foilQuantity}
                onChange={(e) => setFoilQuantity(Math.max(0, parseInt(e.target.value || '0', 10)))}
                className="w-full text-center py-2 bg-zinc-950 border border-amber-500/30 rounded-lg text-amber-300 font-mono text-lg focus:outline-none focus:ring-2 focus:ring-amber-500/50"
              />
              <button
                type="button"
                onClick={() => setFoilQuantity(Math.min(9999, foilQuantity + 1))}
                className="w-10 h-10 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-amber-300 flex items-center justify-center transition-colors"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-semibold rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 py-3 bg-green-600 hover:bg-green-500 text-white font-bold rounded-xl transition-all shadow-[0_0_15px_rgba(34,197,94,0.3)] disabled:opacity-50"
            >
              {isSubmitting ? 'Adding...' : 'Add to Collection'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
