import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, act } from '@testing-library/react';
import { DeckBuilderClient } from '@/components/deck/DeckBuilderClient';
import * as cardsApi from '@/lib/api/cards';
import type { CardFilters } from '@/components/cards/CardFilterPanel';

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useSearchParams: () => ({
    get: (key: string) => (key === 'deckId' ? null : null),
  }),
}));

let capturedFilterChange: ((filters: CardFilters) => void) | null = null;
let capturedSearchChange: ((query: string) => void) | null = null;

// Mock child components
vi.mock('@/components/cards/CardSearchBar', () => ({
  CardSearchBar: ({ onSearch }: { onSearch: (q: string) => void }) => {
    capturedSearchChange = onSearch;
    return <div data-testid="search-bar" />;
  },
}));

vi.mock('@/components/cards/CardFilterPanel', () => ({
  CardFilterPanel: ({ onFilterChange }: { onFilterChange: (filters: CardFilters) => void }) => {
    capturedFilterChange = onFilterChange;
    return <div data-testid="filter-panel" />;
  },
}));

vi.mock('@/components/deck/DeckWorkspace', () => ({ DeckWorkspace: () => <div data-testid="deck-workspace" /> }));
vi.mock('@/components/deck/DeckStats', () => ({ DeckStats: () => <div data-testid="deck-stats" /> }));
vi.mock('@/components/deck/FormatValidator', () => ({ FormatValidator: () => <div data-testid="format-validator" /> }));

describe('DeckBuilderClient Component', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    capturedFilterChange = null;
    capturedSearchChange = null;
  });

  it('renders layout components correctly', () => {
    vi.spyOn(cardsApi, 'getCards').mockResolvedValue({ cards: [], total: 0 });
    render(<DeckBuilderClient />);
    expect(screen.getByTestId('search-bar')).toBeDefined();
    expect(screen.getByTestId('filter-panel')).toBeDefined();
    expect(screen.getByTestId('deck-workspace')).toBeDefined();
    expect(screen.getByTestId('deck-stats')).toBeDefined();
    expect(screen.getByTestId('format-validator')).toBeDefined();
  });

  it('forwards search query and all active filter params (colors, types, cmc, rarity, owned) to getCards', async () => {
    const getCardsSpy = vi.spyOn(cardsApi, 'getCards').mockResolvedValue({
      cards: [
        {
          id: 'card-1',
          oracleId: 'oracle-1',
          name: 'Counterspell',
          manaValue: 2,
          colors: ['U'],
          colorIdentity: ['U'],
          typeLine: 'Instant',
          setCode: 'lea',
          setName: 'Alpha',
          rarity: 'uncommon',
          legalities: { commander: 'legal' },
          ownedQuantity: 2,
        },
      ],
      total: 1,
    });

    render(<DeckBuilderClient />);

    // Trigger search and filter change
    await act(async () => {
      capturedSearchChange?.('Counter');
      capturedFilterChange?.({
        colors: ['U'],
        types: ['Instant'],
        manaValue: 2,
        minCmc: 1,
        maxCmc: 3,
        rarity: 'uncommon',
        ownership: 'owned',
      });
    });

    await waitFor(() => {
      expect(getCardsSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          q: 'Counter',
          colorIdentity: 'U',
          type: 'Instant',
          minCmc: 1,
          maxCmc: 3,
          rarity: 'uncommon',
          minOwnedQuantity: 1,
        })
      );
    });

    // Verify card tile renders with owned badge
    await waitFor(() => {
      expect(screen.getByText('Counterspell')).toBeInTheDocument();
      expect(screen.getByText('Owned: 2')).toBeInTheDocument();
    });
  });

  it('passes maxOwnedQuantity: 0 when unowned ownership filter is selected', async () => {
    const getCardsSpy = vi.spyOn(cardsApi, 'getCards').mockResolvedValue({
      cards: [],
      total: 0,
    });

    render(<DeckBuilderClient />);

    await act(async () => {
      capturedFilterChange?.({
        colors: [],
        types: [],
        manaValue: 0,
        ownership: 'unowned',
      });
    });

    await waitFor(() => {
      expect(getCardsSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          maxOwnedQuantity: 0,
        })
      );
    });
  });
});
