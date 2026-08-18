import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DeckAnalysisPanel } from '@/components/deck/DeckAnalysisPanel';
import * as decksApi from '@/lib/api/decks';

vi.mock('@/lib/api/decks', () => ({
  getDeckAnalysis: vi.fn(),
  fetchDeckLegality: vi.fn().mockResolvedValue({ legal: true, violations: [] }),
  fetchDeckCombos: vi.fn().mockResolvedValue({ available: true, combos: [] }),
}));

// Mock Recharts components to simplify test rendering and inspect passed data
vi.mock('recharts', () => ({
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  BarChart: ({ children, data }: { children: React.ReactNode; data?: unknown[] }) => (
    <div data-testid="bar-chart" data-chart-data={JSON.stringify(data)}>
      {children}
    </div>
  ),
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
      manaCurve: {},
      typeDistribution: {},
      colorDemand: {},
      colorProduction: {},
      landCount: 0,
      averageManaValue: 0,
      ownershipBreakdown: { OWNED: 0, WISHLIST: 0, PROXY: 0 },
      valueByCurrency: { USD: 0 },
      missingCostByCurrency: {},
      unpricedCardCount: 0,
      functionalCategories: {},
      tokenProducers: [],
      gameChangers: [],
      legality: { legal: true, violations: [] },
      combos: { available: false, count: 0, combos: [] },
    });

    render(<DeckAnalysisPanel deckId={99} />);

    await waitFor(() => {
      expect(screen.getByText(/Add cards to analyze your deck/i)).toBeInTheDocument();
    });

    expect(screen.getByText(/Your deck is currently empty/i)).toBeInTheDocument();
  });

  it('renders full analysis charts, badges, valueByCurrency, and categories from real backend contract shape', async () => {
    vi.mocked(decksApi.getDeckAnalysis).mockResolvedValueOnce({
      manaCurve: {
        '2': 25,
        '0': 2,
        '6+': 16,
        '1': 12,
      },
      typeDistribution: {
        Creature: 30,
        Land: 35,
      },
      colorDemand: {
        W: 25,
        U: 40,
      },
      colorProduction: {
        W: 10,
        U: 20,
      },
      landCount: 35,
      averageManaValue: 2.85,
      ownershipBreakdown: {
        OWNED: 85,
        WISHLIST: 10,
        PROXY: 5,
      },
      valueByCurrency: {
        USD: 45.5,
        EUR: 39.9,
      },
      missingCostByCurrency: {
        USD: 12.0,
        EUR: 10.5,
      },
      unpricedCardCount: 0,
      functionalCategories: {
        Ramp: 10,
        'Card Draw': 12,
      },
      tokenProducers: [],
      gameChangers: [],
      legality: { legal: true, violations: [] },
      combos: {
        available: false,
        count: 0,
        combos: [],
      },
    });

    render(<DeckAnalysisPanel deckId={10} />);

    await waitFor(() => {
      expect(screen.getByText(/Mana Curve \(CMC\)/i)).toBeInTheDocument();
    });

    // Derived ownership badges
    expect(screen.getByText('85% Owned')).toBeInTheDocument();
    expect(screen.getByText('(85/100)')).toBeInTheDocument();
    expect(screen.getByText(/15 Missing/i)).toBeInTheDocument();

    // Value by currency
    expect(screen.getByText(/USD: \$45.50/i)).toBeInTheDocument();
    expect(screen.getByText(/EUR: €39.90/i)).toBeInTheDocument();

    // Functional categories
    expect(screen.getByText('Ramp')).toBeInTheDocument();
    expect(screen.getByText('10')).toBeInTheDocument();
    expect(screen.getByText('Card Draw')).toBeInTheDocument();
    expect(screen.getByText('12')).toBeInTheDocument();

    // Mana curve chart data sorted numerically with 6+ last
    const barCharts = screen.getAllByTestId('bar-chart');
    const manaCurveChartData = JSON.parse(barCharts[0].getAttribute('data-chart-data') || '[]');
    expect(manaCurveChartData).toEqual([
      { cmc: '0', count: 2 },
      { cmc: '1', count: 12 },
      { cmc: '2', count: 25 },
      { cmc: '6+', count: 16 },
    ]);

    // Color demand chart data
    const colorDemandChartData = JSON.parse(barCharts[1].getAttribute('data-chart-data') || '[]');
    expect(colorDemandChartData).toEqual([
      { color: 'W', count: 25 },
      { color: 'U', count: 40 },
    ]);
  });

  it('renders format legality violations badge when deck is illegal', async () => {
    vi.mocked(decksApi.getDeckAnalysis).mockResolvedValueOnce({
      manaCurve: {},
      typeDistribution: {},
      colorDemand: {},
      colorProduction: {},
      landCount: 0,
      averageManaValue: 0,
      ownershipBreakdown: { OWNED: 100, WISHLIST: 0, PROXY: 0 },
      valueByCurrency: { USD: 0 },
      missingCostByCurrency: {},
      unpricedCardCount: 0,
      functionalCategories: {},
      tokenProducers: [],
      gameChangers: [],
      legality: { legal: true, violations: [] },
      combos: { available: false, count: 0, combos: [] },
    });
    vi.mocked(decksApi.fetchDeckLegality).mockResolvedValueOnce({
      legal: false,
      violations: [{ code: 'COMMANDER_COLOR_IDENTITY', message: 'Contains off-color cards' }],
    });

    render(<DeckAnalysisPanel deckId={10} />);

    await waitFor(() => {
      expect(screen.getByText('1 Violation')).toBeInTheDocument();
    });
  });

  it('renders verified Commander Spellbook combos with prerequisites from dedicated endpoint', async () => {
    vi.mocked(decksApi.getDeckAnalysis).mockResolvedValueOnce({
      manaCurve: {},
      typeDistribution: {},
      colorDemand: {},
      colorProduction: {},
      landCount: 0,
      averageManaValue: 0,
      ownershipBreakdown: { OWNED: 100, WISHLIST: 0, PROXY: 0 },
      valueByCurrency: { USD: 0 },
      missingCostByCurrency: {},
      unpricedCardCount: 0,
      functionalCategories: {},
      tokenProducers: [],
      gameChangers: [],
      legality: { legal: true, violations: [] },
      combos: { available: false, count: 0, combos: [] },
    });
    vi.mocked(decksApi.fetchDeckCombos).mockResolvedValueOnce({
      available: true,
      combos: [
        {
          id: 'combo-99',
          cards: ['Dramatic Reversal', 'Isochron Scepter'],
          produces: ['Infinite mana'],
          description: 'Imprint Reversal on Scepter for loop',
          prerequisites: 'Nonland mana rocks produce >= 3 mana',
        },
      ],
    });

    render(<DeckAnalysisPanel deckId={10} />);

    await waitFor(() => {
      expect(screen.getByText('Infinite mana')).toBeInTheDocument();
      expect(screen.getByText('Verified Combos')).toBeInTheDocument();
      expect(screen.getByText(/Nonland mana rocks produce >= 3 mana/i)).toBeInTheDocument();
    });
  });

  it('renders Commander Bracket badge and flagged Game Changers breakdown panel', async () => {
    vi.mocked(decksApi.getDeckAnalysis).mockResolvedValueOnce({
      manaCurve: { '2': 10 },
      typeDistribution: { Artifact: 5 },
      colorDemand: { U: 10 },
      colorProduction: { U: 10 },
      landCount: 36,
      averageManaValue: 2.5,
      ownershipBreakdown: { OWNED: 100 },
      valueByCurrency: { USD: 150 },
      missingCostByCurrency: {},
      unpricedCardCount: 0,
      functionalCategories: { Ramp: 5 },
      tokenProducers: [],
      gameChangers: ['Mana Crypt', 'Rhystic Study', 'Demonic Tutor'],
      bracket: 4,
      legality: { legal: true, violations: [] },
      combos: { available: false, count: 0, combos: [] },
    });

    render(<DeckAnalysisPanel deckId={42} />);

    await waitFor(() => {
      expect(screen.getByText(/Bracket 4/i)).toBeInTheDocument();
    });

    expect(screen.getByText(/Game Changers/i)).toBeInTheDocument();
    expect(screen.getByText('Mana Crypt')).toBeInTheDocument();
    expect(screen.getByText('Rhystic Study')).toBeInTheDocument();
    expect(screen.getByText('Demonic Tutor')).toBeInTheDocument();
  });

  it('renders 0 Game Changers empty state when no game changers are flagged', async () => {
    vi.mocked(decksApi.getDeckAnalysis).mockResolvedValueOnce({
      manaCurve: { '2': 10 },
      typeDistribution: { Creature: 10 },
      colorDemand: { G: 10 },
      colorProduction: { G: 10 },
      landCount: 36,
      averageManaValue: 3.0,
      ownershipBreakdown: { OWNED: 100 },
      valueByCurrency: { USD: 50 },
      missingCostByCurrency: {},
      unpricedCardCount: 0,
      functionalCategories: {},
      tokenProducers: [],
      gameChangers: [],
      bracket: 2,
      legality: { legal: true, violations: [] },
      combos: { available: false, count: 0, combos: [] },
    });

    render(<DeckAnalysisPanel deckId={43} />);

    await waitFor(() => {
      expect(screen.getByText(/Bracket 2/i)).toBeInTheDocument();
    });

    expect(screen.getByText(/No Game Changers flagged/i)).toBeInTheDocument();
  });

  it('renders land guidance callout next to mana curve showing current vs recommended land count', async () => {
    vi.mocked(decksApi.getDeckAnalysis).mockResolvedValueOnce({
      manaCurve: { '2': 10 },
      typeDistribution: { Land: 33, Creature: 20 },
      colorDemand: { W: 15 },
      colorProduction: { W: 15 },
      landCount: 33,
      recommendedLandCount: 37,
      averageManaValue: 3.2,
      ownershipBreakdown: { OWNED: 100 },
      valueByCurrency: { USD: 120 },
      missingCostByCurrency: {},
      unpricedCardCount: 0,
      functionalCategories: {},
      tokenProducers: [],
      gameChangers: [],
      bracket: 2,
      legality: { legal: true, violations: [] },
      combos: { available: false, count: 0, combos: [] },
    });

    render(<DeckAnalysisPanel deckId={55} />);

    await waitFor(() => {
      expect(screen.getByText(/Land Guidance/i)).toBeInTheDocument();
    });

    expect(screen.getByText('33')).toBeInTheDocument();
    expect(screen.getByText('37')).toBeInTheDocument();
  });
});


