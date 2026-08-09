'use client';

import React, { useState } from 'react';
import type {
  MulliganStrategy,
  SampleHandsResponse,
  SimulationResponse,
} from '@/types/m3';

interface DeckSimulationPanelProps {
  deckId: number | string;
}

export function DeckSimulationPanel({ deckId }: DeckSimulationPanelProps) {
  const [activeTab, setActiveTab] = useState<'sample-hands' | 'monte-carlo'>('sample-hands');

  // Mulligan Config state
  const [mulliganStrategy, setMulliganStrategy] = useState<MulliganStrategy>('NONE');
  const [minimumLands, setMinimumLands] = useState<number>(2);
  const [maximumLands, setMaximumLands] = useState<number>(5);

  // Sample Hands state
  const [handCount, setHandCount] = useState<number>(7);
  const [sampleHandsData, setSampleHandsData] = useState<SampleHandsResponse | null>(null);
  const [drawingHands, setDrawingHands] = useState<boolean>(false);

  // Monte Carlo state
  const [iterations, setIterations] = useState<number>(1000);
  const [turns, setTurns] = useState<number>(5);
  const [simData, setSimData] = useState<SimulationResponse | null>(null);
  const [runningSim, setRunningSim] = useState<boolean>(false);

  const [error, setError] = useState<string | null>(null);

  const handleDrawSampleHands = async () => {
    setDrawingHands(true);
    setError(null);
    try {
      const res = await fetch(`/api/v1/decks/${deckId}/sample-hands`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          count: handCount,
          mulliganConfig: {
            mulliganStrategy,
            ...(mulliganStrategy === 'LONDON_LAND_RANGE' ? { minimumLands, maximumLands } : {}),
          },
        }),
      });
      const payload = await res.json();
      if (!res.ok) throw new Error(payload.error?.message || 'Failed to generate sample hands');
      setSampleHandsData(payload.data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error drawing hands');
    } finally {
      setDrawingHands(false);
    }
  };

  const handleRunSimulation = async () => {
    setRunningSim(true);
    setError(null);
    try {
      const res = await fetch(`/api/v1/decks/${deckId}/simulations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          iterations,
          turns,
          mulliganConfig: {
            mulliganStrategy,
            ...(mulliganStrategy === 'LONDON_LAND_RANGE' ? { minimumLands, maximumLands } : {}),
          },
        }),
      });
      const payload = await res.json();
      if (!res.ok) throw new Error(payload.error?.message || 'Failed to run simulation');
      setSimData(payload.data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error running simulation');
    } finally {
      setRunningSim(false);
    }
  };

  return (
    <div className="bg-slate-900 text-white rounded-lg p-5 border border-slate-800 space-y-5">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-800 pb-3">
        <h3 className="text-lg font-semibold text-amber-400">Deck Simulation Tools</h3>

        <div className="flex rounded-md bg-slate-950 p-1 border border-slate-800 text-xs">
          <button
            onClick={() => setActiveTab('sample-hands')}
            className={`px-3 py-1.5 rounded transition-all font-medium ${
              activeTab === 'sample-hands'
                ? 'bg-amber-500 text-slate-950 font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Sample Hands
          </button>
          <button
            onClick={() => setActiveTab('monte-carlo')}
            className={`px-3 py-1.5 rounded transition-all font-medium ${
              activeTab === 'monte-carlo'
                ? 'bg-amber-500 text-slate-950 font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Monte Carlo Simulation
          </button>
        </div>
      </div>

      {error && (
        <div className="p-3 bg-red-950/80 border border-red-800 text-red-300 rounded text-sm">
          {error}
        </div>
      )}

      {/* Shared Mulligan Config Controls */}
      <div className="p-4 rounded-lg bg-slate-950/80 border border-slate-800/80 space-y-3 text-xs">
        <h4 className="font-semibold text-slate-300 uppercase tracking-wider text-[11px]">
          Mulligan Rule Settings
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-slate-400 mb-1">Mulligan Strategy</label>
            <select
              value={mulliganStrategy}
              onChange={(e) => setMulliganStrategy(e.target.value as MulliganStrategy)}
              className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-slate-200 focus:outline-none focus:border-amber-500"
            >
              <option value="NONE">None (Keep 7)</option>
              <option value="LONDON_LAND_RANGE">London Mulligan (Land Range)</option>
            </select>
          </div>

          {mulliganStrategy === 'LONDON_LAND_RANGE' && (
            <>
              <div>
                <label className="block text-slate-400 mb-1">Min Acceptable Lands</label>
                <input
                  type="number"
                  min={0}
                  max={7}
                  value={minimumLands}
                  onChange={(e) => setMinimumLands(Number(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-slate-200 focus:outline-none focus:border-amber-500"
                />
              </div>
              <div>
                <label className="block text-slate-400 mb-1">Max Acceptable Lands</label>
                <input
                  type="number"
                  min={0}
                  max={7}
                  value={maximumLands}
                  onChange={(e) => setMaximumLands(Number(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-slate-200 focus:outline-none focus:border-amber-500"
                />
              </div>
            </>
          )}
        </div>
      </div>

      {activeTab === 'sample-hands' && (
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-xs">
              <label className="text-slate-400">Cards per hand:</label>
              <input
                type="number"
                min={1}
                max={100}
                value={handCount}
                onChange={(e) => setHandCount(Number(e.target.value))}
                className="w-16 bg-slate-950 border border-slate-700 rounded px-2 py-1 text-slate-200 focus:outline-none focus:border-amber-500 text-xs"
              />
            </div>
            <button
              onClick={handleDrawSampleHands}
              disabled={drawingHands}
              className="px-4 py-1.5 rounded bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold text-xs disabled:opacity-50"
            >
              {drawingHands ? 'Drawing...' : 'Draw Sample Hands'}
            </button>
          </div>

          {sampleHandsData && (
            <div className="space-y-3">
              <div className="text-xs text-slate-400 font-mono">
                Seeded Run: <span className="text-amber-300">{sampleHandsData.seed}</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {sampleHandsData.hands.map((hand) => (
                  <div key={hand.id} className="p-3 bg-slate-950 rounded border border-slate-800 text-xs space-y-2">
                    <div className="flex justify-between items-center text-slate-300">
                      <span className="font-bold">Hand #{hand.handNumber}</span>
                      <span className="text-slate-500">Mulligans: {hand.mulliganCount}</span>
                    </div>
                    {hand.cards.length === 0 ? (
                      <p className="text-slate-500 italic">No cards in hand snapshot.</p>
                    ) : (
                      <div className="flex flex-wrap gap-1.5">
                        {hand.cards.map((c, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-0.5 rounded bg-slate-800 text-slate-200 border border-slate-700"
                          >
                            {c.name} {c.manaCost && <span className="text-amber-400 font-mono">{c.manaCost}</span>}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'monte-carlo' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div>
              <label className="block text-slate-400 mb-1">Iterations (100 - 100,000)</label>
              <input
                type="number"
                min={100}
                max={100000}
                step={100}
                value={iterations}
                onChange={(e) => setIterations(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-700 rounded px-2.5 py-1.5 text-slate-200 focus:outline-none focus:border-amber-500"
              />
            </div>
            <div>
              <label className="block text-slate-400 mb-1">Turns (1 - 10)</label>
              <input
                type="number"
                min={1}
                max={10}
                value={turns}
                onChange={(e) => setTurns(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-700 rounded px-2.5 py-1.5 text-slate-200 focus:outline-none focus:border-amber-500"
              />
            </div>
            <div className="flex items-end">
              <button
                onClick={handleRunSimulation}
                disabled={runningSim}
                className="w-full py-1.5 rounded bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold text-xs disabled:opacity-50"
              >
                {runningSim ? 'Simulating...' : 'Run Simulation'}
              </button>
            </div>
          </div>

          {simData && (
            <div className="space-y-4 pt-2">
              {/* Overall 95% Confidence Margin of Error Banner */}
              <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg flex justify-between items-center text-xs">
                <div>
                  <span className="font-semibold text-amber-400">95% Confidence Bounds: </span>
                  <span className="text-slate-200">
                    Worst-case margin of error across all metrics
                  </span>
                </div>
                <span className="text-amber-400 font-bold text-sm">
                  &plusmn;{simData.confidence.marginOfErrorPercent95}%
                </span>
              </div>

              {/* Turn Metrics Table */}
              <div className="overflow-x-auto rounded border border-slate-800">
                <table className="w-full text-xs text-left text-slate-300">
                  <thead className="bg-slate-950 text-slate-400 uppercase font-mono">
                    <tr>
                      <th className="px-3 py-2">Turn</th>
                      <th className="px-3 py-2">Land Drop %</th>
                      <th className="px-3 py-2">Cards Seen</th>
                      <th className="px-3 py-2">Playable Spells</th>
                      <th className="px-3 py-2">Castability % *</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {Array.from({ length: turns }, (_, i) => i + 1).map((t) => (
                      <tr key={t} className="hover:bg-slate-800/40">
                        <td className="px-3 py-2 font-bold text-amber-400">Turn {t}</td>
                        <td className="px-3 py-2">
                          {((simData.landDropProbabilityByTurn?.[t] ?? 0) * 100).toFixed(1)}%
                        </td>
                        <td className="px-3 py-2">{simData.cardsSeenByTurn?.[t] ?? 0}</td>
                        <td className="px-3 py-2">{simData.playableSpellCountByTurn?.[t] ?? 0}</td>
                        <td className="px-3 py-2">
                          {((simData.castabilityByTurn?.[t] ?? 0) * 100).toFixed(1)}%
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <p className="text-[11px] text-slate-500 italic">
                * Note: castabilityByTurn is a mana-value heuristic, not a full rules-engine color check.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
