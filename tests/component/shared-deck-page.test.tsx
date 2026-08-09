import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import SharedDeckPage from '@/app/shared/decks/[slug]/page';
import { notFound } from 'next/navigation';

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
  notFound: vi.fn(() => {
    throw new Error('NEXT_NOT_FOUND');
  }),
}));

describe('SharedDeckPage Component', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('triggers notFound when shared deck returns not found or 404', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 404,
      json: async () => ({ error: { message: 'Not found' } }),
    } as Response);

    await expect(
      SharedDeckPage({ params: Promise.resolve({ slug: 'invalid-slug' }) })
    ).rejects.toThrow('NEXT_NOT_FOUND');

    expect(notFound).toHaveBeenCalled();
  });

  it('renders published deck details and handles fork action', async () => {
    const mockSharedDeck = {
      id: 10,
      name: 'Public Shared Commander',
      formatCode: 'commander',
      commanderName: 'Atraxa',
      cards: [{ id: 1, cardPrintingId: 10, quantity: 1, deckSection: 'MAIN_DECK', card: { name: 'Sol Ring', manaCost: '{1}' } }],
      primer: { title: 'Strategy Primer', content: '# How to play Atraxa' },
      publishedAt: '2026-08-09T00:00:00Z',
      slug: 'public-shared-commander',
      visibility: 'PUBLIC',
      publishedRevisionNumber: 4,
    };

    global.fetch = vi.fn().mockImplementation((url: string | URL) => {
      const urlStr = url.toString();
      if (urlStr.includes('/fork')) {
        return Promise.resolve({
          ok: true,
          status: 201,
          json: async () => ({ data: { newDeckId: 99, newDeck: { id: 99, name: 'Public Shared Commander (Fork)' } } }),
        } as Response);
      }
      return Promise.resolve({
        ok: true,
        json: async () => mockSharedDeck,
      } as Response);
    });

    const PageComponent = await SharedDeckPage({ params: Promise.resolve({ slug: 'public-shared-commander' }) });
    render(PageComponent);

    expect(screen.getByText('Public Shared Commander')).toBeInTheDocument();
    expect(screen.getByText(/Pinned Revision #4/i)).toBeInTheDocument();
    expect(screen.getByText(/Sol Ring/i)).toBeInTheDocument();

    const forkButton = screen.getByRole('button', { name: /fork deck/i });
    fireEvent.click(forkButton);

    await waitFor(() => {
      expect(screen.getByText(/deck forked successfully/i)).toBeInTheDocument();
    });
  });
});
