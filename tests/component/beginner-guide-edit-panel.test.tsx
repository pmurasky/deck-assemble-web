import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { BeginnerGuideEditPanel } from '@/components/admin/BeginnerGuideEditPanel';
import * as beginnerGuidesApi from '@/lib/api/beginnerGuides';
import type { AdminBeginnerGuideItem } from '@/lib/api/beginnerGuides';

vi.mock('@/lib/api/beginnerGuides', async () => {
  const actual = await vi.importActual<typeof import('@/lib/api/beginnerGuides')>('@/lib/api/beginnerGuides');
  return {
    ...actual,
    updateAdminBeginnerGuide: vi.fn(),
    publishAdminBeginnerGuide: vi.fn(),
    regenerateAdminBeginnerGuide: vi.fn(),
    rejectAdminBeginnerGuide: vi.fn(),
  };
});

const mockGuide: AdminBeginnerGuideItem = {
  cardId: 'sol-ring-1',
  cardName: 'Sol Ring',
  status: 'DRAFT',
  summary: 'Tap to add {C}{C}. Costs 1 generic mana.',
  examples: 'Cast Sol Ring on turn 1 using an untapped land.',
  whenToUse: 'Whenever you want ramp early in the game.',
  sourceRulingsSnapshot: ['2020-08-07: Sol Ring produces two colorless mana.'],
  generatedAt: '2026-08-16T10:00:00Z',
  reviewedBy: null,
};

