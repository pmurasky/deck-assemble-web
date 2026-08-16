import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import AdminBeginnerGuidesPage from '@/app/(dashboard)/admin/beginner-guides/page';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import * as permissions from '@/lib/utils/permissions';
import * as beginnerGuidesApi from '@/lib/api/beginnerGuides';
import type { AdminBeginnerGuideItem, AdminBeginnerGuidePage } from '@/lib/api/beginnerGuides';

let mockUser: { name?: string; email?: string } | null = {
  name: 'Admin User',
  email: 'admin@deckassemble.app',
};
let mockIsUserLoading = false;

vi.mock('@auth0/nextjs-auth0/client', () => ({
  useUser: () => ({
    user: mockUser,
    isLoading: mockIsUserLoading,
  }),
}));

vi.mock('@/lib/api/beginnerGuides', async () => {
  const actual = await vi.importActual<typeof import('@/lib/api/beginnerGuides')>('@/lib/api/beginnerGuides');
  return {
    ...actual,
    getAdminBeginnerGuides: vi.fn(),
    updateAdminBeginnerGuide: vi.fn(),
    publishAdminBeginnerGuide: vi.fn(),
    regenerateAdminBeginnerGuide: vi.fn(),
    rejectAdminBeginnerGuide: vi.fn(),
  };
});

function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
}

const mockGuides: AdminBeginnerGuideItem[] = [
  {
    cardId: 'sol-ring',
    cardName: 'Sol Ring',
    status: 'DRAFT',
    summary: 'Taps for two colorless mana.',
    examples: 'Play on turn 1.',
    whenToUse: 'Early game ramp.',
    sourceRulingsSnapshot: ['Enters untapped.'],
    generatedAt: '2026-08-16T12:00:00Z',
    reviewedBy: null,
  },
  {
    cardId: 'rhystic-study',
    cardName: 'Rhystic Study',
    status: 'STALE',
    summary: 'Draw cards when opponents cast spells.',
    examples: 'Trigger whenever opponent casts.',
    whenToUse: 'Card draw engine.',
    sourceRulingsSnapshot: [],
    generatedAt: '2026-08-15T12:00:00Z',
    reviewedBy: null,
  },
];

describe('Admin Beginner Guides Page', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    mockUser = { name: 'Admin User', email: 'admin@deckassemble.app' };
    mockIsUserLoading = false;
    vi.spyOn(permissions, 'isAdmin').mockReturnValue(true);
  });

  it('renders auth gate / unauthorized message when user is not an admin', () => {
    vi.spyOn(permissions, 'isAdmin').mockReturnValue(false);
    mockUser = { name: 'Regular User', email: 'user@example.com' };

    const queryClient = createTestQueryClient();
    render(
      <QueryClientProvider client={queryClient}>
        <AdminBeginnerGuidesPage />
      </QueryClientProvider>
    );

    expect(screen.queryByText(/BEGINNER GUIDES REVIEW QUEUE/i)).not.toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /admin access required/i })).toBeInTheDocument();
  });

  it('renders loading state when user authentication is loading', () => {
    mockIsUserLoading = true;

    const queryClient = createTestQueryClient();
    render(
      <QueryClientProvider client={queryClient}>
        <AdminBeginnerGuidesPage />
      </QueryClientProvider>
    );

    expect(screen.queryByText(/BEGINNER GUIDES REVIEW QUEUE/i)).not.toBeInTheDocument();
  });

  it('renders review queue page and loads guides for admin user', async () => {
    const mockPage: AdminBeginnerGuidePage = {
      content: mockGuides,
      totalElements: 2,
    };
    vi.mocked(beginnerGuidesApi.getAdminBeginnerGuides).mockResolvedValueOnce(mockPage);

    const queryClient = createTestQueryClient();
    render(
      <QueryClientProvider client={queryClient}>
        <AdminBeginnerGuidesPage />
      </QueryClientProvider>
    );

    await waitFor(() => {
      expect(screen.getByText(/BEGINNER GUIDES REVIEW QUEUE/i)).toBeInTheDocument();
      expect(screen.getByText('Sol Ring')).toBeInTheDocument();
      expect(screen.getByText('Rhystic Study')).toBeInTheDocument();
    });
  });

  it('allows selecting a guide to open edit panel and publishing it', async () => {
    const mockPage: AdminBeginnerGuidePage = {
      content: [...mockGuides],
      totalElements: 2,
    };
    vi.mocked(beginnerGuidesApi.getAdminBeginnerGuides).mockResolvedValue(mockPage);
    vi.mocked(beginnerGuidesApi.publishAdminBeginnerGuide).mockResolvedValueOnce({
      ...mockGuides[0],
      status: 'PUBLISHED',
    });

    const queryClient = createTestQueryClient();
    render(
      <QueryClientProvider client={queryClient}>
        <AdminBeginnerGuidesPage />
      </QueryClientProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('Sol Ring')).toBeInTheDocument();
    });

    const reviewButtons = screen.getAllByRole('button', { name: /review/i });
    fireEvent.click(reviewButtons[0]);

    // Edit panel should now be visible
    expect(screen.getByLabelText(/rules summary/i)).toHaveValue('Taps for two colorless mana.');

    const publishButton = screen.getByRole('button', { name: /publish/i });
    fireEvent.click(publishButton);

    await waitFor(() => {
      expect(beginnerGuidesApi.publishAdminBeginnerGuide).toHaveBeenCalledWith('sol-ring');
    });
  });

  it('handles regenerating a guide and updating the view', async () => {
    const mockPage: AdminBeginnerGuidePage = {
      content: [...mockGuides],
      totalElements: 2,
    };
    vi.mocked(beginnerGuidesApi.getAdminBeginnerGuides).mockResolvedValue(mockPage);
    vi.mocked(beginnerGuidesApi.regenerateAdminBeginnerGuide).mockResolvedValueOnce({
      ...mockGuides[0],
      summary: 'Brand new generated summary',
    });

    const queryClient = createTestQueryClient();
    render(
      <QueryClientProvider client={queryClient}>
        <AdminBeginnerGuidesPage />
      </QueryClientProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('Sol Ring')).toBeInTheDocument();
    });

    const reviewButtons = screen.getAllByRole('button', { name: /review/i });
    fireEvent.click(reviewButtons[0]);

    const regenerateButton = screen.getByRole('button', { name: /regenerate/i });
    fireEvent.click(regenerateButton);

    await waitFor(() => {
      expect(beginnerGuidesApi.regenerateAdminBeginnerGuide).toHaveBeenCalledWith('sol-ring');
      expect(screen.getByLabelText(/rules summary/i)).toHaveValue('Brand new generated summary');
    });
  });
});
