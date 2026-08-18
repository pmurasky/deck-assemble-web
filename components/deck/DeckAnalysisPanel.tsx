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
  Cell,
} from 'recharts';
import {
  getDeckAnalysis,
  fetchDeckLegality,
  fetchDeckCombos,
  type DeckAnalysisData,
} from '@/lib/api/decks';
import type { DeckLegalityResponse, DeckComboResponse } from '@/types/builder';
import { BracketBadge } from './BracketBadge';
import { GameChangersSection } from './GameChangersSection';

interface DeckAnalysisPanelProps {
  deckId: number | string;
  onAddCards?: () => void;
}

export interface DerivedOwnership {
  totalCards: number;
  ownedCount: number;
  missingCount: number;
  ownedPercentage: number;
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

export function deriveOwnership(ownershipBreakdown?: Record<string, number>): DerivedOwnership {
  const breakdown = ownershipBreakdown || {};
  const totalCards = Object.values(breakdown).reduce((acc, val) => acc + (val || 0), 0);
  const ownedCount = breakdown.OWNED ?? 0;
  const missingCount = Math.max(0, totalCards - ownedCount);
  const ownedPercentage = totalCards > 0 ? Math.round((ownedCount / totalCards) * 100) : 0;

  return { totalCards, ownedCount, missingCount, ownedPercentage };
}

export function formatManaCurve(manaCurve?: Record<string, number>): Array<{ cmc: string; count: number }> {
  return Object.entries(manaCurve || {})
    .map(([cmc, count]) => ({ cmc, count }))
    .sort((a, b) => {
      const numA = a.cmc.endsWith('+') ? Infinity : Number(a.cmc);
      const numB = b.cmc.endsWith('+') ? Infinity : Number(b.cmc);
      return numA - numB;
    });
}

export function formatColorDemand(colorDemand?: Record<string, number>): Array<{ color: string; count: number }> {
  return Object.entries(colorDemand || {}).map(([color, count]) => ({
    color,
    count,
  }));
}

export function formatCategories(categories?: Record<string, number>): Array<{ name: string; count: number }> {
  return Object.entries(categories || {}).map(([name, count]) => ({
    name,
    count,
  }));
}

function EmptyAnalysisState({ onAddCards }: { onAddCards?: () => void }) {
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

function OwnershipBadge({ ownership }: { ownership: DerivedOwnership }) {
  return (
    <div className="bg-zinc-900/90 border border-zinc-800 rounded-2xl p-4 flex items-center gap-3">
      <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400">
        <CheckCircle2 className="w-6 h-6" />
      </div>
      <div>
        <span className="text-xs text-zinc-400 uppercase tracking-wider font-semibold">Ownership</span>
        <div className="flex items-baseline gap-2 mt-0.5">
          <span className="text-xl font-extrabold text-white">{ownership.ownedPercentage}% Owned</span>
          <span className="text-xs text-zinc-400">({ownership.ownedCount}/{ownership.totalCards})</span>
        </div>
      </div>
    </div>
  );
}

function MissingCardsBadge({ missingCount }: { missingCount: number }) {
  return (
    <div className="bg-zinc-900/90 border border-zinc-800 rounded-2xl p-4 flex items-center gap-3">
      <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-amber-400">
        <AlertCircle className="w-6 h-6" />
      </div>
      <div>
        <span className="text-xs text-zinc-400 uppercase tracking-wider font-semibold">Missing Cards</span>
        <div className="text-xl font-extrabold text-amber-400 mt-0.5">{missingCount} Missing</div>
      </div>
    </div>
  );
}

function FormatLegalityBadge({ legality }: { legality: DeckLegalityResponse | null }) {
  const isLegal = legality?.legal !== false;
  return (
    <div className={`border rounded-2xl p-4 flex items-center gap-3 ${
      isLegal ? 'bg-zinc-900/90 border-zinc-800' : 'bg-red-950/20 border-red-800/50'
    }`}>
      <div className={`p-3 rounded-xl border ${
        isLegal ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-red-500/10 border-red-500/30 text-red-400'
      }`}>
        {isLegal ? <CheckCircle2 className="w-6 h-6" /> : <AlertCircle className="w-6 h-6" />}
      </div>
      <div>
        <span className="text-xs text-zinc-400 uppercase tracking-wider font-semibold">Format Legality</span>
        <div className={`text-xl font-extrabold mt-0.5 ${isLegal ? 'text-emerald-400' : 'text-red-400'}`}>
          {legality ? (legality.legal ? 'Format Legal' : `${legality.violations.length} Violation${legality.violations.length === 1 ? '' : 's'}`) : 'Validated'}
        </div>
      </div>
    </div>
  );
}

function DeckValueBadge({ valueByCurrency }: { valueByCurrency?: Record<string, number> }) {
  return (
    <div className="bg-zinc-900/90 border border-zinc-800 rounded-2xl p-4 flex items-center gap-3">
      <div className="p-3 bg-purple-500/10 border border-purple-500/30 rounded-xl text-purple-400">
        <DollarSign className="w-6 h-6" />
      </div>
      <div>
        <span className="text-xs text-zinc-400 uppercase tracking-wider font-semibold">Deck Value</span>
        <div className="text-sm font-extrabold text-white mt-0.5 space-y-0.5">
          {Object.entries(valueByCurrency || {}).map(([curr, val]) => (
            <div key={curr} className="text-xs text-zinc-300">
              {curr}: {CURRENCY_SYMBOLS[curr] || '$'}{Number(val).toFixed(2)}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ManaCurveChart({ data }: { data: Array<{ cmc: string; count: number }> }) {
  return (
    <div className="bg-zinc-900/90 border border-zinc-800 rounded-2xl p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <BarChart2 className="w-5 h-5 text-purple-400" />
          <h4 className="text-base font-bold text-white">Mana Curve (CMC)</h4>
        </div>
      </div>
      <div className="h-60">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <XAxis dataKey="cmc" stroke="#71717a" fontSize={12} tickLine={false} />
            <YAxis stroke="#71717a" fontSize={12} tickLine={false} allowDecimals={false} />
            <Tooltip
              contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', borderRadius: '0.75rem', fontSize: '12px' }}
            />
            <Bar dataKey="count" fill="#a855f7" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function ColorDemandChart({ data }: { data: Array<{ color: string; count: number }> }) {
  return (
    <div className="bg-zinc-900/90 border border-zinc-800 rounded-2xl p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <PieIcon className="w-5 h-5 text-blue-400" />
          <h4 className="text-base font-bold text-white">Color Demand / Pips</h4>
        </div>
      </div>
      <div className="h-60">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <XAxis dataKey="color" stroke="#71717a" fontSize={12} tickLine={false} />
            <YAxis stroke="#71717a" fontSize={12} tickLine={false} allowDecimals={false} />
            <Tooltip
              contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', borderRadius: '0.75rem', fontSize: '12px' }}
            />
            <Bar dataKey="count" radius={[4, 4, 0, 0]}>
              {data.map((entry) => (
                <Cell key={entry.color} fill={COLOR_MAP[entry.color] || '#a855f7'} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function CategoriesSection({ categories }: { categories: Array<{ name: string; count: number }> }) {
  const hasCategories = categories.length > 0;
  return (
    <div className="bg-zinc-900/90 border border-zinc-800 rounded-2xl p-6">
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-base font-bold text-white">Deck Categories</h4>
        {hasCategories && (
          <span className="text-[10px] uppercase font-semibold text-purple-400 bg-purple-950/60 px-2 py-0.5 rounded border border-purple-800/50">
            User Assigned
          </span>
        )}
      </div>
      {hasCategories ? (
        <div className="grid grid-cols-2 gap-3">
          {categories.map((cat) => (
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
      )}
    </div>
  );
}

function CombosSection({ combos }: { combos: DeckComboResponse | null }) {
  const comboList = combos?.combos || [];
  const hasCombos = comboList.length > 0;

  return (
    <div className="bg-zinc-900/90 border border-zinc-800 rounded-2xl p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-amber-400" />
          <h4 className="text-base font-bold text-white">Commander Spellbook Combos</h4>
        </div>
        {combos?.available && (
          <span className="text-[10px] uppercase font-semibold text-amber-400 bg-amber-950/60 px-2 py-0.5 rounded border border-amber-800/50">
            Verified Combos
          </span>
        )}
      </div>
      {hasCombos ? (
        <div className="space-y-3 max-h-56 overflow-y-auto">
          {comboList.map((combo) => (
            <div key={combo.id} className="bg-zinc-950 p-3.5 rounded-xl border border-zinc-800/80">
              <span className="text-xs font-bold text-amber-300 block mb-1">
                {combo.produces?.join(', ') || 'Combo'}
              </span>
              {combo.description && <p className="text-xs text-zinc-400 mb-1">{combo.description}</p>}
              {combo.prerequisites && (
                <p className="text-[10px] text-zinc-500 mb-2 font-mono">Prereq: {combo.prerequisites}</p>
              )}
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
  );
}

export function DeckAnalysisPanel({ deckId, onAddCards }: DeckAnalysisPanelProps) {
  const [data, setData] = useState<DeckAnalysisData | null>(null);
  const [legality, setLegality] = useState<DeckLegalityResponse | null>(null);
  const [combos, setCombos] = useState<DeckComboResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalysis = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [resData, resLegality, resCombos] = await Promise.all([
        getDeckAnalysis(Number(deckId)),
        fetchDeckLegality(Number(deckId)).catch(() => null),
        fetchDeckCombos(Number(deckId)).catch(() => null),
      ]);
      setData(resData);
      setLegality(resLegality);
      setCombos(resCombos);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load deck analysis');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;
    if (!deckId) return;
    Promise.all([
      getDeckAnalysis(Number(deckId)),
      fetchDeckLegality(Number(deckId)).catch(() => null),
      fetchDeckCombos(Number(deckId)).catch(() => null),
    ])
      .then(([resData, resLegality, resCombos]) => {
        if (isMounted) {
          setData(resData);
          setLegality(resLegality);
          setCombos(resCombos);
          setIsLoading(false);
        }
      })
      .catch((err: unknown) => {
        if (isMounted) {
          setError(err instanceof Error ? err.message : 'Failed to load deck analysis');
          setIsLoading(false);
        }
      });
    return () => {
      isMounted = false;
    };
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

  const ownership = deriveOwnership(data?.ownershipBreakdown);
  if (!data || ownership.totalCards === 0) {
    return <EmptyAnalysisState onAddCards={onAddCards} />;
  }

  const manaCurveData = formatManaCurve(data.manaCurve);
  const colorDemandData = formatColorDemand(data.colorDemand);
  const categoriesData = formatCategories(data.functionalCategories);

  return (
    <div className="space-y-8 text-zinc-100">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        <OwnershipBadge ownership={ownership} />
        <MissingCardsBadge missingCount={ownership.missingCount} />
        <FormatLegalityBadge legality={legality} />
        <BracketBadge bracket={data.bracket ?? data.bracketScore} />
        <DeckValueBadge valueByCurrency={data.valueByCurrency} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ManaCurveChart data={manaCurveData} />
        <ColorDemandChart data={colorDemandData} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <CategoriesSection categories={categoriesData} />
        <CombosSection combos={combos} />
        <GameChangersSection gameChangers={data.gameChangers} />
      </div>
    </div>
  );
}
