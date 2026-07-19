import { describe, it, expect } from 'vitest';
import { createSuccessResponse, createErrorResponse, isSuccessResponse } from '@/lib/api/response';
import { cardSchema, createDeckSchema } from '@/lib/validation/card';

describe('API Response Helpers', () => {
  it('should create a valid success response wrapper', () => {
    const data = { id: 'card-1', name: 'Spider-Man' };
    const response = createSuccessResponse(data);

    expect(response).toEqual({
      ok: true,
      data: { id: 'card-1', name: 'Spider-Man' },
    });
    expect(isSuccessResponse(response)).toBe(true);
  });

  it('should create a valid error response wrapper', () => {
    const response = createErrorResponse('NOT_FOUND', 'Card not found');

    expect(response).toEqual({
      ok: false,
      error: {
        code: 'NOT_FOUND',
        message: 'Card not found',
      },
    });
    expect(isSuccessResponse(response)).toBe(false);
  });
});

describe('Domain Zod Validation Schemas', () => {
  it('should validate a complete MTG/Marvel card model', () => {
    const validCard = {
      id: 'marvel-spider-man',
      oracleId: 'spidey-oracle-1',
      name: 'Spider-Man, Neighborhood Hero',
      imageUrl: 'https://cards.scryfall.io/large/spidey.jpg',
      manaCost: '{1}{U}{R}',
      manaValue: 3,
      colors: ['U', 'R'],
      colorIdentity: ['U', 'R'],
      typeLine: 'Legendary Creature — Hero Human',
      oracleText: 'Reach, Haste\nWhenever Spider-Man attacks, draw a card.',
      power: '3',
      toughness: '3',
      setCode: 'MAR',
      setName: 'Marvel MTG Set',
      rarity: 'rare',
      legalities: { commander: 'legal', standard: 'not_legal' },
    };

    const result = cardSchema.safeParse(validCard);
    expect(result.success).toBe(true);
  });

  it('should reject invalid deck creation input', () => {
    const invalidDeck = {
      name: '',
      format: 'Commander',
    };

    const result = createDeckSchema.safeParse(invalidDeck);
    expect(result.success).toBe(false);
  });
});
