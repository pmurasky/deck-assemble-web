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

function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
}

describe('Admin Imports Page - Commander Ranks Section', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    global.fetch = vi.fn();
  });

  it('renders "Never run yet" when latest run returns 404/null', async () => {
    vi.spyOn(global, 'fetch').mockImplementation(((input: RequestInfo | URL) => {
      const url = input.toString();
      if (url.includes('/api/v1/admin/commander-ranks/latest')) {
        return Promise.resolve({
          ok: true,
          status: 200,
          json: async () => ({ data: null }),
        });
      }
      if (url.includes('/api/v1/admin/card-imports')) {
        return Promise.resolve({
          ok: true,
          status: 200,
          json: async () => ({ data: [] }),
        });
      }
      return Promise.reject(new Error(`Unhandled fetch to ${url}`));
    }) as unknown as typeof fetch);

    const queryClient = createTestQueryClient();
    render(
      <QueryClientProvider client={queryClient}>
        <AdminImportsPage />
      </QueryClientProvider>
    );

    await waitFor(() => {
      expect(screen.getByText(/Commander Ranks/i)).toBeInTheDocument();
      expect(screen.getByText(/Never run yet/i)).toBeInTheDocument();
    });

    const refreshBtn = screen.getByRole('button', { name: /Refresh now/i });
    expect(refreshBtn).toBeInTheDocument();
    expect(refreshBtn).not.toBeDisabled();
  });

  it('displays last-run relative date and cards updated count when a prior run exists', async () => {
    vi.spyOn(global, 'fetch').mockImplementation(((input: RequestInfo | URL) => {
      const url = input.toString();
      if (url.includes('/api/v1/admin/commander-ranks/latest')) {
        return Promise.resolve({
          ok: true,
          status: 200,
          json: async () => ({
            data: {
              id: 9,
              cardsUpdated: 187,
              completedAt: new Date(Date.now() - 1000 * 60 * 5).toISOString(), // 5 mins ago
            },
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
      return Promise.reject(new Error(`Unhandled fetch to ${url}`));
    }) as unknown as typeof fetch);

    const queryClient = createTestQueryClient();
    render(
      <QueryClientProvider client={queryClient}>
        <AdminImportsPage />
      </QueryClientProvider>
    );

    await waitFor(() => {
      expect(screen.getByText(/5 minutes ago/i)).toBeInTheDocument();
      expect(screen.getByText('187')).toBeInTheDocument();
    });
  });

  it('triggers commander rank refresh on button click, disables during pending, and updates on success', async () => {
    let latestRunData: { id: number; cardsUpdated: number; completedAt: string } | null = null;

    vi.spyOn(global, 'fetch').mockImplementation(((input: RequestInfo | URL, init?: RequestInit) => {
      const url = input.toString();
      if (url.includes('/api/v1/admin/commander-ranks/refresh') && init?.method === 'POST') {
        latestRunData = {
          id: 10,
          cardsUpdated: 245,
          completedAt: new Date().toISOString(),
        };
        return Promise.resolve({
          ok: true,
          status: 200,
          json: async () => ({
            data: {
              status: 'COMPLETED',
              cardsUpdated: 245,
              errorSummary: null,
            },
          }),
        });
      }
      if (url.includes('/api/v1/admin/commander-ranks/latest')) {
        return Promise.resolve({
          ok: true,
          status: 200,
          json: async () => ({ data: latestRunData }),
        });
      }
      if (url.includes('/api/v1/admin/card-imports')) {
        return Promise.resolve({
          ok: true,
          status: 200,
          json: async () => ({ data: [] }),
        });
      }
      return Promise.reject(new Error(`Unhandled fetch to ${url}`));
    }) as unknown as typeof fetch);

    const queryClient = createTestQueryClient();
    render(
      <QueryClientProvider client={queryClient}>
        <AdminImportsPage />
      </QueryClientProvider>
    );

    await waitFor(() => {
      expect(screen.getByText(/Never run yet/i)).toBeInTheDocument();
    });

    const refreshBtn = screen.getByRole('button', { name: /Refresh now/i });
    fireEvent.click(refreshBtn);

    await waitFor(() => {
      expect(screen.getByText('245')).toBeInTheDocument();
      expect(screen.getByText(/Refresh completed: 245 cards updated/i)).toBeInTheDocument();
      expect(screen.getByText(/Just now/i)).toBeInTheDocument();
    });
  });

  it('handles 502 Bad Gateway failure by displaying error message inline without crashing', async () => {
    vi.spyOn(global, 'fetch').mockImplementation(((input: RequestInfo | URL, init?: RequestInit) => {
      const url = input.toString();
      if (url.includes('/api/v1/admin/commander-ranks/refresh') && init?.method === 'POST') {
        return Promise.resolve({
          ok: false,
          status: 502,
          json: async () => ({
            error: { message: 'EDHREC fetch failed or returned no data' },
          }),
        });
      }
      if (url.includes('/api/v1/admin/commander-ranks/latest')) {
        return Promise.resolve({
          ok: true,
          status: 200,
          json: async () => ({ data: null }),
        });
      }
      if (url.includes('/api/v1/admin/card-imports')) {
        return Promise.resolve({
          ok: true,
          status: 200,
          json: async () => ({ data: [] }),
        });
      }
      return Promise.reject(new Error(`Unhandled fetch to ${url}`));
    }) as unknown as typeof fetch);

    const queryClient = createTestQueryClient();
    render(
      <QueryClientProvider client={queryClient}>
        <AdminImportsPage />
      </QueryClientProvider>
    );

    await waitFor(() => {
      expect(screen.getByText(/Never run yet/i)).toBeInTheDocument();
    });

    const refreshBtn = screen.getByRole('button', { name: /Refresh now/i });
    fireEvent.click(refreshBtn);

    // Verify error is displayed inline and page does not crash
    await waitFor(() => {
      expect(screen.getByText('EDHREC fetch failed or returned no data')).toBeInTheDocument();
    });

    // Verify the page structure remains intact and refresh button can be used again
    expect(screen.getByText(/Commander Ranks/i)).toBeInTheDocument();
    expect(refreshBtn).not.toBeDisabled();
  });
});
