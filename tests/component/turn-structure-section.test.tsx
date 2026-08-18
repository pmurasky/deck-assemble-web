import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { TurnStructureSection } from '@/components/learn/TurnStructureSection';

describe('TurnStructureSection Component', () => {
  it('renders section header, id, and all 5 turn phases', () => {
    // Given & When
    const { container } = render(<TurnStructureSection />);

    // Then
    expect(container.querySelector('#turns')).not.toBeNull();
    expect(screen.getByRole('heading', { level: 2, name: /turn structure/i })).toBeDefined();

    expect(screen.getByRole('heading', { level: 3, name: /Beginning Phase/i })).toBeDefined();
    expect(screen.getByRole('heading', { level: 3, name: /Main Phase 1/i })).toBeDefined();
    expect(screen.getByRole('heading', { level: 3, name: /Combat Phase/i })).toBeDefined();
    expect(screen.getByRole('heading', { level: 3, name: /Main Phase 2/i })).toBeDefined();
    expect(screen.getByRole('heading', { level: 3, name: /Ending Phase/i })).toBeDefined();
  });

  it('renders detailed combat steps including declare attackers, blockers, and combat damage', () => {
    // Given & When
    render(<TurnStructureSection />);

    // Then
    expect(screen.getByText(/Declare Attackers/i)).toBeDefined();
    expect(screen.getByText(/Declare Blockers/i)).toBeDefined();
    expect(screen.getByText(/Combat Damage/i)).toBeDefined();
  });

  it('renders rules timing callout with links to stack, priority, and glossary entries', () => {
    // Given & When
    const { container } = render(<TurnStructureSection />);

    // Then
    const stackLink = container.querySelector('a[href="#glossary-the-stack"]');
    const priorityLink = container.querySelector('a[href="#glossary-priority"]');

    expect(stackLink).not.toBeNull();
    expect(priorityLink).not.toBeNull();
  });
});