describe('BeginnerGuideEditPanel', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('renders card name, status badge, form fields, and source rulings', () => {
    render(<BeginnerGuideEditPanel guide={mockGuide} />);

    expect(screen.getByText('Sol Ring')).toBeInTheDocument();
    expect(screen.getByText('DRAFT')).toBeInTheDocument();
    expect(screen.getByLabelText(/rules summary/i)).toHaveValue('Tap to add {C}{C}. Costs 1 generic mana.');
    expect(screen.getByLabelText(/in-play examples/i)).toHaveValue('Cast Sol Ring on turn 1 using an untapped land.');
    expect(screen.getByLabelText(/when to play/i)).toHaveValue('Whenever you want ramp early in the game.');
    expect(screen.getByText(/Sol Ring produces two colorless mana/i)).toBeInTheDocument();
  });

  it('allows modifying fields and saving changes', async () => {
    const updatedGuide: AdminBeginnerGuideItem = {
      ...mockGuide,
      summary: 'Manually revised summary',
    };
    vi.mocked(beginnerGuidesApi.updateAdminBeginnerGuide).mockResolvedValueOnce(updatedGuide);
    const onSaveSuccess = vi.fn();

    render(<BeginnerGuideEditPanel guide={mockGuide} onSaveSuccess={onSaveSuccess} />);

    const summaryInput = screen.getByLabelText(/rules summary/i);
    fireEvent.change(summaryInput, { target: { value: 'Manually revised summary' } });

    const saveButton = screen.getByRole('button', { name: /save/i });
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(beginnerGuidesApi.updateAdminBeginnerGuide).toHaveBeenCalledWith('sol-ring-1', {
        summary: 'Manually revised summary',
        examples: 'Cast Sol Ring on turn 1 using an untapped land.',
        whenToUse: 'Whenever you want ramp early in the game.',
      });
      expect(onSaveSuccess).toHaveBeenCalledWith(updatedGuide);
    });
  });

  it('calls publish endpoint and triggers onPublishSuccess callback', async () => {
    const publishedGuide: AdminBeginnerGuideItem = {
      ...mockGuide,
      status: 'PUBLISHED',
    };
    vi.mocked(beginnerGuidesApi.publishAdminBeginnerGuide).mockResolvedValueOnce(publishedGuide);
    const onPublishSuccess = vi.fn();

    render(<BeginnerGuideEditPanel guide={mockGuide} onPublishSuccess={onPublishSuccess} />);

    const publishButton = screen.getByRole('button', { name: /publish/i });
    fireEvent.click(publishButton);

    await waitFor(() => {
      expect(beginnerGuidesApi.publishAdminBeginnerGuide).toHaveBeenCalledWith('sol-ring-1');
      expect(onPublishSuccess).toHaveBeenCalledWith(publishedGuide);
    });
  });

  it('calls regenerate endpoint, updates local form, and triggers onRegenerateSuccess callback', async () => {
    const regeneratedGuide: AdminBeginnerGuideItem = {
      ...mockGuide,
      summary: 'AI regenerated fresh summary',
    };
    vi.mocked(beginnerGuidesApi.regenerateAdminBeginnerGuide).mockResolvedValueOnce(regeneratedGuide);
    const onRegenerateSuccess = vi.fn();

    render(<BeginnerGuideEditPanel guide={mockGuide} onRegenerateSuccess={onRegenerateSuccess} />);

    const regenerateButton = screen.getByRole('button', { name: /regenerate/i });
    fireEvent.click(regenerateButton);

    await waitFor(() => {
      expect(beginnerGuidesApi.regenerateAdminBeginnerGuide).toHaveBeenCalledWith('sol-ring-1');
      expect(onRegenerateSuccess).toHaveBeenCalledWith(regeneratedGuide);
      expect(screen.getByLabelText(/rules summary/i)).toHaveValue('AI regenerated fresh summary');
    });
  });

  it('calls reject endpoint and triggers onRejectSuccess callback', async () => {
    vi.mocked(beginnerGuidesApi.rejectAdminBeginnerGuide).mockResolvedValueOnce();
    const onRejectSuccess = vi.fn();

    render(<BeginnerGuideEditPanel guide={mockGuide} onRejectSuccess={onRejectSuccess} />);

    const rejectButton = screen.getByRole('button', { name: /reject/i });
    fireEvent.click(rejectButton);

    await waitFor(() => {
      expect(beginnerGuidesApi.rejectAdminBeginnerGuide).toHaveBeenCalledWith('sol-ring-1');
      expect(onRejectSuccess).toHaveBeenCalledWith('sol-ring-1');
    });
  });

  it('displays inline 403 error when admin privileges are revoked', async () => {
    const err = new Error('Access denied: Administrator privileges required (403)') as Error & { status: number };
    err.status = 403;
    vi.mocked(beginnerGuidesApi.publishAdminBeginnerGuide).mockRejectedValueOnce(err);

    render(<BeginnerGuideEditPanel guide={mockGuide} />);

    const publishButton = screen.getByRole('button', { name: /publish/i });
    fireEvent.click(publishButton);

    await waitFor(() => {
      expect(screen.getByText(/Access denied: Administrator privileges required/i)).toBeInTheDocument();
    });
  });

  it('displays inline 404 error when card was removed mid-review', async () => {
    const err = new Error('Guide not found or already removed (404)') as Error & { status: number };
    err.status = 404;
    vi.mocked(beginnerGuidesApi.rejectAdminBeginnerGuide).mockRejectedValueOnce(err);

    render(<BeginnerGuideEditPanel guide={mockGuide} />);

    const rejectButton = screen.getByRole('button', { name: /reject/i });
    fireEvent.click(rejectButton);

    await waitFor(() => {
      expect(screen.getByText(/Guide not found or already removed/i)).toBeInTheDocument();
    });
  });

  it('toggles collapsible source rulings snapshot visibility', () => {
    render(<BeginnerGuideEditPanel guide={mockGuide} />);

    expect(screen.getByText(/Sol Ring produces two colorless mana/i)).toBeInTheDocument();

    const toggleButton = screen.getByRole('button', { name: /rulings/i });
    fireEvent.click(toggleButton);

    expect(screen.queryByText(/Sol Ring produces two colorless mana/i)).not.toBeInTheDocument();

    fireEvent.click(toggleButton);
    expect(screen.getByText(/Sol Ring produces two colorless mana/i)).toBeInTheDocument();
  });
});
