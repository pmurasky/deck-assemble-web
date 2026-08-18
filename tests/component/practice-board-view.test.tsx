import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import { PracticeBoardView } from '@/components/deck/PracticeBoardView';
import type { PracticeSessionResponse } from '@/types/m3';

describe('PracticeBoardView Component', () => {
  const mockInitialSession: PracticeSessionResponse = {
    sessionId: 'session-456',
    turn: 1,
    phase: 'MAIN_1',
    hand: [
      { id: 'c1', name: 'Sol Ring', manaCost: '{1}', typeLine: 'Artifact' },
      { id: 'c2', name: 'Command Tower', manaCost: '', typeLine: 'Land' },
    ],
    battlefield: [],
    graveyard: [],
    libraryCount: 91,
    manaPool: { colorless: 0, any: 0 },
    logs: ['Game started. Opening hand drawn (7 cards).'],
  };

  const mockTurn2Session: PracticeSessionResponse = {
    sessionId: 'session-456',
    turn: 2,
    phase: 'MAIN_1',
    hand: [
      { id: 'c1', name: 'Sol Ring', manaCost: '{1}', typeLine: 'Artifact' },
      { id: 'c3', name: 'Arcane Signet', manaCost: '{2}', typeLine: 'Artifact' },
    ],
    battlefield: [
      { id: 'c2', name: 'Command Tower', manaCost: '', typeLine: 'Land' },
    ],
    graveyard: [],
    libraryCount: 90,
    manaPool: { colorless: 0, any: 1 },
    logs: ['Turn 2 started.', 'Played Command Tower.'],
  };

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('renders initial practice session with hand, battlefield, and turn controls', async () => {
    global.fetch = vi.fn().mockImplementation((url: string | URL) => {
      const urlStr = url.toString();
      if (urlStr.includes('/practice')) {
        return Promise.resolve({
          ok: true,
          json: async () => ({ data: mockInitialSession }),
        } as Response);
      }
      return Promise.reject(new Error('Unknown URL'));
    });

    render(<PracticeBoardView deckId={10} />);

    await waitFor(() => {
      expect(screen.getByText(/Turn 1/i)).toBeInTheDocument();
      expect(screen.getByText('Sol Ring')).toBeInTheDocument();
      expect(screen.getByText('Command Tower')).toBeInTheDocument();
      expect(screen.getByText(/91 in library/i)).toBeInTheDocument();
    });

    expect(screen.getByRole('button', { name: /Next Turn/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Reset/i })).toBeInTheDocument();
  });

  it('steps to next turn and updates board and hand state', async () => {
    let callCount = 0;
    global.fetch = vi.fn().mockImplementation((url: string | URL) => {
      const urlStr = url.toString();
      if (urlStr.includes('/practice')) {
        callCount++;
        return Promise.resolve({
          ok: true,
          json: async () => ({ data: callCount === 1 ? mockInitialSession : mockTurn2Session }),
        } as Response);
      }
      return Promise.reject(new Error('Unknown URL'));
    });

    render(<PracticeBoardView deckId={10} />);

    await waitFor(() => {
      expect(screen.getByText(/Turn 1/i)).toBeInTheDocument();
    });

    const nextTurnBtn = screen.getByRole('button', { name: /Next Turn/i });
    fireEvent.click(nextTurnBtn);

    await waitFor(() => {
      expect(screen.getByText(/Turn 2/i)).toBeInTheDocument();
      expect(screen.getByText('Arcane Signet')).toBeInTheDocument();
    });
  });

  it('resets practice session back to turn 1', async () => {
    global.fetch = vi.fn().mockImplementation((url: string | URL) => {
      const urlStr = url.toString();
      if (urlStr.includes('/practice')) {
        return Promise.resolve({
          ok: true,
          json: async () => ({ data: mockInitialSession }),
        } as Response);
      }
      return Promise.reject(new Error('Unknown URL'));
    });

    render(<PracticeBoardView deckId={10} />);

    await waitFor(() => {
      expect(screen.getByText(/Turn 1/i)).toBeInTheDocument();
    });

    const resetBtn = screen.getByRole('button', { name: /Reset/i });
    fireEvent.click(resetBtn);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/practice'),
        expect.objectContaining({ method: 'POST' })
      );
    });
  });

  it('allows playing a card from hand to the battlefield', async () => {
    global.fetch = vi.fn().mockImplementation((url: string | URL) => {
      const urlStr = url.toString();
      if (urlStr.includes('/practice')) {
        return Promise.resolve({
          ok: true,
          json: async () => ({ data: mockInitialSession }),
        } as Response);
      }
      return Promise.reject(new Error('Unknown URL'));
    });

    render(<PracticeBoardView deckId={10} />);

    await waitFor(() => {
      expect(screen.getByText('Sol Ring')).toBeInTheDocument();
    });

    const playBtn = screen.getByRole('button', { name: /Play Sol Ring/i });
    fireEvent.click(playBtn);

    await waitFor(() => {
      expect(screen.getByTestId('battlefield-zone')).toHaveTextContent('Sol Ring');
    });
  });
});
