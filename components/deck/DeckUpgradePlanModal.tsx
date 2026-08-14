'use client';

import React, { useState } from 'react';
import {
  Sparkles,
  TrendingUp,
  X,
  RefreshCw,
} from 'lucide-react';
import { requestDeckUpgradePlan } from '@/lib/api/decks';
import type {
  DeckUpgradeObjective,
  DeckUpgradeRequest,
  DeckUpgradePlanResponse,
} from '@/types/builder';

interface DeckUpgradePlanModalProps {
  isOpen: boolean;
  onClose: () => void;
  deckId: number | string;
}

const OBJECTIVES: { value: DeckUpgradeObjective; label: string; description: string }[] = [
  {
    value: 'REPLACE_PROXIES_WITH_OWNED',
    label: 'Replace Proxies with Owned Cards',
    description: 'Prioritizes swaps that replace proxy cards with physical cards from your collection.',
  },
  {
    value: 'IMPROVE_UNDER_BUDGET',
    label: 'Improve Under Budget',
    description: 'Finds optimal upgrades to synergy and power within a strict spending cap.',
  },
  {
    value: 'CLOSE_CATEGORY_GAPS',
    label: 'Close Category Gaps',
    description: 'Targets missing functional needs like card draw, ramp, or interaction.',
  },
];

