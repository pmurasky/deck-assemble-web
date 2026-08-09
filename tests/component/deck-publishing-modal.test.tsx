import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import { DeckPublishingModal } from '@/components/deck/DeckPublishingModal';

vi.mock('@/lib/auth0', () => ({
  auth0: {
    getAccessToken: vi.fn().mockResolvedValue({ token: 'test-token' }),
  },
}));

describe('DeckPublishingModal Component', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('handles visibility change and publishing action separately', async () => {
    global.fetch = vi.fn().mockImplementation((url: string | URL) => {
      const urlStr = url.toString();
      if (urlStr.includes('/publishing')) {
        return Promise.resolve({
          ok: true,
          json: async () => ({ data: { visibility: 'PUBLIC' } }),
        } as Response);
      }
      if (urlStr.includes('/publish')) {
        return Promise.resolve({
          ok: true,
          json: async () => ({
            data: { deckId: 10, publishedRevisionNumber: 3, publishedAt: '2026-08-09T00:00:00Z', slug: 'deck-10-slug' },
          }),
        } as Response);
      }
      return Promise.reject(new Error('Unknown URL'));
    });

    render(<DeckPublishingModal deckId={10} initialVisibility="PRIVATE" initialSlug="deck-10-slug" isOpen={true} onClose={vi.fn()} />);

    expect(screen.getByText(/deck publishing & primer/i)).toBeInTheDocument();

    // Change visibility select
    const visibilitySelect = screen.getByLabelText(/visibility/i);
    fireEvent.change(visibilitySelect, { target: { value: 'PUBLIC' } });

    await waitFor(() => {
      expect(screen.getByText(/visibility updated to public/i)).toBeInTheDocument();
    });

    // Click separate Publish Snapshot button
    const publishButton = screen.getByRole('button', { name: /publish current revision/i });
    fireEvent.click(publishButton);

    await waitFor(() => {
      expect(screen.getByText(/pinned revision #3/i)).toBeInTheDocument();
    });
  });

  it('updates primer strategy guide', async () => {
    global.fetch = vi.fn().mockImplementation((url: string | URL) => {
      const urlStr = url.toString();
      if (urlStr.includes('/primer')) {
        return Promise.resolve({
          ok: true,
          json: async () => ({ data: { title: 'Sideboard Strategy', content: '# Sideboard Guide' } }),
        } as Response);
      }
      return Promise.reject(new Error('Unknown URL'));
    });

    render(<DeckPublishingModal deckId={10} initialVisibility="PUBLIC" isOpen={true} onClose={vi.fn()} />);

    const titleInput = screen.getByPlaceholderText(/primer title/i);
    const contentInput = screen.getByPlaceholderText(/write markdown primer source/i);

    fireEvent.change(titleInput, { target: { value: 'Sideboard Strategy' } });
    fireEvent.change(contentInput, { target: { value: '# Sideboard Guide' } });

    const savePrimerButton = screen.getByRole('button', { name: /save primer/i });
    fireEvent.click(savePrimerButton);

    await waitFor(() => {
      expect(screen.getByText(/primer saved successfully/i)).toBeInTheDocument();
    });
  });
});
