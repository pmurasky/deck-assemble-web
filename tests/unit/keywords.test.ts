import { describe, it, expect } from 'vitest';
import {
  KEYWORDS,
  KEYWORDS_BY_NAME,
  getKeyword,
  getKeywordNames,
  type KeywordItem,
  type KeywordCategory,
} from '@/lib/keywords';

describe('lib/keywords', () => {
  it('exports KEYWORDS array with 40 keyword definitions', () => {
    // Given & When
    const keywords = KEYWORDS;

    // Then
    expect(Array.isArray(keywords)).toBe(true);
    expect(keywords.length).toBe(40);
  });

  it('contains valid properties for each keyword item', () => {
    // Given
    const validCategories: KeywordCategory[] = [
      'Combat',
      'Evergreen',
      'Casting & Costs',
      'Graveyard & Zones',
      'Triggers & Utility',
    ];

    // When & Then
    KEYWORDS.forEach((item: KeywordItem) => {
      expect(typeof item.name).toBe('string');
      expect(item.name.trim().length).toBeGreaterThan(0);
      expect(validCategories).toContain(item.category);
      expect(typeof item.description).toBe('string');
      expect(item.description.trim().length).toBeGreaterThan(0);
    });
  });

  it('provides KEYWORDS_BY_NAME map for O(1) lookup', () => {
    // Given & When
    const flying = KEYWORDS_BY_NAME['flying'];
    const trample = KEYWORDS_BY_NAME['trample'];

    // Then
    expect(flying).toBeDefined();
    expect(flying?.name).toBe('Flying');
    expect(flying?.category).toBe('Combat');

    expect(trample).toBeDefined();
    expect(trample?.name).toBe('Trample');
    expect(trample?.category).toBe('Combat');
  });

  it('retrieves keyword definitions via getKeyword helper case-insensitively', () => {
    // Given & When
    const flyingExact = getKeyword('Flying');
    const flyingLower = getKeyword('flying');
    const flyingUpper = getKeyword('FLYING');
    const missing = getKeyword('NonExistentKeyword');

    // Then
    expect(flyingExact).toBeDefined();
    expect(flyingExact?.name).toBe('Flying');
    expect(flyingExact?.description).toBe("This creature can't be blocked except by creatures with flying and/or reach.");

    expect(flyingLower).toBe(flyingExact);
    expect(flyingUpper).toBe(flyingExact);
    expect(missing).toBeUndefined();
  });

  it('returns all keyword names via getKeywordNames helper', () => {
    // Given & When
    const names = getKeywordNames();

    // Then
    expect(names.length).toBe(40);
    expect(names).toContain('Flying');
    expect(names).toContain('Trample');
    expect(names).toContain('Haste');
    expect(names).toContain('Ward');
    expect(names).toContain('Enchant');
  });
});
