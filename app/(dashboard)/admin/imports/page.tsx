'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useUser } from '@auth0/nextjs-auth0/client';
import { LoadingSkeleton } from '@/components/feedback/LoadingSkeleton';
import { isAdmin } from '@/lib/utils/permissions';
import { ShieldAlert, Play, Tag, AlertCircle } from 'lucide-react';
import { CommanderRanksSection } from '@/components/admin/CommanderRanksSection';
import { SeriesCheckboxPicker } from '@/components/admin/SeriesCheckboxPicker';
import { ImportRunsTable } from '@/components/admin/ImportRunsTable';
import type { ApiResponse } from '@/types/api';
import type { ImportRun, CardSeries } from '@/lib/api/imports';

interface ImportResult {
  runId: number;
  status?: string;
  recordsRead?: number;
  recordsCreated?: number;
  recordsUpdated?: number;
  recordsFailed?: number;
}

async function getImportRuns(): Promise<ImportRun[]> {
  const res = await fetch('/api/v1/admin/card-imports');
  if (!res.ok) throw new Error('Failed to fetch import history');
  const json: ApiResponse<ImportRun[]> = await res.json();
  if (json.error || !json.data) {
    throw new Error(json.error?.message || 'Unknown error fetching import history');
  }
  return json.data;
}

async function getAvailableSeries(): Promise<CardSeries[]> {
  const res = await fetch('/api/v1/admin/card-imports/series');
  if (!res.ok) throw new Error('Failed to fetch available series');
  const json: ApiResponse<CardSeries[]> = await res.json();
  if (json.error || !json.data) {
    throw new Error(json.error?.message || 'Unknown error fetching available series');
  }
  return json.data;
}

