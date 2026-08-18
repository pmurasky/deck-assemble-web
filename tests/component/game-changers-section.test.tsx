import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { GameChangersSection } from '@/components/deck/GameChangersSection';

describe('GameChangersSection Component', () => {
  it('renders clean list message when gameChangers list is empty or undefined', () => {
    const { rerender } = render(<GameChangersSection gameChangers={[]} />);
    expect(screen.getByText(/Clean List/i)).toBeInTheDocument();
    expect(screen.getByText(/No Game Changers flagged/i)).toBeInTheDocument();

    rerender(<GameChangersSection gameChangers={undefined} />);
    expect(screen.getByText(/Clean List/i)).toBeInTheDocument();
  });

  it('renders flagged game changers count and card chips', () => {
    render(<GameChangersSection gameChangers={['Mana Crypt', 'Sol Ring', 'Demonic Tutor']} />);
    expect(screen.getByText('3 Flagged')).toBeInTheDocument();
    expect(screen.getByText('Mana Crypt')).toBeInTheDocument();
    expect(screen.getByText('Sol Ring')).toBeInTheDocument();
    expect(screen.getByText('Demonic Tutor')).toBeInTheDocument();
  });
});
