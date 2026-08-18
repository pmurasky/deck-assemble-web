import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { ReadinessSummaryView } from '@/components/deck/ReadinessSummaryView';

describe('ReadinessSummaryView Component', () => {
  it('renders all four fields: bracket, format, ownership %, and deck value', () => {
    render(
      <ReadinessSummaryView
        summary={{
          bracket: 4,
          format: 'Commander',
          ownershipPercentage: 88,
          deckValue: { USD: 420.75 },
        }}
      />
    );

    expect(screen.getByText(/Deck Readiness Summary/i)).toBeInTheDocument();
    expect(screen.getByText(/Bracket 4/i)).toBeInTheDocument();
    expect(screen.getByText(/\(Optimized\)/i)).toBeInTheDocument();
    expect(screen.getByText(/Commander/i)).toBeInTheDocument();
    expect(screen.getByText(/88% Owned/i)).toBeInTheDocument();
    expect(screen.getByText(/\$420.75/i)).toBeInTheDocument();
  });

  it('handles unrated and number/string deck values gracefully', () => {
    const { rerender } = render(
      <ReadinessSummaryView
        summary={{
          bracket: null,
          format: 'Modern',
          ownershipPercentage: 100,
          deckValue: 150,
        }}
      />
    );

    expect(screen.getByText(/Unrated/i)).toBeInTheDocument();
    expect(screen.getByText(/Modern/i)).toBeInTheDocument();
    expect(screen.getByText(/100% Owned/i)).toBeInTheDocument();
    expect(screen.getByText(/\$150.00/i)).toBeInTheDocument();

    rerender(
      <ReadinessSummaryView
        summary={{
          bracketScore: 1,
          format: 'Pauper',
          ownershipPercentage: 50,
          deckValue: '$45.00',
        }}
      />
    );

    expect(screen.getByText(/Bracket 1/i)).toBeInTheDocument();
    expect(screen.getByText(/\(Exhibition\)/i)).toBeInTheDocument();
    expect(screen.getByText(/Pauper/i)).toBeInTheDocument();
    expect(screen.getByText(/50% Owned/i)).toBeInTheDocument();
    expect(screen.getByText(/\$45.00/i)).toBeInTheDocument();
  });
});
