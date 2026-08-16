'use client';

import React, { useState } from 'react';
import {
  BookOpen,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Loader2,
  RefreshCw,
  Trash2,
  Save,
  Send,
  ChevronDown,
  ChevronUp,
  X,
} from 'lucide-react';
import {
  updateAdminBeginnerGuide,
  publishAdminBeginnerGuide,
  regenerateAdminBeginnerGuide,
  rejectAdminBeginnerGuide,
  type AdminBeginnerGuideItem,
  type BeginnerGuideReviewStatus,
} from '@/lib/api/beginnerGuides';

export interface BeginnerGuideEditPanelProps {
  guide: AdminBeginnerGuideItem;
  onClose?: () => void;
  onPublishSuccess?: (publishedItem: AdminBeginnerGuideItem) => void;
  onRegenerateSuccess?: (regeneratedItem: AdminBeginnerGuideItem) => void;
  onRejectSuccess?: (cardId: string) => void;
  onSaveSuccess?: (updatedItem: AdminBeginnerGuideItem) => void;
}

function GuideStatusBadge({ status }: { status: BeginnerGuideReviewStatus }) {
  const styles: Record<BeginnerGuideReviewStatus, string> = {
    DRAFT: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
    STALE: 'bg-orange-500/10 text-orange-400 border-orange-500/30',
    REPORTED: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
    PUBLISHED: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
  };

  return (
    <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${styles[status] ?? styles.DRAFT}`}>
      {status}
    </span>
  );
}

function SourceRulingsViewer({
  rulings,
  isExpanded,
  onToggle,
}: {
  rulings?: string | string[] | null;
  isExpanded: boolean;
  onToggle: () => void;
}) {
  const rulingsList = Array.isArray(rulings)
    ? rulings
    : typeof rulings === 'string' && rulings.trim()
    ? [rulings]
    : [];

  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-950/60 p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-purple-400" />
          <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-300">
            Source Rulings Snapshot ({rulingsList.length})
          </h4>
        </div>
        <button
          type="button"
          onClick={onToggle}
          aria-label="Toggle Rulings"
          className="text-xs text-zinc-400 hover:text-white flex items-center gap-1 cursor-pointer"
        >
          <span>{isExpanded ? 'Hide' : 'Show'}</span>
          {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>
      </div>

      {isExpanded && (
        <div className="space-y-2 max-h-60 overflow-y-auto text-xs text-zinc-300 pt-2 border-t border-zinc-800/80">
          {rulingsList.length > 0 ? (
            rulingsList.map((ruling, idx) => (
              <div key={idx} className="p-2.5 rounded-lg bg-zinc-900/80 border border-zinc-800 text-zinc-300 leading-relaxed">
                {ruling}
              </div>
            ))
          ) : (
            <p className="text-zinc-500 italic py-2">No source rulings snapshot recorded for this card.</p>
          )}
        </div>
      )}
    </div>
  );
}

interface ActionButtonsProps {
  isSaving: boolean;
  isPublishing: boolean;
  isRegenerating: boolean;
  isRejecting: boolean;
  onSave: () => void;
  onPublish: () => void;
  onRegenerate: () => void;
  onReject: () => void;
}

function ActionButtonsBar({
  isSaving,
  isPublishing,
  isRegenerating,
  isRejecting,
  onSave,
  onPublish,
  onRegenerate,
  onReject,
}: ActionButtonsProps) {
  const isBusy = isSaving || isPublishing || isRegenerating || isRejecting;

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-zinc-800/80">
      <div className="flex items-center gap-2">
        <button
          type="button"
          disabled={isBusy}
          onClick={onSave}
          className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold rounded-lg border border-zinc-700 transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
        >
          {isSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
          <span>Save Draft</span>
        </button>

        <button
          type="button"
          disabled={isBusy}
          onClick={onRegenerate}
          className="px-4 py-2 bg-purple-950/60 hover:bg-purple-900/80 text-purple-300 text-xs font-semibold rounded-lg border border-purple-800/60 transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
        >
          {isRegenerating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
          <span>Regenerate</span>
        </button>
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          disabled={isBusy}
          onClick={onReject}
          className="px-4 py-2 bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 text-xs font-semibold rounded-lg border border-rose-800/50 transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
        >
          {isRejecting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
          <span>Reject</span>
        </button>

        <button
          type="button"
          disabled={isBusy}
          onClick={onPublish}
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg shadow-md transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
        >
          {isPublishing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
          <span>Publish</span>
        </button>
      </div>
    </div>
  );
}

function BeginnerGuideForm({
  guide,
  onClose,
  onPublishSuccess,
  onRegenerateSuccess,
  onRejectSuccess,
  onSaveSuccess,
}: BeginnerGuideEditPanelProps) {
  const [summary, setSummary] = useState(guide.summary || '');
  const [examples, setExamples] = useState(
    Array.isArray(guide.examples) ? guide.examples.join('\n') : guide.examples || ''
  );
  const [whenToUse, setWhenToUse] = useState(guide.whenToUse || '');
  const [isRulingsExpanded, setIsRulingsExpanded] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const [isSaving, setIsSaving] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [isRejecting, setIsRejecting] = useState(false);

  const handleApiError = (err: unknown, fallback: string) => {
    const errorObj = err as Error & { status?: number };
    if (errorObj?.status === 403 || errorObj?.message?.includes('403')) {
      setErrorMessage('Access denied: Administrator privileges required (403)');
    } else if (errorObj?.status === 404 || errorObj?.message?.includes('404')) {
      setErrorMessage('Guide not found or already removed (404)');
    } else {
      setErrorMessage(errorObj?.message || fallback);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    setErrorMessage(null);
    setSuccessMessage(null);
    try {
      const updated = await updateAdminBeginnerGuide(guide.cardId, { summary, examples, whenToUse });
      setSuccessMessage('Guide changes saved successfully.');
      onSaveSuccess?.(updated);
    } catch (err) {
      handleApiError(err, 'Failed to save guide changes');
    } finally {
      setIsSaving(false);
    }
  };

  const handlePublish = async () => {
    setIsPublishing(true);
    setErrorMessage(null);
    setSuccessMessage(null);
    try {
      const published = await publishAdminBeginnerGuide(guide.cardId);
      setSuccessMessage('Guide published successfully.');
      onPublishSuccess?.(published);
    } catch (err) {
      handleApiError(err, 'Failed to publish guide');
    } finally {
      setIsPublishing(false);
    }
  };

  const handleRegenerate = async () => {
    setIsRegenerating(true);
    setErrorMessage(null);
    setSuccessMessage(null);
    try {
      const regenerated = await regenerateAdminBeginnerGuide(guide.cardId);
      setSummary(regenerated.summary || '');
      setExamples(Array.isArray(regenerated.examples) ? regenerated.examples.join('\n') : regenerated.examples || '');
      setWhenToUse(regenerated.whenToUse || '');
      setSuccessMessage('New guide draft generated.');
      onRegenerateSuccess?.(regenerated);
    } catch (err) {
      handleApiError(err, 'Failed to regenerate guide');
    } finally {
      setIsRegenerating(false);
    }
  };

  const handleReject = async () => {
    setIsRejecting(true);
    setErrorMessage(null);
    setSuccessMessage(null);
    try {
      await rejectAdminBeginnerGuide(guide.cardId);
      onRejectSuccess?.(guide.cardId);
    } catch (err) {
      handleApiError(err, 'Failed to reject guide');
    } finally {
      setIsRejecting(false);
    }
  };

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-2xl space-y-6">
      <div className="flex items-start justify-between gap-4 border-b border-zinc-800 pb-4">
        <div>
          <div className="flex items-center gap-3">
            <h3 className="text-xl font-black text-white tracking-tight">{guide.cardName}</h3>
            <GuideStatusBadge status={guide.status} />
          </div>
          <p className="text-xs font-mono text-zinc-500 mt-1">ID: {guide.cardId}</p>
        </div>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            aria-label="Close edit panel"
            className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {errorMessage && (
        <div className="rounded-xl border border-rose-500/30 bg-rose-950/30 p-3.5 text-xs text-rose-300 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{errorMessage}</span>
          </div>
          <button onClick={() => setErrorMessage(null)} className="text-zinc-400 hover:text-white cursor-pointer px-1">
            ✕
          </button>
        </div>
      )}

      {successMessage && (
        <div className="rounded-xl border border-emerald-500/30 bg-emerald-950/30 p-3.5 text-xs text-emerald-300 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{successMessage}</span>
          </div>
          <button onClick={() => setSuccessMessage(null)} className="text-zinc-400 hover:text-white cursor-pointer px-1">
            ✕
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="space-y-1.5">
            <label htmlFor="guide-summary" className="block text-xs font-bold uppercase tracking-wider text-emerald-400">
              Rules Summary
            </label>
            <textarea
              id="guide-summary"
              rows={4}
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              placeholder="Plain-English explanation of core mechanics and card rules..."
              className="w-full rounded-xl bg-zinc-950/90 border border-zinc-800 p-3 text-sm text-zinc-200 focus:border-emerald-500 focus:outline-none transition-colors leading-relaxed"
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="guide-examples" className="block text-xs font-bold uppercase tracking-wider text-emerald-400">
              In-Play Examples
            </label>
            <textarea
              id="guide-examples"
              rows={3}
              value={examples}
              onChange={(e) => setExamples(e.target.value)}
              placeholder="Concrete play scenario or example..."
              className="w-full rounded-xl bg-zinc-950/90 border border-zinc-800 p-3 text-sm text-zinc-200 focus:border-emerald-500 focus:outline-none transition-colors leading-relaxed"
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="guide-when-to-use" className="block text-xs font-bold uppercase tracking-wider text-emerald-400">
              When to Play
            </label>
            <textarea
              id="guide-when-to-use"
              rows={3}
              value={whenToUse}
              onChange={(e) => setWhenToUse(e.target.value)}
              placeholder="Strategic guidance on when and why to cast this card..."
              className="w-full rounded-xl bg-zinc-950/90 border border-zinc-800 p-3 text-sm text-zinc-200 focus:border-emerald-500 focus:outline-none transition-colors leading-relaxed"
            />
          </div>
        </div>

        <div className="space-y-4">
          <SourceRulingsViewer
            rulings={guide.sourceRulingsSnapshot}
            isExpanded={isRulingsExpanded}
            onToggle={() => setIsRulingsExpanded((prev) => !prev)}
          />

          <div className="rounded-xl border border-zinc-800 bg-zinc-950/60 p-4 text-xs text-zinc-400 space-y-2">
            <div className="flex items-center gap-1.5 font-semibold text-zinc-300">
              <Sparkles className="w-3.5 h-3.5 text-purple-400" />
              <span>Review Guidance</span>
            </div>
            <p className="leading-relaxed">
              Verify accuracy against the official MTG rulings snapshot. Ensure explanations are beginner-accessible without jargon.
            </p>
          </div>
        </div>
      </div>

      <ActionButtonsBar
        isSaving={isSaving}
        isPublishing={isPublishing}
        isRegenerating={isRegenerating}
        isRejecting={isRejecting}
        onSave={handleSave}
        onPublish={handlePublish}
        onRegenerate={handleRegenerate}
        onReject={handleReject}
      />
    </div>
  );
}

export function BeginnerGuideEditPanel(props: BeginnerGuideEditPanelProps) {
  return <BeginnerGuideForm key={props.guide.cardId} {...props} />;
}
