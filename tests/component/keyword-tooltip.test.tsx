import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect } from 'vitest';
import { KeywordTooltip, KeywordHighlighter } from '@/components/ui/KeywordTooltip';

describe('KeywordTooltip Component', () => {
  it('renders children and displays keyword reminder text on hover', async () => {
    const user = userEvent.setup();
    render(
      <p>
        Creature has <KeywordTooltip keyword="Flying">Flying</KeywordTooltip>.
      </p>
    );

    const trigger = screen.getByText('Flying');
    expect(trigger).toBeInTheDocument();

    // Hover over trigger
    await user.hover(trigger);

    expect(screen.getByRole('tooltip')).toBeInTheDocument();
    expect(
      screen.getByText("This creature can't be blocked except by creatures with flying and/or reach.")
    ).toBeInTheDocument();
    expect(screen.getByText('Combat')).toBeInTheDocument();

    // Unhover
    await user.unhover(trigger);
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
  });

  it('toggles keyword reminder text on click / tap for mobile touch support', () => {
    render(
      <p>
        Creature has <KeywordTooltip keyword="Deathtouch">Deathtouch</KeywordTooltip>.
      </p>
    );

    const trigger = screen.getByText('Deathtouch');

    // Click to open
    fireEvent.click(trigger);
    expect(screen.getByRole('tooltip')).toBeInTheDocument();
    expect(
      screen.getByText('Any amount of damage this deals to a creature is enough to destroy it.')
    ).toBeInTheDocument();

    // Click again to close
    fireEvent.click(trigger);
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
  });

  it('handles unknown keywords gracefully without showing broken tooltip', () => {
    render(<KeywordTooltip keyword="NonExistentKeyword">Custom Text</KeywordTooltip>);
    expect(screen.getByText('Custom Text')).toBeInTheDocument();
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
  });
});

describe('KeywordHighlighter Component', () => {
  it('detects known keywords in text and wraps them in tooltips', async () => {
    const user = userEvent.setup();
    const oracleText = 'Reach, Vigilance\nWhen this creature enters, Scry 2.';

    render(<KeywordHighlighter text={oracleText} />);

    const reachTrigger = screen.getByText('Reach');
    const vigilanceTrigger = screen.getByText('Vigilance');
    const scryTrigger = screen.getByText('Scry');

    expect(reachTrigger).toBeInTheDocument();
    expect(vigilanceTrigger).toBeInTheDocument();
    expect(scryTrigger).toBeInTheDocument();

    await user.hover(reachTrigger);
    expect(
      screen.getByText('This creature can block creatures with flying.')
    ).toBeInTheDocument();
  });

  it('matches multi-word keywords like First Strike before single-word matches', () => {
    const oracleText = 'Target creature gains First Strike and Trample until end of turn.';
    render(<KeywordHighlighter text={oracleText} />);

    expect(screen.getByText('First Strike')).toBeInTheDocument();
    expect(screen.getByText('Trample')).toBeInTheDocument();
  });
});
