import { render, screen, fireEvent, act } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { CommanderBuildConfigModal } from '@/components/deck/CommanderBuildConfigModal';
import { CommanderSuggestion } from '@/types/builder';

const mockCommander: CommanderSuggestion = {
  id: 'cmd-1',
  name: 'Atraxa, Praetors\' Voice',
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
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders modal with commander summary and build options', () => {
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
  });

  it('collects user configuration and triggers onGenerate', () => {
    const handleGenerate = vi.fn();
    render(
      <CommanderBuildConfigModal
        commander={mockCommander}
        isOpen={true}
        onClose={() => {}}
        onGenerate={handleGenerate}
      />
    );

    // Toggle Owned cards only
    const ownedOnlyToggle = screen.getByLabelText(/Owned cards only/i);
    fireEvent.click(ownedOnlyToggle);

    // Select 'Control' play style chip
    const controlChip = screen.getByText('Control');
    fireEvent.click(controlChip);

    // Click Generate
    const generateBtn = screen.getByRole('button', { name: /Generate Deck/i });
    fireEvent.click(generateBtn);

    act(() => {
      vi.advanceTimersByTime(500);
    });

    expect(handleGenerate).toHaveBeenCalledWith(
      expect.objectContaining({
        commanderId: 'cmd-1',
        ownedOnly: true,
        playStyles: expect.arrayContaining(['Control']),
      })
    );
  });
});
