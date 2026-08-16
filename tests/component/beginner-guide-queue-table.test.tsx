import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { BeginnerGuideQueueTable } from '@/components/admin/BeginnerGuideQueueTable';
import type { AdminBeginnerGuideItem } from '@/lib/api/beginnerGuides';

const mockItems: AdminBeginnerGuideItem[] = [
  {
    cardId: 'sol-ring',
    cardName: 'Sol Ring',
    status: 'DRAFT',
    summary: 'Taps for two colorless mana.',
    examples: 'Play on turn 1.',
    whenToUse: 'Early game ramp.',
    sourceRulingsSnapshot: [],
  },
  {
    cardId: 'rhystic-study',
    cardName: 'Rhystic Study',
    status: 'STALE',
    summary: 'Draw cards when opponents cast spells unless they pay {1}.',
    examples: 'Opponent casts a spell, trigger asks for payment.',
    whenToUse: 'Mid-game card advantage engine.',
    sourceRulingsSnapshot: [],
  },
  {
    cardId: 'cyclonic-rift',
    cardName: 'Cyclonic Rift',
    status: 'REPORTED',
    summary: 'Bounce nonland permanents with overload.',
    examples: 'Pay 7 mana for asymmetrical board wipe.',
    whenToUse: 'Late game finisher or defensive wipe.',
    sourceRulingsSnapshot: [],
  },
];

describe('BeginnerGuideQueueTable', () => {
  it('renders empty state when there are no items in queue', () => {
    render(
      <BeginnerGuideQueueTable
        items={[]}
        totalElements={0}
        currentPage={0}
        pageSize={10}
        onSelectGuide={vi.fn()}
        onPageChange={vi.fn()}
      />
    );

    expect(screen.getByText(/review queue is clear/i)).toBeInTheDocument();
    expect(screen.getByText(/no beginner guides currently require moderation/i)).toBeInTheDocument();
  });

  it('renders table rows with card names, status badges, and summaries', () => {
    render(
      <BeginnerGuideQueueTable
        items={mockItems}
        totalElements={3}
        currentPage={0}
        pageSize={10}
        onSelectGuide={vi.fn()}
        onPageChange={vi.fn()}
      />
    );

    expect(screen.getByText('Sol Ring')).toBeInTheDocument();
    expect(screen.getByText('Rhystic Study')).toBeInTheDocument();
    expect(screen.getByText('Cyclonic Rift')).toBeInTheDocument();

    expect(screen.getByText('DRAFT')).toBeInTheDocument();
    expect(screen.getByText('STALE')).toBeInTheDocument();
    expect(screen.getByText('REPORTED')).toBeInTheDocument();

    expect(screen.getByText('Taps for two colorless mana.')).toBeInTheDocument();
  });

  it('invokes onSelectGuide when Review button is clicked', () => {
    const onSelectGuide = vi.fn();
    render(
      <BeginnerGuideQueueTable
        items={mockItems}
        totalElements={3}
        currentPage={0}
        pageSize={10}
        onSelectGuide={onSelectGuide}
        onPageChange={vi.fn()}
      />
    );

    const reviewButtons = screen.getAllByRole('button', { name: /review/i });
    fireEvent.click(reviewButtons[0]);

    expect(onSelectGuide).toHaveBeenCalledWith(mockItems[0]);
  });

  it('highlights the selected row when selectedCardId matches', () => {
    render(
      <BeginnerGuideQueueTable
        items={mockItems}
        totalElements={3}
        currentPage={0}
        pageSize={10}
        selectedCardId="rhystic-study"
        onSelectGuide={vi.fn()}
        onPageChange={vi.fn()}
      />
    );

    const row = screen.getByTestId('guide-row-rhystic-study');
    expect(row.className).toContain('border-purple-500');
  });

  it('renders pagination controls and triggers onPageChange', () => {
    const onPageChange = vi.fn();
    render(
      <BeginnerGuideQueueTable
        items={mockItems}
        totalElements={25}
        currentPage={0}
        pageSize={10}
        onSelectGuide={vi.fn()}
        onPageChange={onPageChange}
      />
    );

    expect(screen.getByText(/showing 1 to 3 of 25 items/i)).toBeInTheDocument();
    expect(screen.getByText(/page 1 of 3/i)).toBeInTheDocument();

    const nextButton = screen.getByRole('button', { name: /next/i });
    expect(nextButton).not.toBeDisabled();
    fireEvent.click(nextButton);

    expect(onPageChange).toHaveBeenCalledWith(1);

    const prevButton = screen.getByRole('button', { name: /previous/i });
    expect(prevButton).toBeDisabled();
  });

  it('renders loading state when isLoading is true', () => {
    render(
      <BeginnerGuideQueueTable
        items={[]}
        totalElements={0}
        currentPage={0}
        pageSize={10}
        isLoading={true}
        onSelectGuide={vi.fn()}
        onPageChange={vi.fn()}
      />
    );

    expect(screen.getByText(/loading review queue/i)).toBeInTheDocument();
  });

  it('renders error alert when error is provided', () => {
    render(
      <BeginnerGuideQueueTable
        items={[]}
        totalElements={0}
        currentPage={0}
        pageSize={10}
        error={new Error('Failed to load queue')}
        onSelectGuide={vi.fn()}
        onPageChange={vi.fn()}
      />
    );

    expect(screen.getByText('Failed to load queue')).toBeInTheDocument();
  });
});
