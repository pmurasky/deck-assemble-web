import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DeckAnalysisPanel } from '@/components/deck/DeckAnalysisPanel';
import * as decksApi from '@/lib/api/decks';

vi.mock('@/lib/api/decks', () => ({
  getDeckAnalysis: vi.fn(),
}));

// Mock Recharts components to simplify test rendering
vi.mock('recharts', () => ({
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  BarChart: ({ children }: { children: React.ReactNode }) => <div data-testid="bar-chart">{children}</div>,
  Bar: () => <div />,
  XAxis: () => <div />,
  YAxis: () => <div />,
  Tooltip: () => <div />,
  PieChart: ({ children }: { children: React.ReactNode }) => <div data-testid="pie-chart">{children}</div>,
  Pie: () => <div />,
  Cell: () => <div />,
}));

describe('DeckAnalysisPanel Component', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('renders zeroed "Add cards to analyze your deck" empty state when deck is empty', async () => {
    vi.mocked(decksApi.getDeckAnalysis).mockResolvedValueOnce({
      deckId: 99,
      totalCards: 0,
      manaCurve: [],
      colorDemand: [],
      typeDistribution: [],
      ownership: { ownedCount: 0, missingCount: 0, ownedPercentage: 0 },
      valueByCurrency: { USD: 0 },
      categories: [],
      combos: [],
    });

    render(<DeckAnalysisPanel deckId={99} />);

    await waitFor(() => {
      expect(screen.getByText(/Add cards to analyze your deck/i)).toBeInTheDocument();
    });

    expect(screen.getByText(/Your deck is currently empty/i)).toBeInTheDocument();
  });

  it('renders full analysis charts, badges, valueByCurrency, categories, and combos when deck has cards', async () => {
    vi.mocked(decksApi.getDeckAnalysis).mockResolvedValueOnce({
      deckId: 10,
      totalCards: 100,
      manaCurve: [
        { cmc: '0', count: 2 },
        { cmc: '1', count: 12 },
        { cmc: '2', count: 25 },
      ],
      colorDemand: [
        { color: 'W', count: 25 },
        { color: 'U', count: 40 },
      ],
      typeDistribution: [
        { type: 'Creature', count: 30 },
        { type: 'Land', count: 35 },
      ],
      ownership: {
        ownedCount: 85,
        missingCount: 15,
        ownedPercentage: 85,
      },
      valueByCurrency: {
        USD: 45.5,
        EUR: 39.9,
      },
      categories: [
        { name: 'Ramp', count: 10 },
        { name: 'Card Draw', count: 12 },
      ],
      combos: [
        { name: 'Thassa\'s Oracle + Demonic Consultation', cards: ['Thassa\'s Oracle', 'Demonic Consultation'], description: 'Wins on ETB' },
      ],
    });

    render(<DeckAnalysisPanel deckId={10} />);

    await waitFor(() => {
      expect(screen.getByText(/Mana Curve \(CMC\)/i)).toBeInTheDocument();
    });

    // Check ownership badges
    expect(screen.getByText('85% Owned')).toBeInTheDocument();
    expect(screen.getByText(/15 Missing/i)).toBeInTheDocument();

    // Check valueByCurrency badges
    expect(screen.getByText(/USD: \$45.50/i)).toBeInTheDocument();
    expect(screen.getByText(/EUR: €39.90/i)).toBeInTheDocument();

    // Check categories and combo summary
    expect(screen.getByText('Ramp')).toBeInTheDocument();
    expect(screen.getByText("Thassa's Oracle + Demonic Consultation")).toBeInTheDocument();
  });

  it('renders user-assigned functionalCategories when present', async () => {
    vi.mocked(decksApi.getDeckAnalysis).mockResolvedValueOnce({
      deckId: 10,
      totalCards: 100,
      manaCurve: [],
      colorDemand: [],
      typeDistribution: [],
      ownership: { ownedCount: 100, missingCount: 0, ownedPercentage: 100 },
      valueByCurrency: { USD: 0 },
      categories: [],
      functionalCategories: [
        { name: 'Custom Win-Condition', count: 4, isCustom: true },
        { name: 'Fast Mana', count: 8, isCustom: true },
      ],
      combos: [],
    });

    render(<DeckAnalysisPanel deckId={10} />);

    await waitFor(() => {
      expect(screen.getByText('Custom Win-Condition')).toBeInTheDocument();
      expect(screen.getByText('Fast Mana')).toBeInTheDocument();
    });
  });
});

