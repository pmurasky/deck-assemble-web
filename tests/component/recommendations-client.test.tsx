import { render, screen, fireEvent, act } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { RecommendationsClient } from '@/components/deck/RecommendationsClient';

describe('RecommendationsClient Component Flow', () => {
  const mockSuggestions = [
    {
      commanderCardId: 123,
      commanderName: "Atraxa, Praetors' Voice",
      colorIdentity: 'W,U,B,G',
      coveragePercent: 75.0,
      missingCardCount: 2,
      estimatedCompletionCostUsd: 45.0,
      unpricedMissingCardCount: 0,
      commanderRank: 1,
    },
    {
      commanderCardId: 456,
      commanderName: 'Krenko, Mob Boss',
      colorIdentity: 'R',
      coveragePercent: 90.0,
      missingCardCount: 1,
      estimatedCompletionCostUsd: 15.0,
      unpricedMissingCardCount: 0,
      commanderRank: 2,
    },
  ];

  const mockBuildResult = {
    deck: {
      id: 9,
      name: "Atraxa's Proliferate Engine",
      commanderCardId: 123,
      secondaryCommanderCardId: null,
      commanderName: "Atraxa, Praetors' Voice",
      cardCount: 100,
      formatCode: 'COMMANDER',
      status: 'COMPLETE',
      createdAt: '2026-07-26',
    },
    cardCount: 100,
    ownedCount: 80,
    wishlistCount: 20,
    gaps: [],
    score: 87.5,
    legality: { legal: true, violations: [] },
  };

  const mockDeckCards = [
    {
      id: 1,
      cardPrintingId: 789,
      quantity: 1,
      deckSection: 'COMMANDER',
      ownershipStatus: 'OWNED',
      card: {
        id: 123,
        oracleId: 'ora-123',
        name: "Atraxa, Praetors' Voice",
        typeLine: 'Legendary Creature — Phyrexian Angel',
        manaCost: '{G}{W}{U}{B}',
        manaValue: 4,
        colors: 'W,U,B,G',
        colorIdentity: 'W,U,B,G',
      },
    },
  ];

  beforeEach(() => {
    vi.spyOn(global, 'fetch').mockImplementation(async (url) => {
      const urlStr = String(url);
      if (urlStr.includes('/api/v1/recommendations/commanders')) {
        return new Response(JSON.stringify({ data: mockSuggestions }), { status: 200 });
      }
      if (urlStr.includes('/api/v1/cards/')) {
        return new Response(
          JSON.stringify({
            id: 123,
            name: "Atraxa, Praetors' Voice",
            imageUrl: 'http://example.com/img.jpg',
            typeLine: 'Legendary Creature',
          }),
          { status: 200 }
        );
      }
      if (urlStr.includes('/api/v1/recommendations/builds')) {
        return new Response(JSON.stringify({ data: mockBuildResult }), { status: 200 });
      }
      if (urlStr.includes('/api/v1/decks/9/cards')) {
        return new Response(JSON.stringify({ data: mockDeckCards }), { status: 200 });
      }
      return new Response(JSON.stringify({ error: 'Not found' }), { status: 404 });
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders Screen 1 Commander suggestions after fetching', async () => {
    await act(async () => {
      render(<RecommendationsClient />);
    });

    expect(screen.getByText("Atraxa, Praetors' Voice")).toBeInTheDocument();
    expect(screen.getByText('Krenko, Mob Boss')).toBeInTheDocument();
  });

  it('opens Build Config modal when Build Deck is clicked, then generates deck', async () => {
    await act(async () => {
      render(<RecommendationsClient />);
    });

    const buildButtons = screen.getAllByRole('button', { name: /Build Deck/i });
    fireEvent.click(buildButtons[0]);

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText(/Build Configuration/i)).toBeInTheDocument();

    const generateBtn = screen.getByRole('button', { name: /Generate Deck/i });

    await act(async () => {
      fireEvent.click(generateBtn);
    });

    expect(screen.getByTestId('generated-deck-view')).toBeInTheDocument();
    expect(screen.getByText(/Generated Draft Deck/i)).toBeInTheDocument();
  });
});
