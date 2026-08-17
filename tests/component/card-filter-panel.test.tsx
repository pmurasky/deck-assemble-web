import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { CardFilterPanel } from '@/components/cards/CardFilterPanel';

describe('CardFilterPanel Component', () => {
  const defaultFilters = {
    colors: [],
    types: [],
    manaValue: 0
  };

  it('renders filter categories', () => {
    render(<CardFilterPanel filters={defaultFilters} onFilterChange={() => {}} />);
    expect(screen.getByText(/Color/i)).toBeDefined();
    expect(screen.getByText(/Card Type/i)).toBeDefined();
    expect(screen.getByText(/Mana Value/i)).toBeDefined();
  });

  it('calls onFilterChange when a color is toggled', () => {
    const handleFilterChange = vi.fn();
    render(<CardFilterPanel filters={defaultFilters} onFilterChange={handleFilterChange} />);
    
    // Assuming we have a checkbox for 'Red'
    const redCheckbox = screen.getByLabelText(/Red/i);
    fireEvent.click(redCheckbox);
    
    expect(handleFilterChange).toHaveBeenCalledWith(
      expect.objectContaining({
        colors: ['R']
      })
    );
  });

  it('renders ownership filter options (All, Owned, Unowned)', () => {
    render(<CardFilterPanel filters={defaultFilters} onFilterChange={() => {}} />);
    expect(screen.getByText(/Ownership/i)).toBeDefined();
    expect(screen.getByRole('button', { name: /^all$/i })).toBeDefined();
    expect(screen.getByRole('button', { name: /^owned$/i })).toBeDefined();
    expect(screen.getByRole('button', { name: /^unowned$/i })).toBeDefined();
  });

  it('calls onFilterChange with ownership: "owned" when Owned button is clicked', () => {
    const handleFilterChange = vi.fn();
    render(<CardFilterPanel filters={defaultFilters} onFilterChange={handleFilterChange} />);

    const ownedBtn = screen.getByRole('button', { name: /^owned$/i });
    fireEvent.click(ownedBtn);

    expect(handleFilterChange).toHaveBeenCalledWith(
      expect.objectContaining({
        ownership: 'owned',
      })
    );
  });

  it('calls onFilterChange with ownership: "unowned" when Unowned button is clicked', () => {
    const handleFilterChange = vi.fn();
    render(<CardFilterPanel filters={defaultFilters} onFilterChange={handleFilterChange} />);

    const unownedBtn = screen.getByRole('button', { name: /^unowned$/i });
    fireEvent.click(unownedBtn);

    expect(handleFilterChange).toHaveBeenCalledWith(
      expect.objectContaining({
        ownership: 'unowned',
      })
    );
  });

  it('resets ownership filter when Reset is clicked', () => {
    const handleFilterChange = vi.fn();
    render(<CardFilterPanel filters={{ ...defaultFilters, ownership: 'owned' }} onFilterChange={handleFilterChange} />);

    const resetBtn = screen.getByRole('button', { name: /reset/i });
    fireEvent.click(resetBtn);

    expect(handleFilterChange).toHaveBeenCalledWith(
      expect.objectContaining({
        ownership: undefined,
      })
    );
  });
});
