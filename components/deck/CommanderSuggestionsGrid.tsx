import React, { useState, useMemo, useEffect } from 'react';
import { Sparkles, DollarSign, Layers, Award, Filter, ShieldAlert, Search, RefreshCw, ExternalLink, CheckCircle } from 'lucide-react';
import { CommanderSuggestion } from '@/types/builder';
import { getCards } from '@/lib/api/cards';

interface CommanderSuggestionsGridProps {
  commanders: CommanderSuggestion[];
  onSelectCommander: (commander: CommanderSuggestion) => void;
  onViewMissingStaples?: (commander: CommanderSuggestion) => void;
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
  onViewMissingStaples,
}) => {
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [maxBudget, setMaxBudget] = useState<number | ''>('');
  const [ownedOnlyFilter, setOwnedOnlyFilter] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchingCatalog, setIsSearchingCatalog] = useState(false);
  const [catalogSearchResults, setCatalogSearchResults] = useState<CommanderSuggestion[]>([]);

  const toggleColor = (color: string) => {
    setSelectedColors((prev) =>
      prev.includes(color) ? prev.filter((c) => c !== color) : [...prev, color]
    );
  };

  // Perform catalog search via GET /cards?commanderEligible=true when query changes
  useEffect(() => {
    let isMounted = true;
    if (!searchQuery.trim()) {
      setTimeout(() => {
        if (isMounted) setCatalogSearchResults([]);
      }, 0);
      return () => {
        isMounted = false;
      };
    }

    const timer = setTimeout(() => {
      setIsSearchingCatalog(true);
      getCards({
        commanderEligible: true,
        q: searchQuery,
        colorIdentity: selectedColors.join(','),
        limit: 24,
      })
        .then((res) => {
          if (isMounted) {
            const mapped: CommanderSuggestion[] = res.cards.map((card, idx) => ({
              id: card.id,
              name: card.name,
              imageUrl: card.imageUrl,
              colors: card.colors || [],
              colorIdentity: card.colorIdentity || [],
              ownershipCoverage: 70,
              missingStaplesCount: 3,
              estimatedCostToComplete: 25.0,
              popularityRank: idx + 10,
              typeLine: card.typeLine,
              faces: card.faces,
            }));
            setCatalogSearchResults(mapped);
          }
        })
        .catch(() => {
          if (isMounted) setCatalogSearchResults([]);
        })
        .finally(() => {
          if (isMounted) setIsSearchingCatalog(false);
        });
    }, 250);

    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [searchQuery, selectedColors]);

  const displayedCommanders = useMemo(() => {
    const sourceList = searchQuery.trim() ? catalogSearchResults : commanders;

    return sourceList.filter((cmd) => {
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
  }, [commanders, catalogSearchResults, searchQuery, selectedColors, maxBudget, ownedOnlyFilter]);

  return (
    <div className="space-y-6" data-testid="commander-suggestions-grid">
      {/* What can I build title section */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-violet-400" />
            <span>What can I build?</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Browse EDHREC suggestions or search all commander-eligible cards.
          </p>
        </div>

        {/* Free search bar using GET /cards?commanderEligible=true */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search all eligible commanders..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-8 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 text-xs focus:ring-2 focus:ring-violet-500 focus:outline-none"
          />
          {isSearchingCatalog && (
            <RefreshCw className="w-3.5 h-3.5 absolute right-3 top-2.5 text-violet-400 animate-spin" />
          )}
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
      {displayedCommanders.length === 0 ? (
        <div className="py-12 text-center rounded-xl bg-slate-900/40 border border-slate-800 text-slate-400">
          <ShieldAlert className="w-10 h-10 mx-auto text-amber-500 mb-2 opacity-80" />
          <p className="text-sm font-medium">No commanders match your criteria.</p>
          <p className="text-xs text-slate-500 mt-1">Try clearing filters or raising your max budget.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {displayedCommanders.map((cmd) => (
            <CommanderCardTile
              key={cmd.id}
              commander={cmd}
              onSelect={onSelectCommander}
              onViewMissingStaples={onViewMissingStaples}
            />
          ))}
        </div>
      )}
    </div>
  );
};

interface CommanderCardTileProps {
  commander: CommanderSuggestion;
  onSelect: (commander: CommanderSuggestion) => void;
  onViewMissingStaples?: (commander: CommanderSuggestion) => void;
}

const CommanderCardTile: React.FC<CommanderCardTileProps> = ({ commander, onSelect, onViewMissingStaples }) => {
  const [faceIndex, setFaceIndex] = useState(0);
  const faces = commander.faces ?? [];
  const canFlip = faces.length >= 2;

  const activeName = faces.length > 0 ? (faces[faceIndex]?.name || commander.name) : commander.name;
  const activeTypeLine = faces.length > 0 ? (faces[faceIndex]?.typeLine || commander.typeLine) : commander.typeLine;
  const fallbackUrl = activeName ? `https://api.scryfall.com/cards/named?exact=${encodeURIComponent(activeName)}&format=image` : '';
  const initialImageUrl = (faces.length > 0 ? (faces[faceIndex]?.imageUrl || commander.imageUrl) : commander.imageUrl) || fallbackUrl;

  const [imgSrc, setImgSrc] = useState(initialImageUrl);

  return (
    <div className="group relative flex flex-col justify-between rounded-xl bg-slate-900 border border-slate-800 hover:border-violet-500/50 transition-all duration-200 overflow-hidden shadow-lg hover:shadow-violet-500/10">
      {/* Top Banner / Image overlay */}
      <div className="relative h-44 w-full bg-slate-950 overflow-hidden">
        {imgSrc ? (
          <img
            src={imgSrc}
            alt={activeName}
            onError={() => {
              if (fallbackUrl && imgSrc !== fallbackUrl) {
                setImgSrc(fallbackUrl);
              }
            }}
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
          <span>{commander.popularityRank !== null && commander.popularityRank !== undefined ? `#${commander.popularityRank} Rank` : 'Unranked'}</span>
        </div>

        {/* Two-Sided Badge & Flip Button */}
        {canFlip && (
          <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between z-10">
            <span className="px-2 py-0.5 rounded bg-slate-950/90 border border-slate-700/80 text-[10px] font-semibold text-slate-300 backdrop-blur-xs">
              Two-Sided
            </span>
            <button
              type="button"
              onClick={() => setFaceIndex(faceIndex === 0 ? 1 : 0)}
              aria-label={`Show ${faces[faceIndex === 0 ? 1 : 0]?.name ?? commander.name}`}
              className="px-2 py-1 rounded bg-slate-950/90 hover:bg-slate-900 border border-slate-700/80 text-slate-200 text-[11px] font-bold backdrop-blur-xs transition-all shadow-md active:scale-95"
            >
              Flip card
            </button>
          </div>
        )}

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
            {activeName}
          </h3>
          <p className="text-xs text-slate-400 line-clamp-1">{activeTypeLine}</p>
        </div>

        {/* Explanation Chips */}
        {commander.explanations && commander.explanations.length > 0 && (
          <div className="flex flex-wrap gap-1.5 py-0.5">
            {commander.explanations.map((exp, idx) => {
              const label = exp.sentence || exp.explanation || exp.description || `${exp.category}: ${exp.score}`;
              return (
                <span
                  key={idx}
                  title={label}
                  className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-slate-950/80 text-violet-300 border border-violet-500/30 backdrop-blur-xs"
                >
                  {label}
                </span>
              );
            })}
          </div>
        )}

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
          {commander.missingStaplesCount === 0 ? (
            <span className="text-[11px] text-emerald-400 font-medium flex items-center gap-1">
              <CheckCircle className="w-3 h-3 text-emerald-400" />
              All staples owned
            </span>
          ) : (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                if (onViewMissingStaples) {
                  onViewMissingStaples(commander);
                } else {
                  onSelect(commander);
                }
              }}
              className="text-[11px] text-violet-400 hover:text-violet-300 font-semibold hover:underline flex items-center gap-1 transition-colors group/link cursor-pointer"
              title="Click to view missing cards wishlist for this commander"
            >
              <span>
                {commander.missingStaplesCount} missing staples
                {commander.unpricedMissingCardCount ? ` (${commander.unpricedMissingCardCount} unpriced)` : ''}
              </span>
              <ExternalLink className="w-3 h-3 opacity-75 group-hover/link:opacity-100 group-hover/link:translate-x-0.5 transition-all" />
            </button>
          )}

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
