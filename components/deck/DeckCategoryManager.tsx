'use client';

import React, { useEffect, useState } from 'react';
import { Layers, Plus, Trash2, Tag, Loader2 } from 'lucide-react';
import type { DeckCategory } from '@/types/card';
import {
  getDeckCategories,
  createDeckCategory,
  deleteDeckCategory,
} from '@/lib/api/decks';

interface DeckCategoryManagerProps {
  deckId: number;
  onCategorySelect?: (category: DeckCategory) => void;
}

export function DeckCategoryManager({ deckId, onCategorySelect }: DeckCategoryManagerProps) {
  const [categories, setCategories] = useState<DeckCategory[]>([]);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);



  useEffect(() => {
    let isMounted = true;
    if (!deckId) return;
    getDeckCategories(deckId)
      .then((resData) => {
        if (isMounted) {
          setCategories(resData);
          setIsLoading(false);
        }
      })
      .catch((err: unknown) => {
        if (isMounted) {
          setError(err instanceof Error ? err.message : 'Failed to load categories');
          setIsLoading(false);
        }
      });
    return () => {
      isMounted = false;
    };
  }, [deckId]);

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;

    setIsCreating(true);
    try {
      const created = await createDeckCategory(deckId, {
        name: newCategoryName.trim(),
        color: '#8b5cf6',
      });
      setCategories((prev) => [...prev, created]);
      setNewCategoryName('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create category');
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeleteCategory = async (id: number) => {
    try {
      await deleteDeckCategory(deckId, id);
      setCategories((prev) => prev.filter((c) => c.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete category');
    }
  };

  return (
    <div className="bg-zinc-900/90 border border-zinc-800 rounded-2xl p-6 space-y-4">
      <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
        <div className="flex items-center gap-2 text-zinc-100 font-bold text-base">
          <Layers className="w-5 h-5 text-purple-400" />
          <span>Deck Categories</span>
        </div>
        <span className="text-xs text-zinc-400 font-medium">{categories.length} Custom Categories</span>
      </div>

      {error && <div className="p-3 bg-red-950/40 border border-red-800 text-red-300 text-xs rounded-xl">{error}</div>}

      <form onSubmit={handleAddCategory} className="flex gap-2">
        <input
          type="text"
          placeholder="Category name..."
          value={newCategoryName}
          onChange={(e) => setNewCategoryName(e.target.value)}
          className="flex-1 px-3.5 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-zinc-100 focus:outline-none focus:border-purple-500"
        />
        <button
          type="submit"
          disabled={isCreating || !newCategoryName.trim()}
          className="px-4 py-2 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition-colors inline-flex items-center gap-1.5 shrink-0"
        >
          {isCreating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
          Add Category
        </button>
      </form>

      {isLoading ? (
        <div className="p-4 text-center text-xs text-zinc-500">Loading categories...</div>
      ) : categories.length === 0 ? (
        <div className="p-6 text-center border border-dashed border-zinc-800 rounded-xl text-xs text-zinc-500">
          No categories created yet. Add categories like Ramp, Card Draw, or Win-cons.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-60 overflow-y-auto pr-1">
          {categories.map((cat) => (
            <div
              key={cat.id}
              onClick={() => onCategorySelect && onCategorySelect(cat)}
              className="flex justify-between items-center bg-zinc-950 p-3 rounded-xl border border-zinc-800/80 hover:border-purple-500/50 transition-colors group cursor-pointer"
            >
              <div className="flex items-center gap-2 min-w-0">
                <Tag className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                <span className="text-xs font-semibold text-zinc-200 truncate">{cat.name}</span>
                {cat.cardCount !== undefined && (
                  <span className="text-[10px] bg-purple-950/60 text-purple-300 border border-purple-800/50 px-1.5 py-0.5 rounded font-mono">
                    {cat.cardCount} cards
                  </span>
                )}
              </div>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteCategory(cat.id);
                }}
                className="text-zinc-600 hover:text-red-400 p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                title="Delete Category"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
