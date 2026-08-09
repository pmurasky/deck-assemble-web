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

describe('Async Card Import UI (202 + Polling)', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    global.fetch = vi.fn();
  });

  it('handles 202 Accepted trigger response and polls until COMPLETED', async () => {
    let fetchCount = 0;

    vi.spyOn(global, 'fetch').mockImplementation(((_input: RequestInfo | URL, init?: RequestInit) => {
      if (init?.method === 'POST') {
        return Promise.resolve({
          ok: true,
          status: 202,
          json: async () => ({
            data: { runId: 101, status: 'RUNNING' },
          }),
        });
      }

      fetchCount++;
      if (fetchCount <= 2) {
        return Promise.resolve({
          ok: true,
          json: async () => ({
            data: [
              {
                id: 101,
                provider: 'scryfall',
                query: 'e:mar',
                status: 'RUNNING',
                recordsRead: 0,
                recordsCreated: 0,
                recordsUpdated: 0,
                recordsFailed: 0,
                startedAt: '2026-07-26T20:00:00Z',
                completedAt: null,
              },
            ],
          }),
        });
      } else {
        return Promise.resolve({
          ok: true,
          json: async () => ({
            data: [
              {
                id: 101,
                provider: 'scryfall',
                query: 'e:mar',
                status: 'COMPLETED',
                recordsRead: 150,
                recordsCreated: 140,
                recordsUpdated: 10,
                recordsFailed: 0,
                startedAt: '2026-07-26T20:00:00Z',
                completedAt: '2026-07-26T20:01:00Z',
              },
            ],
          }),
        });
      }
    }) as unknown as typeof fetch);

    const queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
      },
    });

    render(
      <QueryClientProvider client={queryClient}>
        <AdminImportsPage />
      </QueryClientProvider>
    );

    // Initial page load should fetch import history
    await waitFor(() => {
      expect(screen.getByText('e:mar')).toBeInTheDocument();
    });

    // Enter query and click Run Import
    const input = screen.getByPlaceholderText(/Scryfall query/i);
    const button = screen.getByRole('button', { name: /Run Import/i });

    fireEvent.change(input, { target: { value: 'e:mar' } });
    fireEvent.click(button);

    // Should display polling banner upon HTTP 202 trigger response
    await waitFor(() => {
      expect(screen.getByText(/Import task accepted \(HTTP 202\)/i)).toBeInTheDocument();
    });

    // Trigger next polling tick
    queryClient.refetchQueries({ queryKey: ['importRuns'] });

    // Once polling refetches completed status, summary card should appear
    await waitFor(() => {
      expect(screen.getByText('Import Completed Successfully')).toBeInTheDocument();
      expect(screen.getByText(/Run ID: #101/i)).toBeInTheDocument();
    });
  });
});
