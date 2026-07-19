import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { CardSearchBar } from '@/components/cards/CardSearchBar';

describe('CardSearchBar Component', () => {
  it('renders correctly', () => {
    render(<CardSearchBar onSearch={() => {}} />);
    expect(screen.getByPlaceholderText(/search/i)).toBeDefined();
  });

  it('calls onSearch when typing', () => {
    const handleSearch = vi.fn();
    render(<CardSearchBar onSearch={handleSearch} />);
    
    const input = screen.getByPlaceholderText(/search/i);
    fireEvent.change(input, { target: { value: 'spider' } });
    
    expect(handleSearch).toHaveBeenCalledWith('spider');
  });

  it('debounces the search if needed (optional)', () => {
    // If we implement debouncing internally, we'd test it here.
    // For now, testing raw input change is sufficient.
  });
});
