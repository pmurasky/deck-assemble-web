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
});
