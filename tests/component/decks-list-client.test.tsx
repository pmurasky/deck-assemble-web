import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { DecksListClient } from '@/components/deck/DecksListClient';
import { useDecksListStore, SavedDeck } from '@/lib/store/useDecksListStore';
import { useDeckStore } from '@/lib/store/deck-store';

const mockPush = vi.fn();

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

vi.mock('@auth0/nextjs-auth0/client', () => ({
  useUser: () => ({ user: { name: 'Peter' }, isLoading: false }),
}));

vi.mock('@/lib/store/useDecksListStore', () => ({
  useDecksListStore: vi.fn(),
}));

vi.mock('@/lib/store/deck-store', () => ({
  useDeckStore: vi.fn(),
}));

describe('DecksListClient Component', () => {
  const mockLoadDeck = vi.fn();
  const mockFetchDeckCards = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useDeckStore).mockReturnValue({
      loadDeck: mockLoadDeck,
      clearDeck: vi.fn(),
      fetchDeckCards: mockFetchDeckCards,
    } as unknown as ReturnType<typeof useDeckStore>);
  });

  it('navigates to deck builder with deckId when Edit Deck is clicked', () => {
    const testDeck: SavedDeck = {
      id: '42',
      cards: [],
      metadata: { name: 'Marvel Brew', format: 'Commander' },
      createdAt: '2026-08-01',
      updatedAt: '2026-08-01',
      cardCount: 100,
      commanderName: 'Iron Man',
    };

    vi.mocked(useDecksListStore).mockReturnValue({
      decks: [testDeck],
      deleteDeck: vi.fn(),
      fetchDecks: vi.fn(),
      isLoading: false,
      error: null,
    } as unknown as ReturnType<typeof useDecksListStore>);

    render(<DecksListClient />);
    const editBtn = screen.getByTitle('Edit Deck');
    fireEvent.click(editBtn);

    expect(mockLoadDeck).toHaveBeenCalledWith('42', [], undefined, { name: 'Marvel Brew', format: 'Commander' });
    expect(mockPush).toHaveBeenCalledWith('/deck-builder?deckId=42');
    expect(mockFetchDeckCards).toHaveBeenCalledWith('42');
  });

  it('calls duplicateDeck when Duplicate Deck is clicked', () => {
    const testDeck: SavedDeck = {
      id: '42',
      cards: [],
      metadata: { name: 'Marvel Brew', format: 'Commander' },
      createdAt: '2026-08-01',
      updatedAt: '2026-08-01',
      cardCount: 100,
    };
    const mockDuplicate = vi.fn();

    vi.mocked(useDecksListStore).mockReturnValue({
      decks: [testDeck],
      deleteDeck: vi.fn(),
      duplicateDeck: mockDuplicate,
      archiveDeck: vi.fn(),
      fetchDecks: vi.fn(),
      isLoading: false,
      error: null,
    } as unknown as ReturnType<typeof useDecksListStore>);

    render(<DecksListClient />);
    const duplicateBtn = screen.getByTitle('Duplicate Deck');
    fireEvent.click(duplicateBtn);

    expect(mockDuplicate).toHaveBeenCalledWith('42');
  });

  it('calls archiveDeck when Archive Deck is confirmed', () => {
    const testDeck: SavedDeck = {
      id: '42',
      cards: [],
      metadata: { name: 'Marvel Brew', format: 'Commander' },
      createdAt: '2026-08-01',
      updatedAt: '2026-08-01',
      cardCount: 100,
    };
    const mockArchive = vi.fn();
    vi.stubGlobal('confirm', vi.fn().mockReturnValue(true));

    vi.mocked(useDecksListStore).mockReturnValue({
      decks: [testDeck],
      deleteDeck: vi.fn(),
      duplicateDeck: vi.fn(),
      archiveDeck: mockArchive,
      fetchDecks: vi.fn(),
      isLoading: false,
      error: null,
    } as unknown as ReturnType<typeof useDecksListStore>);

    render(<DecksListClient />);
    const archiveBtn = screen.getByTitle('Archive Deck');
    fireEvent.click(archiveBtn);

    expect(mockArchive).toHaveBeenCalledWith('42');
  });
});

