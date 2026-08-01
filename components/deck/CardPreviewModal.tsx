import React, { useState } from 'react';
import { X, RefreshCw, ArrowLeftRight, Trash2, Sparkles, Layers, RotateCw } from 'lucide-react';
import { DeckCardRow } from '@/types/builder';
import { OwnershipBadge } from './OwnershipBadge';

interface CardPreviewModalProps {
  cardRow: DeckCardRow;
  onClose: () => void;
  onSyncOwnership: (cardId: string) => void;
  onSwap: (cardRow: DeckCardRow) => void;
  onRemove: (cardId: string) => void;
}

export const CardPreviewModal: React.FC<CardPreviewModalProps> = ({
  cardRow,
  onClose,
  onSyncOwnership,
  onSwap,
  onRemove,
}) => {
  const { card, ownership, estimatedPrice, synergyScore, synergyReason, section } = cardRow;
  const faces = card.faces ?? [];
  const [faceIndex, setFaceIndex] = useState(0);

  const activeFace = faces.length > 0 ? faces[faceIndex] : null;
  const activeImageUrl = activeFace?.imageUrl || card.imageUrl;
  const activeName = activeFace?.name || card.name;
  const activeTypeLine = activeFace?.typeLine || card.typeLine;
  const activeManaCost = activeFace?.manaCost || card.manaCost;
  const activeOracleText = activeFace?.oracleText || card.oracleText;
  const activeFlavorText = activeFace?.flavorText || card.flavorText;

  const handleFlipFace = () => {
    if (faces.length > 1) {
      setFaceIndex((prev) => (prev + 1) % faces.length);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="card-preview-title"
      data-testid="card-preview-modal"
    >
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col md:flex-row max-h-[90vh]">
        {/* Card Image Display Column */}
        <div className="md:w-1/2 p-6 bg-slate-950 flex flex-col items-center justify-center relative border-b md:border-b-0 md:border-r border-slate-800">
          {activeImageUrl ? (
            <div className="relative group">
              <img
                src={activeImageUrl}
                alt={activeName}
                className="w-56 h-auto rounded-xl shadow-2xl border border-slate-700/60 object-cover transform transition-transform duration-300 group-hover:scale-105"
              />
              {faces.length > 1 && (
                <button
                  type="button"
                  onClick={handleFlipFace}
                  className="absolute bottom-3 right-3 px-3 py-1.5 rounded-lg bg-violet-600/90 hover:bg-violet-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-lg backdrop-blur-sm transition-all"
                  aria-label="Flip card face"
                >
                  <RotateCw className="w-3.5 h-3.5" />
                  <span>Flip Face</span>
                </button>
              )}
            </div>
          ) : (
            <div className="w-56 h-80 rounded-xl bg-slate-900 border border-slate-800 flex flex-col items-center justify-center text-slate-500 p-4 text-center">
              <Layers className="w-12 h-12 mb-2 text-slate-600" />
              <span className="text-xs font-bold text-slate-400">{activeName}</span>
              <span className="text-[10px] text-slate-600 mt-1">Image not available</span>
            </div>
          )}

          {/* Section & Ownership Indicator under card image */}
          <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
            <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-violet-950 border border-violet-700/40 text-violet-300">
              {section}
            </span>
            <OwnershipBadge status={ownership} price={estimatedPrice} />
          </div>
        </div>

        {/* Card Details & Actions Column */}
        <div className="md:w-1/2 p-6 flex flex-col justify-between overflow-y-auto space-y-4">
          <div>
            <div className="flex items-start justify-between gap-2 border-b border-slate-800 pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <h2 id="card-preview-title" className="text-xl font-bold text-slate-100">
                    {activeName}
                  </h2>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">{activeTypeLine}</p>
              </div>

              <div className="flex items-center gap-2">
                {activeManaCost && (
                  <span className="font-mono text-xs font-bold text-slate-300 bg-slate-950 px-2.5 py-1 rounded border border-slate-800">
                    {activeManaCost}
                  </span>
                )}
                <button
                  type="button"
                  onClick={onClose}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
                  aria-label="Close preview modal"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Oracle Text */}
            <div className="mt-4 space-y-3">
              {activeOracleText && (
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 text-xs text-slate-300 leading-relaxed whitespace-pre-line">
                  {activeOracleText}
                </div>
              )}

              {activeFlavorText && (
                <p className="text-[11px] italic text-slate-500 px-1">{activeFlavorText}</p>
              )}

              {/* Synergy Explanation */}
              {synergyReason && (
                <div className="p-3 rounded-xl bg-violet-950/40 border border-violet-500/30 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-violet-400 flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5 text-violet-400" />
                      <span>Deck Synergy Fit</span>
                    </span>
                    <span className="text-xs font-bold text-violet-300 font-mono">
                      {synergyScore}%
                    </span>
                  </div>
                  <p className="text-xs text-slate-300">{synergyReason}</p>
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons Footer */}
          <div className="pt-4 border-t border-slate-800 space-y-2">
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => onSyncOwnership(card.id)}
                className="px-3 py-2 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-700 text-slate-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
              >
                <RefreshCw className="w-3.5 h-3.5 text-emerald-400" />
                <span>{ownership === 'owned' ? 'Mark Wishlist' : 'Mark Owned'}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  onClose();
                  onSwap(cardRow);
                }}
                className="px-3 py-2 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-700 text-slate-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
              >
                <ArrowLeftRight className="w-3.5 h-3.5 text-violet-400" />
                <span>Swap Card</span>
              </button>
            </div>

            <button
              type="button"
              onClick={() => {
                onRemove(card.id);
                onClose();
              }}
              className="w-full px-3 py-2 rounded-xl bg-rose-950/30 hover:bg-rose-900/50 border border-rose-900/40 text-rose-300 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5 text-rose-400" />
              <span>Remove From Deck</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
