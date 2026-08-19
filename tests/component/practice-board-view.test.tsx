import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { PracticeBoardView } from '@/components/deck/PracticeBoardView';
import type { PracticeSessionResponse } from '@/types/m3';

describe('PracticeBoardView Component', () => {
  const mockInitialSession: PracticeSessionResponse = {
    sessionId: 'session-456',
    turn: 1,
    phase: 'MAIN_1',
    hand: [
      { id: 'c1', name: 'Sol Ring', manaCost: '{1}', typeLine: 'Artifact' },
      { id: 'c2', name: 'Command Tower', manaCost: '', typeLine: 'Land' },
    ],
    battlefield: [],
    graveyard: [],
    libraryCount: 91,
    manaPool: { colorless: 0, any: 0 },
    logs: ['Game started. Opening hand drawn (7 cards).'],
  };

  const mockTurn2Session: PracticeSessionResponse = {
    sessionId: 'session-456',
    turn: 2,
    phase: 'MAIN_1',
    hand: [
      { id: 'c1', name: 'Sol Ring', manaCost: '{1}', typeLine: 'Artifact' },
      { id: 'c3', name: 'Arcane Signet', manaCost: '{2}', typeLine: 'Artifact' },
    ],
    battlefield: [
      { id: 'c2', name: 'Command Tower', manaCost: '', typeLine: 'Land' },
    ],
    graveyard: [],
    libraryCount: 90,
    manaPool: { colorless: 0, any: 1 },
    logs: ['Turn 2 started.', 'Played Command Tower.'],
  };

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('renders initial practice session with hand, battlefield, and turn controls', async () => {
    global.fetch = vi.fn().mockImplementation((url: string | URL) => {
      const urlStr = url.toString();
      if (urlStr.includes('/practice')) {
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
      expect(screen.getByText(/91 in library/i)).toBeInTheDocument();
    });

    expect(screen.getByRole('button', { name: /Next Turn/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Reset/i })).toBeInTheDocument();
  });

  it('steps to next turn and updates board and hand state', async () => {
    let callCount = 0;
    global.fetch = vi.fn().mockImplementation((url: string | URL) => {
      const urlStr = url.toString();
      if (urlStr.includes('/practice')) {
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
  });

  it('resets practice session back to turn 1', async () => {
    global.fetch = vi.fn().mockImplementation((url: string | URL) => {
      const urlStr = url.toString();
      if (urlStr.includes('/practice')) {
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
        expect.stringContaining('/practice'),
        expect.objectContaining({ method: 'POST' })
      );
    });
  });

  it('allows playing a card from hand to the battlefield', async () => {
    global.fetch = vi.fn().mockImplementation((url: string | URL) => {
      const urlStr = url.toString();
      if (urlStr.includes('/practice')) {
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
    });

    const playBtn = screen.getByRole('button', { name: /Play Sol Ring/i });
    fireEvent.click(playBtn);

    await waitFor(() => {
      expect(screen.getByTestId('battlefield-zone')).toHaveTextContent('Sol Ring');
    });
  });

  it('renders keyword tooltips inline for cards with keywords in practice mode', async () => {
    const user = userEvent.setup();
    const sessionWithKeywords: PracticeSessionResponse = {
      sessionId: 'session-keywords',
      turn: 1,
      phase: 'MAIN_1',
      hand: [
        { id: 'c-vamp', name: 'Vampire Nighthawk', manaCost: '{1}{B}{B}', typeLine: 'Creature — Vampire', oracleText: 'Flying, Deathtouch, Lifelink' },
      ],
      battlefield: [],
      graveyard: [],
      libraryCount: 90,
      manaPool: {},
      logs: [],
    };

    global.fetch = vi.fn().mockImplementation((url: string | URL) => {
      const urlStr = url.toString();
      if (urlStr.includes('/practice')) {
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
      turn: 1,
      phase: 'MAIN_1',
      hand: [
        {
          id: 'c-sol',
          name: 'Sol Ring',
          manaCost: '{1}',
          typeLine: 'Artifact',
          imageUrl: 'https://cards.scryfall.io/normal/front/sol-ring.jpg',
        },
      ],
      battlefield: [
        {
          id: 'c-tower',
          name: 'Command Tower',
          typeLine: 'Land',
          imageUrl: 'https://cards.scryfall.io/normal/front/command-tower.jpg',
          tapped: false,
        },
      ],
      graveyard: [],
      libraryCount: 91,
      manaPool: { colorless: 0, any: 0 },
      logs: [],
    };

    global.fetch = vi.fn().mockImplementation((url: string | URL) => {
      const urlStr = url.toString();
      if (urlStr.includes('/practice')) {
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

  it('rotates battlefield card image on tap toggle', async () => {
    const sessionWithBf: PracticeSessionResponse = {
      sessionId: 'session-tap',
      turn: 1,
      phase: 'MAIN_1',
      hand: [],
      battlefield: [
        {
          id: 'c-tower',
          name: 'Command Tower',
          typeLine: 'Land',
          imageUrl: 'https://cards.scryfall.io/normal/front/command-tower.jpg',
          tapped: false,
        },
      ],
      graveyard: [],
      libraryCount: 92,
      manaPool: {},
      logs: [],
    };

    global.fetch = vi.fn().mockImplementation((url: string | URL) => {
      const urlStr = url.toString();
      if (urlStr.includes('/practice')) {
        return Promise.resolve({
          ok: true,
          json: async () => ({ data: sessionWithBf }),
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
  });

  it('falls back gracefully to text rendering when card has no imageUrl', async () => {
    const sessionNoImages: PracticeSessionResponse = {
      sessionId: 'session-no-img',
      turn: 1,
      phase: 'COMBAT',
      hand: [
        { id: 'c-plain', name: 'Plains', typeLine: 'Basic Land — Plains', manaCost: '' },
      ],
      battlefield: [],
      graveyard: [],
      libraryCount: 92,
      manaPool: {},
      logs: [],
    };

    global.fetch = vi.fn().mockImplementation((url: string | URL) => {
      const urlStr = url.toString();
      if (urlStr.includes('/practice')) {
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

  it('renders horizontal phase stepper highlighting current phase and link to turn structure', async () => {
    const sessionCombat: PracticeSessionResponse = {
      sessionId: 'session-stepper',
      turn: 3,
      phase: 'COMBAT',
      hand: [],
      battlefield: [],
      graveyard: [],
      libraryCount: 88,
      manaPool: {},
      logs: [],
    };

    global.fetch = vi.fn().mockImplementation((url: string | URL) => {
      const urlStr = url.toString();
      if (urlStr.includes('/practice')) {
        return Promise.resolve({
          ok: true,
          json: async () => ({ data: sessionCombat }),
        } as Response);
      }
      return Promise.reject(new Error('Unknown URL'));
    });

    render(<PracticeBoardView deckId={10} />);

    await waitFor(() => {
      expect(screen.getByTestId('phase-stepper')).toBeInTheDocument();
    });

    const stepper = screen.getByTestId('phase-stepper');
    expect(stepper).toHaveTextContent('Untap');
    expect(stepper).toHaveTextContent('Upkeep');
    expect(stepper).toHaveTextContent('Draw');
    expect(stepper).toHaveTextContent('Main 1');
    expect(stepper).toHaveTextContent('Combat');
    expect(stepper).toHaveTextContent('Main 2');
    expect(stepper).toHaveTextContent('End');

    const activePhase = screen.getByTestId('phase-step-COMBAT');
    expect(activePhase).toHaveAttribute('data-active', 'true');

    const guideLink = screen.getByRole('link', { name: /Learn MTG Turn Phases/i });
    expect(guideLink).toHaveAttribute('href', '/learn/turn-structure');
  });

  it('renders mana pool pips when manaPool has non-zero values', async () => {
    const sessionWithMana: PracticeSessionResponse = {
      sessionId: 'session-mana',
      turn: 2,
      phase: 'MAIN_1',
      hand: [],
      battlefield: [],
      graveyard: [],
      libraryCount: 89,
      manaPool: { W: 2, U: 1, colorless: 0 },
      logs: [],
    };

    global.fetch = vi.fn().mockImplementation((url: string | URL) => {
      const urlStr = url.toString();
      if (urlStr.includes('/practice')) {
        return Promise.resolve({
          ok: true,
          json: async () => ({ data: sessionWithMana }),
        } as Response);
      }
      return Promise.reject(new Error('Unknown URL'));
    });

    render(<PracticeBoardView deckId={10} />);

    await waitFor(() => {
      expect(screen.getByTestId('mana-pool')).toBeInTheDocument();
    });

    const manaPoolEl = screen.getByTestId('mana-pool');
    expect(manaPoolEl).toHaveTextContent('W');
    expect(manaPoolEl).toHaveTextContent('2');
    expect(manaPoolEl).toHaveTextContent('U');
    expect(manaPoolEl).toHaveTextContent('1');
  });
});
