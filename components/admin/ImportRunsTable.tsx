import { EmptyState } from '@/components/feedback/EmptyState';
import { LoadingSkeleton } from '@/components/feedback/LoadingSkeleton';
import type { ImportRun } from '@/lib/api/imports';

function formatRelativeDate(value: string | null): string {
  if (!value) return '—';
  const diffInSeconds = Math.floor((Date.now() - new Date(value).getTime()) / 1000);
  if (diffInSeconds < 60) return 'Just now';
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) return `${diffInMinutes} minute${diffInMinutes !== 1 ? 's' : ''} ago`;
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours} hour${diffInHours !== 1 ? 's' : ''} ago`;
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 30) return `${diffInDays} day${diffInDays !== 1 ? 's' : ''} ago`;
  return new Date(value).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function getStatusBadgeClass(status: string): string {
  if (status === 'COMPLETED') return 'text-green-500 font-medium';
  if (status === 'FAILED') return 'text-red-500 font-medium';
  return 'text-yellow-500 font-medium animate-pulse';
}

function ImportRunRow({ run }: { run: ImportRun }) {
  return (
    <tr className="border-t border-zinc-800/50 hover:bg-zinc-900/50 transition-colors">
      <td className="px-4 py-3 font-mono text-xs text-zinc-300">{run.query || '—'}</td>
      <td className="px-4 py-3">
        <span className={getStatusBadgeClass(run.status)}>{run.status.replaceAll('_', ' ')}</span>
      </td>
      <td className="px-4 py-3 text-right text-zinc-300">{run.recordsRead}</td>
      <td className="px-4 py-3 text-right text-zinc-300">{run.recordsCreated}</td>
      <td className="px-4 py-3 text-right text-zinc-300">{run.recordsUpdated}</td>
      <td className="px-4 py-3 text-right text-zinc-300">{run.recordsFailed}</td>
      <td className="px-4 py-3 text-right text-zinc-400">{formatRelativeDate(run.startedAt)}</td>
      <td className="px-4 py-3 text-zinc-400">{formatRelativeDate(run.completedAt)}</td>
    </tr>
  );
}

interface ImportRunsTableProps {
  runs?: ImportRun[];
  isLoading: boolean;
  error?: unknown;
}

export function ImportRunsTable({ runs, isLoading, error }: ImportRunsTableProps) {
  if (isLoading) return <LoadingSkeleton />;
  if (error) {
    const message = error instanceof Error ? error.message : 'Import history is unavailable.';
    return <EmptyState title="Unable to load import history" description={message} />;
  }
  if (!runs || runs.length === 0) {
    return <EmptyState title="No imports yet" description="Card imports will appear here once run." />;
  }

  return (
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
            <ImportRunRow key={run.id} run={run} />
          ))}
        </tbody>
      </table>
    </div>
  );
}
