import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import LearnPage from '@/app/(dashboard)/learn/page';

describe('LearnPage', () => {
  beforeEach(() => {
    class MockIntersectionObserver {
      observe = vi.fn();
      unobserve = vi.fn();
      disconnect = vi.fn();
    }
    vi.stubGlobal('IntersectionObserver', MockIntersectionObserver);
  });

  it('renders page header and all learning sections including keyword glossary and resources', () => {
    // Given & When
    const { container } = render(<LearnPage />);

    // Then
    expect(screen.getByRole('heading', { level: 1, name: /how magic works/i })).toBeDefined();

    // Verify all 7 section containers exist by ID
    expect(container.querySelector('#objective')).not.toBeNull();
    expect(container.querySelector('#colors')).not.toBeNull();
    expect(container.querySelector('#types')).not.toBeNull();
    expect(container.querySelector('#turns')).not.toBeNull();
    expect(container.querySelector('#commander')).not.toBeNull();
    expect(container.querySelector('#keywords')).not.toBeNull();
    expect(container.querySelector('#resources')).not.toBeNull();

    // Verify headings
    expect(screen.getByRole('heading', { level: 2, name: /keyword glossary/i })).toBeDefined();
    expect(screen.getByRole('heading', { level: 2, name: /learn more resources/i })).toBeDefined();
  });
});
