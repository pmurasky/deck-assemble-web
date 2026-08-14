import { describe, it, expect } from 'vitest';
import {
  deriveOwnership,
  formatManaCurve,
  formatColorDemand,
  formatCategories,
} from '@/components/deck/DeckAnalysisPanel';

describe('DeckAnalysisPanel pure helpers', () => {
  describe('deriveOwnership', () => {
    it('returns zeroes for undefined breakdown', () => {
      const result = deriveOwnership(undefined);
      expect(result).toEqual({
        totalCards: 0,
        ownedCount: 0,
        missingCount: 0,
        ownedPercentage: 0,
      });
    });

    it('returns zeroes for empty breakdown', () => {
      const result = deriveOwnership({});
      expect(result).toEqual({
        totalCards: 0,
        ownedCount: 0,
        missingCount: 0,
        ownedPercentage: 0,
      });
    });

    it('derives totalCards, missingCount and ownedPercentage correctly', () => {
      const result = deriveOwnership({
        OWNED: 75,
        WISHLIST: 20,
        PROXY: 5,
      });
      expect(result).toEqual({
        totalCards: 100,
        ownedCount: 75,
        missingCount: 25,
        ownedPercentage: 75,
      });
    });

    it('handles 100% owned deck', () => {
      const result = deriveOwnership({
        OWNED: 100,
      });
      expect(result).toEqual({
        totalCards: 100,
        ownedCount: 100,
        missingCount: 0,
        ownedPercentage: 100,
      });
    });

    it('rounds percentage properly', () => {
      const result = deriveOwnership({
        OWNED: 1,
        WISHLIST: 2,
      });
      // 1 / 3 = 33.333% -> 33%
      expect(result).toEqual({
        totalCards: 3,
        ownedCount: 1,
        missingCount: 2,
        ownedPercentage: 33,
      });
    });
  });

  describe('formatManaCurve', () => {
    it('returns empty array when manaCurve is undefined or empty', () => {
      expect(formatManaCurve(undefined)).toEqual([]);
      expect(formatManaCurve({})).toEqual([]);
    });

    it('sorts CMC buckets numerically placing 6+ at the end', () => {
      const input = {
        '6+': 10,
        '3': 15,
        '0': 2,
        '1': 8,
        '5': 7,
        '2': 20,
        '4': 12,
      };
      const result = formatManaCurve(input);
      expect(result).toEqual([
        { cmc: '0', count: 2 },
        { cmc: '1', count: 8 },
        { cmc: '2', count: 20 },
        { cmc: '3', count: 15 },
        { cmc: '4', count: 12 },
        { cmc: '5', count: 7 },
        { cmc: '6+', count: 10 },
      ]);
    });
  });

  describe('formatColorDemand', () => {
    it('formats color demand map to array', () => {
      expect(formatColorDemand({ W: 10, U: 20 })).toEqual([
        { color: 'W', count: 10 },
        { color: 'U', count: 20 },
      ]);
    });

    it('handles undefined input', () => {
      expect(formatColorDemand(undefined)).toEqual([]);
    });
  });

  describe('formatCategories', () => {
    it('formats functionalCategories map to array', () => {
      expect(formatCategories({ Ramp: 10, Draw: 12 })).toEqual([
        { name: 'Ramp', count: 10 },
        { name: 'Draw', count: 12 },
      ]);
    });

    it('handles undefined input', () => {
      expect(formatCategories(undefined)).toEqual([]);
    });
  });
});
