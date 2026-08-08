import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { DeckFolderTagManager } from '@/components/deck/DeckFolderTagManager';
import * as decksApi from '@/lib/api/decks';

vi.mock('@/lib/api/decks', async () => {
  const actual = await vi.importActual('@/lib/api/decks');
  return {
    ...actual,
    getDeckFolders: vi.fn(),
    createDeckFolder: vi.fn(),
    getDeckTags: vi.fn(),
    createDeckTag: vi.fn(),
  };
});

describe('DeckFolderTagManager component', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('renders folders and tags and allows creating a folder', async () => {
    vi.mocked(decksApi.getDeckFolders).mockResolvedValue([
      { id: 1, name: 'Commander Decks', deckCount: 3 },
    ]);
    vi.mocked(decksApi.getDeckTags).mockResolvedValue([
      { id: 1, name: 'Competitive', color: '#ef4444' },
    ]);
    vi.mocked(decksApi.createDeckFolder).mockResolvedValue({
      id: 2,
      name: 'Casual',
      deckCount: 0,
    });

    render(<DeckFolderTagManager />);

    await waitFor(() => {
      expect(screen.getByText('Commander Decks')).toBeInTheDocument();
      expect(screen.getByText('Competitive')).toBeInTheDocument();
    });

    const folderInput = screen.getByPlaceholderText('New folder name...');
    fireEvent.change(folderInput, { target: { value: 'Casual' } });

    const createFolderBtn = screen.getByRole('button', { name: /create folder/i });
    fireEvent.click(createFolderBtn);

    await waitFor(() => {
      expect(decksApi.createDeckFolder).toHaveBeenCalledWith(expect.objectContaining({ name: 'Casual' }));
      expect(screen.getByText('Casual')).toBeInTheDocument();
    });
  });
});
