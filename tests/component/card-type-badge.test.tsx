import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { CardTypeBadge } from '@/components/cards/CardTypeBadge';

describe('CardTypeBadge Component', () => {
  it('renders the main type correctly', () => {
    render(<CardTypeBadge type="Legendary Creature — Hero" />);
    
    expect(screen.getByText('Legendary Creature')).toBeDefined();
  });
});
