import React, { useState, useMemo } from 'react';
import { Sparkles, DollarSign, Layers, Award, Filter, ShieldAlert } from 'lucide-react';
import { CommanderSuggestion } from '@/types/builder';

interface CommanderSuggestionsGridProps {
  commanders: CommanderSuggestion[];
  onSelectCommander: (commander: CommanderSuggestion) => void;
}

const COLOR_MAP: Record<string, { label: string; bg: string; text: string; name: string }> = {
  W: { label: 'W', bg: 'bg-amber-100/90 text-amber-900 border-amber-300', text: 'White', name: 'White' },
  U: { label: 'U', bg: 'bg-blue-600/90 text-white border-blue-400', text: 'Blue', name: 'Blue' },
  B: { label: 'B', bg: 'bg-slate-800 text-slate-100 border-slate-600', text: 'Black', name: 'Black' },
  R: { label: 'R', bg: 'bg-rose-600/90 text-white border-rose-400', text: 'Red', name: 'Red' },
  G: { label: 'G', bg: 'bg-emerald-600/90 text-white border-emerald-400', text: 'Green', name: 'Green' },
};

export const CommanderSuggestionsGrid: React.FC<CommanderSuggestionsGridProps> = ({
  commanders,
  onSelectCommander,
}) => {
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [maxBudget, setMaxBudget] = useState<number | ''>('');
  const [ownedOnlyFilter, setOwnedOnlyFilter] = useState(false);

  const toggleColor = (color: string) => {
    setSelectedColors((prev) =>
      prev.includes(color) ? prev.filter((c) => c !== color) : [...prev, color]
    );
  };

  const filteredCommanders = useMemo(() => {
    return commanders.filter((cmd) => {
      // Color identity filter
      if (selectedColors.length > 0) {
        const matchesColor = selectedColors.some((c) => cmd.colorIdentity.includes(c));
        if (!matchesColor) return false;
      }
      // Budget filter
      if (maxBudget !== '' && cmd.estimatedCostToComplete > maxBudget) {
        return false;
      }
      // Owned only filter (95%+ owned considered owned)
      if (ownedOnlyFilter && cmd.ownershipCoverage < 95) {
        return false;
      }
      return true;
    });
  }, [commanders, selectedColors, maxBudget, ownedOnlyFilter]);

  return (
    <div className="space-y-6" data-testid="commander-suggestions-grid">
      {/* What can I build title section */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-violet-400" />
            <span>What can I build?</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Commanders ranked by your collection coverage, missing staples count, and estimated cost to complete.
          </p>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 backdrop-blur-sm space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-slate-200 font-semibold text-sm">
            <Filter className="w-4 h-4 text-violet-400" />
            <span>Filter Suggestions</span>
          </div>

          {/* Color identity filter pips */}
          <div className="flex items-center gap-1.5" role="group" aria-label="Color identity filter">
            {Object.entries(COLOR_MAP).map(([code, info]) => {
              const active = selectedColors.includes(code);
              return (
                <button
                  key={code}
                  type="button"
                  aria-label={`Filter ${info.name}`}
                  onClick={() => toggleColor(code)}
                  className={`w-7 h-7 rounded-full text-xs font-bold border transition-all ${info.bg} ${
                    active ? 'ring-2 ring-violet-400 scale-110 shadow-lg' : 'opacity-60 hover:opacity-100'
                  }`}
                >
                  {info.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-4 text-xs text-slate-300 pt-2 border-t border-slate-800">
          <div className="flex items-center gap-2">
            <label htmlFor="max-budget-input" className="text-slate-400">Max Cost to Complete ($):</label>
            <input
              id="max-budget-input"
              type="number"
              min="0"
              placeholder="Any budget"
              value={maxBudget}
              onChange={(e) => setMaxBudget(e.target.value === '' ? '' : Number(e.target.value))}
              className="w-24 px-2.5 py-1 rounded-md bg-slate-950 border border-slate-700 text-slate-100 text-xs focus:ring-1 focus:ring-violet-500 focus:outline-none"
            />
          </div>

          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={ownedOnlyFilter}
              onChange={(e) => setOwnedOnlyFilter(e.target.checked)}
              className="rounded bg-slate-950 border-slate-700 text-violet-600 focus:ring-violet-500"
            />
            <span>High Owned Coverage (&gt;95%)</span>
          </label>
        </div>
      </div>

      {/* Grid of Commanders */}
      {filteredCommanders.length === 0 ? (
        <div className="py-12 text-center rounded-xl bg-slate-900/40 border border-slate-800 text-slate-400">
          <ShieldAlert className="w-10 h-10 mx-auto text-amber-500 mb-2 opacity-80" />
          <p className="text-sm font-medium">No commanders match your criteria.</p>
          <p className="text-xs text-slate-500 mt-1">Try clearing filters or raising your max budget.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredCommanders.map((cmd) => (
            <CommanderCardTile key={cmd.id} commander={cmd} onSelect={onSelectCommander} />
          ))}
        </div>
      )}
    </div>
  );
};

interface CommanderCardTileProps {
  commander: CommanderSuggestion;
  onSelect: (commander: CommanderSuggestion) => void;
}

const CommanderCardTile: React.FC<CommanderCardTileProps> = ({ commander, onSelect }) => {
  return (
    <div className="group relative flex flex-col justify-between rounded-xl bg-slate-900 border border-slate-800 hover:border-violet-500/50 transition-all duration-200 overflow-hidden shadow-lg hover:shadow-violet-500/10">
      {/* Top Banner / Image overlay */}
      <div className="relative h-44 w-full bg-slate-950 overflow-hidden">
        {commander.imageUrl ? (
          <img
            src={commander.imageUrl}
            alt={commander.name}
            className="w-full h-full object-cover object-top opacity-85 group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-950 text-slate-600 font-mono text-xs">
            Artwork Unavailable
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent" />

        {/* Popularity Rank Badge */}
        <div className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-full bg-slate-950/80 backdrop-blur-md border border-slate-700/60 text-[11px] font-semibold text-amber-300 flex items-center gap-1">
          <Award className="w-3 h-3 text-amber-400" />
          <span>#{commander.popularityRank} Meta</span>
        </div>

        {/* Color Pips */}
        <div className="absolute top-2.5 right-2.5 flex items-center gap-1">
          {commander.colorIdentity.map((c) => (
            <span
              key={c}
              className={`w-5 h-5 rounded-full text-[10px] font-bold border flex items-center justify-center ${
                COLOR_MAP[c]?.bg || 'bg-slate-700 text-white'
              }`}
            >
              {c}
            </span>
          ))}
        </div>
      </div>

      {/* Content Body */}
      <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
        <div>
          <h3 className="text-base font-bold text-slate-100 group-hover:text-violet-300 transition-colors line-clamp-1">
            {commander.name}
          </h3>
          <p className="text-xs text-slate-400 line-clamp-1">{commander.typeLine}</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-2 text-xs py-2 border-y border-slate-800/80">
          <div className="flex items-center gap-1.5 text-emerald-400 bg-emerald-950/30 px-2 py-1 rounded border border-emerald-500/20">
            <Layers className="w-3.5 h-3.5" />
            <span className="font-semibold">{commander.ownershipCoverage}% Owned</span>
          </div>

          <div className="flex items-center gap-1.5 text-indigo-300 bg-indigo-950/30 px-2 py-1 rounded border border-indigo-500/20">
            <DollarSign className="w-3.5 h-3.5 text-indigo-400" />
            <span className="font-medium">${commander.estimatedCostToComplete.toFixed(2)} to complete</span>
          </div>
        </div>

        {/* Missing Staples & CTA */}
        <div className="pt-2 flex items-center justify-between gap-3">
          <span className="text-[11px] text-slate-400">
            {commander.missingStaplesCount === 0 ? (
              <span className="text-emerald-400 font-medium">All staples owned</span>
            ) : (
              <span>{commander.missingStaplesCount} missing staples</span>
            )}
          </span>

          <button
            type="button"
            onClick={() => onSelect(commander)}
            className="px-3.5 py-1.5 rounded-lg bg-violet-600 hover:bg-violet-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-all shadow-md hover:shadow-violet-600/30 active:scale-95"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Build Deck</span>
          </button>
        </div>
      </div>
    </div>
  );
};
