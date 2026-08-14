import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { DeckWorkspace } from '@/components/deck/DeckWorkspace';
import { useDeckStore } from '@/lib/store/deck-store';

// Mock the Zustand store
vi.mock('@/lib/store/deck-store', () => ({
  useDeckStore: vi.fn(),
}));

describe('DeckWorkspace Component', () => {
  it('renders empty state when no cards', () => {
    vi.mocked(useDeckStore).mockReturnValue({
      metadata: { name: 'Test Deck', format: 'Commander' },
      cards: [],
      removeCard: vi.fn(),
      addCard: vi.fn(),
    });
    
    render(<DeckWorkspace />);
    expect(screen.getByText(/Your deck is empty/i)).toBeDefined();
  });

  it('renders grouped cards', () => {
    vi.mocked(useDeckStore).mockReturnValue({
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
});
