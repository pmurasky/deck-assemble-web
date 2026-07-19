'use client';

import React, { useMemo } from 'react';
import { useDeckStore } from '@/lib/store/deck-store';

export function FormatValidator() {
  const { cards, metadata, commander } = useDeckStore();

  const validation = useMemo(() => {
    const errors: string[] = [];
    let isLegal = true;

    const totalCards = cards.reduce((sum, c) => sum + c.quantity, 0);

    if (metadata.format === 'Commander') {
      if (totalCards !== 100) {
        errors.push(`Deck must be exactly 100 cards (currently ${totalCards}).`);
        isLegal = false;
      }

      if (!commander) {
        errors.push('Commander format requires a designated Commander.');
        isLegal = false;
      }

      cards.forEach(({ card, quantity }) => {
        if (!card.typeLine?.includes('Basic Land') && quantity > 1) {
          errors.push(`Only 1 copy of ${card.name} is allowed in Commander.`);
          isLegal = false;
        }
      });
    }

    return { isLegal, errors };
  }, [cards, metadata.format, commander]);

  if (validation.isLegal) {
    return (
      <div className="bg-green-950/40 border border-green-800/60 rounded-lg p-4 text-green-400">
        <div className="flex items-center gap-2 font-medium">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          Deck is legal for {metadata.format}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-red-950/30 border border-red-900/50 rounded-lg p-4 space-y-2">
      <div className="flex items-center gap-2 font-medium text-red-400 border-b border-red-900/30 pb-2 mb-2">
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
        Deck Issues Found
      </div>
      <ul className="text-sm text-red-300/80 list-disc pl-5 space-y-1">
        {validation.errors.map((error, idx) => (
          <li key={idx}>{error}</li>
        ))}
      </ul>
    </div>
  );
}