async function triggerImportRun(seriesKeys: string[]): Promise<ImportResult> {
  const params = new URLSearchParams();
  if (seriesKeys.length > 0) {
    params.set('seriesKeys', seriesKeys.join(','));
  }
  const res = await fetch(`/api/v1/admin/card-imports?${params.toString()}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ seriesKeys }),
  });
  if (!res.ok && res.status !== 202) {
    const errorJson = await res.json().catch(() => ({}));
    throw new Error(errorJson.error?.message || 'Failed to trigger import');
  }
  const json: ApiResponse<ImportResult> = await res.json();
  if (json.error || !json.data) throw new Error(json.error?.message || 'Failed to trigger import');
  return json.data;
}

async function triggerOracleTagsImportRun(): Promise<ImportResult> {
  const res = await fetch('/api/v1/admin/card-imports/oracle-tags', { method: 'POST' });
  if (!res.ok && res.status !== 202) {
    const errorJson = await res.json().catch(() => ({}));
    throw new Error(errorJson.error?.message || 'Failed to trigger oracle tags import');
  }
  const json: ApiResponse<ImportResult> = await res.json();
  if (json.error || !json.data) {
    throw new Error(json.error?.message || 'Failed to trigger oracle tags import');
  }
  return json.data;
}

function ImportPollingBanner({ activeRunId }: { activeRunId: number | null }) {
  return (
    <div className="mb-6 rounded-xl border border-green-500/30 bg-green-950/20 p-4 text-green-300 flex items-center gap-3 animate-pulse">
      <span className="w-5 h-5 border-2 border-green-500/30 border-t-green-400 rounded-full animate-spin" />
      <div>
        <p className="font-semibold text-sm">
          Importing cards from Scryfall {activeRunId ? `(Run #${activeRunId})` : ''}...
        </p>
        <p className="text-xs text-green-400/80">
          Import task accepted (HTTP 202). Polling import status until completion...
        </p>
      </div>
    </div>
  );
}

function ResultCountsBadge({ result }: { result: ImportResult }) {
  const failedCount = result.recordsFailed ?? 0;
  return (
    <div className="flex gap-4 text-xs font-medium bg-zinc-900/80 px-4 py-2 rounded-lg border border-zinc-800">
      <div><span className="text-zinc-400">Created: </span><span className="text-green-400 font-bold">{result.recordsCreated ?? 0}</span></div>
      <div><span className="text-zinc-400">Updated: </span><span className="text-blue-400 font-bold">{result.recordsUpdated ?? 0}</span></div>
      <div><span className="text-zinc-400">Failed: </span><span className={failedCount > 0 ? 'text-red-400 font-bold' : 'text-zinc-500'}>{failedCount}</span></div>
    </div>
  );
}

interface ImportResultCardProps {
  result: ImportResult;
  lastQuery: string;
  onDismiss: () => void;
}

function ImportResultCard({ result, lastQuery, onDismiss }: ImportResultCardProps) {
  const isFailed = result.status === 'FAILED';
  return (
    <div className="mb-6 rounded-xl border border-purple-500/30 bg-purple-950/20 p-4 text-white relative flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
      <div>
        <div className="flex items-center gap-2">
          <span className={`inline-block w-2 h-2 rounded-full ${isFailed ? 'bg-red-400' : 'bg-green-400'}`} />
          <h3 className="font-bold text-sm text-purple-300">
            {isFailed ? 'Import Failed' : 'Import Completed Successfully'}
          </h3>
          {lastQuery && <span className="text-xs font-mono text-zinc-400">({lastQuery})</span>}
        </div>
        <p className="text-xs text-zinc-400 mt-1">Run ID: #{result.runId} • Total Records Read: {result.recordsRead ?? 0}</p>
      </div>
      <ResultCountsBadge result={result} />
      <button onClick={onDismiss} className="absolute top-2 right-2 text-zinc-500 hover:text-zinc-300 text-xs px-2 py-1 cursor-pointer">
        ✕
      </button>
    </div>
  );
}

interface ActionButtonsProps {
  isImporting: boolean;
  isImportPending: boolean;
  selectedCount: number;
  isOracleTagsPending: boolean;
  onRunImport: () => void;
  onSyncOracleTags: () => void;
}

function ActionButtons({
  isImporting,
  isImportPending,
  selectedCount,
  isOracleTagsPending,
  onRunImport,
  onSyncOracleTags,
}: ActionButtonsProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
      <button
        type="button"
        disabled={isImporting || selectedCount === 0}
        onClick={onRunImport}
        className="bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 transition-colors disabled:opacity-50 whitespace-nowrap cursor-pointer justify-center"
      >
        {isImportPending ? (
          <>
            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            Importing...
          </>
        ) : (
          <>
            <Play className="w-4 h-4" />
            Run Import
          </>
        )}
      </button>

      <button
        type="button"
        disabled={isImporting}
        onClick={onSyncOracleTags}
        className="bg-purple-600 hover:bg-purple-500 text-white px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 transition-colors disabled:opacity-50 whitespace-nowrap cursor-pointer justify-center"
      >
        {isOracleTagsPending ? (
          <>
            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            Triggering...
          </>
        ) : (
          <>
            <Tag className="w-4 h-4" />
            Sync Oracle Tags
          </>
        )}
      </button>
    </div>
  );
}

function UnauthorizedView() {
  return (
    <div className="container mx-auto py-24 px-4 flex flex-col items-center justify-center">
      <ShieldAlert className="w-16 h-16 text-red-500 mb-4" />
      <h1 className="text-3xl font-extrabold text-white mb-2">Not Authorized</h1>
      <p className="text-zinc-400">You must be an administrator to view this page.</p>
    </div>
  );
}

