import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DeckCardAlternativesFlyout } from '@/components/deck/DeckCardAlternativesFlyout';
import * as decksApi from '@/lib/api/decks';

vi.mock('@/lib/api/decks');

describe('DeckCardAlternativesFlyout Component', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('loads and renders ranked card alternatives and reasons', async () => {
    vi.mocked(decksApi.fetchDeckCardAlternatives).mockResolvedValue([
      {
        cardPrintingId: 201,
        name: 'Arcane Signet',
        owned: true,
        priceUsd: 0.99,
        total: 92.5,
        reasons: [
          {
            code: 'SYNERGY',
            points: 50,
            evidence: { description: 'Matches commander colors' },
          },
        ],
      },
      {
        cardPrintingId: 202,
        name: 'Fellwar Stone',
        owned: false,
        priceUsd: 1.5,
        total: 80.0,
        reasons: [
          {
            code: 'RAMP',
            points: 40,
            evidence: { description: '2-CMC untapped rock' },
          },
        ],
      },
    ]);

    render(
      <DeckCardAlternativesFlyout
        isOpen={true}
        onClose={vi.fn()}
        deckId={10}
        deckCardId={101}
        cardName="Mind Stone"
        onSwapCard={vi.fn()}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Arcane Signet')).toBeInTheDocument();
    });

    expect(decksApi.fetchDeckCardAlternatives).toHaveBeenCalledWith(10, 101, 10, true);
    expect(screen.getByText('Fellwar Stone')).toBeInTheDocument();
    expect(screen.getByText('Not Owned')).toBeInTheDocument();
    expect(screen.getByText(/SYNERGY \(\+50\)/i)).toBeInTheDocument();
  });

  it('triggers onSwapCard when swap button is clicked', async () => {
    const mockSwap = vi.fn();
    vi.mocked(decksApi.fetchDeckCardAlternatives).mockResolvedValue([
      {
        cardPrintingId: 201,
        name: 'Arcane Signet',
        owned: true,
        priceUsd: 0.99,
        total: 92.5,
        reasons: [],
      },
    ]);

    render(
      <DeckCardAlternativesFlyout
        isOpen={true}
        onClose={vi.fn()}
        deckId={10}
        deckCardId={101}
        cardName="Mind Stone"
        onSwapCard={mockSwap}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Arcane Signet')).toBeInTheDocument();
    });

    const swapBtn = screen.getByRole('button', { name: /Swap In Arcane Signet/i });
    fireEvent.click(swapBtn);

    expect(mockSwap).toHaveBeenCalledWith(expect.objectContaining({
      cardPrintingId: 201,
      name: 'Arcane Signet',
    }));
  });
});
