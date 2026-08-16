import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { LearnSidebar } from '@/components/learn/LearnSidebar';

describe('LearnSidebar Component', () => {
  beforeEach(() => {
    class MockIntersectionObserver {
      observe = vi.fn();
      unobserve = vi.fn();
      disconnect = vi.fn();
    }
    vi.stubGlobal('IntersectionObserver', MockIntersectionObserver);
  });

  it('renders all 7 navigation section links including keywords and resources', () => {
    // Given & When
    render(<LearnSidebar />);

    // Then
    expect(screen.getByRole('link', { name: 'The Goal of the Game' })).toHaveAttribute('href', '#objective');
    expect(screen.getByRole('link', { name: 'The 5 Colors of Mana' })).toHaveAttribute('href', '#colors');
    expect(screen.getByRole('link', { name: 'Card Types' })).toHaveAttribute('href', '#types');
    expect(screen.getByRole('link', { name: 'Turn Structure' })).toHaveAttribute('href', '#turns');
    expect(screen.getByRole('link', { name: 'Commander Basics' })).toHaveAttribute('href', '#commander');
    expect(screen.getByRole('link', { name: 'Keyword Glossary' })).toHaveAttribute('href', '#keywords');
    expect(screen.getByRole('link', { name: 'Learn More Resources' })).toHaveAttribute('href', '#resources');
  });
});
