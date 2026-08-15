import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET as GET_LatestCommanderRankRun } from '@/app/api/v1/admin/commander-ranks/latest/route';
import { POST as POST_RefreshCommanderRanks } from '@/app/api/v1/admin/commander-ranks/refresh/route';
import * as commanderRanksApi from '@/lib/api/commander-ranks';

vi.mock('@/lib/api/commander-ranks');

describe('Admin Commander Ranks API Routes', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  describe('GET /api/v1/admin/commander-ranks/latest', () => {
    it('should return 200 with latest run data when run exists', async () => {
      const mockRun: commanderRanksApi.LatestCommanderRankRun = {
        id: 9,
        cardsUpdated: 187,
        completedAt: '2026-08-14T06:31:00Z',
      };
      vi.spyOn(commanderRanksApi, 'fetchLatestCommanderRankRun').mockResolvedValue(mockRun);

      const res = await GET_LatestCommanderRankRun();
      expect(res.status).toBe(200);

      const json = await res.json();
      expect(json).toEqual({ data: mockRun });
      expect(commanderRanksApi.fetchLatestCommanderRankRun).toHaveBeenCalled();
    });

    it('should return 200 with data: null when no run has completed yet', async () => {
      vi.spyOn(commanderRanksApi, 'fetchLatestCommanderRankRun').mockResolvedValue(null);

      const res = await GET_LatestCommanderRankRun();
      expect(res.status).toBe(200);

      const json = await res.json();
      expect(json).toEqual({ data: null });
      expect(commanderRanksApi.fetchLatestCommanderRankRun).toHaveBeenCalled();
    });

    it('should return error status when fetchLatestCommanderRankRun fails', async () => {
      vi.spyOn(commanderRanksApi, 'fetchLatestCommanderRankRun').mockRejectedValue(
        new Error('Commander rank latest returned 500')
      );

      const res = await GET_LatestCommanderRankRun();
      expect(res.status).toBe(500);

      const json = await res.json();
      expect(json).toEqual({ error: { message: 'Commander rank latest returned 500' } });
    });
  });

  describe('POST /api/v1/admin/commander-ranks/refresh', () => {
    it('should trigger refresh and return 200 with data', async () => {
      const mockResult: commanderRanksApi.CommanderRankRefreshResult = {
        status: 'COMPLETED',
        cardsUpdated: 187,
        errorSummary: null,
      };
      vi.spyOn(commanderRanksApi, 'triggerCommanderRankRefresh').mockResolvedValue(mockResult);

      const res = await POST_RefreshCommanderRanks();
      expect(res.status).toBe(200);

      const json = await res.json();
      expect(json).toEqual({ data: mockResult });
      expect(commanderRanksApi.triggerCommanderRankRefresh).toHaveBeenCalled();
    });

    it('should handle failure when triggerCommanderRankRefresh fails with 502', async () => {
      vi.spyOn(commanderRanksApi, 'triggerCommanderRankRefresh').mockRejectedValue(
        new Error('EDHREC fetch failed or returned no data (502)')
      );

      const res = await POST_RefreshCommanderRanks();
      expect(res.status).toBe(502);

      const json = await res.json();
      expect(json).toEqual({ error: { message: 'EDHREC fetch failed or returned no data (502)' } });
    });
  });
});
