import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
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

  it('renders rules entries including stack, priority, and combat steps', () => {
    // Given & When
    render(<KeywordGlossarySection />);

    // Then
    expect(screen.getByText('The Stack')).toBeDefined();
    expect(screen.getByText('Priority')).toBeDefined();
    expect(screen.getByText('Combat Damage Step')).toBeDefined();
  });

  it('renders at least 40 keywords and rules entries', () => {
    // Given & When
    const { container } = render(<KeywordGlossarySection />);

    // Then
    const keywordCards = container.querySelectorAll('[data-testid="keyword-card"]');
    expect(keywordCards.length).toBeGreaterThanOrEqual(40);
  });

  it('renders search input and category filter buttons', () => {
    // Given & When
    render(<KeywordGlossarySection />);

    // Then
    expect(screen.getByRole('searchbox', { name: /search glossary/i })).toBeDefined();
    expect(screen.getByRole('button', { name: /all/i })).toBeDefined();
    expect(screen.getByRole('button', { name: /combat steps/i })).toBeDefined();
    expect(screen.getByRole('button', { name: /rules & timing/i })).toBeDefined();
  });

  it('filters entries when typing into search input', async () => {
    // Given
    const user = userEvent.setup();
    render(<KeywordGlossarySection />);
    const searchInput = screen.getByRole('searchbox', { name: /search glossary/i });

    // When
    await user.type(searchInput, 'priority');

    // Then
    expect(screen.getByText('Priority')).toBeDefined();
    expect(screen.queryByText('Flying')).toBeNull();
  });

  it('filters entries by clicking category filter button', async () => {
    // Given
    const user = userEvent.setup();
    render(<KeywordGlossarySection />);
    const combatStepsBtn = screen.getByRole('button', { name: /combat steps/i });

    // When
    await user.click(combatStepsBtn);

    // Then
    expect(screen.getByText('Combat Damage Step')).toBeDefined();
    expect(screen.getByText('Declare Attackers Step')).toBeDefined();
    expect(screen.queryByText('Flying')).toBeNull();
  });

  it('combines category filter and search query', async () => {
    // Given
    const user = userEvent.setup();
    render(<KeywordGlossarySection />);
    const combatStepsBtn = screen.getByRole('button', { name: /combat steps/i });
    const searchInput = screen.getByRole('searchbox', { name: /search glossary/i });

    // When
    await user.click(combatStepsBtn);
    await user.type(searchInput, 'blockers');

    // Then
    expect(screen.getByText('Declare Blockers Step')).toBeDefined();
    expect(screen.queryByText('Combat Damage Step')).toBeNull();
    expect(screen.queryByText('Flying')).toBeNull();
  });

  it('displays empty state when no entries match search query and allows reset', async () => {
    // Given
    const user = userEvent.setup();
    render(<KeywordGlossarySection />);
    const searchInput = screen.getByRole('searchbox', { name: /search glossary/i });

    // When
    await user.type(searchInput, 'xyznonexistentrulesentry123');

    // Then
    expect(screen.getByText(/no glossary entries found/i)).toBeDefined();
    const resetBtn = screen.getByRole('button', { name: /clear search & filters/i });
    expect(resetBtn).toBeDefined();

    // When clicking reset
    await user.click(resetBtn);

    // Then entries restored
    expect(screen.getByText('Flying')).toBeDefined();
    expect(screen.getByText('The Stack')).toBeDefined();
  });

  it('clears search input via search clear icon button', async () => {
    // Given
    const user = userEvent.setup();
    render(<KeywordGlossarySection />);
    const searchInput = screen.getByRole('searchbox', { name: /search glossary/i });

    // When typing
    await user.type(searchInput, 'haste');
    expect(screen.getByText('Haste')).toBeDefined();
    expect(screen.queryByText('Flying')).toBeNull();

    // When clicking clear input icon button
    const clearInputBtn = screen.getByRole('button', { name: /clear search input/i });
    await user.click(clearInputBtn);

    // Then
    expect(screen.getByText('Flying')).toBeDefined();
    expect(screen.getByText('Haste')).toBeDefined();
  });

  it('renders anchor IDs on cards for deep linking', () => {
    // Given & When
    const { container } = render(<KeywordGlossarySection />);

    // Then
    expect(container.querySelector('#glossary-the-stack')).not.toBeNull();
    expect(container.querySelector('#glossary-priority')).not.toBeNull();
    expect(container.querySelector('#glossary-flying')).not.toBeNull();
  });
});

