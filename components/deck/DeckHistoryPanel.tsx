'use client';

import React, { useState, useEffect, useCallback } from 'react';
import type { DeckRevisionSummary, DeckRevisionDiff, DeckRevisionDetail } from '@/types/m3';

interface DeckHistoryPanelProps {
  deckId: number | string;
  currentRevision?: number;
  onRestoreSuccess?: (newRevisionNumber: number) => void;
}

export function DeckHistoryPanel({
  deckId,
  currentRevision,
  onRestoreSuccess,
}: DeckHistoryPanelProps) {
  const [revisions, setRevisions] = useState<DeckRevisionSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [restoringRevision, setRestoringRevision] = useState<number | null>(null);
  const [selectedRevisionDetail, setSelectedRevisionDetail] = useState<DeckRevisionDetail | null>(null);
  const [diff, setDiff] = useState<DeckRevisionDiff | null>(null);

  const fetchRevisions = useCallback(async () => {
    try {
      const res = await fetch(`/api/v1/decks/${deckId}/revisions?page=1&size=20`);
      if (!res.ok) throw new Error('Failed to load deck history');
      const payload = await res.json();
      setRevisions(payload.data?.items || []);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error loading history');
    } finally {
      setLoading(false);
    }
  }, [deckId]);

  useEffect(() => {
    let isMounted = true;
    const load = async () => {
      try {
        const res = await fetch(`/api/v1/decks/${deckId}/revisions?page=1&size=20`);
        if (!res.ok) throw new Error('Failed to load deck history');
        const payload = await res.json();
        if (isMounted) setRevisions(payload.data?.items || []);
      } catch (err: unknown) {
        if (isMounted) setError(err instanceof Error ? err.message : 'Error loading history');
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    load();
    return () => {
      isMounted = false;
    };
  }, [deckId]);

  const handleRestore = async (revNum: number) => {
    setRestoringRevision(revNum);
    setError(null);
    try {
      const res = await fetch(`/api/v1/decks/${deckId}/revisions/${revNum}/restore`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ expectedCurrentRevision: currentRevision }),
      });
      const payload = await res.json();
      if (!res.ok) {
        if (res.status === 409) {
          throw new Error('Deck has been updated since you last loaded it. Refreshing history...');
        }
        throw new Error(payload.error?.message || 'Failed to restore revision');
      }
      onRestoreSuccess?.(payload.data?.revisionNumber ?? revNum);
      await fetchRevisions();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Restore failed');
    } finally {
      setRestoringRevision(null);
    }
  };

  const inspectRevision = async (revNum: number) => {
    try {
      const res = await fetch(`/api/v1/decks/${deckId}/revisions/${revNum}`);
      if (!res.ok) throw new Error('Failed to inspect revision');
      const payload = await res.json();
      setSelectedRevisionDetail(payload.data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Inspect failed');
    }
  };

  const compareWithCurrent = async (revNum: number) => {
    try {
      const res = await fetch(`/api/v1/decks/${deckId}/revisions/${revNum}/diff/${currentRevision}`);
      if (!res.ok) throw new Error('Failed to load diff');
      const payload = await res.json();
      setDiff(payload.data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Diff failed');
    }
  };

  if (loading) {
    return (
      <div className="p-4 text-center text-gray-400">
        <span className="animate-pulse">Loading history...</span>
      </div>
    );
  }

  return (
    <div className="bg-slate-900 text-white rounded-lg p-5 border border-slate-800 space-y-4">
      <div className="flex justify-between items-center border-b border-slate-800 pb-3">
        <h3 className="text-lg font-semibold text-amber-400">Deck Revision History</h3>
        <button
          onClick={fetchRevisions}
          className="text-xs px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300"
        >
          Refresh
        </button>
      </div>

      {error && (
        <div className="p-3 bg-red-950/80 border border-red-800 text-red-300 rounded text-sm">
          {error}
        </div>
      )}

      {revisions.length === 0 ? (
        <p className="text-sm text-slate-400">No revisions found.</p>
      ) : (
        <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
          {revisions.map((rev) => (
            <div
              key={rev.id || rev.revisionNumber}
              className={`p-3.5 rounded border transition-all flex flex-col md:flex-row md:items-center justify-between gap-3 ${
                rev.revisionNumber === currentRevision
                  ? 'bg-amber-950/30 border-amber-500/50'
                  : 'bg-slate-800/50 border-slate-700/60 hover:border-slate-600'
              }`}
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-200">Revision #{rev.revisionNumber}</span>
                  <span className="text-xs px-2 py-0.5 rounded bg-slate-700 text-amber-300 font-mono">
                    {rev.changeType}
                  </span>
                  {rev.revisionNumber === currentRevision && (
                    <span className="text-xs px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-semibold border border-amber-500/30">
                      Current
                    </span>
                  )}
                </div>
                <div className="text-xs text-slate-400">
                  {new Date(rev.createdAt).toLocaleString()} {rev.createdBy && `by ${rev.createdBy}`}
                </div>
                {rev.description && <p className="text-xs text-slate-300 italic">{rev.description}</p>}
              </div>

              <div className="flex items-center gap-2 self-end md:self-auto">
                <button
                  onClick={() => inspectRevision(rev.revisionNumber)}
                  className="text-xs px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700"
                >
                  Inspect
                </button>
                <button
                  onClick={() => compareWithCurrent(rev.revisionNumber)}
                  className="text-xs px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700"
                >
                  Compare
                </button>
                {rev.revisionNumber !== currentRevision && (
                  <button
                    onClick={() => handleRestore(rev.revisionNumber)}
                    disabled={restoringRevision === rev.revisionNumber}
                    className="text-xs px-3 py-1 rounded bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-slate-950 font-semibold"
                  >
                    {restoringRevision === rev.revisionNumber ? 'Restoring...' : 'Restore'}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedRevisionDetail && (
        <div className="mt-4 p-4 rounded bg-slate-950 border border-slate-800 text-sm space-y-2">
          <div className="flex justify-between items-center">
            <h4 className="font-semibold text-amber-400">
              Snapshot: Revision #{selectedRevisionDetail.revisionNumber}
            </h4>
            <button
              onClick={() => setSelectedRevisionDetail(null)}
              className="text-xs text-slate-400 hover:text-white"
            >
              Close
            </button>
          </div>
          <p className="text-xs text-slate-300">Name: {selectedRevisionDetail.snapshot.name}</p>
          <p className="text-xs text-slate-300">Format: {selectedRevisionDetail.snapshot.formatCode}</p>
          <p className="text-xs text-slate-300">Total Cards: {selectedRevisionDetail.snapshot.cards?.length ?? 0}</p>
        </div>
      )}

      {diff && (
        <div className="mt-4 p-4 rounded bg-slate-950 border border-slate-800 text-sm space-y-2">
          <div className="flex justify-between items-center">
            <h4 className="font-semibold text-amber-400">
              Diff: Rev #{diff.revisionA} vs Rev #{diff.revisionB}
            </h4>
            <button onClick={() => setDiff(null)} className="text-xs text-slate-400 hover:text-white">
              Close
            </button>
          </div>
          {diff.cardChanges && diff.cardChanges.length > 0 ? (
            <ul className="space-y-1 text-xs">
              {diff.cardChanges.map((change, idx) => (
                <li key={idx} className="text-slate-300">
                  <span className="font-semibold">{change.cardName}</span> ({change.section}): {change.oldQuantity} &rarr; {change.newQuantity}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-xs text-slate-400">No card changes recorded between revisions.</p>
          )}
        </div>
      )}
    </div>
  );
}
