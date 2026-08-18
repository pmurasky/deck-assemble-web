import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ProxyPrintView } from '@/components/deck/ProxyPrintView';

describe('ProxyPrintView Component', () => {
  const mockExportResponse = {
    deckName: 'Dragon Commander',
    format: 'proxy-sheet',
    totalUnowned: 3,
    unownedCards: [
      {
        id: 'c-1',
        name: 'The Great Henge',
        quantity: 1,
        manaCost: '{7}{G}{G}',
        typeLine: 'Legendary Artifact',
        oracleText: 'This spell costs {X} less to cast, where X is the greatest power among creatures you control.',
      },
      {
        id: 'c-2',
        name: 'Ancient Copper Dragon',
        quantity: 1,
        manaCost: '{4}{R}{R}',
        typeLine: 'Creature — Elder Dragon',
        oracleText: 'Flying. Whenever Ancient Copper Dragon deals combat damage to a player, roll a d20.',
      },
      {
        id: 'c-3',
        name: 'Mana Vault',
        quantity: 1,
        manaCost: '{1}',
        typeLine: 'Artifact',
        oracleText: 'Mana Vault does not untap during your untap step.',
      },
    ],
  };

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('fetches proxy export data and renders one entry per unowned card', async () => {
    global.fetch = vi.fn().mockImplementation((url: string | URL) => {
      const urlStr = url.toString();
      if (urlStr.includes('/export?format=proxy-sheet')) {
        return Promise.resolve({
          ok: true,
          json: async () => mockExportResponse,
        } as Response);
      }
      return Promise.reject(new Error('Unknown URL'));
    });

    render(
      <ProxyPrintView
        isOpen={true}
        onClose={vi.fn()}
        deckId={42}
        deckName="Dragon Commander"
      />
    );

    expect(screen.getByText(/Generating proxy print sheet/i)).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('The Great Henge')).toBeInTheDocument();
      expect(screen.getByText('Ancient Copper Dragon')).toBeInTheDocument();
      expect(screen.getByText('Mana Vault')).toBeInTheDocument();
    });

    const cardItems = screen.getAllByTestId('proxy-card-item');
    expect(cardItems).toHaveLength(3);
  });

  it('triggers window.print when clicking Print button', async () => {
    const printSpy = vi.spyOn(window, 'print').mockImplementation(() => {});

    global.fetch = vi.fn().mockImplementation((url: string | URL) => {
      const urlStr = url.toString();
      if (urlStr.includes('/export?format=proxy-sheet')) {
        return Promise.resolve({
          ok: true,
          json: async () => mockExportResponse,
        } as Response);
      }
      return Promise.reject(new Error('Unknown URL'));
    });

    render(
      <ProxyPrintView
        isOpen={true}
        onClose={vi.fn()}
        deckId={42}
        deckName="Dragon Commander"
      />
    );

    await waitFor(() => {
      expect(screen.getByText('The Great Henge')).toBeInTheDocument();
    });

    const printButton = screen.getByRole('button', { name: /Print Sheet|Print \/ PDF/i });
    fireEvent.click(printButton);

    expect(printSpy).toHaveBeenCalled();
  });
});
