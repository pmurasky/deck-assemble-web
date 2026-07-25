import React, { useState } from 'react';
import { X, Sparkles, Sliders, Zap, RefreshCw } from 'lucide-react';
import { CommanderSuggestion, DeckBuildConfig } from '@/types/builder';

interface CommanderBuildConfigModalProps {
  commander: CommanderSuggestion | null;
  isOpen: boolean;
  onClose: () => void;
  onGenerate: (config: DeckBuildConfig) => void;
}

const PLAY_STYLES = [
  'Aggro',
  'Control',
  'Combo',
  'Midrange',
  'Tribal / Kindred',
  'Spellslinger',
  'Aristocrats',
  'Voltron',
  'Stax / Tax',
  'Superfriends',
];

export const CommanderBuildConfigModal: React.FC<CommanderBuildConfigModalProps> = ({
  commander,
  isOpen,
  onClose,
  onGenerate,
}) => {
  const [ownedOnly, setOwnedOnly] = useState(true);
  const [budgetLimit, setBudgetLimit] = useState<number | undefined>(undefined);
  const [powerLevel, setPowerLevel] = useState<number>(7);
  const [selectedPlayStyles, setSelectedPlayStyles] = useState<string[]>(['Midrange']);
  const [isGenerating, setIsGenerating] = useState(false);

  if (!isOpen || !commander) return null;

  const togglePlayStyle = (style: string) => {
    setSelectedPlayStyles((prev) =>
      prev.includes(style) ? prev.filter((s) => s !== style) : [...prev, style]
    );
  };

  const handleGenerateClick = () => {
    setIsGenerating(true);
    setTimeout(() => {
      onGenerate({
        commanderId: commander.id,
        ownedOnly,
        budgetLimit,
        powerLevel,
        playStyles: selectedPlayStyles,
      });
      setIsGenerating(false);
    }, 400);
  };

  const getPowerLevelLabel = (level: number) => {
    if (level <= 3) return 'Casual / Precon';
    if (level <= 6) return 'Mid-Power Interactive';
    if (level <= 8) return 'Optimized High Synergy';
    return 'cEDH / Maximum Power';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        role="dialog"
        aria-modal="true"
        aria-labelledby="build-config-modal-title"
      >
        {/* Header with Commander preview */}
        <div className="relative p-6 bg-slate-950/90 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-4">
            {commander.imageUrl && (
              <img
                src={commander.imageUrl}
                alt={commander.name}
                className="w-14 h-14 rounded-lg object-cover border border-slate-700 shadow-md"
              />
            )}
            <div>
              <div className="flex items-center gap-2 text-xs text-violet-400 font-semibold uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Build Configuration</span>
              </div>
              <h2 id="build-config-modal-title" className="text-xl font-bold text-slate-100">
                {commander.name}
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">{commander.typeLine}</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="p-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body controls */}
        <div className="p-6 space-y-6 overflow-y-auto">
          {/* Toggle: Owned cards only */}
          <div className="flex items-center justify-between p-4 rounded-xl bg-slate-950 border border-slate-800">
            <div>
              <label htmlFor="owned-only-toggle" className="text-sm font-semibold text-slate-200 block cursor-pointer">
                Owned cards only
              </label>
              <p className="text-xs text-slate-400">
                Only use cards currently present in your collection inventory.
              </p>
            </div>
            <input
              id="owned-only-toggle"
              type="checkbox"
              checked={ownedOnly}
              onChange={(e) => setOwnedOnly(e.target.checked)}
              className="w-5 h-5 rounded bg-slate-900 border-slate-700 text-violet-600 focus:ring-violet-500 cursor-pointer"
            />
          </div>

          {/* Budget Limit Input & Presets */}
          <div className="space-y-2">
            <label htmlFor="budget-limit-input" className="text-sm font-semibold text-slate-200 flex items-center justify-between">
              <span>Budget Limit ($)</span>
              <span className="text-xs font-normal text-slate-400">
                {budgetLimit ? `$${budgetLimit} max unowned spend` : 'No budget limit set'}
              </span>
            </label>
            <div className="flex items-center gap-3">
              <input
                id="budget-limit-input"
                type="number"
                min="0"
                placeholder="Unlimited"
                value={budgetLimit ?? ''}
                onChange={(e) => setBudgetLimit(e.target.value === '' ? undefined : Number(e.target.value))}
                className="flex-1 px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-100 text-sm focus:ring-2 focus:ring-violet-500 focus:outline-none"
              />
              <div className="flex items-center gap-1.5">
                {[50, 100, 200].map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setBudgetLimit(preset)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                      budgetLimit === preset
                        ? 'bg-violet-600 text-white border-violet-500'
                        : 'bg-slate-950 text-slate-300 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    ${preset}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Power Level Slider */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm font-semibold text-slate-200">
              <label htmlFor="power-level-slider" className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-400" />
                <span>Power Level</span>
              </label>
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-violet-950 border border-violet-500/40 text-violet-300">
                {powerLevel} / 10 — {getPowerLevelLabel(powerLevel)}
              </span>
            </div>
            <input
              id="power-level-slider"
              type="range"
              min="1"
              max="10"
              value={powerLevel}
              onChange={(e) => setPowerLevel(Number(e.target.value))}
              className="w-full h-2 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-violet-500"
            />
            <div className="flex justify-between text-[11px] text-slate-500 font-mono">
              <span>1 (Casual)</span>
              <span>5 (Mid)</span>
              <span>8 (Optimized)</span>
              <span>10 (cEDH)</span>
            </div>
          </div>

          {/* Play Style Chips */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-200 flex items-center gap-2">
              <Sliders className="w-4 h-4 text-violet-400" />
              <span>Preferred Play Style</span>
            </label>
            <div className="flex flex-wrap gap-2">
              {PLAY_STYLES.map((style) => {
                const active = selectedPlayStyles.includes(style);
                return (
                  <button
                    key={style}
                    type="button"
                    onClick={() => togglePlayStyle(style)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                      active
                        ? 'bg-violet-600 text-white border-violet-400 shadow-md shadow-violet-600/20'
                        : 'bg-slate-950 text-slate-400 border-slate-800 hover:border-slate-700 hover:text-slate-200'
                    }`}
                  >
                    {style}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-6 bg-slate-950 border-t border-slate-800 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-slate-400 hover:text-slate-200 text-sm font-medium transition-colors"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleGenerateClick}
            disabled={isGenerating}
            className="px-6 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-white text-sm font-bold flex items-center gap-2 shadow-lg shadow-violet-600/30 transition-all active:scale-95"
          >
            {isGenerating ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin text-violet-200" />
                <span>Generating Deck...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-violet-200" />
                <span>Generate Deck</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
