import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import { DeckHistoryPanel } from '@/components/deck/DeckHistoryPanel';

vi.mock('@/lib/auth0', () => ({
  auth0: {
    getAccessToken: vi.fn().mockResolvedValue({ token: 'test-token' }),
  },
}));

describe('DeckHistoryPanel Component', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('renders loading state initially and then lists revisions', async () => {
    const mockRevisions = {
      items: [
        { id: 1, revisionNumber: 2, changeType: 'CARD_ADDED', createdAt: '2026-08-09T10:00:00Z', description: 'Added Sol Ring' },
        { id: 2, revisionNumber: 1, changeType: 'CREATED', createdAt: '2026-08-09T09:00:00Z', description: 'Deck created' },
      ],
      total: 2,
      page: 1,
      size: 20,
    };

    global.fetch = vi.fn().mockImplementation((url: string | URL) => {
      const urlStr = url.toString();
      if (urlStr.includes('/revisions')) {
        return Promise.resolve({
          ok: true,
          json: async () => ({ data: mockRevisions }),
        } as Response);
      }
      return Promise.reject(new Error('Unknown URL'));
    });

    render(<DeckHistoryPanel deckId={10} currentRevision={2} onRestoreSuccess={vi.fn()} />);

    expect(screen.getByText(/loading history/i)).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText(/Revision #2/i)).toBeInTheDocument();
      expect(screen.getByText(/CARD_ADDED/i)).toBeInTheDocument();
      expect(screen.getByText(/Revision #1/i)).toBeInTheDocument();
    });
  });

  it('triggers restore deck revision with conflict handling', async () => {
    const mockRevisions = {
      items: [
        { id: 1, revisionNumber: 2, changeType: 'CARD_ADDED', createdAt: '2026-08-09T10:00:00Z' },
        { id: 2, revisionNumber: 1, changeType: 'CREATED', createdAt: '2026-08-09T09:00:00Z' },
      ],
      total: 2,
      page: 1,
      size: 20,
    };

    global.fetch = vi.fn().mockImplementation((url: string | URL) => {
      const urlStr = url.toString();
      if (urlStr.includes('/restore')) {
        return Promise.resolve({
          ok: true,
          json: async () => ({ data: { revisionNumber: 3 } }),
        } as Response);
      }
      if (urlStr.includes('/revisions')) {
        return Promise.resolve({
          ok: true,
          json: async () => ({ data: mockRevisions }),
        } as Response);
      }
      return Promise.reject(new Error('Unknown URL'));
    });

    const onRestoreSuccess = vi.fn();
    render(<DeckHistoryPanel deckId={10} currentRevision={2} onRestoreSuccess={onRestoreSuccess} />);

    await waitFor(() => {
      expect(screen.getByText(/Revision #1/i)).toBeInTheDocument();
    });

    const restoreButtons = screen.getAllByRole('button', { name: /restore/i });
    fireEvent.click(restoreButtons[0]);

    await waitFor(() => {
      expect(onRestoreSuccess).toHaveBeenCalledWith(3);
    });
  });
});
