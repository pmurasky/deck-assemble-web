'use client';

import React, { useState } from 'react';
import type { DeckVisibility, PublishDeckResponse } from '@/types/m3';
import { ReadinessSummaryView, type DeckReadinessSummary } from './ReadinessSummaryView';

interface DeckPublishingModalProps {
  deckId: number | string;
  initialVisibility?: DeckVisibility;
  initialSlug?: string;
  initialPrimerTitle?: string;
  initialPrimerContent?: string;
  isOpen: boolean;
  onClose: () => void;
  readinessSummary?: DeckReadinessSummary;
}

export function DeckPublishingModal({
  deckId,
  initialVisibility = 'PRIVATE',
  initialSlug = '',
  initialPrimerTitle = '',
  initialPrimerContent = '',
  isOpen,
  onClose,
  readinessSummary,
}: DeckPublishingModalProps) {
  const [visibility, setVisibility] = useState<DeckVisibility>(initialVisibility);
  const [slug, setSlug] = useState<string>(initialSlug);
  const [publishedData, setPublishedData] = useState<PublishDeckResponse | null>(null);

  const [primerTitle, setPrimerTitle] = useState<string>(initialPrimerTitle);
  const [primerContent, setPrimerContent] = useState<string>(initialPrimerContent);
  const [activeTab, setActiveTab] = useState<'edit' | 'preview'>('edit');

  const [updatingVisibility, setUpdatingVisibility] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [savingPrimer, setSavingPrimer] = useState(false);

  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  if (!isOpen) return null;

  const handleVisibilityChange = async (newVis: DeckVisibility) => {
    setUpdatingVisibility(true);
    setMessage(null);
    try {
      const res = await fetch(`/api/v1/decks/${deckId}/publishing`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ visibility: newVis }),
      });
      const payload = await res.json();
      if (!res.ok) throw new Error(payload.error?.message || 'Failed to update visibility');
      setVisibility(payload.data.visibility);
      setMessage({ type: 'success', text: `Visibility updated to ${newVis.toLowerCase()}.` });
    } catch (err: unknown) {
      setMessage({ type: 'error', text: err instanceof Error ? err.message : 'Error changing visibility' });
    } finally {
      setUpdatingVisibility(false);
    }
  };

  const handlePublish = async () => {
    setPublishing(true);
    setMessage(null);
    try {
      const res = await fetch(`/api/v1/decks/${deckId}/publish`, {
        method: 'POST',
      });
      const payload = await res.json();
      if (!res.ok) throw new Error(payload.error?.message || 'Failed to publish deck');
      setPublishedData(payload.data);
      if (payload.data.slug) setSlug(payload.data.slug);
      setMessage({
        type: 'success',
        text: `Published! Pinned revision #${payload.data.publishedRevisionNumber} as the active shared snapshot.`,
      });
    } catch (err: unknown) {
      setMessage({ type: 'error', text: err instanceof Error ? err.message : 'Error publishing deck' });
    } finally {
      setPublishing(false);
    }
  };

  const handleSavePrimer = async () => {
    setSavingPrimer(true);
    setMessage(null);
    try {
      const res = await fetch(`/api/v1/decks/${deckId}/primer`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: primerTitle, content: primerContent }),
      });
      const payload = await res.json();
      if (!res.ok) throw new Error(payload.error?.message || 'Failed to save primer');
      setMessage({ type: 'success', text: 'Primer saved successfully!' });
    } catch (err: unknown) {
      setMessage({ type: 'error', text: err instanceof Error ? err.message : 'Error saving primer' });
    } finally {
      setSavingPrimer(false);
    }
  };

  // Safe client-side Markdown sanitizer/renderer
  const renderSanitizedMarkdown = (source: string) => {
    if (!source) return <p className="text-slate-500 italic">No primer content written yet.</p>;

    // Basic sanitize: escape HTML tags to prevent XSS
    const escaped = source
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');

    const lines = escaped.split('\n');
    return (
      <div className="space-y-2 text-slate-200 text-xs font-sans">
        {lines.map((line, idx) => {
          if (line.startsWith('# ')) {
            return <h1 key={idx} className="text-lg font-bold text-amber-400 border-b border-slate-700 pb-1">{line.slice(2)}</h1>;
          }
          if (line.startsWith('## ')) {
            return <h2 key={idx} className="text-base font-semibold text-amber-300">{line.slice(3)}</h2>;
          }
          if (line.startsWith('### ')) {
            return <h3 key={idx} className="text-sm font-semibold text-slate-200">{line.slice(4)}</h3>;
          }
          if (line.startsWith('- ') || line.startsWith('* ')) {
            return <li key={idx} className="ml-4 list-disc text-slate-300">{line.slice(2)}</li>;
          }
          if (!line.trim()) {
            return <div key={idx} className="h-2" />;
          }
          return <p key={idx} className="leading-relaxed">{line}</p>;
        })}
      </div>
    );
  };

  const shareUrl = slug && typeof window !== 'undefined'
    ? `${window.location.origin}/shared/decks/${slug}`
    : `/shared/decks/${slug || deckId}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-800 rounded-xl w-full max-w-2xl text-white p-6 space-y-6 shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center border-b border-slate-800 pb-3">
          <h2 className="text-xl font-bold text-amber-400">Deck Publishing & Primer</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white text-sm">
            &times; Close
          </button>
        </div>

        {message && (
          <div
            className={`p-3 rounded text-xs border ${
              message.type === 'success'
                ? 'bg-emerald-950/80 border-emerald-800 text-emerald-300'
                : 'bg-red-950/80 border-red-800 text-red-300'
            }`}
          >
            {message.text}
          </div>
        )}

        {readinessSummary && <ReadinessSummaryView summary={readinessSummary} />}

        {/* Section 1: Visibility Controls */}
        <div className="p-4 bg-slate-950 rounded-lg border border-slate-800 space-y-3">
          <div className="flex justify-between items-center">
            <label htmlFor="visibility-select" className="text-sm font-semibold text-slate-200">
              Visibility Setting
            </label>
            <select
              id="visibility-select"
              value={visibility}
              disabled={updatingVisibility}
              onChange={(e) => handleVisibilityChange(e.target.value as DeckVisibility)}
              className="bg-slate-900 border border-slate-700 rounded px-3 py-1.5 text-xs text-amber-400 font-semibold focus:outline-none focus:border-amber-500"
            >
              <option value="PRIVATE">PRIVATE (Only Owner)</option>
              <option value="UNLISTED">UNLISTED (Anyone with link)</option>
              <option value="PUBLIC">PUBLIC (Searchable & Listed)</option>
            </select>
          </div>
          <p className="text-xs text-slate-400">
            Visibility controls who can access the share URL.
          </p>

          {visibility !== 'PRIVATE' && (
            <div className="pt-2 border-t border-slate-800 space-y-1">
              <label className="text-[11px] text-slate-400 font-mono uppercase">Share URL</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  readOnly
                  value={shareUrl}
                  className="flex-1 bg-slate-900 border border-slate-800 rounded px-3 py-1 text-xs text-amber-300 font-mono"
                />
                <button
                  onClick={() => navigator.clipboard.writeText(shareUrl)}
                  className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs rounded border border-slate-700"
                >
                  Copy
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Section 2: Independent Publish Action */}
        <div className="p-4 bg-slate-950 rounded-lg border border-slate-800 space-y-3">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-sm font-semibold text-slate-200">Publish Deck Revision</h3>
              <p className="text-xs text-slate-400">
                Pins current revision as the public snapshot.
              </p>
            </div>
            <button
              onClick={handlePublish}
              disabled={publishing}
              className="px-4 py-2 rounded bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs disabled:opacity-50"
            >
              {publishing ? 'Publishing...' : 'Publish Current Revision'}
            </button>
          </div>
          {publishedData && (
            <p className="text-xs text-amber-300 font-mono">
              Latest Pinned Revision: #{publishedData.publishedRevisionNumber} (at{' '}
              {new Date(publishedData.publishedAt).toLocaleTimeString()})
            </p>
          )}
        </div>

        {/* Section 3: Markdown Primer Editor */}
        <div className="p-4 bg-slate-950 rounded-lg border border-slate-800 space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-semibold text-slate-200">Deck Primer & Guide</h3>

            <div className="flex rounded bg-slate-900 p-0.5 border border-slate-800 text-xs">
              <button
                onClick={() => setActiveTab('edit')}
                className={`px-3 py-1 rounded ${
                  activeTab === 'edit' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400'
                }`}
              >
                Write
              </button>
              <button
                onClick={() => setActiveTab('preview')}
                className={`px-3 py-1 rounded ${
                  activeTab === 'preview' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400'
                }`}
              >
                Sanitized Preview
              </button>
            </div>
          </div>

          {activeTab === 'edit' ? (
            <div className="space-y-3">
              <input
                type="text"
                placeholder="Primer Title (e.g. Commander Strategy Guide)"
                maxLength={200}
                value={primerTitle}
                onChange={(e) => setPrimerTitle(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
              />
              <textarea
                placeholder="Write Markdown primer source (up to 20,000 chars)..."
                maxLength={20000}
                rows={6}
                value={primerContent}
                onChange={(e) => setPrimerContent(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded p-3 text-xs text-white placeholder-slate-500 font-mono focus:outline-none focus:border-amber-500"
              />
              <div className="flex justify-between items-center text-[11px] text-slate-500">
                <span>{primerContent.length} / 20,000 chars</span>
                <button
                  onClick={handleSavePrimer}
                  disabled={savingPrimer}
                  className="px-4 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-amber-300 font-semibold text-xs border border-slate-700 disabled:opacity-50"
                >
                  {savingPrimer ? 'Saving...' : 'Save Primer'}
                </button>
              </div>
            </div>
          ) : (
            <div className="p-4 bg-slate-900 border border-slate-800 rounded min-h-[160px]">
              {primerTitle && <h2 className="text-base font-bold text-amber-400 mb-2">{primerTitle}</h2>}
              {renderSanitizedMarkdown(primerContent)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
