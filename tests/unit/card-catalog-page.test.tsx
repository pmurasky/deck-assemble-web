import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import CardBrowserPage from '@/app/(dashboard)/cards/page';

// Mock the React Query hook
vi.mock('@tanstack/react-query', async () => {
  const actual = await vi.importActual('@tanstack/react-query');
  return {
    ...actual,
    useQuery: () => ({
      data: { cards: [], total: 0 },
      isLoading: false,
      error: null,
    }),
  };
});

describe('CardBrowserPage', () => {
  it('renders the page title and search bar', () => {
    render(<CardBrowserPage />);
    expect(screen.getByText(/Card Catalog/i)).toBeDefined();
    expect(screen.getAllByPlaceholderText(/Search Marvel heroes.../i).length).toBeGreaterThan(0);
  });
});
