import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ExportDeckModal } from '@/components/export/ExportDeckModal';
import { ExportCollectionButton } from '@/components/export/ExportCollectionButton';
import * as exportsApi from '@/lib/api/exports';

vi.mock('@/lib/api/exports', () => ({
  DECK_EXPORT_FORMATS: ['txt', 'csv', 'json', 'mtgo', 'arena', 'cod'],
  getDeckExportUrl: vi.fn((deckId, fmt) => `/api/v1/decks/${deckId}/export?format=${fmt}`),
  getCollectionExportUrl: vi.fn((colId) => `/api/v1/collections/${colId}/export`),
  triggerAttachmentDownload: vi.fn(),
}));

describe('Export Components', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe('ExportDeckModal', () => {
    it('renders 6 format options and triggers attachment download on click', () => {
      const onClose = vi.fn();
      render(<ExportDeckModal isOpen={true} onClose={onClose} deckId={10} deckName="Test Brew" />);

      expect(screen.getByText(/Export Deck: Test Brew/i)).toBeInTheDocument();

      // Check format options exist
      expect(screen.getByText(/Text \(.txt\)/i)).toBeInTheDocument();
      expect(screen.getByText(/CSV \(.csv\)/i)).toBeInTheDocument();
      expect(screen.getByText(/JSON \(.json\)/i)).toBeInTheDocument();
      expect(screen.getByText(/MTGO \(.dek\)/i)).toBeInTheDocument();
      expect(screen.getByText('MTG Arena')).toBeInTheDocument();
      expect(screen.getByText(/Cockatrice \(.cod\)/i)).toBeInTheDocument();

      // Click MTGO format option
      const mtgoBtn = screen.getByRole('button', { name: /MTGO \(.dek\)/i });
      fireEvent.click(mtgoBtn);

      const downloadBtn = screen.getByRole('button', { name: /Download Export/i });
      fireEvent.click(downloadBtn);

      expect(exportsApi.getDeckExportUrl).toHaveBeenCalledWith(10, 'mtgo');
      expect(exportsApi.triggerAttachmentDownload).toHaveBeenCalledWith(
        '/api/v1/decks/10/export?format=mtgo',
        'Test Brew.dek'
      );
    });
  });

  describe('ExportCollectionButton', () => {
    it('triggers CSV attachment download on click', () => {
      render(<ExportCollectionButton collectionId={5} collectionName="My Collection" />);

      const button = screen.getByRole('button', { name: /Export CSV/i });
      fireEvent.click(button);

      expect(exportsApi.getCollectionExportUrl).toHaveBeenCalledWith(5);
      expect(exportsApi.triggerAttachmentDownload).toHaveBeenCalledWith(
        '/api/v1/collections/5/export',
        'My Collection.csv'
      );
    });
  });
});
