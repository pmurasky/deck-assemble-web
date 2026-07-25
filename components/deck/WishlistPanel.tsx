import React, { useState } from 'react';
import {
  ShoppingCart,
  CheckCircle2,
  Download,
  FileText,
  ArrowLeft,
  DollarSign,
  Sparkles,
} from 'lucide-react';
import { WishlistItem } from '@/types/builder';

interface WishlistPanelProps {
  items: WishlistItem[];
  onMarkAcquired: (cardId: string) => void;
  onBackToDeck: () => void;
}

const PRIORITIES = ['High Synergy', 'Key Staple', 'Flex / Utility'] as const;

export const WishlistPanel: React.FC<WishlistPanelProps> = ({
  items,
  onMarkAcquired,
  onBackToDeck,
}) => {
  const [copiedNotification, setCopiedNotification] = useState<string | null>(null);

  const activeItems = items.filter((item) => !item.acquired);
  const acquiredItems = items.filter((item) => item.acquired);

  const totalCost = activeItems.reduce(
    (sum, item) => sum + item.estimatedPrice * item.quantity,
    0
  );

  const exportAsText = () => {
    const textLines = activeItems
      .map((item) => `${item.quantity} ${item.card.name}`)
      .join('\n');
    navigator.clipboard.writeText(textLines);
    setCopiedNotification('Wishlist exported as text to clipboard!');
    setTimeout(() => setCopiedNotification(null), 3000);
  };

  const exportAsCSV = () => {
    const header = 'Name,Set,Quantity,Price\n';
    const csvLines = activeItems
      .map(
        (item) =>
          `"${item.card.name}",${item.card.setCode.toUpperCase()},${item.quantity},${item.estimatedPrice.toFixed(2)}`
      )
      .join('\n');
    const blob = new Blob([header + csvLines], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'deck_wishlist.csv';
    link.click();
    URL.revokeObjectURL(url);
    setCopiedNotification('Downloaded CSV file!');
    setTimeout(() => setCopiedNotification(null), 3000);
  };

  return (
    <div className="space-y-6" data-testid="wishlist-panel">
      {/* Top Action Bar */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onBackToDeck}
              className="p-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-300 hover:text-white hover:border-slate-700 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold text-amber-400 uppercase tracking-wider">
                <ShoppingCart className="w-3.5 h-3.5" />
                <span>Wishlist Manager</span>
              </div>
              <h1 className="text-2xl font-black text-slate-100 mt-0.5">
                Deck Completion Wishlist
              </h1>
            </div>
          </div>

          {/* Export Actions */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={exportAsText}
              aria-label="Export Text"
              className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-all"
            >
              <FileText className="w-4 h-4 text-violet-400" />
              <span>Export Text</span>
            </button>

            <button
              type="button"
              onClick={exportAsCSV}
              aria-label="Export CSV"
              className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-all"
            >
              <Download className="w-4 h-4 text-emerald-400" />
              <span>Export CSV</span>
            </button>
          </div>
        </div>

        {/* Copy Toast */}
        {copiedNotification && (
          <div className="p-2.5 rounded-lg bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 text-xs font-medium animate-in fade-in">
            {copiedNotification}
          </div>
        )}

        {/* Total Cost Summary Card */}
        <div className="flex items-center justify-between p-4 rounded-xl bg-slate-950 border border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-amber-950/60 border border-amber-500/30 text-amber-400">
              <DollarSign className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs text-slate-400 uppercase font-semibold">Total Estimated Wishlist Cost</span>
              <div className="text-2xl font-black text-amber-300">${totalCost.toFixed(2)}</div>
            </div>
          </div>

          <div className="text-right text-xs text-slate-400">
            <span className="font-bold text-slate-200">{activeItems.length}</span> unowned cards remaining
          </div>
        </div>
      </div>

      {/* Priority Groupings */}
      <div className="space-y-6">
        {PRIORITIES.map((priority) => {
          const priorityItems = activeItems.filter((i) => i.priority === priority);
          if (priorityItems.length === 0) return null;

          return (
            <div key={priority} className="space-y-3">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span>{priority}</span>
                  <span className="text-xs font-normal text-slate-500 font-mono">
                    ({priorityItems.length})
                  </span>
                </h3>
              </div>

              <div className="divide-y divide-slate-800/60 rounded-xl bg-slate-900 border border-slate-800 overflow-hidden">
                {priorityItems.map((item) => (
                  <div
                    key={item.card.id}
                    className="flex items-center justify-between p-4 hover:bg-slate-850 transition-colors group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="font-mono text-xs text-slate-500 font-bold w-5">
                        {item.quantity}x
                      </span>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-slate-100 group-hover:text-amber-300 transition-colors truncate">
                            {item.card.name}
                          </span>
                          <span className="font-mono text-xs text-slate-400">
                            {item.card.manaCost}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 truncate">{item.card.typeLine}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <span className="font-mono text-sm font-bold text-amber-300">
                        ${item.estimatedPrice.toFixed(2)}
                      </span>

                      <button
                        type="button"
                        onClick={() => onMarkAcquired(item.card.id)}
                        aria-label={`Mark as acquired ${item.card.name}`}
                        className="px-3 py-1.5 rounded-lg bg-emerald-950 border border-emerald-500/40 hover:bg-emerald-900 text-emerald-300 text-xs font-semibold flex items-center gap-1.5 transition-all"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Mark as Acquired</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}

        {/* Acquired History Section */}
        {acquiredItems.length > 0 && (
          <div className="pt-6 space-y-3 border-t border-slate-800">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Recently Acquired ({acquiredItems.length})</span>
            </h3>

            <div className="divide-y divide-slate-800/40 rounded-xl bg-slate-950/60 border border-slate-800/60 overflow-hidden">
              {acquiredItems.map((item) => (
                <div
                  key={item.card.id}
                  className="flex items-center justify-between p-3 opacity-60 text-xs"
                >
                  <span className="font-medium text-slate-300 line-through">
                    {item.quantity}x {item.card.name}
                  </span>
                  <span className="text-emerald-400 font-semibold">Acquired</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
