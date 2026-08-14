import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DeckWishlistPanel } from '@/components/deck/DeckWishlistPanel';
import * as decksApi from '@/lib/api/decks';

vi.mock('@/lib/api/decks');

describe('DeckWishlistPanel Component', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('syncs ownership on load and renders wishlist items and total cost', async () => {
    vi.mocked(decksApi.syncDeckOwnershipClient).mockResolvedValue({
      changedCount: 0,
      changes: [],
    });
    vi.mocked(decksApi.fetchDeckWishlist).mockResolvedValue({
      items: [
        {
          deckCardId: 101,
          cardPrintingId: 501,
          cardName: 'Mox Diamond',
          quantity: 1,
          unitPriceUsd: 550.0,
          lineTotalUsd: 550.0,
        },
        {
          deckCardId: 102,
          cardPrintingId: 502,
          cardName: 'Mana Crypt',
          quantity: 1,
          unitPriceUsd: 180.0,
          lineTotalUsd: 180.0,
        },
      ],
      totalUsd: 730.0,
    });

    render(<DeckWishlistPanel deckId={10} />);

    await waitFor(() => {
      expect(decksApi.syncDeckOwnershipClient).toHaveBeenCalledWith(10);
      expect(decksApi.fetchDeckWishlist).toHaveBeenCalledWith(10);
      expect(screen.getByText('Mox Diamond')).toBeInTheDocument();
      expect(screen.getByText('Mana Crypt')).toBeInTheDocument();
      expect(screen.getByText('$730.00')).toBeInTheDocument();
    });
  });

  it('marks card as acquired when Acquire button is clicked', async () => {
    vi.mocked(decksApi.syncDeckOwnershipClient).mockResolvedValue({
      changedCount: 0,
      changes: [],
    });
    vi.mocked(decksApi.fetchDeckWishlist).mockResolvedValue({
      items: [
        {
          deckCardId: 101,
          cardPrintingId: 501,
          cardName: 'Rhystic Study',
          quantity: 1,
          unitPriceUsd: 40.0,
          lineTotalUsd: 40.0,
        },
      ],
      totalUsd: 40.0,
    });
    vi.mocked(decksApi.acquireDeckCardClient).mockResolvedValue({
      id: 101,
      cardPrintingId: 501,
      quantity: 1,
      deckSection: 'MAIN_DECK',
      ownershipStatus: 'OWNED',
      card: {
        id: 501,
        name: 'Rhystic Study',
        oracleId: 'ora-1',
        manaCost: '{2}{U}',
        manaValue: 3,
        colors: 'U',
        colorIdentity: 'U',
        typeLine: 'Enchantment',
      },
    });

    render(<DeckWishlistPanel deckId={10} />);

    await waitFor(() => {
      expect(screen.getByText('Rhystic Study')).toBeInTheDocument();
    });

    const acquireBtn = screen.getByRole('button', { name: /Acquire/i });
    fireEvent.click(acquireBtn);

    await waitFor(() => {
      expect(decksApi.acquireDeckCardClient).toHaveBeenCalledWith(10, 101);
      expect(screen.getAllByText(/Acquired/i).length).toBeGreaterThanOrEqual(1);
    });
  });
});
