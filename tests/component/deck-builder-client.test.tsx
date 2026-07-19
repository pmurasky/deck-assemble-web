import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { DeckBuilderClient } from '@/components/deck/DeckBuilderClient';

// Mock child components to isolate test
vi.mock('@/components/cards/CardSearchBar', () => ({ CardSearchBar: () => <div data-testid="search-bar" /> }));
vi.mock('@/components/cards/CardFilterPanel', () => ({ CardFilterPanel: () => <div data-testid="filter-panel" /> }));
vi.mock('@/components/deck/DeckWorkspace', () => ({ DeckWorkspace: () => <div data-testid="deck-workspace" /> }));
vi.mock('@/components/deck/DeckStats', () => ({ DeckStats: () => <div data-testid="deck-stats" /> }));
vi.mock('@/components/deck/FormatValidator', () => ({ FormatValidator: () => <div data-testid="format-validator" /> }));

describe('DeckBuilderClient Component', () => {
  it('renders layout components correctly', () => {
    render(<DeckBuilderClient />);
    expect(screen.getByTestId('search-bar')).toBeDefined();
    expect(screen.getByTestId('filter-panel')).toBeDefined();
    expect(screen.getByTestId('deck-workspace')).toBeDefined();
    expect(screen.getByTestId('deck-stats')).toBeDefined();
    expect(screen.getByTestId('format-validator')).toBeDefined();
  });
});
