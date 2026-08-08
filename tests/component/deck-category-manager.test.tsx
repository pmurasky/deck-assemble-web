import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { DeckCategoryManager } from '@/components/deck/DeckCategoryManager';
import * as decksApi from '@/lib/api/decks';

vi.mock('@/lib/api/decks', async () => {
  const actual = await vi.importActual('@/lib/api/decks');
  return {
    ...actual,
    getDeckCategories: vi.fn(),
    createDeckCategory: vi.fn(),
    deleteDeckCategory: vi.fn(),
  };
});

describe('DeckCategoryManager component', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('renders existing categories and allows adding a new custom category', async () => {
    vi.mocked(decksApi.getDeckCategories).mockResolvedValue([
      { id: 1, deckId: 10, name: 'Ramp', cardCount: 8, color: '#3b82f6' },
    ]);
    vi.mocked(decksApi.createDeckCategory).mockResolvedValue({
      id: 2,
      deckId: 10,
      name: 'Removal',
      cardCount: 0,
      color: '#ef4444',
    });

    render(<DeckCategoryManager deckId={10} />);

    await waitFor(() => {
      expect(screen.getByText('Ramp')).toBeInTheDocument();
    });

    const input = screen.getByPlaceholderText('Category name...');
    fireEvent.change(input, { target: { value: 'Removal' } });

    const addBtn = screen.getByRole('button', { name: /add category/i });
    fireEvent.click(addBtn);

    await waitFor(() => {
      expect(decksApi.createDeckCategory).toHaveBeenCalledWith(10, expect.objectContaining({ name: 'Removal' }));
      expect(screen.getByText('Removal')).toBeInTheDocument();
    });
  });
});
