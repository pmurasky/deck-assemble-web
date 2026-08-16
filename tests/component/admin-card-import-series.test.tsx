import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import AdminImportsPage from '@/app/(dashboard)/admin/imports/page';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

vi.mock('@auth0/nextjs-auth0/client', () => ({
  useUser: () => ({
    user: { email: 'admin@example.com', 'https://deck-assemble.com/roles': ['admin'] },
    isLoading: false,
  }),
}));

vi.mock('@/lib/utils/permissions', () => ({
  isAdmin: () => true,
}));

const mockSeriesList = [
  { key: 'MARVEL', label: 'Marvel' },
  { key: 'SPIDER_MAN', label: 'Spider-Man' },
  { key: 'HOBBIT', label: 'The Hobbit' },
  { key: 'TMNT', label: 'Teenage Mutant Ninja Turtles' },
  { key: 'ASSASSINS_CREED', label: "Assassin's Creed" },
];

function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
}

describe('Admin Card Imports - Series Checkbox Picker', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    global.fetch = vi.fn();
  });

  it('fetches and renders series checkboxes from GET /api/v1/admin/card-imports/series', async () => {
    vi.spyOn(global, 'fetch').mockImplementation(((input: RequestInfo | URL) => {
      const url = input.toString();
      if (url.includes('/api/v1/admin/card-imports/series')) {
        return Promise.resolve({
          ok: true,
          status: 200,
          json: async () => ({ data: mockSeriesList }),
        });
      }
      if (url.includes('/api/v1/admin/card-imports')) {
        return Promise.resolve({
          ok: true,
          status: 200,
          json: async () => ({ data: [] }),
        });
      }
      if (url.includes('/api/v1/admin/commander-ranks/latest')) {
        return Promise.resolve({
          ok: true,
          status: 200,
          json: async () => ({ data: null }),
        });
      }
      return Promise.reject(new Error(`Unhandled fetch: ${url}`));
    }) as unknown as typeof fetch);

    const queryClient = createTestQueryClient();
    render(
      <QueryClientProvider client={queryClient}>
        <AdminImportsPage />
      </QueryClientProvider>
    );

    // Verify all 5 series checkboxes appear with their labels from the API
    await waitFor(() => {
      expect(screen.getByLabelText('Marvel')).toBeInTheDocument();
      expect(screen.getByLabelText('Spider-Man')).toBeInTheDocument();
      expect(screen.getByLabelText('The Hobbit')).toBeInTheDocument();
      expect(screen.getByLabelText('Teenage Mutant Ninja Turtles')).toBeInTheDocument();
      expect(screen.getByLabelText("Assassin's Creed")).toBeInTheDocument();
    });

    // Ensure free text input is removed
    expect(screen.queryByPlaceholderText(/Scryfall query/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/e:mar,spe,spm/i)).not.toBeInTheDocument();

    // Submit button should be disabled when nothing is selected
    const importBtn = screen.getByRole('button', { name: /Run Import/i });
    expect(importBtn).toBeDisabled();
  });

  it('enables submit button only when at least one series is checked and triggers import with seriesKeys', async () => {
    let triggeredUrl = '';
    let triggeredMethod = '';
    let triggeredBody = '';

    vi.spyOn(global, 'fetch').mockImplementation(((input: RequestInfo | URL, init?: RequestInit) => {
      const url = input.toString();
      if (url.includes('/api/v1/admin/card-imports/series')) {
        return Promise.resolve({
          ok: true,
          status: 200,
          json: async () => ({ data: mockSeriesList }),
        });
      }
      if (init?.method === 'POST' && url.includes('/api/v1/admin/card-imports')) {
        triggeredUrl = url;
        triggeredMethod = init.method;
        triggeredBody = init.body ? init.body.toString() : '';
        return Promise.resolve({
          ok: true,
          status: 202,
          json: async () => ({
            data: { runId: 55, status: 'RUNNING' },
          }),
        });
      }
      if (url.includes('/api/v1/admin/card-imports')) {
        return Promise.resolve({
          ok: true,
          status: 200,
          json: async () => ({ data: [] }),
        });
      }
      if (url.includes('/api/v1/admin/commander-ranks/latest')) {
        return Promise.resolve({
          ok: true,
          status: 200,
          json: async () => ({ data: null }),
        });
      }
      return Promise.reject(new Error(`Unhandled fetch: ${url}`));
    }) as unknown as typeof fetch);

    const queryClient = createTestQueryClient();
    render(
      <QueryClientProvider client={queryClient}>
        <AdminImportsPage />
      </QueryClientProvider>
    );

    const marvelCheckbox = await screen.findByLabelText('Marvel');
    const tmntCheckbox = await screen.findByLabelText('Teenage Mutant Ninja Turtles');
    const importBtn = screen.getByRole('button', { name: /Run Import/i });

    expect(importBtn).toBeDisabled();

    // Check Marvel
    fireEvent.click(marvelCheckbox);
    expect(marvelCheckbox).toBeChecked();
    expect(importBtn).not.toBeDisabled();

    // Check TMNT
    fireEvent.click(tmntCheckbox);
    expect(tmntCheckbox).toBeChecked();
    expect(importBtn).not.toBeDisabled();

    // Click submit
    fireEvent.click(importBtn);

    await waitFor(() => {
      expect(screen.getByText(/Importing cards from Scryfall/i)).toBeInTheDocument();
    });

    // Check that POST request was made with MARVEL and TMNT
    expect(triggeredMethod).toBe('POST');
    const hasCorrectQuery = triggeredUrl.includes('seriesKeys=MARVEL%2CTMNT') ||
      triggeredUrl.includes('seriesKeys=MARVEL,TMNT') ||
      triggeredUrl.includes('seriesKeys=TMNT%2CMARVEL');
    const hasCorrectBody = triggeredBody.includes('MARVEL') && triggeredBody.includes('TMNT');
    expect(hasCorrectQuery || hasCorrectBody).toBe(true);
  });

  it('disables submit button again if all selected checkboxes are unchecked', async () => {
    vi.spyOn(global, 'fetch').mockImplementation(((input: RequestInfo | URL) => {
      const url = input.toString();
      if (url.includes('/api/v1/admin/card-imports/series')) {
        return Promise.resolve({
          ok: true,
          status: 200,
          json: async () => ({ data: mockSeriesList }),
        });
      }
      if (url.includes('/api/v1/admin/card-imports')) {
        return Promise.resolve({
          ok: true,
          status: 200,
          json: async () => ({ data: [] }),
        });
      }
      if (url.includes('/api/v1/admin/commander-ranks/latest')) {
        return Promise.resolve({
          ok: true,
          status: 200,
          json: async () => ({ data: null }),
        });
      }
      return Promise.reject(new Error(`Unhandled fetch: ${url}`));
    }) as unknown as typeof fetch);

    const queryClient = createTestQueryClient();
    render(
      <QueryClientProvider client={queryClient}>
        <AdminImportsPage />
      </QueryClientProvider>
    );

    const hobbitCheckbox = await screen.findByLabelText('The Hobbit');
    const importBtn = screen.getByRole('button', { name: /Run Import/i });

    expect(importBtn).toBeDisabled();

    fireEvent.click(hobbitCheckbox);
    expect(hobbitCheckbox).toBeChecked();
    expect(importBtn).not.toBeDisabled();

    fireEvent.click(hobbitCheckbox);
    expect(hobbitCheckbox).not.toBeChecked();
    expect(importBtn).toBeDisabled();
  });

  it('renders visible error state when available series fetch fails', async () => {
    vi.spyOn(global, 'fetch').mockImplementation(((input: RequestInfo | URL) => {
      const url = input.toString();
      if (url.includes('/api/v1/admin/card-imports/series')) {
        return Promise.resolve({
          ok: false,
          status: 500,
          json: async () => ({ error: { message: 'Failed to fetch available series' } }),
        });
      }
      if (url.includes('/api/v1/admin/card-imports')) {
        return Promise.resolve({
          ok: true,
          status: 200,
          json: async () => ({ data: [] }),
        });
      }
      if (url.includes('/api/v1/admin/commander-ranks/latest')) {
        return Promise.resolve({
          ok: true,
          status: 200,
          json: async () => ({ data: null }),
        });
      }
      return Promise.reject(new Error(`Unhandled fetch: ${url}`));
    }) as unknown as typeof fetch);

    const queryClient = createTestQueryClient();
    render(
      <QueryClientProvider client={queryClient}>
        <AdminImportsPage />
      </QueryClientProvider>
    );

    await waitFor(() => {
      expect(screen.getByText(/Failed to fetch available series/i)).toBeInTheDocument();
    });

    expect(screen.queryByLabelText('Marvel')).not.toBeInTheDocument();
  });
});

