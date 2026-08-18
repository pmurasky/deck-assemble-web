import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { CommanderBasicsSection } from '@/components/learn/CommanderBasicsSection';

describe('CommanderBasicsSection', () => {
  it('renders commander basics content and CTA link to create deck', () => {
    render(<CommanderBasicsSection />);

    expect(screen.getByRole('heading', { level: 2, name: /commander basics/i })).toBeDefined();
    expect(screen.getByRole('heading', { level: 3, name: /the commander/i })).toBeDefined();
    expect(screen.getByRole('heading', { level: 3, name: /color identity/i })).toBeDefined();
    expect(screen.getByRole('heading', { level: 3, name: /100-card singleton/i })).toBeDefined();

    const ctaLink = screen.getByRole('link', { name: /build a deck/i });
    expect(ctaLink).toBeDefined();
    expect(ctaLink.getAttribute('href')).toBe('/decks?create=true');
  });
});
