import { render, screen, fireEvent, act } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { CommanderBuildConfigModal } from '@/components/deck/CommanderBuildConfigModal';
import { CommanderSuggestion } from '@/types/builder';

const mockCommander: CommanderSuggestion = {
  id: 'cmd-1',
  name: "Atraxa, Praetors' Voice",
  imageUrl: 'https://cards.scryfall.io/normal/front/d/0/d0d0.jpg',
  colors: ['W', 'U', 'B', 'G'],
  colorIdentity: ['W', 'U', 'B', 'G'],
  ownershipCoverage: 75,
  missingStaplesCount: 2,
  estimatedCostToComplete: 45.0,
  popularityRank: 1,
  typeLine: 'Legendary Creature — Phyrexian Angel',
};

describe('CommanderBuildConfigModal Component', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders modal with commander summary, color identity pips, and build options', () => {
    render(
      <CommanderBuildConfigModal
        commander={mockCommander}
        isOpen={true}
        onClose={() => {}}
        onGenerate={() => {}}
      />
    );

    expect(screen.getByText("Atraxa, Praetors' Voice")).toBeInTheDocument();
    expect(screen.getByLabelText(/Owned cards only/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Power Level/i)).toBeInTheDocument();
    expect(screen.getByText('Control')).toBeInTheDocument();
    expect(screen.getByText('Combo')).toBeInTheDocument();

    // Verify color identity pips for Atraxa (W, U, B, G)
    expect(screen.getByTestId('color-pip-W')).toBeInTheDocument();
    expect(screen.getByTestId('color-pip-U')).toBeInTheDocument();
    expect(screen.getByTestId('color-pip-B')).toBeInTheDocument();
    expect(screen.getByTestId('color-pip-G')).toBeInTheDocument();
  });

  it('collects user configuration and triggers onGenerate with ownedOnly enabled by default', async () => {
    const handleGenerate = vi.fn().mockResolvedValue(undefined);
    render(
      <CommanderBuildConfigModal
        commander={mockCommander}
        isOpen={true}
        onClose={() => {}}
        onGenerate={handleGenerate}
      />
    );

    const ownedOnlyToggle = screen.getByLabelText(/Owned cards only/i) as HTMLInputElement;
    expect(ownedOnlyToggle.checked).toBe(true);

    const controlChip = screen.getByText('Control');
    fireEvent.click(controlChip);

    const generateBtn = screen.getByRole('button', { name: /Generate Deck/i });
    fireEvent.click(generateBtn);

    await act(async () => {
      await Promise.resolve();
    });

    expect(handleGenerate).toHaveBeenCalledWith(
      expect.objectContaining({
        commanderId: 'cmd-1',
        ownedOnly: true,
        playStyles: expect.arrayContaining(['Control']),
      })
    );
  });

  it('offers optional partner/secondary commander section and surfaces 400 eligibility error message when build fails', async () => {
    const handleGenerate = vi.fn().mockRejectedValue(new Error('Card is not eligible as commander: Sol Ring'));

    render(
      <CommanderBuildConfigModal
        commander={mockCommander}
        isOpen={true}
        onClose={() => {}}
        onGenerate={handleGenerate}
      />
    );

    // Partner/Secondary commander section is available after primary is picked
    expect(screen.getByText(/Partner \/ Secondary Commander/i)).toBeInTheDocument();

    // Trigger generate deck which fails with eligibility error
    const generateBtn = screen.getByRole('button', { name: /Generate Deck/i });
    fireEvent.click(generateBtn);

    await act(async () => {
      await Promise.resolve();
    });

    // The error message must be surfaced directly in the modal
    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(screen.getByText('Card is not eligible as commander: Sol Ring')).toBeInTheDocument();
  });
});
