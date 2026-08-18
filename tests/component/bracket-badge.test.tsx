import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { BracketBadge } from '@/components/deck/BracketBadge';

describe('BracketBadge Component', () => {
  it('renders Unrated state when bracket is undefined or null', () => {
    const { rerender } = render(<BracketBadge bracket={undefined} />);
    expect(screen.getByText('Unrated')).toBeInTheDocument();

    rerender(<BracketBadge bracket={null} />);
    expect(screen.getByText('Unrated')).toBeInTheDocument();
  });

  it('renders Bracket 1 (Exhibition)', () => {
    render(<BracketBadge bracket={1} />);
    expect(screen.getByText('Bracket 1')).toBeInTheDocument();
    expect(screen.getByText('(Exhibition)')).toBeInTheDocument();
  });

  it('renders Bracket 2 (Core)', () => {
    render(<BracketBadge bracket={2} />);
    expect(screen.getByText('Bracket 2')).toBeInTheDocument();
    expect(screen.getByText('(Core)')).toBeInTheDocument();
  });

  it('renders Bracket 3 (Upgraded)', () => {
    render(<BracketBadge bracket={3} />);
    expect(screen.getByText('Bracket 3')).toBeInTheDocument();
    expect(screen.getByText('(Upgraded)')).toBeInTheDocument();
  });

  it('renders Bracket 4 (Optimized)', () => {
    render(<BracketBadge bracket={4} />);
    expect(screen.getByText('Bracket 4')).toBeInTheDocument();
    expect(screen.getByText('(Optimized)')).toBeInTheDocument();
  });

  it('renders Bracket 5 (cEDH)', () => {
    render(<BracketBadge bracket={5} />);
    expect(screen.getByText('Bracket 5')).toBeInTheDocument();
    expect(screen.getByText('(cEDH)')).toBeInTheDocument();
  });
});
