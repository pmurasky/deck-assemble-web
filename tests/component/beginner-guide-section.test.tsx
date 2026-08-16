import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BeginnerGuideSection } from '@/components/cards/BeginnerGuideSection';
import * as beginnerGuidesApi from '@/lib/api/beginnerGuides';
import type { BeginnerGuide } from '@/lib/api/beginnerGuides';

function renderWithClient(ui: React.ReactElement) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });
  return render(<QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>);
}

describe('BeginnerGuideSection Component', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders published guide with summary, examples, and whenToUse', async () => {
    // Given
    const mockGuide: BeginnerGuide = {
      cardId: 'sol-ring',
      status: 'PUBLISHED',
      summary: 'Sol Ring provides immediate mana acceleration.',
      examples: 'Tap Sol Ring for 2 colorless mana to cast your commander earlier.',
      whenToUse: 'Cast this on turn 1 whenever possible.',
      publishedAt: '2026-08-01T00:00:00Z',
    };
    vi.spyOn(beginnerGuidesApi, 'getBeginnerGuide').mockResolvedValueOnce(mockGuide);

    // When
    renderWithClient(<BeginnerGuideSection cardId="sol-ring" faceIndex={0} />);

    // Then
    await waitFor(() => {
      expect(screen.getByRole('heading', { level: 3, name: /beginner guide/i })).toBeDefined();
    });
    expect(screen.getByText('Sol Ring provides immediate mana acceleration.')).toBeDefined();
    expect(screen.getByText('Tap Sol Ring for 2 colorless mana to cast your commander earlier.')).toBeDefined();
    expect(screen.getByText('Cast this on turn 1 whenever possible.')).toBeDefined();
  });

  it('renders "Explain this card" prompt when guide is 404 (null)', async () => {
    // Given
    vi.spyOn(beginnerGuidesApi, 'getBeginnerGuide').mockResolvedValueOnce(null);

    // When
    renderWithClient(<BeginnerGuideSection cardId="uncovered-card" faceIndex={0} />);

    // Then
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /explain this card/i })).toBeDefined();
    });
    expect(screen.queryByText(/rules summary/i)).toBeNull();
  });

  it('triggers requestBeginnerGuide when "Explain this card" is clicked', async () => {
    // Given
    const user = userEvent.setup();
    vi.spyOn(beginnerGuidesApi, 'getBeginnerGuide').mockResolvedValueOnce(null);
    vi.spyOn(beginnerGuidesApi, 'requestBeginnerGuide').mockResolvedValueOnce({
      cardId: 'uncovered-card',
      status: 'DRAFT',
    });

    renderWithClient(<BeginnerGuideSection cardId="uncovered-card" faceIndex={0} />);

    const button = await screen.findByRole('button', { name: /explain this card/i });

    // When
    await user.click(button);

    // Then
    await waitFor(() => {
      expect(screen.getByText(/guide requested/i)).toBeDefined();
    });
    expect(beginnerGuidesApi.requestBeginnerGuide).toHaveBeenCalledWith('uncovered-card', 0);
  });

  it('displays 429 cap hit messaging when generation quota is exceeded', async () => {
    // Given
    const user = userEvent.setup();
    vi.spyOn(beginnerGuidesApi, 'getBeginnerGuide').mockResolvedValueOnce(null);
    const rateLimitError = new Error('Daily generation limit reached') as Error & { status?: number };
    rateLimitError.status = 429;
    vi.spyOn(beginnerGuidesApi, 'requestBeginnerGuide').mockRejectedValueOnce(rateLimitError);

    renderWithClient(<BeginnerGuideSection cardId="uncovered-card" faceIndex={0} />);

    const button = await screen.findByRole('button', { name: /explain this card/i });

    // When
    await user.click(button);

    // Then
    await waitFor(() => {
      expect(screen.getByText(/daily generation limit reached/i)).toBeDefined();
    });
  });

  it('handles report action on rendered guide with confirmation toast', async () => {
    // Given
    const user = userEvent.setup();
    const mockGuide: BeginnerGuide = {
      cardId: 'sol-ring',
      status: 'PUBLISHED',
      summary: 'Sol Ring summary.',
      examples: 'Sol Ring example.',
      whenToUse: 'When to use Sol Ring.',
      publishedAt: '2026-08-01T00:00:00Z',
    };
    vi.spyOn(beginnerGuidesApi, 'getBeginnerGuide').mockResolvedValueOnce(mockGuide);
    vi.spyOn(beginnerGuidesApi, 'reportBeginnerGuide').mockResolvedValueOnce({ success: true });

    renderWithClient(<BeginnerGuideSection cardId="sol-ring" faceIndex={0} />);

    const reportBtn = await screen.findByRole('button', { name: /report an issue/i });

    // When
    await user.click(reportBtn);

    // Then
    await waitFor(() => {
      expect(screen.getByText(/thank you for your feedback/i)).toBeDefined();
    });
    expect(beginnerGuidesApi.reportBeginnerGuide).toHaveBeenCalledWith('sol-ring', 0);
  });

  it('renders nothing on 500 or general error', async () => {
    // Given
    vi.spyOn(beginnerGuidesApi, 'getBeginnerGuide').mockRejectedValueOnce(new Error('Internal server error'));

    // When
    const { container } = renderWithClient(<BeginnerGuideSection cardId="broken-card" faceIndex={0} />);

    // Then
    await waitFor(() => {
      expect(container.innerHTML).toBe('');
    });
  });

  it('re-fetches and renders new guide when faceIndex changes', async () => {
    // Given
    const frontGuide: BeginnerGuide = {
      cardId: 'dfc-card',
      status: 'PUBLISHED',
      summary: 'Front face summary.',
      examples: 'Front face example.',
      whenToUse: 'Front face usage.',
      publishedAt: '2026-08-01T00:00:00Z',
    };
    const backGuide: BeginnerGuide = {
      cardId: 'dfc-card',
      status: 'PUBLISHED',
      summary: 'Back face transformed summary.',
      examples: 'Back face example.',
      whenToUse: 'Back face usage.',
      publishedAt: '2026-08-01T00:00:00Z',
    };

    vi.spyOn(beginnerGuidesApi, 'getBeginnerGuide').mockImplementation(async (_id, face) => {
      return face === 1 ? backGuide : frontGuide;
    });

    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });

    const { rerender } = render(
      <QueryClientProvider client={queryClient}>
        <BeginnerGuideSection cardId="dfc-card" faceIndex={0} faceName="Front Face" />
      </QueryClientProvider>
    );

    expect(await screen.findByText('Front face summary.')).toBeDefined();

    // When rerendering with faceIndex=1
    rerender(
      <QueryClientProvider client={queryClient}>
        <BeginnerGuideSection cardId="dfc-card" faceIndex={1} faceName="Back Face" />
      </QueryClientProvider>
    );

    // Then
    expect(await screen.findByText('Back face transformed summary.')).toBeDefined();
  });
});
