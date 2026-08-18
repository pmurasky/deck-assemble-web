import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TopUpgradeSuggestionsPanel } from '@/components/deck/TopUpgradeSuggestionsPanel';
import * as decksApi from '@/lib/api/decks';
import type { DeckUpgradePlanResponse } from '@/types/builder';

vi.mock('@/lib/api/decks');

const mockPlanResponse: DeckUpgradePlanResponse = {
  objective: 'IMPROVE_UNDER_BUDGET',
  currency: 'USD',
  budget: null,
  maxChanges: 5,
  substitutions: [
    {
      deckCardId: 101,
      removedPrintingId: 1001,
      removedName: 'Cancel',
      removedOwnershipStatus: 'PROXY',
      quantity: 1,
      addedPrintingId: 2001,
      addedName: 'Counterspell',
      addedOwned: true,
      cost: 0,
      reasons: [{ code: 'MANA_EFFICIENCY', points: 30, evidence: { costDiff: '-1' } }],
    },
    {
      deckCardId: 102,
      removedPrintingId: 1002,
      removedName: 'Manalith',
      removedOwnershipStatus: 'OWNED',
      quantity: 1,
      addedPrintingId: 2002,
      addedName: 'Arcane Signet',
      addedOwned: true,
      cost: 0.99,
      reasons: [{ code: 'RAMP_EFFICIENCY', points: 40, evidence: { costDiff: '-1' } }],
    },
    {
      deckCardId: 103,
      removedPrintingId: 1003,
      removedName: 'Divination',
      removedOwnershipStatus: 'OWNED',
      quantity: 1,
      addedPrintingId: 2003,
      addedName: 'Rhystic Study',
      addedOwned: false,
      cost: 35.0,
      reasons: [{ code: 'SYNERGY', points: 50, evidence: { category: 'Draw' } }],
    },
    {
      deckCardId: 104,
      removedPrintingId: 1004,
      removedName: 'Murder',
      removedOwnershipStatus: 'OWNED',
      quantity: 1,
      addedPrintingId: 2004,
      addedName: 'Deadly Rollick',
      addedOwned: false,
      cost: 45.0,
      reasons: [{ code: 'FREE_SPELL', points: 45, evidence: {} }],
    },
    {
      deckCardId: 105,
      removedPrintingId: 1005,
      removedName: 'Forest',
      removedOwnershipStatus: 'OWNED',
      quantity: 1,
      addedPrintingId: 2005,
      addedName: 'Boseiju, Who Endures',
      addedOwned: true,
      cost: 0,
      reasons: [{ code: 'UTILITY_LAND', points: 35, evidence: {} }],
    },
  ],
  before: {
    ownershipBreakdown: { OWNED: 90, PROXY: 10 },
    valueByCurrency: { USD: 100 },
    missingCostByCurrency: { USD: 20 },
    functionalCategories: {},
    legal: true,
  },
  after: {
    ownershipBreakdown: { OWNED: 93, PROXY: 7 },
    valueByCurrency: { USD: 180 },
    missingCostByCurrency: { USD: 80 },
    functionalCategories: {},
    legal: true,
  },
};

