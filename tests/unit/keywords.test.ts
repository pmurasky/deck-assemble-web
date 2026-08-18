import { describe, it, expect } from 'vitest';
import {
  KEYWORDS,
  KEYWORDS_BY_NAME,
  RULES_ENTRIES,
  GLOSSARY_ITEMS,
  GLOSSARY_CATEGORIES,
  getKeyword,
  getKeywordNames,
  getGlossaryItem,
  type KeywordItem,
  type KeywordCategory,
  type GlossaryItem,
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

  it('exports RULES_ENTRIES containing stack, priority, and combat steps', () => {
    // Given & When
    const rules = RULES_ENTRIES;

    // Then
    expect(Array.isArray(rules)).toBe(true);
    expect(rules.length).toBeGreaterThanOrEqual(10);

    const ruleNames = rules.map((r: GlossaryItem) => r.name);
    expect(ruleNames).toContain('The Stack');
    expect(ruleNames).toContain('Priority');
    expect(ruleNames).toContain('State-Based Actions');
    expect(ruleNames).toContain('Beginning of Combat Step');
    expect(ruleNames).toContain('Declare Attackers Step');
    expect(ruleNames).toContain('Declare Blockers Step');
    expect(ruleNames).toContain('Combat Damage Step');
    expect(ruleNames).toContain('End of Combat Step');
  });

  it('exports GLOSSARY_ITEMS combining keywords and rules', () => {
    // Given & When
    const glossary = GLOSSARY_ITEMS;

    // Then
    expect(glossary.length).toBe(KEYWORDS.length + RULES_ENTRIES.length);
    expect(glossary.some((item) => item.name === 'Flying')).toBe(true);
    expect(glossary.some((item) => item.name === 'The Stack')).toBe(true);
    expect(glossary.some((item) => item.name === 'Priority')).toBe(true);
  });

  it('exports GLOSSARY_CATEGORIES array with unique categories', () => {
    // Given & When
    const categories = GLOSSARY_CATEGORIES;

    // Then
    expect(categories).toContain('Combat');
    expect(categories).toContain('Evergreen');
    expect(categories).toContain('Rules & Timing');
    expect(categories).toContain('Combat Steps');
  });

  it('retrieves rules and keyword entries via getGlossaryItem case-insensitively', () => {
    // Given & When
    const stackExact = getGlossaryItem('The Stack');
    const stackShort = getGlossaryItem('stack');
    const priority = getGlossaryItem('Priority');
    const combatDamage = getGlossaryItem('Combat Damage Step');

    // Then
    expect(stackExact).toBeDefined();
    expect(stackExact?.name).toBe('The Stack');
    expect(stackExact?.description).toContain('Last-In, First-Out');

    expect(stackShort).toBeDefined();
    expect(stackShort?.name).toBe('The Stack');

    expect(priority).toBeDefined();
    expect(priority?.name).toBe('Priority');

    expect(combatDamage).toBeDefined();
    expect(combatDamage?.name).toBe('Combat Damage Step');
  });
});
