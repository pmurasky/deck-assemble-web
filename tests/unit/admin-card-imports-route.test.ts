import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET, POST } from '@/app/api/v1/admin/card-imports/route';
import { NextRequest } from 'next/server';
import * as importsApi from '@/lib/api/imports';

vi.mock('@/lib/api/imports');

describe('API Route: /api/v1/admin/card-imports', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  describe('GET /api/v1/admin/card-imports', () => {
    it('should return import runs data on success', async () => {
      const mockRuns: importsApi.ImportRun[] = [
        {
          id: 1,
          provider: 'scryfall',
          query: 'e:mar',
          status: 'COMPLETED',
          recordsRead: 100,
          recordsCreated: 90,
          recordsUpdated: 10,
          recordsFailed: 0,
          startedAt: '2026-07-22T00:00:00Z',
          completedAt: '2026-07-22T00:02:00Z',
        },
      ];
      vi.spyOn(importsApi, 'fetchImportRuns').mockResolvedValue(mockRuns);

      const res = await GET();
      expect(res.status).toBe(200);

      const json = await res.json();
      expect(json).toEqual({ data: mockRuns });
    });

    it('should return error response when fetchImportRuns fails', async () => {
      vi.spyOn(importsApi, 'fetchImportRuns').mockRejectedValue(new Error('Import history returned 403'));

      const res = await GET();
      expect(res.status).toBe(403);

      const json = await res.json();
      expect(json).toEqual({ error: { message: 'Import history returned 403' } });
    });
  });

  describe('POST /api/v1/admin/card-imports', () => {
    it('should return 400 bad request if query parameter is missing or blank', async () => {
      const req = new NextRequest('http://localhost/api/v1/admin/card-imports');
      const res = await POST(req);
      expect(res.status).toBe(400);

      const json = await res.json();
      expect(json.error.message).toBe('Query parameter is required');
    });

    it('should trigger import and return import result on success', async () => {
      const mockResult: importsApi.ImportResult = {
        runId: 3,
        recordsRead: 1803,
        recordsCreated: 1708,
        recordsUpdated: 95,
        recordsFailed: 0,
      };
      vi.spyOn(importsApi, 'triggerImport').mockResolvedValue(mockResult);

      const req = new NextRequest('http://localhost/api/v1/admin/card-imports?query=e%3Amar');
      const res = await POST(req);
      expect(res.status).toBe(200);

      const json = await res.json();
      expect(json).toEqual({ data: mockResult });
      expect(importsApi.triggerImport).toHaveBeenCalledWith('e:mar');
    });

    it('should handle authorization and execution errors gracefully', async () => {
      vi.spyOn(importsApi, 'triggerImport').mockRejectedValue(new Error('Import trigger returned 403'));

      const req = new NextRequest('http://localhost/api/v1/admin/card-imports?query=e%3Amar');
      const res = await POST(req);
      expect(res.status).toBe(403);

      const json = await res.json();
      expect(json).toEqual({ error: { message: 'Import trigger returned 403' } });
    });
  });
});