describe('TopUpgradeSuggestionsPanel Component', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('fetches upgrade plan on mount and renders up to 5 suggestion rows', async () => {
    vi.mocked(decksApi.requestDeckUpgradePlan).mockResolvedValue(mockPlanResponse);

    render(<TopUpgradeSuggestionsPanel deckId={10} />);

    expect(screen.getByText(/Finding top card upgrades|Loading/i)).toBeInTheDocument();

    await waitFor(() => {
      expect(decksApi.requestDeckUpgradePlan).toHaveBeenCalledWith(10, {
        objective: 'IMPROVE_UNDER_BUDGET',
        maxChanges: 5,
      });
      expect(screen.getByText('Cancel')).toBeInTheDocument();
      expect(screen.getByText('Counterspell')).toBeInTheDocument();
      expect(screen.getByText('Manalith')).toBeInTheDocument();
      expect(screen.getByText('Arcane Signet')).toBeInTheDocument();
      expect(screen.getByText('Divination')).toBeInTheDocument();
      expect(screen.getByText('Rhystic Study')).toBeInTheDocument();
      expect(screen.getByText('Murder')).toBeInTheDocument();
      expect(screen.getByText('Deadly Rollick')).toBeInTheDocument();
      expect(screen.getByText('Forest')).toBeInTheDocument();
      expect(screen.getByText('Boseiju, Who Endures')).toBeInTheDocument();
    });

    expect(screen.getByText(/MANA_EFFICIENCY/i)).toBeInTheDocument();
  });

  it('renders quiet "already optimal" message when substitutions list is empty', async () => {
    vi.mocked(decksApi.requestDeckUpgradePlan).mockResolvedValue({
      ...mockPlanResponse,
      substitutions: [],
    });

    render(<TopUpgradeSuggestionsPanel deckId="10" />);

    await waitFor(() => {
      expect(screen.getByText(/already optimal/i)).toBeInTheDocument();
    });

    expect(screen.queryByText(/Counterspell/i)).not.toBeInTheDocument();
  });

  it('renders error state with retry button when fetch rejects', async () => {
    vi.mocked(decksApi.requestDeckUpgradePlan).mockRejectedValueOnce(new Error('Network error'));

    render(<TopUpgradeSuggestionsPanel deckId={10} />);

    await waitFor(() => {
      expect(screen.getByText(/Network error/i)).toBeInTheDocument();
    });

    const retryBtn = screen.getByRole('button', { name: /Retry/i });
    expect(retryBtn).toBeInTheDocument();

    vi.mocked(decksApi.requestDeckUpgradePlan).mockResolvedValueOnce(mockPlanResponse);
    fireEvent.click(retryBtn);

    await waitFor(() => {
      expect(screen.getByText('Counterspell')).toBeInTheDocument();
    });
  });

  it('triggers onSwapSubstitution when "Swap In" button is clicked', async () => {
    const mockSwap = vi.fn();
    vi.mocked(decksApi.requestDeckUpgradePlan).mockResolvedValue(mockPlanResponse);

    render(<TopUpgradeSuggestionsPanel deckId={10} onSwapSubstitution={mockSwap} />);

    await waitFor(() => {
      expect(screen.getByText('Counterspell')).toBeInTheDocument();
    });

    const swapBtns = screen.getAllByRole('button', { name: /Swap In/i });
    expect(swapBtns.length).toBe(5);

    fireEvent.click(swapBtns[0]);

    expect(mockSwap).toHaveBeenCalledWith(expect.objectContaining({
      removedName: 'Cancel',
      addedName: 'Counterspell',
      addedPrintingId: 2001,
    }));
  });

  it('renders plain-language sentence when sentence field is provided in reason', async () => {
    const planWithSentences: DeckUpgradePlanResponse = {
      ...mockPlanResponse,
      substitutions: [
        {
          deckCardId: 101,
          removedPrintingId: 1001,
          removedName: 'Cancel',
          removedOwnershipStatus: 'PROXY',
          quantity: 1,
          addedPrintingId: 2001,
          addedName: 'Counterspell',
          addedOwned: true,
          cost: 0,
          reasons: [
            {
              code: 'MANA_EFFICIENCY',
              points: 30,
              sentence: 'Saves 1 mana for identical hard counter effect.',
              evidence: {},
            },
          ],
        },
      ],
    };

    vi.mocked(decksApi.requestDeckUpgradePlan).mockResolvedValue(planWithSentences);

    render(<TopUpgradeSuggestionsPanel deckId={10} />);

    await waitFor(() => {
      expect(screen.getByText('Saves 1 mana for identical hard counter effect.')).toBeInTheDocument();
    });
  });
});
