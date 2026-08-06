import { describe, it, expect } from 'vitest';
import { getDeckExportUrl, getCollectionExportUrl, DECK_EXPORT_FORMATS } from '@/lib/api/exports';

describe('Exports API Client', () => {
  describe('getDeckExportUrl', () => {
    it('should construct correct URL with format query param for deck exports', () => {
      const url = getDeckExportUrl(42, 'mtgo');
      expect(url).toBe('/api/v1/decks/42/export?format=mtgo');
    });

    it('should support all 6 valid export formats', () => {
      expect(DECK_EXPORT_FORMATS).toEqual(['txt', 'csv', 'json', 'mtgo', 'arena', 'cod']);
      DECK_EXPORT_FORMATS.forEach((fmt) => {
        const url = getDeckExportUrl(1, fmt);
        expect(url).toBe(`/api/v1/decks/1/export?format=${fmt}`);
      });
    });
  });

  describe('getCollectionExportUrl', () => {
    it('should construct correct URL for collection CSV exports', () => {
      const url = getCollectionExportUrl(7);
      expect(url).toBe('/api/v1/collections/7/export');
    });
  });
});
