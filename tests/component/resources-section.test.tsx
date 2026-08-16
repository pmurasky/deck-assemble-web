import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ResourcesSection } from '@/components/learn/ResourcesSection';

describe('ResourcesSection Component', () => {
  it('renders section header and id correctly', () => {
    // Given & When
    const { container } = render(<ResourcesSection />);

    // Then
    const section = container.querySelector('#resources');
    expect(section).not.toBeNull();
    expect(screen.getByRole('heading', { level: 2, name: /learn more/i })).toBeDefined();
  });

  it('renders the 4 required resource categories', () => {
    // Given & When
    render(<ResourcesSection />);

    // Then
    expect(screen.getByText(/rules.*beginner explainers/i)).toBeDefined();
    expect(screen.getByText(/commander strategy/i)).toBeDefined();
    expect(screen.getByText(/meta.*deck context/i)).toBeDefined();
    expect(screen.getByText(/format-specific practice/i)).toBeDefined();
  });

  it('renders required external links with correct attributes', () => {
    // Given & When
    render(<ResourcesSection />);

    // Then
    const edhrecLink = screen.getByRole('link', { name: /edhrec/i });
    expect(edhrecLink).toBeDefined();
    expect(edhrecLink.getAttribute('href')).toBe('https://edhrec.com');
    expect(edhrecLink.getAttribute('target')).toBe('_blank');
    expect(edhrecLink.getAttribute('rel')).toContain('noopener');

    const tolarianLink = screen.getByRole('link', { name: /tolarian community college/i });
    expect(tolarianLink).toBeDefined();
    expect(tolarianLink.getAttribute('target')).toBe('_blank');

    const goldfishLink = screen.getByRole('link', { name: /mtggoldfish/i });
    expect(goldfishLink).toBeDefined();
    expect(goldfishLink.getAttribute('target')).toBe('_blank');

    const draftsimLink = screen.getByRole('link', { name: /draftsim/i });
    expect(draftsimLink).toBeDefined();
    expect(draftsimLink.getAttribute('target')).toBe('_blank');
  });
});
