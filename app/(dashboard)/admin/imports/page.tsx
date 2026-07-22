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

interface ImportResult {
  runId: number;
  recordsRead: number;
  recordsCreated: number;
  recordsUpdated: number;
  recordsFailed: number;
}

async function triggerImportRun(query: string): Promise<ImportResult> {
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
  const json: ApiResponse<ImportResult> = await res.json();
  if (json.error || !json.data) {
    throw new Error(json.error?.message || 'Failed to trigger import');
  }
  return json.data;
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
  const [lastResult, setLastResult] = useState<ImportResult | null>(null);
  const [lastQuery, setLastQuery] = useState<string>('');
  const queryClient = useQueryClient();

  const { data: runs, isLoading: isRunsLoading, error } = useQuery({
    queryKey: ['importRuns'],
    queryFn: getImportRuns,
    refetchInterval: (query) => {
      const currentRuns = query.state.data as ImportRun[] | undefined;
      const isRunning = currentRuns?.some(r => r.status === 'RUNNING' || r.status === 'PENDING');
      return isRunning ? 5000 : false;
    },
  });

  const importMutation = useMutation({
    mutationFn: triggerImportRun,
    onSuccess: (data, variables) => {
      setLastResult(data);
      setLastQuery(variables);
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
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-green-500 to-purple-500 bg-clip-text text-transparent">
            CARD IMPORTS
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Import cards from Scryfall using search queries (e.g. <code className="text-green-400 bg-zinc-900 px-1 py-0.5 rounded">e:mar,spe,spm,pspm,msh,msc,lmar</code>).
          </p>
        </div>

        <form 
          onSubmit={(e) => {
            e.preventDefault();
            if (!queryInput.trim()) return;
            importMutation.mutate(queryInput);
          }}
          className="flex gap-2 w-full md:w-auto"
        >
          <input 
            type="text" 
            placeholder="Scryfall query (e.g. e:mar)" 
            value={queryInput}
            onChange={(e) => setQueryInput(e.target.value)}
            disabled={importMutation.isPending}
            className="bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:border-green-500 flex-1 md:w-80 disabled:opacity-50"
          />
          <button 
            type="submit"
            disabled={importMutation.isPending || !queryInput.trim()}
            className="bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 transition-colors disabled:opacity-50 whitespace-nowrap"
          >
            {importMutation.isPending ? (
              <>
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                Importing...
              </>
            ) : (
              <>
                <Play className="w-4 h-4" />
                Run Import
              </>
            )}
          </button>
        </form>
      </div>

      {importMutation.isPending && (
        <div className="mb-6 rounded-xl border border-green-500/30 bg-green-950/20 p-4 text-green-300 flex items-center gap-3 animate-pulse">
          <span className="w-5 h-5 border-2 border-green-500/30 border-t-green-400 rounded-full animate-spin"></span>
          <div>
            <p className="font-semibold text-sm">Importing cards from Scryfall...</p>
            <p className="text-xs text-green-400/80">This request is synchronous and may take up to 2 minutes depending on query size.</p>
          </div>
        </div>
      )}

      {lastResult && (
        <div className="mb-6 rounded-xl border border-purple-500/30 bg-purple-950/20 p-4 text-white relative flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="inline-block w-2 h-2 rounded-full bg-green-400"></span>
              <h3 className="font-bold text-sm text-purple-300">Import Completed Successfully</h3>
              {lastQuery && <span className="text-xs font-mono text-zinc-400">({lastQuery})</span>}
            </div>
            <p className="text-xs text-zinc-400 mt-1">Run ID: #{lastResult.runId} • Total Records Read: {lastResult.recordsRead}</p>
          </div>
          <div className="flex gap-4 text-xs font-medium bg-zinc-900/80 px-4 py-2 rounded-lg border border-zinc-800">
            <div>
              <span className="text-zinc-400">Created: </span>
              <span className="text-green-400 font-bold">{lastResult.recordsCreated}</span>
            </div>
            <div>
              <span className="text-zinc-400">Updated: </span>
              <span className="text-blue-400 font-bold">{lastResult.recordsUpdated}</span>
            </div>
            <div>
              <span className="text-zinc-400">Failed: </span>
              <span className={lastResult.recordsFailed > 0 ? "text-red-400 font-bold" : "text-zinc-500"}>{lastResult.recordsFailed}</span>
            </div>
          </div>
          <button 
            onClick={() => setLastResult(null)}
            className="absolute top-2 right-2 text-zinc-500 hover:text-zinc-300 text-xs px-2 py-1"
          >
            ✕
          </button>
        </div>
      )}


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
