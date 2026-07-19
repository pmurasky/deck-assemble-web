'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useUser } from '@auth0/nextjs-auth0/client';
import { EmptyState } from '@/components/feedback/EmptyState';
import { LoadingSkeleton } from '@/components/feedback/LoadingSkeleton';
import { isAdmin } from '@/lib/utils/permissions';
import { ShieldAlert, Play } from 'lucide-react';
import type { ApiResponse } from '@/types/api';
import type { ImportRun } from '@/lib/api/imports';

async function getImportRuns(): Promise<ImportRun[]> {
  const res = await fetch('/api/v1/admin/card-imports');
  if (!res.ok) {
    throw new Error('Failed to fetch import history');
  }
  const json: ApiResponse<ImportRun[]> = await res.json();
  if (json.error || !json.data) {
    throw new Error(json.error?.message || 'Unknown error fetching import history');
  }
  return json.data;
}

async function triggerImportRun(query: string): Promise<void> {
  const params = new URLSearchParams();
  if (query) {
    params.set('query', query);
  }
  const res = await fetch(`/api/v1/admin/card-imports?${params.toString()}`, {
    method: 'POST',
  });
  if (!res.ok) {
    const errorJson = await res.json().catch(() => ({}));
    throw new Error(errorJson.error?.message || 'Failed to trigger import');
  }
}

function formatRelativeDate(value: string | null) {
  if (!value) {
    return '—';
  }
  
  const date = new Date(value);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
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

export default function AdminImportsPage() {
  const { user, isLoading: isUserLoading } = useUser();
  const [queryInput, setQueryInput] = useState('');
  const queryClient = useQueryClient();

  const { data: runs, isLoading: isRunsLoading, error } = useQuery({
    queryKey: ['importRuns'],
    queryFn: getImportRuns,
    // Auto-refresh every 5 seconds if we have runs and the latest one is still running
    refetchInterval: (query) => {
      const currentRuns = query.state.data as ImportRun[] | undefined;
      const isRunning = currentRuns?.some(r => r.status === 'RUNNING' || r.status === 'PENDING');
      return isRunning ? 5000 : false;
    },
  });

  const importMutation = useMutation({
    mutationFn: triggerImportRun,
    onSuccess: () => {
      setQueryInput('');
      queryClient.invalidateQueries({ queryKey: ['importRuns'] });
    },
    onError: (err: Error) => {
      alert(`Error triggering import: ${err.message}`);
    }
  });

  // Role Gating
  if (isUserLoading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <LoadingSkeleton />
      </div>
    );
  }

  if (!isAdmin(user)) {
    return (
      <div className="container mx-auto py-24 px-4 flex flex-col items-center justify-center">
        <ShieldAlert className="w-16 h-16 text-red-500 mb-4" />
        <h1 className="text-3xl font-extrabold text-white mb-2">Not Authorized</h1>
        <p className="text-zinc-400">You must be an administrator to view this page.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-green-500 to-purple-500 bg-clip-text text-transparent">
          CARD IMPORTS
        </h1>

        <form 
          onSubmit={(e) => {
            e.preventDefault();
            importMutation.mutate(queryInput);
          }}
          className="flex gap-2"
        >
          <input 
            type="text" 
            placeholder="Query (e.g. set=m20)" 
            value={queryInput}
            onChange={(e) => setQueryInput(e.target.value)}
            className="bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:border-green-500"
          />
          <button 
            type="submit"
            disabled={importMutation.isPending}
            className="bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 transition-colors disabled:opacity-50"
          >
            {importMutation.isPending ? (
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
            ) : (
              <Play className="w-4 h-4" />
            )}
            Run Import
          </button>
        </form>
      </div>

      {isRunsLoading ? (
        <LoadingSkeleton />
      ) : error ? (
        <EmptyState
          title="Unable to load import history"
          description={error instanceof Error ? error.message : 'Import history is unavailable.'}
        />
      ) : !runs || runs.length === 0 ? (
        <EmptyState title="No imports yet" description="Card imports will appear here once run." />
      ) : (
        <div className="overflow-x-auto rounded-xl border border-zinc-800">
          <table className="w-full text-sm">
            <thead className="bg-zinc-900 text-left text-zinc-400">
              <tr>
                <th className="px-4 py-3 font-semibold">Query</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 font-semibold text-right">Read</th>
                <th className="px-4 py-3 font-semibold text-right">Created</th>
                <th className="px-4 py-3 font-semibold text-right">Updated</th>
                <th className="px-4 py-3 font-semibold text-right">Skipped</th>
                <th className="px-4 py-3 font-semibold">Started</th>
                <th className="px-4 py-3 font-semibold">Completed</th>
              </tr>
            </thead>
            <tbody className="bg-zinc-950/50">
              {runs.map((run) => (
                <tr key={run.id} className="border-t border-zinc-800/50 hover:bg-zinc-900/50 transition-colors">
                  <td className="px-4 py-3 font-mono text-xs text-zinc-300">{run.query || '—'}</td>
                  <td className="px-4 py-3">
                    <span
                      className={
                        run.status === 'COMPLETED'
                          ? 'text-green-500 font-medium'
                          : run.status === 'FAILED'
                            ? 'text-red-500 font-medium'
                            : 'text-yellow-500 font-medium animate-pulse'
                      }
                    >
                      {run.status.replaceAll('_', ' ')}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right text-zinc-300">{run.recordsRead}</td>
                  <td className="px-4 py-3 text-right text-zinc-300">{run.recordsCreated}</td>
                  <td className="px-4 py-3 text-right text-zinc-300">{run.recordsUpdated}</td>
                  <td className="px-4 py-3 text-right text-zinc-300">{run.recordsFailed}</td>
                  <td className="px-4 py-3 text-zinc-400">{formatRelativeDate(run.startedAt)}</td>
                  <td className="px-4 py-3 text-zinc-400">{formatRelativeDate(run.completedAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