export default function AdminImportsPage() {
  const { user, isLoading: isUserLoading } = useUser();
  const [selectedSeries, setSelectedSeries] = useState<string[]>([]);
  const [activeRunId, setActiveRunId] = useState<number | null>(null);
  const [lastResult, setLastResult] = useState<ImportResult | null>(null);
  const [lastQuery, setLastQuery] = useState<string>('');
  const queryClient = useQueryClient();

  const { data: runs, isLoading: isRunsLoading, error: runsError } = useQuery({
    queryKey: ['importRuns'],
    queryFn: getImportRuns,
    refetchInterval: (query) => {
      const currentRuns = query.state.data as ImportRun[] | undefined;
      const isRunning = activeRunId !== null || currentRuns?.some((r) => r.status === 'RUNNING' || r.status === 'PENDING');
      return isRunning ? 1500 : false;
    },
  });

  const { data: seriesList, isLoading: isSeriesLoading, error: seriesError } = useQuery({
    queryKey: ['adminCardImportSeries'],
    queryFn: getAvailableSeries,
  });

  if (activeRunId && runs) {
    const activeRun = runs.find((r) => r.id === activeRunId);
    if (activeRun && activeRun.status !== 'RUNNING' && activeRun.status !== 'PENDING') {
      setActiveRunId(null);
      setLastResult({
        runId: activeRun.id,
        status: activeRun.status,
        recordsRead: activeRun.recordsRead,
        recordsCreated: activeRun.recordsCreated,
        recordsUpdated: activeRun.recordsUpdated,
        recordsFailed: activeRun.recordsFailed,
      });
    }
  }

  const importMutation = useMutation({
    mutationFn: triggerImportRun,
    onSuccess: (data, variables) => {
      setLastQuery(variables.join(', '));
      if (data.runId) setActiveRunId(data.runId);
      if (data.recordsRead !== undefined && data.recordsRead > 0 && data.status !== 'RUNNING' && data.status !== 'PENDING') {
        setLastResult(data);
      }
      queryClient.invalidateQueries({ queryKey: ['importRuns'] });
    },
    onError: (err: Error) => alert(`Error triggering import: ${err.message}`),
  });

  const oracleTagsMutation = useMutation({
    mutationFn: triggerOracleTagsImportRun,
    onSuccess: (data) => {
      setLastQuery('oracle-tags');
      if (data.runId) setActiveRunId(data.runId);
      if (data.recordsRead !== undefined && data.recordsRead > 0 && data.status !== 'RUNNING' && data.status !== 'PENDING') {
        setLastResult(data);
      }
      queryClient.invalidateQueries({ queryKey: ['importRuns'] });
    },
    onError: (err: Error) => alert(`Error triggering oracle tags import: ${err.message}`),
  });

  const isImporting = importMutation.isPending || oracleTagsMutation.isPending || activeRunId !== null;

  if (isUserLoading) return <div className="container mx-auto py-8 px-4"><LoadingSkeleton /></div>;
  if (!isAdmin(user)) return <UnauthorizedView />;

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-green-500 to-purple-500 bg-clip-text text-transparent">
            CARD IMPORTS
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Select one or more card series to import from Scryfall.
          </p>
        </div>

        <ActionButtons
          isImporting={isImporting}
          isImportPending={importMutation.isPending}
          selectedCount={selectedSeries.length}
          isOracleTagsPending={oracleTagsMutation.isPending}
          onRunImport={() => importMutation.mutate(selectedSeries)}
          onSyncOracleTags={() => oracleTagsMutation.mutate()}
        />
      </div>

      <div className="mb-6 rounded-xl border border-zinc-800 bg-zinc-900/50 p-4">
        <h2 className="text-sm font-semibold text-zinc-300 mb-3">Available Series</h2>
        {isSeriesLoading ? (
          <div className="text-xs text-zinc-500">Loading series...</div>
        ) : seriesError ? (
          <div className="rounded-lg border border-red-500/30 bg-red-950/20 p-3 text-xs text-red-300 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            <span>{seriesError instanceof Error ? seriesError.message : 'Failed to load available series'}</span>
          </div>
        ) : (
          <SeriesCheckboxPicker
            series={seriesList || []}
            selectedKeys={selectedSeries}
            onChange={setSelectedSeries}
            disabled={isImporting}
          />
        )}
      </div>

      <CommanderRanksSection />

      {isImporting && <ImportPollingBanner activeRunId={activeRunId} />}

      {lastResult && (
        <ImportResultCard
          result={lastResult}
          lastQuery={lastQuery}
          onDismiss={() => setLastResult(null)}
        />
      )}

      <ImportRunsTable runs={runs} isLoading={isRunsLoading} error={runsError} />
    </div>
  );
}
