import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  uploadImportPreview,
  commitImport,
  getImportErrorsDownloadUrl,
  triggerOracleTagsImport,
  fetchImportRunStatus,
} from '@/lib/api/imports';

vi.mock('@/lib/auth0', () => ({
  auth0: {
    getAccessToken: vi.fn().mockResolvedValue({ token: 'test-token' }),
  },
}));

describe('Imports API Client', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe('uploadImportPreview', () => {
    it('should send file via multipart form-data to deck preview endpoint', async () => {
      const mockPreviewResponse = {
        previewToken: 'tok-123',
        expiresAt: '2026-08-06T20:00:00Z',
        totalRows: 2,
        rows: [
          { lineNumber: 1, rawText: '1 Sol Ring', status: 'resolved', cardName: 'Sol Ring', candidatePrintingIds: [] },
          { lineNumber: 2, rawText: '1 Counterspell', status: 'ambiguous', cardName: 'Counterspell', candidatePrintingIds: [10, 20] },
        ],
      };

      globalThis.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => mockPreviewResponse,
      } as Response);

      const file = new File(['1 Sol Ring\n1 Counterspell'], 'deck.txt', { type: 'text/plain' });
      const result = await uploadImportPreview(file, 'decks');

      expect(globalThis.fetch).toHaveBeenCalledWith(
        '/api/v1/decks/import/preview',
        expect.objectContaining({ method: 'POST' })
      );
      expect(result).toEqual(mockPreviewResponse);
    });

    it('should handle 413 payload error when file size or row count exceeds limits', async () => {
      globalThis.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 413,
        json: async () => ({ error: { message: 'File exceeds maximum size of 1 MiB or 500 rows limit' } }),
      } as Response);

      const file = new File(['a'.repeat(2000000)], 'huge.txt', { type: 'text/plain' });
      await expect(uploadImportPreview(file, 'decks')).rejects.toThrow('File exceeds maximum size of 1 MiB or 500 rows limit');
    });
  });

  describe('commitImport', () => {
    it('should send Idempotency-Key header and payload to commit endpoint', async () => {
      const mockCommitResponse = {
        success: true,
        importedCount: 2,
        failedCount: 0,
      };

      globalThis.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => mockCommitResponse,
      } as Response);

      const idempotencyKey = 'idemp-uuid-1234';
      const result = await commitImport({
        previewToken: 'tok-123',
        excludedLineNumbers: [3],
        selectedPrintings: { 2: 10 },
        deckName: 'My Commander Brew',
        formatCode: 'COMMANDER',
        idempotencyKey,
        targetType: 'decks',
      });

      expect(globalThis.fetch).toHaveBeenCalledWith(
        '/api/v1/decks/import/commit',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Idempotency-Key': idempotencyKey,
            'Content-Type': 'application/json',
          }),
        })
      );
      expect(result).toEqual(mockCommitResponse);
    });

    it('should throw 409 conflict error on idempotency key conflict', async () => {
      globalThis.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 409,
        json: async () => ({ error: { message: 'Idempotency key already committed' } }),
      } as Response);

      await expect(
        commitImport({
          previewToken: 'tok-123',
          excludedLineNumbers: [],
          idempotencyKey: 'idemp-uuid-1234',
          targetType: 'decks',
        })
      ).rejects.toThrow('Idempotency key already committed');
    });

    it('should throw 404 error when preview token is expired or foreign', async () => {
      globalThis.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 404,
        json: async () => ({ error: { message: 'Preview token expired or invalid' } }),
      } as Response);

      await expect(
        commitImport({
          previewToken: 'expired-tok',
          excludedLineNumbers: [],
          idempotencyKey: 'idemp-uuid-1234',
          targetType: 'collections',
        })
      ).rejects.toThrow('Preview token expired or invalid');
    });
  });

  describe('getImportErrorsDownloadUrl', () => {
    it('should format error CSV download URL with token query param', () => {
      const url = getImportErrorsDownloadUrl('tok-123', 'decks');
      expect(url).toBe('/api/v1/decks/import/errors?token=tok-123');
    });
  });

  describe('triggerOracleTagsImport', () => {
    it('should trigger POST /api/v1/admin/card-imports/oracle-tags and return ImportResult', async () => {
      const mockResult = { runId: 42, status: 'RUNNING' };
      globalThis.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 202,
        json: async () => mockResult,
      } as Response);

      const result = await triggerOracleTagsImport();
      expect(globalThis.fetch).toHaveBeenCalledWith(
        expect.objectContaining({
          href: expect.stringContaining('/api/v1/admin/card-imports/oracle-tags'),
        }),
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({ Authorization: 'Bearer test-token' }),
        })
      );
      expect(result).toEqual(mockResult);
    });

    it('should throw error when trigger returns non-ok status', async () => {
      globalThis.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 500,
      } as Response);

      await expect(triggerOracleTagsImport()).rejects.toThrow('Oracle tags import trigger returned 500');
    });
  });

  describe('fetchImportRunStatus', () => {
    it('should fetch status for specific import runId', async () => {
      const mockRun = {
        id: 42,
        provider: 'oracle-tags',
        query: 'oracle-tags',
        status: 'COMPLETED',
        recordsRead: 500,
        recordsCreated: 450,
        recordsUpdated: 50,
        recordsFailed: 0,
        startedAt: '2026-08-10T10:00:00Z',
        completedAt: '2026-08-10T10:01:00Z',
      };
      globalThis.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => mockRun,
      } as Response);

      const result = await fetchImportRunStatus(42);
      expect(globalThis.fetch).toHaveBeenCalledWith(
        expect.objectContaining({
          href: expect.stringContaining('/api/v1/admin/card-imports/42'),
        }),
        expect.objectContaining({
          headers: expect.objectContaining({ Authorization: 'Bearer test-token' }),
        })
      );
      expect(result).toEqual(mockRun);
    });

    it('should throw error when status endpoint returns non-ok', async () => {
      globalThis.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 404,
      } as Response);

      await expect(fetchImportRunStatus(42)).rejects.toThrow('Import run status returned 404');
    });
  });
});

