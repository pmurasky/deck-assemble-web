import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { PracticeBoardView } from '@/components/deck/PracticeBoardView';
import type { PracticeSessionResponse } from '@/types/m3';

describe('PracticeBoardView Component', () => {
  const mockInitialSession: PracticeSessionResponse = {
    sessionId: 'session-456',
    seed: 12345,
    turn: 1,
    mulliganCount: 0,
    hand: [
      { printingId: 101, name: 'Sol Ring', manaCost: '{1}', typeLine: 'Artifact' },
      { printingId: 102, name: 'Command Tower', manaCost: '', typeLine: 'Land' },
    ],
    battlefield: [],
    drawnCard: null,
    landsInPlay: 0,
    landPlayedThisTurn: false,
    castableSpells: [{ printingId: 101, name: 'Sol Ring' }],
    finished: false,
  };

  const mockTurn2Session: PracticeSessionResponse = {
    sessionId: 'session-456',
    seed: 12345,
    turn: 2,
    mulliganCount: 0,
    hand: [
      { printingId: 101, name: 'Sol Ring', manaCost: '{1}', typeLine: 'Artifact' },
      { printingId: 103, name: 'Arcane Signet', manaCost: '{2}', typeLine: 'Artifact' },
    ],
    battlefield: [
      { card: { printingId: 102, name: 'Command Tower', manaCost: '', typeLine: 'Land' }, tapped: false },
    ],
    drawnCard: { printingId: 103, name: 'Arcane Signet' },
    landsInPlay: 1,
    landPlayedThisTurn: false,
    castableSpells: [{ printingId: 101, name: 'Sol Ring' }],
    finished: false,
  };

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('renders initial practice session with hand, battlefield, and turn controls', async () => {
    global.fetch = vi.fn().mockImplementation((url: string | URL) => {
      const urlStr = url.toString();
      if (urlStr.includes('/practice-sessions')) {
        return Promise.resolve({
          ok: true,
          json: async () => ({ data: mockInitialSession }),
        } as Response);
      }
      return Promise.reject(new Error('Unknown URL'));
    });

    render(<PracticeBoardView deckId={10} />);

    await waitFor(() => {
      expect(screen.getByText(/Turn 1/i)).toBeInTheDocument();
      expect(screen.getByText('Sol Ring')).toBeInTheDocument();
      expect(screen.getByText('Command Tower')).toBeInTheDocument();
      expect(screen.getByTestId('land-drop-status')).toHaveTextContent(/Land Drop Available/i);
    });

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/v1/decks/10/practice-sessions'),
      expect.objectContaining({
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          revision: 1,
          onThePlay: true,
          mulliganStrategy: 'NONE',
        }),
      })
    );

    expect(screen.getByRole('button', { name: /Next Turn/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Reset/i })).toBeInTheDocument();
  });

  it('starts session with custom revision and mulligan strategy props', async () => {
    global.fetch = vi.fn().mockImplementation((url: string | URL) => {
      const urlStr = url.toString();
      if (urlStr.includes('/practice-sessions')) {
        return Promise.resolve({
          ok: true,
          json: async () => ({ data: mockInitialSession }),
        } as Response);
      }
      return Promise.reject(new Error('Unknown URL'));
    });

    render(
      <PracticeBoardView
        deckId={10}
        revision={3}
        onThePlay={false}
        mulliganStrategy="LONDON_LAND_RANGE"
        minimumLands={2}
        maximumLands={4}
      />
    );

    await waitFor(() => {
      expect(screen.getByText(/Turn 1/i)).toBeInTheDocument();
    });

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/v1/decks/10/practice-sessions'),
      expect.objectContaining({
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          revision: 3,
          onThePlay: false,
          mulliganStrategy: 'LONDON_LAND_RANGE',
          minimumLands: 2,
          maximumLands: 4,
        }),
      })
    );
  });

  it('steps to next turn and updates board and hand state', async () => {
    let callCount = 0;
    global.fetch = vi.fn().mockImplementation((url: string | URL) => {
      const urlStr = url.toString();
      if (urlStr.includes('/practice-sessions')) {
        callCount++;
        return Promise.resolve({
          ok: true,
          json: async () => ({ data: callCount === 1 ? mockInitialSession : mockTurn2Session }),
        } as Response);
      }
      return Promise.reject(new Error('Unknown URL'));
    });

    render(<PracticeBoardView deckId={10} />);

    await waitFor(() => {
      expect(screen.getByText(/Turn 1/i)).toBeInTheDocument();
    });

    const nextTurnBtn = screen.getByRole('button', { name: /Next Turn/i });
    fireEvent.click(nextTurnBtn);

    await waitFor(() => {
      expect(screen.getByText(/Turn 2/i)).toBeInTheDocument();
      expect(screen.getByText('Arcane Signet')).toBeInTheDocument();
    });

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/practice-sessions/session-456/steps'),
      expect.objectContaining({ method: 'POST' })
    );
  });

  it('resets practice session back to turn 1', async () => {
    global.fetch = vi.fn().mockImplementation((url: string | URL) => {
      const urlStr = url.toString();
      if (urlStr.includes('/practice-sessions')) {
        return Promise.resolve({
          ok: true,
          json: async () => ({ data: mockInitialSession }),
        } as Response);
      }
      return Promise.reject(new Error('Unknown URL'));
    });

    render(<PracticeBoardView deckId={10} />);

    await waitFor(() => {
      expect(screen.getByText(/Turn 1/i)).toBeInTheDocument();
    });

    const resetBtn = screen.getByRole('button', { name: /Reset/i });
    fireEvent.click(resetBtn);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/practice-sessions/session-456/reset'),
        expect.objectContaining({ method: 'POST' })
      );
    });
  });

  it('allows playing a card from hand to the battlefield calling play endpoint', async () => {
    const afterPlaySession: PracticeSessionResponse = {
      ...mockInitialSession,
      hand: [{ printingId: 102, name: 'Command Tower', manaCost: '', typeLine: 'Land' }],
      battlefield: [{ card: { printingId: 101, name: 'Sol Ring', manaCost: '{1}', typeLine: 'Artifact' }, tapped: false }],
    };

    let callCount = 0;
    global.fetch = vi.fn().mockImplementation((url: string | URL) => {
      const urlStr = url.toString();
      if (urlStr.includes('/practice-sessions')) {
        callCount++;
        return Promise.resolve({
          ok: true,
          json: async () => ({ data: callCount === 1 ? mockInitialSession : afterPlaySession }),
        } as Response);
      }
      return Promise.reject(new Error('Unknown URL'));
    });

    render(<PracticeBoardView deckId={10} />);

    await waitFor(() => {
      expect(screen.getByText('Sol Ring')).toBeInTheDocument();
    });

    const playBtn = screen.getByRole('button', { name: /Play Sol Ring/i });
    fireEvent.click(playBtn);

    await waitFor(() => {
      expect(screen.getByTestId('battlefield-zone')).toHaveTextContent('Sol Ring');
    });

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/practice-sessions/session-456/play'),
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ printingId: 101 }),
      })
    );
  });

  it('rotates battlefield card image and calls tap endpoint on toggle', async () => {
    const sessionWithBf: PracticeSessionResponse = {
      sessionId: 'session-tap',
      seed: 123,
      turn: 1,
      mulliganCount: 0,
      hand: [],
      battlefield: [
        {
          card: {
            printingId: 102,
            name: 'Command Tower',
            typeLine: 'Land',
            imageUrl: 'https://cards.scryfall.io/normal/front/command-tower.jpg',
          },
          tapped: false,
        },
      ],
      drawnCard: null,
      landsInPlay: 1,
      landPlayedThisTurn: true,
      castableSpells: [],
      finished: false,
    };

    const sessionTapped: PracticeSessionResponse = {
      ...sessionWithBf,
      battlefield: [
        {
          card: sessionWithBf.battlefield[0].card,
          tapped: true,
        },
      ],
    };

    let callCount = 0;
    global.fetch = vi.fn().mockImplementation((url: string | URL) => {
      const urlStr = url.toString();
      if (urlStr.includes('/practice-sessions')) {
        callCount++;
        return Promise.resolve({
          ok: true,
          json: async () => ({ data: callCount === 1 ? sessionWithBf : sessionTapped }),
        } as Response);
      }
      return Promise.reject(new Error('Unknown URL'));
    });

    render(<PracticeBoardView deckId={10} />);

    await waitFor(() => {
      expect(screen.getByRole('img', { name: 'Command Tower' })).toBeInTheDocument();
    });

    const bfCard = screen.getByRole('button', { name: /Command Tower/i });
    expect(bfCard).toHaveTextContent(/Untapped/i);

    fireEvent.click(bfCard);

    await waitFor(() => {
      expect(bfCard).toHaveTextContent(/Tapped/i);
    });

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/practice-sessions/session-tap/tap'),
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ printingId: 102 }),
      })
    );
  });

  it('renders keyword tooltips inline for cards with keywords in practice mode', async () => {
    const user = userEvent.setup();
    const sessionWithKeywords: PracticeSessionResponse = {
      sessionId: 'session-keywords',
      seed: 99,
      turn: 1,
      mulliganCount: 0,
      hand: [
        {
          printingId: 201,
          name: 'Vampire Nighthawk',
          manaCost: '{1}{B}{B}',
          typeLine: 'Creature — Vampire',
          oracleText: 'Flying, Deathtouch, Lifelink',
        },
      ],
      battlefield: [],
      drawnCard: null,
      landsInPlay: 0,
      landPlayedThisTurn: false,
      castableSpells: [],
      finished: false,
    };

    global.fetch = vi.fn().mockImplementation((url: string | URL) => {
      const urlStr = url.toString();
      if (urlStr.includes('/practice-sessions')) {
        return Promise.resolve({
          ok: true,
          json: async () => ({ data: sessionWithKeywords }),
        } as Response);
      }
      return Promise.reject(new Error('Unknown URL'));
    });

    render(<PracticeBoardView deckId={10} />);

    await waitFor(() => {
      expect(screen.getByText('Vampire Nighthawk')).toBeInTheDocument();
    });

    const flyingTrigger = screen.getByText('Flying');
    expect(flyingTrigger).toBeInTheDocument();

    await user.hover(flyingTrigger);
    expect(screen.getByRole('tooltip')).toBeInTheDocument();
    expect(
      screen.getByText("This creature can't be blocked except by creatures with flying and/or reach.")
    ).toBeInTheDocument();
  });

  it('renders card images for hand and battlefield cards when imageUrl is provided', async () => {
    const sessionWithImages: PracticeSessionResponse = {
      sessionId: 'session-images',
      seed: 777,
      turn: 1,
      mulliganCount: 0,
      hand: [
        {
          printingId: 101,
          name: 'Sol Ring',
          manaCost: '{1}',
          typeLine: 'Artifact',
          imageUrl: 'https://cards.scryfall.io/normal/front/sol-ring.jpg',
        },
      ],
      battlefield: [
        {
          card: {
            printingId: 102,
            name: 'Command Tower',
            typeLine: 'Land',
            imageUrl: 'https://cards.scryfall.io/normal/front/command-tower.jpg',
          },
          tapped: false,
        },
      ],
      drawnCard: null,
      landsInPlay: 1,
      landPlayedThisTurn: true,
      castableSpells: [],
      finished: false,
    };

    global.fetch = vi.fn().mockImplementation((url: string | URL) => {
      const urlStr = url.toString();
      if (urlStr.includes('/practice-sessions')) {
        return Promise.resolve({
          ok: true,
          json: async () => ({ data: sessionWithImages }),
        } as Response);
      }
      return Promise.reject(new Error('Unknown URL'));
    });

    render(<PracticeBoardView deckId={10} />);

    await waitFor(() => {
      expect(screen.getByTestId('hand-zone')).toBeInTheDocument();
      expect(screen.getByTestId('battlefield-zone')).toBeInTheDocument();
    });

    const handImg = screen.getByRole('img', { name: 'Sol Ring' });
    expect(handImg).toHaveAttribute('src', 'https://cards.scryfall.io/normal/front/sol-ring.jpg');

    const bfImg = screen.getByRole('img', { name: 'Command Tower' });
    expect(bfImg).toHaveAttribute('src', 'https://cards.scryfall.io/normal/front/command-tower.jpg');
  });

  it('falls back gracefully to text rendering when card has no imageUrl', async () => {
    const sessionNoImages: PracticeSessionResponse = {
      sessionId: 'session-no-img',
      seed: 55,
      turn: 1,
      mulliganCount: 0,
      hand: [
        { printingId: 301, name: 'Plains', typeLine: 'Basic Land — Plains', manaCost: '' },
      ],
      battlefield: [],
      drawnCard: null,
      landsInPlay: 0,
      landPlayedThisTurn: false,
      castableSpells: [],
      finished: false,
    };

    global.fetch = vi.fn().mockImplementation((url: string | URL) => {
      const urlStr = url.toString();
      if (urlStr.includes('/practice-sessions')) {
        return Promise.resolve({
          ok: true,
          json: async () => ({ data: sessionNoImages }),
        } as Response);
      }
      return Promise.reject(new Error('Unknown URL'));
    });

    render(<PracticeBoardView deckId={10} />);

    await waitFor(() => {
      expect(screen.getByText('Plains')).toBeInTheDocument();
      expect(screen.getByText('Basic Land — Plains')).toBeInTheDocument();
    });

    expect(screen.queryByRole('img', { name: 'Plains' })).not.toBeInTheDocument();
  });

  it('highlights castable spells in hand with advisory badge', async () => {
    global.fetch = vi.fn().mockImplementation((url: string | URL) => {
      const urlStr = url.toString();
      if (urlStr.includes('/practice-sessions')) {
        return Promise.resolve({
          ok: true,
          json: async () => ({ data: mockInitialSession }),
        } as Response);
      }
      return Promise.reject(new Error('Unknown URL'));
    });

    render(<PracticeBoardView deckId={10} />);

    await waitFor(() => {
      expect(screen.getByText('Sol Ring')).toBeInTheDocument();
      expect(screen.getByText('Castable')).toBeInTheDocument();
    });
  });

  it('surfaces error banner on initial load failure without falling back to fake data', async () => {
    global.fetch = vi.fn().mockImplementation(() =>
      Promise.resolve({
        ok: false,
        status: 500,
        json: async () => ({ error: { message: 'Server unreachable' } }),
      } as Response)
    );

    render(<PracticeBoardView deckId={10} />);

    await waitFor(() => {
      expect(screen.getByText('Server unreachable')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Retry/i })).toBeInTheDocument();
    });

    expect(screen.queryByTestId('battlefield-zone')).not.toBeInTheDocument();
    expect(screen.queryByTestId('hand-zone')).not.toBeInTheDocument();
  });

  it('surfaces inline error banner on action failure', async () => {
    let callCount = 0;
    global.fetch = vi.fn().mockImplementation((url: string | URL) => {
      const urlStr = url.toString();
      callCount++;
      if (callCount === 1) {
        return Promise.resolve({
          ok: true,
          json: async () => ({ data: mockInitialSession }),
        } as Response);
      }
      if (urlStr.includes('/play')) {
        return Promise.resolve({
          ok: false,
          status: 400,
          json: async () => ({ error: { message: 'Land already played this turn' } }),
        } as Response);
      }
      return Promise.reject(new Error('Unknown URL'));
    });

    render(<PracticeBoardView deckId={10} />);

    await waitFor(() => {
      expect(screen.getByText('Command Tower')).toBeInTheDocument();
    });

    const playBtn = screen.getByRole('button', { name: /Play Command Tower/i });
    fireEvent.click(playBtn);

    await waitFor(() => {
      expect(screen.getByText('Land already played this turn')).toBeInTheDocument();
    });
  });
});
