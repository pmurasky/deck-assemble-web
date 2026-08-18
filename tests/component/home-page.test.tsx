import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import Home from '@/app/page';

vi.mock('@/lib/api/catalog', () => ({
  fetchCards: vi.fn().mockResolvedValue({
    cards: [
      {
        id: 'c1',
        name: 'Spider-Man',
        type_line: 'Legendary Creature — Hero',
        mana_cost: '{1}{U}{R}',
        cmc: 3,
        colors: ['U', 'R'],
        colorIdentity: ['U', 'R'],
        rarity: 'mythic',
        image_uris: { normal: '/spider-man.png' },
        legalities: { commander: 'legal' },
      },
    ],
    total: 1,
  }),
}));

describe('Home Page', () => {
  it('renders hero section and deck creation CTA pointing to /decks?create=true', async () => {
    const ResolvedHome = await Home();
    render(ResolvedHome);

    expect(screen.getByRole('heading', { level: 1 })).toBeDefined();

    const ctaLink = screen.getByRole('link', { name: /build commander deck/i });
    expect(ctaLink).toBeDefined();
    expect(ctaLink.getAttribute('href')).toBe('/decks?create=true');
  });
});
