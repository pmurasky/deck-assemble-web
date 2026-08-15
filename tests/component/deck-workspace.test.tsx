import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { DeckWorkspace } from '@/components/deck/DeckWorkspace';
import { useDeckStore } from '@/lib/store/deck-store';
import * as decksApi from '@/lib/api/decks';
import * as cardsApi from '@/lib/api/cards';

// Mock the Zustand store and APIs
vi.mock('@/lib/store/deck-store', () => ({
  useDeckStore: vi.fn(),
}));
vi.mock('@/lib/api/decks');
vi.mock('@/lib/api/cards');

describe('DeckWorkspace Component', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    vi.mocked(decksApi.requestDeckUpgradePlan).mockResolvedValue({
      objective: 'IMPROVE_UNDER_BUDGET',
      currency: 'USD',
      budget: null,
      maxChanges: 5,
      substitutions: [],
      before: { ownershipBreakdown: {}, valueByCurrency: {}, missingCostByCurrency: {}, functionalCategories: {}, legal: true },
      after: { ownershipBreakdown: {}, valueByCurrency: {}, missingCostByCurrency: {}, functionalCategories: {}, legal: true },
    });
  });

  it('renders empty state when no cards', () => {
    vi.mocked(useDeckStore).mockReturnValue({
      id: 'uuid-123',
      metadata: { name: 'Test Deck', format: 'Commander' },
      cards: [],
      removeCard: vi.fn(),
      addCard: vi.fn(),
      updateMetadata: vi.fn(),
    });
    
    render(<DeckWorkspace />);
    expect(screen.getByText(/Your deck is empty/i)).toBeDefined();
  });

  it('renders grouped cards', () => {
    vi.mocked(useDeckStore).mockReturnValue({
      id: 'uuid-123',
      metadata: { name: 'Test Deck', format: 'Commander' },
      cards: [
        {
          deckCardId: 1,
          cardPrintingId: 1,
          card: { id: '1', name: 'Goblin Guide', typeLine: 'Creature — Goblin' },
          quantity: 2,
          deckSection: 'MAIN_DECK',
        },
      ],
      removeCard: vi.fn(),
      addCard: vi.fn(),
      updateMetadata: vi.fn(),
    });
    
    render(<DeckWorkspace />);
    expect(screen.getByText(/Creature/i)).toBeDefined();
    expect(screen.getByText('Goblin Guide')).toBeDefined();
    expect(screen.getByText(/x2/i)).toBeDefined();
  });

  describe('Deck Name Editing', () => {
    it('renders deck name as clickable text by default', () => {
      const mockUpdateMetadata = vi.fn();
      vi.mocked(useDeckStore).mockReturnValue({
        id: 'uuid-123',
        metadata: { name: 'Grixis Control', format: 'Commander' },
        cards: [
          {
            deckCardId: 1,
            cardPrintingId: 1,
            card: { id: '1', name: 'Sol Ring', typeLine: 'Artifact' },
            quantity: 1,
            deckSection: 'MAIN_DECK',
          },
        ],
        removeCard: vi.fn(),
        addCard: vi.fn(),
        updateMetadata: mockUpdateMetadata,
      });

      render(<DeckWorkspace />);
      const nameHeading = screen.getByRole('heading', { level: 2, name: 'Grixis Control' });
      expect(nameHeading).toBeDefined();
      expect(screen.queryByRole('textbox')).toBeNull();
    });

    it('clicking the name switches to edit mode with an input pre-filled with current name', () => {
      const mockUpdateMetadata = vi.fn();
      vi.mocked(useDeckStore).mockReturnValue({
        id: 'uuid-123',
        metadata: { name: 'Grixis Control', format: 'Commander' },
        cards: [
          {
            deckCardId: 1,
            cardPrintingId: 1,
            card: { id: '1', name: 'Sol Ring', typeLine: 'Artifact' },
            quantity: 1,
            deckSection: 'MAIN_DECK',
          },
        ],
        removeCard: vi.fn(),
        addCard: vi.fn(),
        updateMetadata: mockUpdateMetadata,
      });

      render(<DeckWorkspace />);
      const nameHeading = screen.getByRole('heading', { level: 2, name: 'Grixis Control' });
      fireEvent.click(nameHeading);

      const input = screen.getByRole('textbox') as HTMLInputElement;
      expect(input).toBeDefined();
      expect(input.value).toBe('Grixis Control');
    });

    it('saving on Enter calls updateMetadata with trimmed new name', () => {
      const mockUpdateMetadata = vi.fn();
      vi.mocked(useDeckStore).mockReturnValue({
        id: 'uuid-123',
        metadata: { name: 'Grixis Control', format: 'Commander' },
        cards: [
          {
            deckCardId: 1,
            cardPrintingId: 1,
            card: { id: '1', name: 'Sol Ring', typeLine: 'Artifact' },
            quantity: 1,
            deckSection: 'MAIN_DECK',
          },
        ],
        removeCard: vi.fn(),
        addCard: vi.fn(),
        updateMetadata: mockUpdateMetadata,
      });

      render(<DeckWorkspace />);
      const nameHeading = screen.getByRole('heading', { level: 2, name: 'Grixis Control' });
      fireEvent.click(nameHeading);

      const input = screen.getByRole('textbox');
      fireEvent.change(input, { target: { value: '  Dimir Rogues  ' } });
      fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' });

      expect(mockUpdateMetadata).toHaveBeenCalledWith({ name: 'Dimir Rogues' });
      expect(screen.queryByRole('textbox')).toBeNull();
    });

    it('saving on blur calls updateMetadata with trimmed new name', () => {
      const mockUpdateMetadata = vi.fn();
      vi.mocked(useDeckStore).mockReturnValue({
        id: 'uuid-123',
        metadata: { name: 'Grixis Control', format: 'Commander' },
        cards: [
          {
            deckCardId: 1,
            cardPrintingId: 1,
            card: { id: '1', name: 'Sol Ring', typeLine: 'Artifact' },
            quantity: 1,
            deckSection: 'MAIN_DECK',
          },
        ],
        removeCard: vi.fn(),
        addCard: vi.fn(),
        updateMetadata: mockUpdateMetadata,
      });

      render(<DeckWorkspace />);
      const nameHeading = screen.getByRole('heading', { level: 2, name: 'Grixis Control' });
      fireEvent.click(nameHeading);

      const input = screen.getByRole('textbox');
      fireEvent.change(input, { target: { value: 'Esper Midrange' } });
      fireEvent.blur(input);

      expect(mockUpdateMetadata).toHaveBeenCalledWith({ name: 'Esper Midrange' });
      expect(screen.queryByRole('textbox')).toBeNull();
    });

    it('empty or whitespace-only name does not call updateMetadata and exits edit mode', () => {
      const mockUpdateMetadata = vi.fn();
      vi.mocked(useDeckStore).mockReturnValue({
        id: 'uuid-123',
        metadata: { name: 'Grixis Control', format: 'Commander' },
        cards: [
          {
            deckCardId: 1,
            cardPrintingId: 1,
            card: { id: '1', name: 'Sol Ring', typeLine: 'Artifact' },
            quantity: 1,
            deckSection: 'MAIN_DECK',
          },
        ],
        removeCard: vi.fn(),
        addCard: vi.fn(),
        updateMetadata: mockUpdateMetadata,
      });

      render(<DeckWorkspace />);
      const nameHeading = screen.getByRole('heading', { level: 2, name: 'Grixis Control' });
      fireEvent.click(nameHeading);

      const input = screen.getByRole('textbox');
      fireEvent.change(input, { target: { value: '   ' } });
      fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' });

      expect(mockUpdateMetadata).not.toHaveBeenCalled();
      expect(screen.queryByRole('textbox')).toBeNull();
    });

    it('pressing Escape reverts changes without calling updateMetadata', () => {
      const mockUpdateMetadata = vi.fn();
      vi.mocked(useDeckStore).mockReturnValue({
        id: 'uuid-123',
        metadata: { name: 'Grixis Control', format: 'Commander' },
        cards: [
          {
            deckCardId: 1,
            cardPrintingId: 1,
            card: { id: '1', name: 'Sol Ring', typeLine: 'Artifact' },
            quantity: 1,
            deckSection: 'MAIN_DECK',
          },
        ],
        removeCard: vi.fn(),
        addCard: vi.fn(),
        updateMetadata: mockUpdateMetadata,
      });

      render(<DeckWorkspace />);
      const nameHeading = screen.getByRole('heading', { level: 2, name: 'Grixis Control' });
      fireEvent.click(nameHeading);

      const input = screen.getByRole('textbox');
      fireEvent.change(input, { target: { value: 'Should Not Save' } });
      fireEvent.keyDown(input, { key: 'Escape', code: 'Escape' });

      expect(mockUpdateMetadata).not.toHaveBeenCalled();
      expect(screen.queryByRole('textbox')).toBeNull();
    });
  });

  describe('TopUpgradeSuggestionsPanel Integration', () => {
    it('does not render TopUpgradeSuggestionsPanel when deck id is a client UUID', () => {
      vi.mocked(useDeckStore).mockReturnValue({
        id: '123e4567-e89b-12d3-a456-426614174000',
        metadata: { name: 'Unsaved Deck', format: 'Commander' },
        cards: [
          {
            deckCardId: 1,
            cardPrintingId: 100,
            card: { id: '1', name: 'Sol Ring', typeLine: 'Artifact' },
            quantity: 1,
            deckSection: 'MAIN_DECK',
          },
        ],
        removeCard: vi.fn(),
        addCard: vi.fn(),
        updateMetadata: vi.fn(),
      });

      render(<DeckWorkspace />);
      expect(screen.queryByTestId('top-upgrade-suggestions-panel')).toBeNull();
    });

    it('renders TopUpgradeSuggestionsPanel when deck id is persisted', () => {
      vi.mocked(useDeckStore).mockReturnValue({
        id: '42',
        metadata: { name: 'Persisted Deck', format: 'Commander' },
        cards: [
          {
            deckCardId: 1,
            cardPrintingId: 100,
            card: { id: '1', name: 'Sol Ring', typeLine: 'Artifact' },
            quantity: 1,
            deckSection: 'MAIN_DECK',
          },
        ],
        removeCard: vi.fn(),
        addCard: vi.fn(),
        updateMetadata: vi.fn(),
      });

      render(<DeckWorkspace />);
      expect(screen.getByTestId('top-upgrade-suggestions-panel')).toBeDefined();
    });

    it('clicking Swap In calls removeCard and addCard with resolved card in same section', async () => {
      const mockRemoveCard = vi.fn().mockResolvedValue(undefined);
      const mockAddCard = vi.fn().mockResolvedValue(undefined);
      vi.mocked(decksApi.requestDeckUpgradePlan).mockResolvedValue({
        objective: 'IMPROVE_UNDER_BUDGET',
        currency: 'USD',
        budget: null,
        maxChanges: 5,
        substitutions: [
          {
            deckCardId: 101,
            removedPrintingId: 501,
            removedName: 'Cancel',
            removedOwnershipStatus: 'PROXY',
            quantity: 1,
            addedPrintingId: 999,
            addedName: 'Counterspell',
            addedOwned: true,
            cost: 0,
            reasons: [{ code: 'MANA_EFFICIENCY', points: 30, evidence: {} }],
          },
        ],
        before: { ownershipBreakdown: {}, valueByCurrency: {}, missingCostByCurrency: {}, functionalCategories: {}, legal: true },
        after: { ownershipBreakdown: {}, valueByCurrency: {}, missingCostByCurrency: {}, functionalCategories: {}, legal: true },
      });

      vi.mocked(cardsApi.getCardById).mockResolvedValue({
        id: '999',
        printingId: 999,
        oracleId: 'o-counterspell',
        name: 'Counterspell',
        manaCost: '{U}{U}',
        manaValue: 2,
        colors: ['U'],
        colorIdentity: ['U'],
        typeLine: 'Instant',
      });

      vi.mocked(useDeckStore).mockReturnValue({
        id: '42',
        metadata: { name: 'Persisted Deck', format: 'Commander' },
        cards: [
          {
            deckCardId: 101,
            cardPrintingId: 501,
            card: { id: 'c-cancel', name: 'Cancel', typeLine: 'Instant' },
            quantity: 1,
            deckSection: 'MAIN_DECK',
          },
        ],
        removeCard: mockRemoveCard,
        addCard: mockAddCard,
        updateMetadata: vi.fn(),
      });

      render(<DeckWorkspace />);

      await waitFor(() => {
        expect(screen.getByText('Counterspell')).toBeInTheDocument();
      });

      const swapBtn = screen.getByRole('button', { name: /Swap In Counterspell/i });
      fireEvent.click(swapBtn);

      await waitFor(() => {
        expect(mockRemoveCard).toHaveBeenCalledWith(101);
        expect(mockAddCard).toHaveBeenCalledWith(
          expect.objectContaining({
            name: 'Counterspell',
            printingId: 999,
          }),
          'MAIN_DECK'
        );
      });
    });
  });
});
