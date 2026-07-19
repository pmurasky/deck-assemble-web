'use client';

import { useQuery } from '@tanstack/react-query';
import { EmptyState } from '@/components/feedback/EmptyState';
import { LoadingSkeleton } from '@/components/feedback/LoadingSkeleton';
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

function formatDate(value: string | null) {
  if (!value) {
    return '—';
  }
  return new Date(value).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

export default function AdminImportsPage() {
  const { data: runs, isLoading, error } = useQuery({
    queryKey: ['importRuns'],
    queryFn: getImportRuns,
  });

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-extrabold tracking-tight mb-8 bg-gradient-to-r from-green-500 to-purple-500 bg-clip-text text-transparent">
        CARD IMPORTS
      </h1>

      {isLoading ? (
        <LoadingSkeleton />
      ) : error ? (
        <EmptyState
          title="Unable to load import history"
          description={error instanceof Error ? error.message : 'Import history is unavailable.'}
        />
      ) : !runs || runs.length === 0 ? (
        <EmptyState title="No imports yet" description="Card imports will appear here once run." />
      ) : (
        <div className="overflow-x-auto rounded-xl border border-border">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-left">
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
            <tbody>
              {runs.map((run) => (
                <tr key={run.id} className="border-t border-border">
                  <td className="px-4 py-3 font-mono text-xs">{run.query}</td>
                  <td className="px-4 py-3">
                    <span
                      className={
                        run.status === 'COMPLETED'
                          ? 'text-green-500'
                          : run.status === 'FAILED'
                            ? 'text-red-500'
                            : 'text-yellow-500'
                      }
                    >
                      {run.status.replaceAll('_', ' ')}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">{run.recordsRead}</td>
                  <td className="px-4 py-3 text-right">{run.recordsCreated}</td>
                  <td className="px-4 py-3 text-right">{run.recordsUpdated}</td>
                  <td className="px-4 py-3 text-right">{run.recordsFailed}</td>
                  <td className="px-4 py-3">{formatDate(run.startedAt)}</td>
                  <td className="px-4 py-3">{formatDate(run.completedAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
