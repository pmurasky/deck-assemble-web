import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ImportWizardModal } from '@/components/import/ImportWizardModal';
import * as importsApi from '@/lib/api/imports';

vi.mock('@/lib/api/imports', () => ({
  uploadImportPreview: vi.fn(),
  commitImport: vi.fn(),
  getImportErrorsDownloadUrl: vi.fn((token, target) => `/api/v1/${target}/import/errors?token=${token}`),
}));

describe('ImportWizardModal Component', () => {
  const defaultProps = {
    isOpen: true,
    onClose: vi.fn(),
    targetType: 'decks' as const,
    onImportSuccess: vi.fn(),
  };

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('renders Step 1 (Upload) initially with target deck limits', () => {
    render(<ImportWizardModal {...defaultProps} />);
    expect(screen.getByText(/Import Decks/i)).toBeInTheDocument();
    expect(screen.getByText(/Step 1: Upload File/i)).toBeInTheDocument();
    expect(screen.getByText(/Max file size 1 MiB/i)).toBeInTheDocument();
    expect(screen.getByText(/500 rows limit/i)).toBeInTheDocument();
  });

  it('handles 413 file size limit error when file exceeds 1 MiB', async () => {
    render(<ImportWizardModal {...defaultProps} />);

    const file = new File(['a'.repeat(2000000)], 'large_deck.txt', { type: 'text/plain' });
    const input = screen.getByTestId('import-file-input');

    fireEvent.change(input, { target: { files: [file] } });

    const previewButton = screen.getByRole('button', { name: /Preview File/i });
    fireEvent.click(previewButton);

    await waitFor(() => {
      expect(screen.getByText(/File size exceeds maximum size of 1 MiB limit/i)).toBeInTheDocument();
    });
  });

  it('advances to Step 2 (Review) after preview upload success', async () => {
    const mockPreviewData: importsApi.ImportPreviewResult = {
      previewToken: 'tok-abc-123',
      expiresAt: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
      totalRows: 2,
      rows: [
        { lineNumber: 1, rawText: '1 Sol Ring', status: 'resolved', cardName: 'Sol Ring', candidatePrintingIds: [] },
        { lineNumber: 2, rawText: '1 Mystery Card', status: 'unmatched', errorMessage: 'Card not found' },
      ],
    };

    vi.mocked(importsApi.uploadImportPreview).mockResolvedValueOnce(mockPreviewData);

    render(<ImportWizardModal {...defaultProps} />);

    const file = new File(['1 Sol Ring\n1 Mystery Card'], 'deck.txt', { type: 'text/plain' });
    const input = screen.getByTestId('import-file-input');
    fireEvent.change(input, { target: { files: [file] } });

    const previewButton = screen.getByRole('button', { name: /Preview File/i });
    fireEvent.click(previewButton);

    await waitFor(() => {
      expect(screen.getByText(/Step 2: Review & Resolve/i)).toBeInTheDocument();
    });

    expect(screen.getByText(/Sol Ring/)).toBeInTheDocument();
    expect(screen.getByText(/Mystery Card/)).toBeInTheDocument();
  });

  it('allows excluding unresolved rows in Step 2 and committing in Step 3', async () => {
    const mockPreviewData: importsApi.ImportPreviewResult = {
      previewToken: 'tok-abc-123',
      expiresAt: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
      totalRows: 2,
      rows: [
        { lineNumber: 1, rawText: '1 Sol Ring', status: 'resolved', cardName: 'Sol Ring', candidatePrintingIds: [] },
        { lineNumber: 2, rawText: '1 Unknown Card', status: 'unmatched', errorMessage: 'Card not found' },
      ],
    };

    vi.mocked(importsApi.uploadImportPreview).mockResolvedValueOnce(mockPreviewData);
    vi.mocked(importsApi.commitImport).mockResolvedValueOnce({
      success: true,
      importedCount: 1,
      failedCount: 0,
      deckId: 101,
    });

    render(<ImportWizardModal {...defaultProps} />);

    const file = new File(['1 Sol Ring\n1 Unknown Card'], 'deck.txt', { type: 'text/plain' });
    const input = screen.getByTestId('import-file-input');
    fireEvent.change(input, { target: { files: [file] } });

    const previewButton = screen.getByRole('button', { name: /Preview File/i });
    fireEvent.click(previewButton);

    await waitFor(() => {
      expect(screen.getByText(/Step 2: Review & Resolve/i)).toBeInTheDocument();
    });

    // Check exclude checkbox for line 2
    const excludeCheckbox = screen.getByTestId('exclude-row-2');
    fireEvent.click(excludeCheckbox);

    // Click Proceed to Commit
    const commitButton = screen.getByRole('button', { name: /Proceed to Commit/i });
    fireEvent.click(commitButton);

    await waitFor(() => {
      expect(screen.getByText(/Import Successful!/i)).toBeInTheDocument();
    });

    expect(importsApi.commitImport).toHaveBeenCalledWith(
      expect.objectContaining({
        previewToken: 'tok-abc-123',
        excludedLineNumbers: [2],
        targetType: 'decks',
      })
    );
  });
});
