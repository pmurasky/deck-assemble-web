import React from 'react';
import { Filter, RotateCcw } from 'lucide-react';

export interface CardFilters {
  colors: string[];
  types: string[];
  manaValue: number;
  minCmc?: number;
  maxCmc?: number;
  rarity?: string;
  oracleText?: string;
  format?: string;
  power?: string;
  toughness?: string;
}

interface CardFilterPanelProps {
  filters: CardFilters;
  onFilterChange: (filters: CardFilters) => void;
  className?: string;
}

const CARD_TYPES = [
  'Creature',
  'Instant',
  'Sorcery',
  'Artifact',
  'Enchantment',
  'Planeswalker',
  'Land',
  'Token Creature',
  'Token Artifact',
];

const COLOR_OPTIONS = [
  { code: 'W', label: 'White', bg: 'bg-amber-100 text-zinc-900 border-amber-300' },
  { code: 'U', label: 'Blue', bg: 'bg-blue-600 text-white border-blue-400' },
  { code: 'B', label: 'Black', bg: 'bg-zinc-800 text-zinc-200 border-zinc-600' },
  { code: 'R', label: 'Red', bg: 'bg-red-600 text-white border-red-400' },
  { code: 'G', label: 'Green', bg: 'bg-emerald-600 text-white border-emerald-400' },
];

const RARITIES = ['common', 'uncommon', 'rare', 'mythic'];

export function CardFilterPanel({ filters, onFilterChange, className = '' }: CardFilterPanelProps) {
  const handleColorToggle = (color: string) => {
    const newColors = filters.colors.includes(color)
      ? filters.colors.filter((c) => c !== color)
      : [...filters.colors, color];

    onFilterChange({ ...filters, colors: newColors });
  };

  const handleTypeToggle = (type: string) => {
    const newTypes = filters.types.includes(type)
      ? filters.types.filter((t) => t !== type)
      : [...filters.types, type];

    onFilterChange({ ...filters, types: newTypes });
  };

  const handleReset = () => {
    onFilterChange({
      colors: [],
      types: [],
      manaValue: 0,
      minCmc: undefined,
      maxCmc: undefined,
      rarity: undefined,
      oracleText: undefined,
      format: undefined,
      power: undefined,
      toughness: undefined,
    });
  };

  const hasActiveFilters =
    filters.colors.length > 0 ||
    filters.types.length > 0 ||
    filters.manaValue > 0 ||
    filters.minCmc !== undefined ||
    filters.maxCmc !== undefined ||
    !!filters.rarity ||
    !!filters.oracleText ||
    !!filters.format ||
    !!filters.power ||
    !!filters.toughness;

  return (
    <div className={`p-5 rounded-2xl border border-zinc-800/80 bg-zinc-900/90 backdrop-blur-xl shadow-xl flex flex-col space-y-6 ${className}`}>
      <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
        <div className="flex items-center gap-2 text-zinc-100 font-bold text-base">
          <Filter className="w-4 h-4 text-purple-400" />
          <span>Catalog Filters</span>
        </div>
        {hasActiveFilters && (
          <button
            type="button"
            onClick={handleReset}
            className="flex items-center gap-1 text-xs text-zinc-400 hover:text-purple-400 transition-colors"
          >
            <RotateCcw className="w-3 h-3" />
            Reset
          </button>
        )}
      </div>

      <div className="space-y-6">
        <div>
          <h4 className="font-semibold text-xs text-zinc-400 uppercase tracking-wider mb-3">Color Identity</h4>
          <div className="grid grid-cols-5 gap-2">
            {COLOR_OPTIONS.map(({ code, label, bg }) => {
              const isSelected = filters.colors.includes(code);
              return (
                <label key={code} className="cursor-pointer">
                  <input
                    type="checkbox"
                    aria-label={label}
                    checked={isSelected}
                    onChange={() => handleColorToggle(code)}
                    className="sr-only"
                  />
                  <div
                    className={`h-9 rounded-xl flex items-center justify-center font-bold text-xs border transition-all transform active:scale-95 ${
                      isSelected
                        ? `${bg} ring-2 ring-purple-500 shadow-lg scale-105`
                        : 'bg-zinc-950/60 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                    }`}
                    title={label}
                  >
                    {code}
                  </div>
                </label>
              );
            })}
          </div>
        </div>

        <div>
          <h4 className="font-semibold text-xs text-zinc-400 uppercase tracking-wider mb-3">Card Type</h4>
          <div className="flex flex-wrap gap-2">
            {CARD_TYPES.map((type) => {
              const isSelected = filters.types.includes(type);
              return (
                <button
                  key={type}
                  type="button"
                  onClick={() => handleTypeToggle(type)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-all ${
                    isSelected
                      ? 'bg-purple-600/30 border-purple-500 text-purple-300 shadow-md shadow-purple-950/40'
                      : 'bg-zinc-950/40 border-zinc-800/80 text-zinc-400 hover:text-zinc-200 hover:border-zinc-700'
                  }`}
                >
                  {type}
                </button>
              );
            })}
          </div>
        </div>

        {/* Advanced Filters: CMC Range & Rarity */}
        <div>
          <h4 className="font-semibold text-xs text-zinc-400 uppercase tracking-wider mb-3">Mana Value Range (CMC)</h4>
          <div className="flex items-center gap-2">
            <input
              type="number"
              placeholder="Min"
              value={filters.minCmc ?? ''}
              onChange={(e) =>
                onFilterChange({
                  ...filters,
                  minCmc: e.target.value !== '' ? parseInt(e.target.value, 10) : undefined,
                })
              }
              className="w-1/2 px-3 py-1.5 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-zinc-100 focus:outline-none focus:border-purple-500"
            />
            <span className="text-zinc-500 text-xs">to</span>
            <input
              type="number"
              placeholder="Max"
              value={filters.maxCmc ?? ''}
              onChange={(e) =>
                onFilterChange({
                  ...filters,
                  maxCmc: e.target.value !== '' ? parseInt(e.target.value, 10) : undefined,
                })
              }
              className="w-1/2 px-3 py-1.5 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-zinc-100 focus:outline-none focus:border-purple-500"
            />
          </div>
        </div>

        <div>
          <h4 className="font-semibold text-xs text-zinc-400 uppercase tracking-wider mb-3">Rarity</h4>
          <div className="flex flex-wrap gap-2">
            {RARITIES.map((r) => {
              const isSelected = filters.rarity === r;
              return (
                <button
                  key={r}
                  type="button"
                  onClick={() =>
                    onFilterChange({
                      ...filters,
                      rarity: isSelected ? undefined : r,
                    })
                  }
                  className={`capitalize px-3 py-1 rounded-xl text-xs font-medium border transition-all ${
                    isSelected
                      ? 'bg-purple-600/30 border-purple-500 text-purple-300'
                      : 'bg-zinc-950/40 border-zinc-800 text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  {r}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}


