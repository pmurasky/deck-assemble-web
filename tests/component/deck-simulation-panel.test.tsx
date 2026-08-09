import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import { DeckSimulationPanel } from '@/components/deck/DeckSimulationPanel';

vi.mock('@/lib/auth0', () => ({
  auth0: {
    getAccessToken: vi.fn().mockResolvedValue({ token: 'test-token' }),
  },
}));

describe('DeckSimulationPanel Component', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('draws sample hands with mulligan configuration', async () => {
    const mockHandsResponse = {
      seed: 'seed-test-123',
      hands: [
        {
          id: 'h-1',
          handNumber: 1,
          cards: [{ id: 101, name: 'Sol Ring', manaCost: '{1}' }],
          mulliganCount: 1,
        },
      ],
    };

    global.fetch = vi.fn().mockImplementation((url: string | URL) => {
      const urlStr = url.toString();
      if (urlStr.includes('/sample-hands')) {
        return Promise.resolve({
          ok: true,
          json: async () => ({ data: mockHandsResponse }),
        } as Response);
      }
      return Promise.reject(new Error('Unknown URL'));
    });

    render(<DeckSimulationPanel deckId={10} />);

    expect(screen.getByRole('button', { name: 'Sample Hands' })).toBeInTheDocument();

    const drawButton = screen.getByRole('button', { name: /draw sample hands/i });
    fireEvent.click(drawButton);

    await waitFor(() => {
      expect(screen.getByText(/Hand #1/i)).toBeInTheDocument();
      expect(screen.getByText(/Sol Ring/i)).toBeInTheDocument();
      expect(screen.getByText(/Mulligans: 1/i)).toBeInTheDocument();
    });
  });

  it('runs Monte Carlo simulation and displays 95% margin of error banner', async () => {
    const mockSimResponse = {
      seed: 'sim-seed-789',
      landDropProbabilityByTurn: { 1: 0.95, 2: 0.88 },
      colorAvailabilityByTurn: { W: { 1: 0.60 } },
      cardsSeenByTurn: { 1: 8, 2: 9 },
      castabilityByTurn: { 1: 0.75, 2: 0.85 },
      playableSpellCountByTurn: { 1: 2, 2: 4 },
      confidence: { marginOfErrorPercent95: 1.45 },
    };

    global.fetch = vi.fn().mockImplementation((url: string | URL) => {
      const urlStr = url.toString();
      if (urlStr.includes('/simulations')) {
        return Promise.resolve({
          ok: true,
          json: async () => ({ data: mockSimResponse }),
        } as Response);
      }
      return Promise.reject(new Error('Unknown URL'));
    });

    render(<DeckSimulationPanel deckId={10} />);

    // Switch tab to Monte Carlo Simulation
    const simTab = screen.getByRole('button', { name: /monte carlo simulation/i });
    fireEvent.click(simTab);

    const runButton = screen.getByRole('button', { name: /run simulation/i });
    fireEvent.click(runButton);

    await waitFor(() => {
      expect(screen.getByText(/±1.45%/i)).toBeInTheDocument();
      expect(screen.getByText(/mana-value heuristic/i)).toBeInTheDocument();
    });
  });
});
