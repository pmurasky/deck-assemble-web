import { describe, expect, it } from 'vitest';
import { toCard } from '@/lib/api/catalog';

describe('catalog API mapping', () => {
  it('preserves legality statuses returned by the API', () => {
    const card = toCard({
      id: 1,
      oracleId: 'oracle-captain-marvel',
      name: 'Captain Marvel',
      legalities: { commander: 'legal' },
    });

    expect(card.legalities).toEqual({ commander: 'legal' });
  });
});
