import React, { useState, useEffect, useMemo } from 'react';
import { X, Sparkles, Sliders, Zap, RefreshCw, AlertTriangle, Plus, Search, Trash2, ShieldCheck } from 'lucide-react';
import { CommanderSuggestion, DeckBuildConfig } from '@/types/builder';
import { getCards } from '@/lib/api/cards';
import { Card } from '@/types/card';

interface CommanderBuildConfigModalProps {
  commander: CommanderSuggestion | null;
  isOpen: boolean;
  onClose: () => void;
  onGenerate: (config: DeckBuildConfig) => Promise<void> | void;
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

const COLOR_MAP: Record<string, { label: string; bg: string; name: string }> = {
  W: { label: 'W', bg: 'bg-amber-100/90 text-amber-900 border-amber-300', name: 'White' },
  U: { label: 'U', bg: 'bg-blue-600/90 text-white border-blue-400', name: 'Blue' },
  B: { label: 'B', bg: 'bg-slate-800 text-slate-100 border-slate-600', name: 'Black' },
  R: { label: 'R', bg: 'bg-rose-600/90 text-white border-rose-400', name: 'Red' },
  G: { label: 'G', bg: 'bg-emerald-600/90 text-white border-emerald-400', name: 'Green' },
};

const COLOR_ORDER = ['W', 'U', 'B', 'R', 'G'];

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
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Partner / Secondary Commander states
  const [secondaryCommander, setSecondaryCommander] = useState<Card | CommanderSuggestion | null>(null);
  const [isSearchingPartner, setIsSearchingPartner] = useState(false);
  const [partnerQuery, setPartnerQuery] = useState('');
  const [partnerSearchResults, setPartnerSearchResults] = useState<Card[]>([]);
  const [isFetchingPartners, setIsFetchingPartners] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setErrorMessage(null);
      setSecondaryCommander(null);
      setIsSearchingPartner(false);
      setPartnerQuery('');
    }
  }, [isOpen]);

  // Fetch eligible partner commanders when searching
  useEffect(() => {
    if (!isSearchingPartner) return;

    let isMounted = true;
    const timer = setTimeout(() => {
      setIsFetchingPartners(true);
      getCards({
        commanderEligible: true,
        partnerForCardId: commander?.id,
        q: partnerQuery,
        limit: 10,
      })
        .then((res) => {
          if (isMounted) {
            // Filter out primary commander
            const results = res.cards.filter((c) => String(c.id) !== String(commander?.id));
            setPartnerSearchResults(results);
          }
        })
        .catch(() => {
          if (isMounted) setPartnerSearchResults([]);
        })
        .finally(() => {
          if (isMounted) setIsFetchingPartners(false);
        });
    }, 200);

    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [partnerQuery, isSearchingPartner, commander?.id]);

  // Combine primary and secondary color identity
  const combinedColorIdentity = useMemo(() => {
    if (!commander) return [];
    const set = new Set<string>();
    (commander.colorIdentity || []).forEach((c) => set.add(c.toUpperCase()));

    if (secondaryCommander) {
      (secondaryCommander.colorIdentity || []).forEach((c) => set.add(c.toUpperCase()));
    }

    return COLOR_ORDER.filter((c) => set.has(c));
  }, [commander, secondaryCommander]);

  if (!isOpen || !commander) return null;

  const togglePlayStyle = (style: string) => {
    setSelectedPlayStyles((prev) =>
      prev.includes(style) ? prev.filter((s) => s !== style) : [...prev, style]
    );
  };

  const handleGenerateClick = async () => {
    setErrorMessage(null);
    setIsGenerating(true);
    try {
      await onGenerate({
        commanderId: commander.id,
        secondaryCommanderId: secondaryCommander ? String(secondaryCommander.id) : null,
        ownedOnly,
        budgetLimit,
        powerLevel,
        playStyles: selectedPlayStyles,
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to generate deck build.';
      setErrorMessage(msg);
    } finally {
      setIsGenerating(false);
    }
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
        {/* Header with Commander preview and Color Identity Pips */}
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
              <h2 id="build-config-modal-title" className="text-xl font-bold text-slate-100 flex items-center gap-2">
                <span>{commander.name}</span>
                {secondaryCommander && (
                  <span className="text-xs text-slate-400 font-normal">
                    + {secondaryCommander.name}
                  </span>
                )}
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">{commander.typeLine}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Display Combined Color Identity Pips */}
            <div className="flex items-center gap-1 bg-slate-900/90 p-1.5 rounded-lg border border-slate-800" title="Combined Color Identity">
              {combinedColorIdentity.length === 0 ? (
                <span className="text-[10px] text-slate-500 font-mono px-1">Colorless</span>
              ) : (
                combinedColorIdentity.map((c) => (
                  <span
                    key={c}
                    data-testid={`color-pip-${c}`}
                    className={`w-5 h-5 rounded-full text-[10px] font-bold border flex items-center justify-center ${
                      COLOR_MAP[c]?.bg || 'bg-slate-700 text-white'
                    }`}
                  >
                    {c}
                  </span>
                ))
              )}
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
        </div>

        {/* Error Alert Banner */}
        {errorMessage && (
          <div
            role="alert"
            className="p-4 bg-rose-950/80 border-b border-rose-800/80 flex items-start gap-3 text-rose-200 animate-in fade-in"
          >
            <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
            <div className="flex-1 text-xs">
              <span className="font-bold block text-rose-100 mb-0.5">Commander Legality Error</span>
              <p>{errorMessage}</p>
            </div>
            <button
              type="button"
              onClick={() => setErrorMessage(null)}
              className="text-rose-400 hover:text-rose-200 p-1"
              aria-label="Dismiss error"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Body controls */}
        <div className="p-6 space-y-6 overflow-y-auto">
          {/* Partner / Secondary Commander Selection Section */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-violet-400" />
                  <span>Partner / Secondary Commander</span>
                  <span className="text-[11px] font-normal text-slate-400">(Optional)</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Optionally select a partner or background commander after picking your primary commander.
                </p>
              </div>

              {!secondaryCommander && !isSearchingPartner && (
                <button
                  type="button"
                  onClick={() => setIsSearchingPartner(true)}
                  className="px-3 py-1.5 rounded-lg bg-violet-950 hover:bg-violet-900 border border-violet-700/50 text-violet-300 text-xs font-semibold flex items-center gap-1.5 transition-all"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Partner</span>
                </button>
              )}
            </div>

            {/* If Secondary Commander selected */}
            {secondaryCommander && (
              <div className="flex items-center justify-between p-3 rounded-lg bg-slate-900 border border-slate-700/70">
                <div className="flex items-center gap-3">
                  {secondaryCommander.imageUrl ? (
                    <img
                      src={secondaryCommander.imageUrl}
                      alt={secondaryCommander.name}
                      className="w-10 h-10 rounded object-cover border border-slate-700"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded bg-slate-800 border border-slate-700 flex items-center justify-center text-[10px] font-bold text-slate-400">
                      Card
                    </div>
                  )}
                  <div>
                    <h4 className="text-xs font-bold text-slate-100">{secondaryCommander.name}</h4>
                    <p className="text-[11px] text-slate-400">{secondaryCommander.typeLine}</p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setSecondaryCommander(null);
                    setErrorMessage(null);
                  }}
                  aria-label="Remove partner commander"
                  className="p-1.5 rounded-lg text-rose-400 hover:text-rose-300 hover:bg-rose-950/40 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Searching for Partner Commander */}
            {isSearchingPartner && !secondaryCommander && (
              <div className="space-y-2 pt-2 border-t border-slate-800">
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
                  <input
                    type="text"
                    placeholder="Search eligible partner cards (e.g. Thrasios, Yoshimaru)..."
                    value={partnerQuery}
                    onChange={(e) => setPartnerQuery(e.target.value)}
                    className="w-full pl-9 pr-8 py-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-100 text-xs focus:ring-1 focus:ring-violet-500 focus:outline-none"
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setIsSearchingPartner(false);
                      setPartnerQuery('');
                    }}
                    className="absolute right-2.5 top-2.5 text-slate-500 hover:text-slate-300"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>

                {isFetchingPartners && (
                  <p className="text-xs text-slate-500 flex items-center gap-1.5 py-1">
                    <RefreshCw className="w-3 h-3 animate-spin text-violet-400" />
                    <span>Searching eligible commanders...</span>
                  </p>
                )}

                {!isFetchingPartners && partnerSearchResults.length === 0 && (
                  <p className="text-xs text-slate-500 py-2 text-center italic" data-testid="no-partners-found">
                    No eligible partner commanders found for this card.
                  </p>
                )}

                {partnerSearchResults.length > 0 && (
                  <div className="max-h-40 overflow-y-auto rounded-lg bg-slate-900 border border-slate-800 divide-y divide-slate-800">
                    {partnerSearchResults.map((card) => (
                      <button
                        key={card.id}
                        type="button"
                        onClick={() => {
                          setSecondaryCommander(card);
                          setIsSearchingPartner(false);
                          setErrorMessage(null);
                        }}
                        className="w-full px-3 py-2 text-left hover:bg-violet-950/40 flex items-center justify-between text-xs transition-colors"
                      >
                        <div>
                          <span className="font-semibold text-slate-200 block">{card.name}</span>
                          <span className="text-[10px] text-slate-400">{card.typeLine}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          {card.colorIdentity?.map((c) => (
                            <span key={c} className="w-4 h-4 rounded-full text-[9px] font-bold bg-slate-800 border border-slate-600 text-slate-300 flex items-center justify-center">
                              {c}
                            </span>
                          ))}
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

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