export function DeckUpgradePlanModal({
  isOpen,
  onClose,
  deckId,
}: DeckUpgradePlanModalProps) {
  const [objective, setObjective] = useState<DeckUpgradeObjective>('REPLACE_PROXIES_WITH_OWNED');
  const [budget, setBudget] = useState<string>('50');
  const [currency, setCurrency] = useState<'usd' | 'eur' | 'tix' | 'usdFoil'>('usd');
  const [maxChanges, setMaxChanges] = useState<number>(10);
  const [plan, setPlan] = useState<DeckUpgradePlanResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleGeneratePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      const numericBudget = budget.trim() ? Number(budget) : undefined;
      const req: DeckUpgradeRequest = {
        objective,
        budget: numericBudget && !isNaN(numericBudget) ? numericBudget : undefined,
        currency,
        maxChanges: maxChanges ? Number(maxChanges) : 10,
      };

      const result = await requestDeckUpgradePlan(Number(deckId), req);
      setPlan(result);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to generate deck upgrade plan');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl max-w-4xl w-full p-6 text-zinc-100 shadow-2xl relative max-h-[90vh] overflow-y-auto space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-zinc-800">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-amber-400 uppercase tracking-wider">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>AI Deck Optimizer</span>
            </div>
            <h2 className="text-xl font-black text-white mt-0.5">
              Generate Deck Upgrade Plan
            </h2>
            <p className="text-xs text-zinc-400 mt-0.5">
              Configure optimization objectives, budget caps, and maximum allowed substitutions.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="p-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Configuration Form */}
        <form onSubmit={handleGeneratePlan} className="space-y-4 bg-zinc-950 p-5 rounded-2xl border border-zinc-800/80">
          <div className="space-y-2">
            <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider">
              Upgrade Objective
            </label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {OBJECTIVES.map((obj) => (
                <button
                  key={obj.value}
                  type="button"
                  onClick={() => setObjective(obj.value)}
                  className={`p-3.5 rounded-xl border text-left transition-all ${
                    objective === obj.value
                      ? 'bg-purple-950/40 border-purple-500 text-white shadow-md'
                      : 'bg-zinc-900/60 border-zinc-800 hover:border-zinc-700 text-zinc-300'
                  }`}
                >
                  <span className="text-xs font-bold block mb-1">{obj.label}</span>
                  <span className="text-[11px] text-zinc-400 leading-snug block">{obj.description}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            <div>
              <label className="block text-xs font-bold text-zinc-400 mb-1">
                Budget Cap
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-xs text-zinc-500 font-mono">$</span>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={budget}
                  onChange={(e) => setBudget(e.target.value)}
                  placeholder="50.00"
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl py-2 pl-7 pr-3 text-xs text-white focus:outline-none focus:border-purple-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-400 mb-1">
                Currency
              </label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value as 'usd' | 'eur' | 'tix' | 'usdFoil')}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl py-2 px-3 text-xs text-white focus:outline-none focus:border-purple-500"
              >
                <option value="usd">USD ($)</option>
                <option value="eur">EUR (€)</option>
                <option value="tix">MTGO TIX</option>
                <option value="usdFoil">USD Foil</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-400 mb-1">
                Max Card Changes
              </label>
              <input
                type="number"
                min="1"
                max="50"
                value={maxChanges}
                onChange={(e) => setMaxChanges(Number(e.target.value))}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl py-2 px-3 text-xs text-white focus:outline-none focus:border-purple-500"
              />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={isLoading}
              className="px-5 py-2.5 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center gap-2 active:scale-95"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Computing Optimal Upgrades...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Generate Upgrade Plan</span>
                </>
              )}
            </button>
          </div>
        </form>

        {error && (
          <div className="p-4 bg-red-950/30 border border-red-800/40 rounded-xl text-red-300 text-xs">
            {error}
          </div>
        )}

        {/* Plan Results */}
        {plan && (
          <div className="space-y-6 pt-2">
            {/* Before / After Comparison */}
            <div>
              <h3 className="text-sm font-extrabold text-white mb-3 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-emerald-400" />
                <span>Before & After Comparison</span>
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 space-y-2">
                  <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider block">
                    Before Upgrade
                  </span>
                  <div className="space-y-1 text-xs">
                    <div className="flex justify-between text-zinc-300">
                      <span>Ownership:</span>
                      <span className="font-mono font-bold">{plan.before.ownershipBreakdown?.OWNED ?? 0} Owned / {plan.before.ownershipBreakdown?.PROXY ?? 0} Proxies</span>
                    </div>
                    <div className="flex justify-between text-zinc-300">
                      <span>Format Legality:</span>
                      <span className={plan.before.legal ? 'text-emerald-400 font-bold' : 'text-red-400 font-bold'}>
                        {plan.before.legal ? 'Legal' : 'Violations Present'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-zinc-950 border border-purple-500/40 space-y-2">
                  <span className="text-xs font-bold text-purple-300 uppercase tracking-wider block">
                    After Upgrade
                  </span>
                  <div className="space-y-1 text-xs">
                    <div className="flex justify-between text-zinc-300">
                      <span>Ownership:</span>
                      <span className="font-mono font-bold text-emerald-400">
                        {plan.after.ownershipBreakdown?.OWNED ?? 0} Owned / {plan.after.ownershipBreakdown?.PROXY ?? 0} Proxies
                      </span>
                    </div>
                    <div className="flex justify-between text-zinc-300">
                      <span>Format Legality:</span>
                      <span className={plan.after.legal ? 'text-emerald-400 font-bold' : 'text-red-400 font-bold'}>
                        {plan.after.legal ? 'Legal' : 'Violations Present'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Proposed Substitutions List */}
            <div>
              <h3 className="text-sm font-extrabold text-white mb-3">
                Proposed Card Substitutions ({plan.substitutions.length})
              </h3>
              {plan.substitutions.length === 0 ? (
                <p className="text-xs text-zinc-500 italic">No substitutions required. Deck is already optimal for this objective.</p>
              ) : (
                <div className="divide-y divide-zinc-800/80 rounded-xl bg-zinc-950 border border-zinc-800 overflow-hidden">
                  {plan.substitutions.map((sub, idx) => (
                    <div key={idx} className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                      <div className="flex items-center gap-3 flex-1">
                        <div className="space-y-0.5">
                          <span className="text-xs font-mono text-red-400 line-through block">
                            - {sub.removedName} ({sub.removedOwnershipStatus})
                          </span>
                          <span className="text-sm font-bold text-emerald-400 flex items-center gap-1.5">
                            + {sub.addedName}
                            {sub.addedOwned && (
                              <span className="text-[9px] bg-emerald-950 border border-emerald-500/40 text-emerald-300 px-1.5 py-0.2 rounded font-bold">
                                Owned
                              </span>
                            )}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        {sub.cost !== null && sub.cost !== undefined && (
                          <span className="text-xs font-mono text-zinc-300">
                            Cost: ${sub.cost.toFixed(2)}
                          </span>
                        )}
                        {sub.reasons && sub.reasons.length > 0 && (
                          <span className="text-[10px] bg-purple-950 border border-purple-800/50 text-purple-300 px-2 py-0.5 rounded font-semibold">
                            {sub.reasons[0].code}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
