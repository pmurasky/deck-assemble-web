import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { CardTile } from '@/components/cards/CardTile';
import { Card } from '@/types/card';

const sampleCard: Card = {
  id: 'spidey-1',
  oracleId: 'spidey-o-1',
  name: 'Spider-Man, Web Slinger',
  manaCost: '{1}{U}{R}',
  manaValue: 3,
  colors: ['U', 'R'],
  colorIdentity: ['U', 'R'],
  typeLine: 'Legendary Creature — Hero',
  oracleText: 'Reach, Vigilance',
  setCode: 'MARVEL',
  setName: 'Marvel MTG Set',
  rarity: 'rare',
  legalities: { commander: 'legal' },
};

describe('CardTile Component', () => {
  it('renders card details correctly', () => {
    render(<CardTile card={sampleCard} ownedQuantity={2} />);
    expect(screen.getByText('Spider-Man, Web Slinger')).toBeInTheDocument();
    expect(screen.getByText('Legendary Creature — Hero')).toBeInTheDocument();
    expect(screen.getByText('Owned: 2')).toBeInTheDocument();
  });
});
