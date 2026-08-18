'use client';

import React, { useMemo } from 'react';
import { useDeckStore, type DeckCard } from '@/lib/store/deck-store';
import type { Card } from '@/types/card';

interface ValidationResult {
  isLegal: boolean;
  errors: string[];
}

function validateCardLegality(card: Card, format: string, errors: string[]): void {
  const formatKey = format.toLowerCase();
  const status = card.legalities?.[formatKey];
  if (!status || status === 'legal' || status === 'restricted') return;
  if (status === 'banned') {
    errors.push(`${card.name} is banned in ${format}.`);
  } else {
    errors.push(`${card.name} is not legal in ${format}.`);
  }
}

function validateCommanderRules(
  cards: DeckCard[],
  activeCommander: Card | undefined,
  totalCards: number,
  errors: string[]
): void {
  if (totalCards !== 100) {
    errors.push(`Deck must be exactly 100 cards (currently ${totalCards}).`);
  }
  if (!activeCommander) {
    errors.push('Commander format requires a designated Commander.');
  }
  cards.forEach(({ card, quantity }) => {
    if (!card.typeLine?.includes('Basic Land') && quantity > 1) {
      errors.push(`Only 1 copy of ${card.name} is allowed in Commander.`);
    }
    validateCardLegality(card, 'Commander', errors);
  });
}

function validateConstructedRules(
  format: string,
  cards: DeckCard[],
  totalCards: number,
  errors: string[]
): void {
  if (totalCards < 60) {
    errors.push(`${format} decks must have at least 60 cards (currently ${totalCards}).`);
  }
  cards.forEach(({ card, quantity }) => {
    if (!card.typeLine?.includes('Basic Land') && quantity > 4) {
      errors.push(`Maximum 4 copies of ${card.name} allowed in ${format}.`);
    }
    validateCardLegality(card, format, errors);
  });
}

export function FormatValidator() {
  const { cards, metadata, commander } = useDeckStore();

  const validation = useMemo<ValidationResult>(() => {
    const errors: string[] = [];
    const activeCommander = commander || cards.find((c) => c.deckSection === 'COMMANDER')?.card;
    const hasSeparateCommander = Boolean(commander && !cards.some((c) => c.card.id === commander.id));
    const totalCards = cards.reduce((sum, c) => sum + c.quantity, 0) + (hasSeparateCommander ? 1 : 0);

    if (metadata.format === 'Commander') {
      validateCommanderRules(cards, activeCommander, totalCards, errors);
    } else {
      validateConstructedRules(metadata.format, cards, totalCards, errors);
    }

    return { isLegal: errors.length === 0, errors };
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

