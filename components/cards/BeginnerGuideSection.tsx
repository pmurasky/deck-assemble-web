'use client';

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { BookOpen, Sparkles, Flag, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import {
  getBeginnerGuide,
  requestBeginnerGuide,
  reportBeginnerGuide,
  type BeginnerGuide,
} from '@/lib/api/beginnerGuides';

interface BeginnerGuideSectionProps {
  cardId: string;
  faceIndex?: number;
  faceName?: string;
}

function GuideField({ label, content }: { label: string; content: string | string[] }) {
  if (Array.isArray(content)) {
    return (
      <div className="space-y-1.5">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-green-400">{label}</h4>
        <ul className="list-disc pl-4 space-y-1 text-sm text-zinc-300">
          {content.map((item, idx) => (
            <li key={idx} className="leading-relaxed">{item}</li>
          ))}
        </ul>
      </div>
    );
  }

  return (
    <div className="space-y-1">
      <h4 className="text-xs font-semibold uppercase tracking-wider text-green-400">{label}</h4>
      <p className="text-sm text-zinc-300 leading-relaxed">{content}</p>
    </div>
  );
}

function GuideReportBar({
  onReport,
  isReporting,
  reportSubmitted,
}: {
  onReport: () => void;
  isReporting: boolean;
  reportSubmitted: boolean;
}) {
  if (reportSubmitted) {
    return (
      <div className="flex items-center gap-2 text-xs text-emerald-400 pt-2 border-t border-zinc-800/80">
        <CheckCircle2 className="w-3.5 h-3.5" />
        <span>Thank you for your feedback. Our team will review this guide.</span>
      </div>
    );
  }

  return (
    <div className="flex justify-end pt-2 border-t border-zinc-800/80">
      <button
        type="button"
        onClick={onReport}
        disabled={isReporting}
        className="flex items-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-300 transition-colors disabled:opacity-50 cursor-pointer"
      >
        {isReporting ? <Loader2 className="w-3 h-3 animate-spin" /> : <Flag className="w-3 h-3" />}
        <span>Report an issue</span>
      </button>
    </div>
  );
}

function GuideContent({
  guide,
  faceName,
  onReport,
  isReporting,
  reportSubmitted,
}: {
  guide: BeginnerGuide;
  faceName?: string;
  onReport: () => void;
  isReporting: boolean;
  reportSubmitted: boolean;
}) {
  return (
    <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6 space-y-5">
      <div className="flex items-center justify-between border-b border-zinc-800/80 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-green-950/50 border border-green-800/50 flex items-center justify-center text-green-400">
            <BookOpen className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-lg text-zinc-100 flex items-center gap-2">
              Beginner Guide
              {faceName && (
                <span className="text-xs font-normal text-zinc-400">({faceName})</span>
              )}
            </h3>
          </div>
        </div>
        <span className="text-[11px] font-medium px-2.5 py-0.5 rounded-full bg-green-500/10 text-green-400 border border-green-500/20">
          Rules & Play
        </span>
      </div>

      <div className="space-y-4">
        <GuideField label="Rules Summary" content={guide.summary} />
        {guide.examples && <GuideField label="In-Play Example" content={guide.examples} />}
        {guide.whenToUse && <GuideField label="When to Play" content={guide.whenToUse} />}
      </div>

      <GuideReportBar
        onReport={onReport}
        isReporting={isReporting}
        reportSubmitted={reportSubmitted}
      />
    </div>
  );
}

function NoGuidePrompt({
  onRequest,
  isRequesting,
  requestSubmitted,
  requestError,
}: {
  onRequest: () => void;
  isRequesting: boolean;
  requestSubmitted: boolean;
  requestError: string | null;
}) {
  return (
    <div className="bg-zinc-900/40 border border-zinc-800/70 rounded-xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
      <div className="space-y-1">
        <div className="flex items-center gap-2 text-zinc-200 font-semibold text-sm">
          <Sparkles className="w-4 h-4 text-green-400" />
          <span>New to this card?</span>
        </div>
        <p className="text-xs text-zinc-400">
          {requestSubmitted
            ? 'Guide requested! A beginner explanation will be generated shortly.'
            : 'Get a plain-English breakdown with rules, strategy, and play examples.'}
        </p>
        {requestError && (
          <p className="text-xs text-amber-400 flex items-center gap-1 mt-1">
            <AlertCircle className="w-3.5 h-3.5" />
            <span>{requestError}</span>
          </p>
        )}
      </div>

      {!requestSubmitted && (
        <button
          type="button"
          onClick={onRequest}
          disabled={isRequesting}
          className="flex-shrink-0 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 hover:text-white text-xs font-semibold rounded-lg border border-zinc-700 transition-colors flex items-center gap-2 cursor-pointer disabled:opacity-50"
        >
          {isRequesting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
          <span>{isRequesting ? 'Requesting...' : 'Explain this card'}</span>
        </button>
      )}
    </div>
  );
}

export function BeginnerGuideSection({
  cardId,
  faceIndex = 0,
  faceName,
}: BeginnerGuideSectionProps) {
  const { data: guide, isLoading, isError } = useQuery({
    queryKey: ['beginnerGuide', cardId, faceIndex],
    queryFn: () => getBeginnerGuide(cardId, faceIndex),
  });

  const [isRequesting, setIsRequesting] = useState(false);
  const [requestSubmitted, setRequestSubmitted] = useState(false);
  const [requestError, setRequestError] = useState<string | null>(null);

  const [isReporting, setIsReporting] = useState(false);
  const [reportSubmitted, setReportSubmitted] = useState(false);

  if (isLoading) {
    return (
      <div className="bg-zinc-900/30 border border-zinc-800/50 rounded-xl p-6 animate-pulse">
        <div className="h-5 bg-zinc-800 rounded w-1/3 mb-4" />
        <div className="h-4 bg-zinc-800/60 rounded w-full mb-2" />
        <div className="h-4 bg-zinc-800/60 rounded w-2/3" />
      </div>
    );
  }

  if (isError) {
    return null;
  }

  const handleRequest = async () => {
    setIsRequesting(true);
    setRequestError(null);
    try {
      await requestBeginnerGuide(cardId, faceIndex);
      setRequestSubmitted(true);
    } catch (err: unknown) {
      const errorObj = err as Error & { status?: number };
      if (errorObj.status === 429) {
        setRequestError('Daily generation limit reached. Please try again tomorrow.');
      } else {
        setRequestError(errorObj.message || 'Failed to request guide');
      }
    } finally {
      setIsRequesting(false);
    }
  };

  const handleReport = async () => {
    setIsReporting(true);
    try {
      await reportBeginnerGuide(cardId, faceIndex);
      setReportSubmitted(true);
    } catch {
      // Keep optimistic or silent
    } finally {
      setIsReporting(false);
    }
  };

  if (!guide) {
    return (
      <NoGuidePrompt
        onRequest={handleRequest}
        isRequesting={isRequesting}
        requestSubmitted={requestSubmitted}
        requestError={requestError}
      />
    );
  }

  return (
    <GuideContent
      guide={guide}
      faceName={faceName}
      onReport={handleReport}
      isReporting={isReporting}
      reportSubmitted={reportSubmitted}
    />
  );
}
