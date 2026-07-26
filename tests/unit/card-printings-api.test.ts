import { afterEach, describe, expect, it, vi } from 'vitest';
import { getCardPrintings } from '@/lib/api/cards';

describe('getCardPrintings', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('returns all available artworks for a canonical card', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          data: [
            { id: 262, setCode: 'msh', imageUri: 'https://img.example/plains-a.jpg' },
            { id: 489, setCode: 'msh', imageUri: 'https://img.example/plains-b.jpg' },
          ],
        }),
        { status: 200 },
      ),
    );
    vi.stubGlobal('fetch', fetchMock);

    const printings = await getCardPrintings('262');

    expect(fetchMock).toHaveBeenCalledWith('/api/v1/cards/262/printings');
    expect(printings).toHaveLength(2);
    expect(printings[1].imageUri).toBe('https://img.example/plains-b.jpg');
  });
});
