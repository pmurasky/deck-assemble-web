import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  fetchLatestCommanderRankRun,
  triggerCommanderRankRefresh,
  type LatestCommanderRankRun,
  type CommanderRankRefreshResult,
} from '@/lib/api/commander-ranks';

vi.mock('@/lib/auth0', () => ({
  auth0: {
    getAccessToken: vi.fn().mockResolvedValue({ token: 'test-admin-token' }),
  },
}));

describe('Commander Ranks API Client', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe('fetchLatestCommanderRankRun', () => {
    it('should return latest commander rank run when 200 OK', async () => {
      const mockRun: LatestCommanderRankRun = {
        id: 9,
        cardsUpdated: 187,
        completedAt: '2026-08-14T06:31:00Z',
      };

      globalThis.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => mockRun,
      } as Response);

      const result = await fetchLatestCommanderRankRun();

      expect(globalThis.fetch).toHaveBeenCalledWith(
        expect.objectContaining({
          href: expect.stringContaining('/api/v1/admin/commander-ranks/latest'),
        }),
        expect.objectContaining({
          cache: 'no-store',
          headers: expect.objectContaining({ Authorization: 'Bearer test-admin-token' }),
        })
      );
      expect(result).toEqual(mockRun);
    });

    it('should return null when 404 Not Found (no run completed yet)', async () => {
      globalThis.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 404,
      } as Response);

      const result = await fetchLatestCommanderRankRun();

      expect(result).toBeNull();
    });

    it('should throw error when server returns unexpected error status', async () => {
      globalThis.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 500,
      } as Response);

      await expect(fetchLatestCommanderRankRun()).rejects.toThrow('Commander rank latest returned 500');
    });
  });

  describe('triggerCommanderRankRefresh', () => {
    it('should trigger POST /api/v1/admin/commander-ranks/refresh and return result', async () => {
      const mockResult: CommanderRankRefreshResult = {
        status: 'COMPLETED',
        cardsUpdated: 187,
        errorSummary: null,
      };

      globalThis.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => mockResult,
      } as Response);

      const result = await triggerCommanderRankRefresh();

      expect(globalThis.fetch).toHaveBeenCalledWith(
        expect.objectContaining({
          href: expect.stringContaining('/api/v1/admin/commander-ranks/refresh'),
        }),
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({ Authorization: 'Bearer test-admin-token' }),
        })
      );
      expect(result).toEqual(mockResult);
    });

    it('should throw error with errorSummary when trigger fails with 502', async () => {
      globalThis.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 502,
        json: async () => ({
          status: 'FAILED',
          cardsUpdated: 0,
          errorSummary: 'EDHREC fetch failed or returned no data',
        }),
      } as Response);

      await expect(triggerCommanderRankRefresh()).rejects.toThrow('EDHREC fetch failed or returned no data');
    });

    it('should throw default status error if json parsing fails on non-ok response', async () => {
      globalThis.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 500,
        json: async () => {
          throw new Error('Invalid JSON');
        },
      } as unknown as Response);

      await expect(triggerCommanderRankRefresh()).rejects.toThrow('Commander rank refresh trigger returned 500');
    });
  });
});
