'use client';

import React, { useEffect, useState } from 'react';
import {
  PieChart as PieIcon,
  BarChart2,
  DollarSign,
  CheckCircle2,
  AlertCircle,
  Layers,
  Sparkles,
  PlusCircle,
  RefreshCw,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { getDeckAnalysis, type DeckAnalysisData } from '@/lib/api/decks';

interface DeckAnalysisPanelProps {
  deckId: number | string;
  onAddCards?: () => void;
}

const COLOR_MAP: Record<string, string> = {
  W: '#f8f6d8',
  U: '#60a5fa',
  B: '#a1a1aa',
  R: '#f87171',
  G: '#4ade80',
  C: '#94a3b8',
};

const CURRENCY_SYMBOLS: Record<string, string> = {
  USD: '$',
  EUR: '€',
  GBP: '£',
  CAD: 'C$',
  AUD: 'A$',
};

export function DeckAnalysisPanel({ deckId, onAddCards }: DeckAnalysisPanelProps) {
  const [data, setData] = useState<DeckAnalysisData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalysis = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const resData = await getDeckAnalysis(Number(deckId));
      setData(resData);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load deck analysis');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (deckId) {
      fetchAnalysis();
    }
  }, [deckId]);

  if (isLoading) {
    return (
      <div className="p-12 text-center border border-zinc-800 rounded-2xl bg-zinc-900/40">
        <RefreshCw className="w-8 h-8 text-purple-500 animate-spin mx-auto mb-3" />
        <p className="text-zinc-400 text-sm font-medium">Analyzing deck statistics...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-red-950/30 border border-red-800/40 rounded-2xl text-red-300 text-sm flex items-center justify-between">
        <div className="flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
          <span>{error}</span>
        </div>
        <button
          onClick={fetchAnalysis}
          className="px-3 py-1.5 bg-red-900/50 hover:bg-red-800 text-white rounded-lg text-xs font-semibold transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  // Zeroed / Empty state handling
  if (!data || data.totalCards === 0) {
    return (
      <div className="p-12 text-center border-2 border-dashed border-zinc-800 rounded-2xl bg-zinc-900/20">
        <Layers className="w-14 h-14 text-zinc-600 mx-auto mb-4" />
        <h3 className="text-xl font-bold text-zinc-200">Add cards to analyze your deck</h3>
        <p className="text-zinc-400 text-sm mt-2 max-w-md mx-auto mb-6">
          Your deck is currently empty. Add cards to view mana curves, color demand, ownership breakdown, and combo synergies.
        </p>
        {onAddCards && (
          <button
            type="button"
            onClick={onAddCards}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl text-sm transition-colors shadow-lg shadow-purple-950/50"
          >
            <PlusCircle className="w-4 h-4" />
            Add Cards
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-8 text-zinc-100">
      {/* Header Badges: Ownership & Missing Cost by Currency */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-zinc-900/90 border border-zinc-800 rounded-2xl p-4 flex items-center gap-3">
          <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-zinc-400 uppercase tracking-wider font-semibold">Ownership</span>
            <div className="flex items-baseline gap-2 mt-0.5">
              <span className="text-xl font-extrabold text-white">{data.ownership.ownedPercentage}% Owned</span>
              <span className="text-xs text-zinc-400">({data.ownership.ownedCount}/{data.totalCards})</span>
            </div>
          </div>
        </div>

        <div className="bg-zinc-900/90 border border-zinc-800 rounded-2xl p-4 flex items-center gap-3">
          <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-amber-400">
            <AlertCircle className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-zinc-400 uppercase tracking-wider font-semibold">Missing Cards</span>
            <div className="text-xl font-extrabold text-amber-400 mt-0.5">{data.ownership.missingCount} Missing</div>
          </div>
        </div>

        <div className="bg-zinc-900/90 border border-zinc-800 rounded-2xl p-4 flex items-center gap-3 md:col-span-2">
          <div className="p-3 bg-purple-500/10 border border-purple-500/30 rounded-xl text-purple-400">
            <DollarSign className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-zinc-400 uppercase tracking-wider font-semibold">Missing Cards Cost</span>
            <div className="flex flex-wrap items-center gap-3 mt-1">
              {Object.entries(data.valueByCurrency || {}).map(([currency, val]) => (
                <span
                  key={currency}
                  className="px-3 py-1 bg-zinc-950 border border-zinc-800 rounded-lg text-sm font-mono font-bold text-purple-300"
                >
                  {currency}: {CURRENCY_SYMBOLS[currency] || ''}{val.toFixed(2)}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Mana Curve Chart */}
        <div className="bg-zinc-900/90 border border-zinc-800 rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <BarChart2 className="w-5 h-5 text-purple-400" />
            <h4 className="text-base font-bold text-white">Mana Curve (CMC)</h4>
          </div>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.manaCurve}>
                <XAxis dataKey="cmc" stroke="#71717a" fontSize={12} />
                <YAxis stroke="#71717a" fontSize={12} allowDecimals={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', borderRadius: '8px', color: '#fff' }}
                />
                <Bar dataKey="count" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Color Demand Distribution */}
        <div className="bg-zinc-900/90 border border-zinc-800 rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <PieIcon className="w-5 h-5 text-blue-400" />
            <h4 className="text-base font-bold text-white">Color Demand</h4>
          </div>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.colorDemand}>
                <XAxis dataKey="color" stroke="#71717a" fontSize={12} />
                <YAxis stroke="#71717a" fontSize={12} allowDecimals={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', borderRadius: '8px', color: '#fff' }}
                />
                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                  {data.colorDemand.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLOR_MAP[entry.color] || '#a855f7'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Card Type Distribution */}
        <div className="bg-zinc-900/90 border border-zinc-800 rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <Layers className="w-5 h-5 text-emerald-400" />
            <h4 className="text-base font-bold text-white">Type Distribution</h4>
          </div>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.typeDistribution} layout="vertical">
                <XAxis type="number" stroke="#71717a" fontSize={12} allowDecimals={false} />
                <YAxis type="category" dataKey="type" stroke="#71717a" fontSize={11} width={80} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', borderRadius: '8px', color: '#fff' }}
                />
                <Bar dataKey="count" fill="#10b981" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Categories & Combos Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Category List */}
        <div className="bg-zinc-900/90 border border-zinc-800 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-base font-bold text-white">Deck Categories</h4>
            {data.functionalCategories && data.functionalCategories.length > 0 && (
              <span className="text-[10px] uppercase font-semibold text-purple-400 bg-purple-950/60 px-2 py-0.5 rounded border border-purple-800/50">
                User Assigned
              </span>
            )}
          </div>
          {(() => {
            const displayCategories = (data.functionalCategories && data.functionalCategories.length > 0)
              ? data.functionalCategories
              : data.categories;

            return displayCategories && displayCategories.length > 0 ? (
              <div className="grid grid-cols-2 gap-3">
                {displayCategories.map((cat) => (
                  <div key={cat.name} className="flex justify-between items-center bg-zinc-950 p-3 rounded-xl border border-zinc-800">
                    <span className="text-xs font-semibold text-zinc-300">{cat.name}</span>
                    <span className="text-xs font-bold text-purple-400 px-2 py-0.5 bg-purple-500/10 rounded-md">
                      {cat.count}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-zinc-500 italic">No categories tagged for this deck.</p>
            );
          })()}
        </div>

        {/* Combo Summary */}
        <div className="bg-zinc-900/90 border border-zinc-800 rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="w-5 h-5 text-amber-400" />
            <h4 className="text-base font-bold text-white">Combo & Synergies</h4>
          </div>
          {data.combos && data.combos.length > 0 ? (
            <div className="space-y-3 max-h-56 overflow-y-auto">
              {data.combos.map((combo) => (
                <div key={combo.name} className="bg-zinc-950 p-3.5 rounded-xl border border-zinc-800/80">
                  <span className="text-xs font-bold text-amber-300 block mb-1">{combo.name}</span>
                  {combo.description && <p className="text-xs text-zinc-400 mb-2">{combo.description}</p>}
                  <div className="flex flex-wrap gap-1.5">
                    {combo.cards.map((card) => (
                      <span key={card} className="text-[10px] bg-zinc-900 text-zinc-300 px-2 py-0.5 rounded border border-zinc-800 font-mono">
                        {card}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-zinc-500 italic">No win-condition combos detected in deck analysis.</p>
          )}
        </div>
      </div>
    </div>
  );
}
