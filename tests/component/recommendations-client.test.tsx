import { render, screen, fireEvent, act } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { RecommendationsClient } from '@/components/deck/RecommendationsClient';

describe('RecommendationsClient Component Flow', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders Screen 1 Commander suggestions initially', () => {
    render(<RecommendationsClient />);

    expect(screen.getByText("Atraxa, Praetors' Voice")).toBeInTheDocument();
    expect(screen.getByText('Krenko, Mob Boss')).toBeInTheDocument();
  });

  it('opens Build Config modal when Build Deck is clicked, then generates deck', () => {
    render(<RecommendationsClient />);

    // Click Build Deck on first commander tile
    const buildButtons = screen.getAllByRole('button', { name: /Build Deck/i });
    fireEvent.click(buildButtons[0]);

    // Screen 2 Modal opens
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText(/Build Configuration/i)).toBeInTheDocument();

    // Click Generate Deck inside modal
    const generateBtn = screen.getByRole('button', { name: /Generate Deck/i });
    fireEvent.click(generateBtn);

    act(() => {
      vi.advanceTimersByTime(500);
    });

    // Screen 3 Generated Deck View should now be active
    expect(screen.getByTestId('generated-deck-view')).toBeInTheDocument();
    expect(screen.getByText(/Generated Deck Strategy/i)).toBeInTheDocument();
  });
});
