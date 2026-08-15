'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Sparkles, RefreshCw, AlertCircle } from 'lucide-react';
import type { ApiResponse } from '@/types/api';
import type { LatestCommanderRankRun, CommanderRankRefreshResult } from '@/lib/api/commander-ranks';

function formatRelativeDate(value: string | null) {
  if (!value) return '—';
  
  const date = new Date(value);
  const diffInSeconds = Math.floor((Date.now() - date.getTime()) / 1000);
  
  if (diffInSeconds < 60) return 'Just now';
  
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) return `${diffInMinutes} minute${diffInMinutes !== 1 ? 's' : ''} ago`;
  
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours} hour${diffInHours !== 1 ? 's' : ''} ago`;
  
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 30) return `${diffInDays} day${diffInDays !== 1 ? 's' : ''} ago`;
  
  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

async function getLatestCommanderRankRun(): Promise<LatestCommanderRankRun | null> {
  const res = await fetch('/api/v1/admin/commander-ranks/latest');
  if (!res.ok) {
    throw new Error('Failed to fetch latest commander rank run');
  }
  const json: ApiResponse<LatestCommanderRankRun | null> = await res.json();
  if (json.error) {
    throw new Error(json.error?.message || 'Unknown error fetching latest commander rank run');
  }
  return json.data ?? null;
}

async function triggerCommanderRankRefreshRun(): Promise<CommanderRankRefreshResult> {
  const res = await fetch('/api/v1/admin/commander-ranks/refresh', {
    method: 'POST',
  });
  if (!res.ok) {
    const errorJson = await res.json().catch(() => ({}));
    throw new Error(errorJson.error?.message || errorJson.errorSummary || 'Failed to refresh commander ranks');
  }
  const json: ApiResponse<CommanderRankRefreshResult> = await res.json();
  if (json.error || !json.data) {
    throw new Error(json.error?.message || 'Failed to refresh commander ranks');
  }
  return json.data;
}

export function CommanderRanksSection() {
  const [rankError, setRankError] = useState<string | null>(null);
  const [rankSuccessMessage, setRankSuccessMessage] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const { data: latestRank, isLoading: isRankLoading } = useQuery({
    queryKey: ['latestCommanderRankRun'],
    queryFn: getLatestCommanderRankRun,
  });

  const rankMutation = useMutation({
    mutationFn: triggerCommanderRankRefreshRun,
    onSuccess: (data) => {
      setRankError(null);
      setRankSuccessMessage(`Refresh completed: ${data.cardsUpdated} cards updated.`);
      queryClient.invalidateQueries({ queryKey: ['latestCommanderRankRun'] });
    },
    onError: (err: Error) => {
      setRankSuccessMessage(null);
      setRankError(err.message || 'Failed to refresh commander ranks');
    },
  });

  const handleRefresh = () => {
    setRankError(null);
    setRankSuccessMessage(null);
    rankMutation.mutate();
  };

  return (
    <div className="mb-8 rounded-xl border border-zinc-800 bg-zinc-900/50 p-5">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-400" />
            <h2 className="text-lg font-bold text-white tracking-tight">Commander Ranks</h2>
          </div>
          <p className="text-xs text-zinc-400 mt-1">
            Backfill and synchronize EDHREC popularity ranks for commander cards on demand.
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-4 text-xs">
            <div>
              <span className="text-zinc-400">Last run: </span>
              <span className="text-zinc-200 font-medium">
                {isRankLoading ? 'Loading...' : latestRank ? formatRelativeDate(latestRank.completedAt) : 'Never run yet'}
              </span>
            </div>
            {latestRank && (
              <div>
                <span className="text-zinc-400">Cards updated: </span>
                <span className="text-green-400 font-semibold">{latestRank.cardsUpdated}</span>
              </div>
            )}
          </div>
        </div>

        <button
          type="button"
          disabled={rankMutation.isPending}
          onClick={handleRefresh}
          className="bg-purple-600 hover:bg-purple-500 text-white px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 transition-colors disabled:opacity-50 whitespace-nowrap cursor-pointer"
        >
          {rankMutation.isPending ? (
            <>
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
              Refreshing...
            </>
          ) : (
            <>
              <RefreshCw className="w-4 h-4" />
              Refresh now
            </>
          )}
        </button>
      </div>

      {rankError && (
        <div className="mt-4 rounded-lg border border-red-500/30 bg-red-950/20 p-3 text-xs text-red-300 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            <span>{rankError}</span>
          </div>
          <button
            onClick={() => setRankError(null)}
            className="text-zinc-400 hover:text-white cursor-pointer px-1"
          >
            ✕
          </button>
        </div>
      )}

      {rankSuccessMessage && (
        <div className="mt-4 rounded-lg border border-green-500/30 bg-green-950/20 p-3 text-xs text-green-300 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-green-400"></span>
            <span>{rankSuccessMessage}</span>
          </div>
          <button
            onClick={() => setRankSuccessMessage(null)}
            className="text-zinc-400 hover:text-white cursor-pointer px-1"
          >
            ✕
          </button>
        </div>
      )}
    </div>
  );
}
