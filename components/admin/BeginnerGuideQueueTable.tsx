'use client';

import React from 'react';
import {
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  CheckCircle2,
  Edit3,
  Loader2,
} from 'lucide-react';
import type { AdminBeginnerGuideItem, BeginnerGuideReviewStatus } from '@/lib/api/beginnerGuides';

export interface BeginnerGuideQueueTableProps {
  items: AdminBeginnerGuideItem[];
  totalElements: number;
  currentPage: number;
  pageSize: number;
  isLoading?: boolean;
  error?: Error | null;
  selectedCardId?: string | null;
  onSelectGuide: (guide: AdminBeginnerGuideItem) => void;
  onPageChange: (newPage: number) => void;
}

function StatusPill({ status }: { status: BeginnerGuideReviewStatus }) {
  const styles: Record<BeginnerGuideReviewStatus, string> = {
    DRAFT: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
    STALE: 'bg-orange-500/10 text-orange-400 border-orange-500/30',
    REPORTED: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
    PUBLISHED: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
  };

  return (
    <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${styles[status] ?? styles.DRAFT}`}>
      {status}
    </span>
  );
}

function EmptyQueueState() {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center bg-zinc-900/30 rounded-2xl border border-zinc-800">
      <div className="w-12 h-12 rounded-2xl bg-emerald-950/60 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-3">
        <CheckCircle2 className="w-6 h-6" />
      </div>
      <h3 className="text-base font-bold text-white">Review Queue is Clear</h3>
      <p className="text-xs text-zinc-400 mt-1 max-w-sm">
        No beginner guides currently require moderation or attention. All drafts, stale guides, and reports have been processed.
      </p>
    </div>
  );
}

function QueueLoadingState() {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center bg-zinc-900/30 rounded-2xl border border-zinc-800 space-y-3">
      <Loader2 className="w-8 h-8 text-purple-400 animate-spin" />
      <p className="text-xs text-zinc-400">Loading review queue...</p>
    </div>
  );
}

function PaginationBar({
  currentPage,
  pageSize,
  totalElements,
  itemCount,
  onPageChange,
}: {
  currentPage: number;
  pageSize: number;
  totalElements: number;
  itemCount: number;
  onPageChange: (newPage: number) => void;
}) {
  const totalPages = Math.max(1, Math.ceil(totalElements / pageSize));
  const startItem = totalElements > 0 ? currentPage * pageSize + 1 : 0;
  const endItem = Math.min(currentPage * pageSize + itemCount, totalElements);

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3 border-t border-zinc-800 text-xs text-zinc-400">
      <div>
        Showing {startItem} to {endItem} of {totalElements} items
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          disabled={currentPage === 0}
          onClick={() => onPageChange(currentPage - 1)}
          className="p-1.5 rounded-lg border border-zinc-800 bg-zinc-900 text-zinc-300 hover:text-white hover:bg-zinc-800 disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed flex items-center gap-1"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
          <span>Previous</span>
        </button>

        <span className="px-2 font-medium text-zinc-300">
          Page {currentPage + 1} of {totalPages}
        </span>

        <button
          type="button"
          disabled={endItem >= totalElements}
          onClick={() => onPageChange(currentPage + 1)}
          className="p-1.5 rounded-lg border border-zinc-800 bg-zinc-900 text-zinc-300 hover:text-white hover:bg-zinc-800 disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed flex items-center gap-1"
        >
          <span>Next</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}

function GuideTableRow({
  guide,
  isSelected,
  onSelect,
}: {
  guide: AdminBeginnerGuideItem;
  isSelected: boolean;
  onSelect: () => void;
}) {
  return (
    <tr
      data-testid={`guide-row-${guide.cardId}`}
      className={`border-b border-zinc-800/60 hover:bg-zinc-800/30 transition-colors ${
        isSelected ? 'bg-purple-950/20 border-l-2 border-purple-500' : ''
      }`}
    >
      <td className="py-3.5 px-4">
        <div className="font-bold text-sm text-zinc-100">{guide.cardName}</div>
        <div className="font-mono text-[11px] text-zinc-500">{guide.cardId}</div>
      </td>
      <td className="py-3.5 px-4">
        <StatusPill status={guide.status} />
      </td>
      <td className="py-3.5 px-4 max-w-xs md:max-w-md">
        <p className="text-xs text-zinc-300 line-clamp-2 leading-relaxed">{guide.summary}</p>
      </td>
      <td className="py-3.5 px-4 text-right">
        <button
          type="button"
          onClick={onSelect}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 ml-auto transition-colors cursor-pointer ${
            isSelected
              ? 'bg-purple-600 text-white'
              : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700'
          }`}
        >
          <Edit3 className="w-3 h-3" />
          <span>Review</span>
        </button>
      </td>
    </tr>
  );
}

export function BeginnerGuideQueueTable({
  items,
  totalElements,
  currentPage,
  pageSize,
  isLoading,
  error,
  selectedCardId,
  onSelectGuide,
  onPageChange,
}: BeginnerGuideQueueTableProps) {
  if (isLoading) {
    return <QueueLoadingState />;
  }

  if (error) {
    return (
      <div className="rounded-xl border border-rose-500/30 bg-rose-950/20 p-4 text-xs text-rose-300 flex items-center gap-2">
        <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
        <span>{error.message || 'Failed to load beginner guides queue'}</span>
      </div>
    );
  }

  if (items.length === 0) {
    return <EmptyQueueState />;
  }

  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 shadow-xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-zinc-800 bg-zinc-950/60 text-[11px] font-bold uppercase tracking-wider text-zinc-400">
              <th className="py-3 px-4">Card</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4">Summary Preview</th>
              <th className="py-3 px-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody>
            {items.map((guide) => (
              <GuideTableRow
                key={guide.cardId}
                guide={guide}
                isSelected={selectedCardId === guide.cardId}
                onSelect={() => onSelectGuide(guide)}
              />
            ))}
          </tbody>
        </table>
      </div>

      <PaginationBar
        currentPage={currentPage}
        pageSize={pageSize}
        totalElements={totalElements}
        itemCount={items.length}
        onPageChange={onPageChange}
      />
    </div>
  );
}
