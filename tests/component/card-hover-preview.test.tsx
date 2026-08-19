import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect } from 'vitest';
import { CardHoverPreview } from '@/components/ui/CardHoverPreview';

describe('CardHoverPreview Component', () => {
  it('renders card name trigger and displays preview popover with image on hover', async () => {
    const user = userEvent.setup();
    render(
      <p>
        Cast <CardHoverPreview cardName="Sol Ring" imageUrl="https://cards.scryfall.io/normal/front/sol-ring.jpg" /> from hand.
      </p>
    );

    const trigger = screen.getByRole('button', { name: 'Sol Ring' });
    expect(trigger).toBeInTheDocument();
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();

    await user.hover(trigger);

    const tooltip = screen.getByRole('tooltip');
    expect(tooltip).toBeInTheDocument();

    const img = screen.getByRole('img', { name: 'Sol Ring' });
    expect(img).toHaveAttribute('src', 'https://cards.scryfall.io/normal/front/sol-ring.jpg');

    await user.unhover(trigger);
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
  });

  it('opens popover on keyboard focus and closes on blur', async () => {
    const user = userEvent.setup();
    render(
      <CardHoverPreview
        cardName="Counterspell"
        imageUrl="https://cards.scryfall.io/normal/front/counterspell.jpg"
      />
    );

    const trigger = screen.getByRole('button', { name: 'Counterspell' });
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();

    await user.tab();
    expect(trigger).toHaveFocus();
    expect(screen.getByRole('tooltip')).toBeInTheDocument();

    await user.tab();
    expect(trigger).not.toHaveFocus();
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
  });

  it('falls back to Scryfall image URL by exact name when imageUrl is not provided', async () => {
    const user = userEvent.setup();
    render(<CardHoverPreview cardName="Black Lotus" />);

    const trigger = screen.getByRole('button', { name: 'Black Lotus' });
    await user.hover(trigger);

    const img = screen.getByRole('img', { name: 'Black Lotus' });
    expect(img).toHaveAttribute(
      'src',
      'https://api.scryfall.com/cards/named?exact=Black%20Lotus&format=image'
    );
  });

  it('toggles preview popover open and closed on click', () => {
    render(
      <CardHoverPreview
        cardName="Lightning Bolt"
        imageUrl="https://cards.scryfall.io/normal/front/bolt.jpg"
      />
    );

    const trigger = screen.getByRole('button', { name: 'Lightning Bolt' });
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();

    fireEvent.click(trigger);
    expect(screen.getByRole('tooltip')).toBeInTheDocument();

    fireEvent.click(trigger);
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
  });

  it('renders custom children and displays mana cost if provided', async () => {
    const user = userEvent.setup();
    render(
      <CardHoverPreview
        cardName="Dark Ritual"
        manaCost="{B}"
        imageUrl="https://cards.scryfall.io/normal/front/dark-ritual.jpg"
      >
        <span>+ 1x Dark Ritual (Foil)</span>
      </CardHoverPreview>
    );

    const trigger = screen.getByRole('button', { name: '+ 1x Dark Ritual (Foil)' });
    expect(trigger).toBeInTheDocument();

    await user.hover(trigger);
    const tooltip = screen.getByRole('tooltip');
    expect(tooltip).toBeInTheDocument();
    expect(screen.getByText('B')).toBeInTheDocument();
  });
});
