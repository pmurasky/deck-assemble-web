import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { ManaCost } from '@/components/cards/ManaCost';
import { ColorIdentityBadge } from '@/components/cards/ColorIdentityBadge';
import { LegalityBadge } from '@/components/cards/LegalityBadge';

describe('Card UI Components', () => {
  it('renders ManaCost symbols correctly', () => {
    render(<ManaCost manaCost="{1}{U}{R}" />);
    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('U')).toBeInTheDocument();
    expect(screen.getByText('R')).toBeInTheDocument();
  });

  it('renders ColorIdentityBadge with color names', () => {
    render(<ColorIdentityBadge colors={['U', 'R']} />);
    expect(screen.getByText('Blue')).toBeInTheDocument();
    expect(screen.getByText('Red')).toBeInTheDocument();
  });

  it('renders LegalityBadge for legal status', () => {
    render(<LegalityBadge format="Commander" status="legal" />);
    expect(screen.getByText('Commander')).toBeInTheDocument();
    expect(screen.getByText('LEGAL')).toBeInTheDocument();
  });
});
