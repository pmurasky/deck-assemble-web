import { describe, it, expect } from 'vitest';
import { MOCK_CARDS } from '@/lib/mock-data/cards';
import { cardSchema } from '@/lib/validation/card';

describe('Mock Data: Cards', () => {
  it('should be an array of valid Card objects', () => {
    expect(Array.isArray(MOCK_CARDS)).toBe(true);
    expect(MOCK_CARDS.length).toBeGreaterThan(0);

    MOCK_CARDS.forEach(card => {
      const result = cardSchema.safeParse(card);
      expect(result.success).toBe(true);
    });
  });
});
