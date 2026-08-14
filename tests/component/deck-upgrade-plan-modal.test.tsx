import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DeckUpgradePlanModal } from '@/components/deck/DeckUpgradePlanModal';
import * as decksApi from '@/lib/api/decks';

vi.mock('@/lib/api/decks');

describe('DeckUpgradePlanModal Component', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('submits upgrade plan request and renders proposed substitutions with before/after metrics', async () => {
    vi.mocked(decksApi.requestDeckUpgradePlan).mockResolvedValue({
      objective: 'REPLACE_PROXIES_WITH_OWNED',
      currency: 'usd',
      budget: 100,
      maxChanges: 5,
      substitutions: [
        {
          deckCardId: 101,
          removedPrintingId: 501,
          removedName: 'Proxy Sol Ring',
          removedOwnershipStatus: 'PROXY',
          quantity: 1,
          addedPrintingId: 502,
          addedName: 'Owned Sol Ring',
          addedOwned: true,
          cost: 0,
          reasons: [{ code: 'OWNERSHIP', points: 50, evidence: { match: 'In collection' } }],
        },
      ],
      before: {
        ownershipBreakdown: { OWNED: 80, PROXY: 20 },
        valueByCurrency: { USD: 250 },
        missingCostByCurrency: { USD: 50 },
        functionalCategories: { Ramp: 10 },
        legal: true,
      },
      after: {
        ownershipBreakdown: { OWNED: 81, PROXY: 19 },
        valueByCurrency: { USD: 250 },
        missingCostByCurrency: { USD: 50 },
        functionalCategories: { Ramp: 10 },
        legal: true,
      },
    });

    render(
      <DeckUpgradePlanModal
        isOpen={true}
        onClose={vi.fn()}
        deckId={10}
      />
    );

    expect(screen.getByText(/Generate Deck Upgrade Plan/i)).toBeInTheDocument();

    const form = screen.getByRole('button', { name: /Generate Upgrade Plan/i }).closest('form')!;
    fireEvent.submit(form);

    await waitFor(() => {
      expect(decksApi.requestDeckUpgradePlan).toHaveBeenCalledWith(10, expect.objectContaining({
        objective: 'REPLACE_PROXIES_WITH_OWNED',
      }));
      expect(screen.getByText(/Proxy Sol Ring/i)).toBeInTheDocument();
      expect(screen.getByText(/Owned Sol Ring/i)).toBeInTheDocument();
      expect(screen.getByText(/Before & After Comparison/i)).toBeInTheDocument();
    });
  });
});
