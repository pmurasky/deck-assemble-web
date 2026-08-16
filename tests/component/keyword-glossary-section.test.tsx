import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { KeywordGlossarySection } from '@/components/learn/KeywordGlossarySection';

describe('KeywordGlossarySection Component', () => {
  it('renders section header and id correctly', () => {
    // Given & When
    const { container } = render(<KeywordGlossarySection />);

    // Then
    const section = container.querySelector('#keywords');
    expect(section).not.toBeNull();
    expect(screen.getByRole('heading', { level: 2, name: /keyword glossary/i })).toBeDefined();
  });

  it('renders common combat and evergreen keywords with plain English definitions', () => {
    // Given & When
    render(<KeywordGlossarySection />);

    // Then
    expect(screen.getByText('Flying')).toBeDefined();
    expect(screen.getByText(/can't be blocked except by creatures with flying and\/or reach/i)).toBeDefined();

    expect(screen.getByText('Trample')).toBeDefined();
    expect(screen.getByText(/can deal excess combat damage to the player or planeswalker it's attacking/i)).toBeDefined();

    expect(screen.getByText('Deathtouch')).toBeDefined();
    expect(screen.getByText(/any amount of damage this deals to a creature is enough to destroy it/i)).toBeDefined();

    expect(screen.getByText('Haste')).toBeDefined();
    expect(screen.getByText(/can attack and \{T\} as soon as it comes under your control/i)).toBeDefined();

    expect(screen.getByText('Ward')).toBeDefined();
    expect(screen.getByText(/counter it unless that player pays the ward cost/i)).toBeDefined();
  });

  it('renders at least 30 common keywords', () => {
    // Given & When
    const { container } = render(<KeywordGlossarySection />);

    // Then
    const keywordCards = container.querySelectorAll('[data-testid="keyword-card"]');
    expect(keywordCards.length).toBeGreaterThanOrEqual(30);
  });
});
