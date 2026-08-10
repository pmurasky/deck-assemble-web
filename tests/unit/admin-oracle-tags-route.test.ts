import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST as POST_OracleTags } from '@/app/api/v1/admin/card-imports/oracle-tags/route';
import { GET as GET_RunStatus } from '@/app/api/v1/admin/card-imports/[id]/route';
import { NextRequest } from 'next/server';
import * as importsApi from '@/lib/api/imports';

vi.mock('@/lib/api/imports');

describe('Admin Card Imports API Routes', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  describe('POST /api/v1/admin/card-imports/oracle-tags', () => {
    it('should trigger oracle tags import and return 202 status with data', async () => {
      const mockResult: importsApi.ImportResult = {
        runId: 99,
        status: 'RUNNING',
      };
      vi.spyOn(importsApi, 'triggerOracleTagsImport').mockResolvedValue(mockResult);

      const res = await POST_OracleTags();
      expect(res.status).toBe(202);

      const json = await res.json();
      expect(json).toEqual({ data: mockResult });
      expect(importsApi.triggerOracleTagsImport).toHaveBeenCalled();
    });

    it('should handle errors gracefully when oracle tags trigger fails', async () => {
      vi.spyOn(importsApi, 'triggerOracleTagsImport').mockRejectedValue(
        new Error('Oracle tags import trigger returned 403')
      );

      const res = await POST_OracleTags();
      expect(res.status).toBe(403);

      const json = await res.json();
      expect(json).toEqual({ error: { message: 'Oracle tags import trigger returned 403' } });
    });
  });

  describe('GET /api/v1/admin/card-imports/[id]', () => {
    it('should fetch and return import run status', async () => {
      const mockRun: importsApi.ImportRun = {
        id: 99,
        provider: 'oracle-tags',
        query: 'oracle-tags',
        status: 'COMPLETED',
        recordsRead: 100,
        recordsCreated: 90,
        recordsUpdated: 10,
        recordsFailed: 0,
        startedAt: '2026-08-10T10:00:00Z',
        completedAt: '2026-08-10T10:01:00Z',
      };
      vi.spyOn(importsApi, 'fetchImportRunStatus').mockResolvedValue(mockRun);

      const req = new NextRequest('http://localhost/api/v1/admin/card-imports/99');
      const res = await GET_RunStatus(req, { params: Promise.resolve({ id: '99' }) });
      expect(res.status).toBe(200);

      const json = await res.json();
      expect(json).toEqual({ data: mockRun });
      expect(importsApi.fetchImportRunStatus).toHaveBeenCalledWith('99');
    });

    it('should return error when fetchImportRunStatus fails', async () => {
      vi.spyOn(importsApi, 'fetchImportRunStatus').mockRejectedValue(
        new Error('Import run status returned 404')
      );

      const req = new NextRequest('http://localhost/api/v1/admin/card-imports/99');
      const res = await GET_RunStatus(req, { params: Promise.resolve({ id: '99' }) });
      expect(res.status).toBe(404);

      const json = await res.json();
      expect(json).toEqual({ error: { message: 'Import run status returned 404' } });
    });
  });
});
