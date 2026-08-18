'use client';

import React, { useEffect, useState } from 'react';
import { X, Printer, Loader2, AlertCircle } from 'lucide-react';

export interface ProxyCardItem {
  id?: number | string;
  name: string;
  quantity: number;
  manaCost?: string;
  typeLine?: string;
  oracleText?: string;
  imageUrl?: string;
}

interface ProxyPrintViewProps {
  isOpen: boolean;
  onClose: () => void;
  deckId: number | string;
  deckName: string;
}

function parseCardsFromPayload(payload: unknown): ProxyCardItem[] {
  if (!payload || typeof payload !== 'object') return [];
  const obj = payload as Record<string, unknown>;
  const rawList =
    obj.unownedCards ||
    obj.cards ||
    obj.missingCards ||
    (obj.data && (obj.data as Record<string, unknown>).unownedCards) ||
    [];
  if (Array.isArray(rawList)) {
    return rawList.map((item: unknown) => {
      const card = item as Record<string, unknown>;
      return {
        id: (card.id as string | number) || (card.cardId as string | number) || Math.random().toString(),
        name: (card.name as string) || (card.cardName as string) || 'Unknown Card',
        quantity: typeof card.quantity === 'number' ? card.quantity : 1,
        manaCost: card.manaCost as string | undefined,
        typeLine: card.typeLine as string | undefined,
        oracleText: card.oracleText as string | undefined,
        imageUrl: card.imageUrl as string | undefined,
      };
    });
  }
  return [];
}

export function ProxyPrintView({ isOpen, onClose, deckId, deckName }: ProxyPrintViewProps) {
  const [cards, setCards] = useState<ProxyCardItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isCurrent = true;
    if (!isOpen || !deckId) return;

    fetch(`/api/v1/decks/${deckId}/export?format=proxy-sheet`)
      .then((res) => {
        if (!res.ok) throw new Error('Failed to fetch proxy sheet data');
        return res.json();
      })
      .then((data) => {
        if (isCurrent) {
          const parsed = parseCardsFromPayload(data);
          setCards(parsed);
          setIsLoading(false);
        }
      })
      .catch((err) => {
        if (isCurrent) {
          setError(err instanceof Error ? err.message : 'Error loading proxy cards');
          setIsLoading(false);
        }
      });

    return () => {
      isCurrent = false;
    };
  }, [isOpen, deckId]);

  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto print:p-0 print:bg-white print:static print:overflow-visible"
      data-testid="proxy-print-view"
    >
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl max-w-4xl w-full p-6 text-zinc-100 shadow-2xl relative max-h-[90vh] overflow-y-auto print:max-h-none print:h-auto print:max-w-none print:p-0 print:border-none print:bg-white print:text-black">
        {/* Screen Toolbar - Hidden on Print */}
        <div className="flex items-center justify-between border-b border-zinc-800 pb-4 mb-6 print:hidden">
          <div>
            <h2 className="text-xl font-bold text-white">Proxy Sheet: {deckName}</h2>
            <p className="text-xs text-zinc-400">
              Print-optimized proxy cards for unowned/missing cards ({cards.length} unowned cards)
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handlePrint}
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-bold transition-all shadow-md active:scale-95 cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Print / PDF</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-2 hover:bg-zinc-800 rounded-xl text-zinc-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-16 text-purple-400">
            <Loader2 className="w-8 h-8 animate-spin mb-3" />
            <p className="text-sm font-semibold text-zinc-300">Generating proxy print sheet...</p>
          </div>
        ) : error ? (
          <div className="p-4 bg-red-950/40 border border-red-800 text-red-300 rounded-xl text-sm flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              <span>{error}</span>
            </div>
          </div>
        ) : cards.length === 0 ? (
          <div className="py-16 text-center text-zinc-400 border border-dashed border-zinc-800 rounded-xl">
            <p className="font-semibold text-sm">All cards owned! No proxies needed for this deck.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 print:grid-cols-3 print:gap-2">
            {cards.map((card, idx) => (
              <div
                key={`${card.id}-${idx}`}
                data-testid="proxy-card-item"
                className="p-4 rounded-xl border border-zinc-700 bg-zinc-950 text-zinc-100 flex flex-col justify-between min-h-[220px] print:border-2 print:border-black print:bg-white print:text-black print:break-inside-avoid print:p-2"
              >
                <div>
                  <div className="flex justify-between items-start gap-2 border-b border-zinc-800 print:border-black pb-1.5 mb-2">
                    <span className="font-extrabold text-sm truncate print:text-black">{card.name}</span>
                    {card.manaCost && (
                      <span className="font-mono text-xs text-amber-400 font-bold print:text-black">
                        {card.manaCost}
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] text-zinc-400 print:text-zinc-700 font-semibold mb-2">
                    {card.typeLine || 'Card'}
                  </div>
                  {card.oracleText && (
                    <p className="text-xs text-zinc-300 print:text-black leading-relaxed line-clamp-4 print:line-clamp-none">
                      {card.oracleText}
                    </p>
                  )}
                </div>
                <div className="flex justify-between items-center pt-2 border-t border-zinc-800 print:border-black text-[10px] text-zinc-500 print:text-black font-mono">
                  <span>QTY: {card.quantity}</span>
                  <span className="uppercase tracking-wider font-semibold">PROXY</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
