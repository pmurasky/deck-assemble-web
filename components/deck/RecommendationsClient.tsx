'use client';

import React, { useState, useEffect } from 'react';
import { MOCK_COMMANDERS, createMockGeneratedDeck, extractWishlistFromDeck } from '@/lib/mock-data/builder';
import { CommanderSuggestion, DeckBuildConfig, GeneratedDeck, WishlistItem } from '@/types/builder';
import { generateBuildDeck, getCommanderRecommendations } from '@/lib/api/recommendations';
import { CommanderSuggestionsGrid } from './CommanderSuggestionsGrid';
import { CommanderBuildConfigModal } from './CommanderBuildConfigModal';
import { GeneratedDeckView } from './GeneratedDeckView';
import { WishlistPanel } from './WishlistPanel';
import { DeckComparisonModal } from './DeckComparisonModal';
import { Sparkles } from 'lucide-react';

export function RecommendationsClient() {
  const [commanders, setCommanders] = useState<CommanderSuggestion[]>(MOCK_COMMANDERS);
  const [selectedCommander, setSelectedCommander] = useState<CommanderSuggestion | null>(MOCK_COMMANDERS[0]);
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);

  // Initialize with a default generated deck so tabs 2 and 3 are immediately accessible & previewable
  const initialDeck = createMockGeneratedDeck(MOCK_COMMANDERS[0]);
  const [activeDeck, setActiveDeck] = useState<GeneratedDeck | null>(initialDeck);
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>(() => extractWishlistFromDeck(initialDeck));
  const [currentView, setCurrentView] = useState<'suggestions' | 'generated_deck' | 'wishlist'>('suggestions');
  const [isCompareModalOpen, setIsCompareModalOpen] = useState(false);
  const [comparisonDecks, setComparisonDecks] = useState<GeneratedDeck[]>([initialDeck]);

  useEffect(() => {
    let isMounted = true;
    getCommanderRecommendations().then((fetched) => {
      if (isMounted && fetched && fetched.length > 0) {
        setCommanders(fetched);
      }
    });
    return () => {
      isMounted = false;
    };
  }, []);

  // Step 1: User clicks "Build Deck" on a Commander tile
  const handleSelectCommander = (commander: CommanderSuggestion) => {
    setSelectedCommander(commander);
    setIsConfigModalOpen(true);
  };

  // Step 2: User submits Build Config Modal
  const handleGenerateDeck = async (config: DeckBuildConfig) => {
    if (!selectedCommander) return;

    const payload = {
      commanderCardId: selectedCommander.id,
      secondaryCommanderCardId: config.secondaryCommanderId ?? null,
      desiredPowerLevel: config.powerLevel,
      playStyle: config.playStyles[0]?.toLowerCase() ?? 'midrange',
      useOwnedCardsOnly: config.ownedOnly,
      budgetLimit: config.budgetLimit,
    };

    const generated = await generateBuildDeck(payload);

    setActiveDeck(generated);
    setWishlistItems(extractWishlistFromDeck(generated));
    setIsConfigModalOpen(false);
    setCurrentView('generated_deck');

    // Add to comparison list (limit to top 3 for side-by-side comparison matrix)
    setComparisonDecks((prev) => {
      if (prev.some((d) => d.id === generated.id)) return prev;
      return [...prev.slice(-2), generated];
    });
  };

  // Switch tabs safely, ensuring an active deck exists
  const navigateToView = (view: 'suggestions' | 'generated_deck' | 'wishlist') => {
    if (!activeDeck && (view === 'generated_deck' || view === 'wishlist')) {
      const demoDeck = createMockGeneratedDeck(MOCK_COMMANDERS[0]);
      setActiveDeck(demoDeck);
      setWishlistItems(extractWishlistFromDeck(demoDeck));
    }
    setCurrentView(view);
  };

  // Step 3: Handle card acquisition from Wishlist Panel
  const handleMarkAcquired = (cardId: string) => {
    setWishlistItems((prev) =>
      prev.map((item) => (item.card.id === cardId ? { ...item, acquired: true } : item))
    );

    if (activeDeck) {
      const updatedCards = activeDeck.cards.map((c) =>
        c.card.id === cardId ? { ...c, ownership: 'owned' as const } : c
      );
      const totalCards = updatedCards.length;
      const ownedCards = updatedCards.filter((c) => c.ownership === 'owned');
      const wishlistCards = updatedCards.filter((c) => c.ownership === 'wishlist');
      const ownedCount = ownedCards.length;
      const wishlistCount = wishlistCards.length;
      const newOwnedPct = totalCards > 0 ? Math.round((ownedCount / totalCards) * 100) : 0;
      const newWishlistCost = wishlistCards.reduce((sum, c) => sum + (c.estimatedPrice || 0), 0);

      setActiveDeck({
        ...activeDeck,
        cards: updatedCards,
        ownedPercentage: newOwnedPct,
        ownedCardsCount: ownedCount,
        wishlistCardsCount: wishlistCount,
        wishlistTotalCost: newWishlistCost,
      });
    }
  };

  return (
    <div className="space-y-8" data-testid="recommendations-client">
      {/* Top Banner Navigation Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <h1 className="text-3xl font-black text-slate-100 flex items-center gap-3">
            <Sparkles className="w-8 h-8 text-violet-400 fill-violet-400/20" />
            <span>Commander Auto Deck Builder</span>
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Discover recommendations, configure build preferences, and generate synergistic EDH decks.
          </p>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 p-1.5 rounded-xl bg-slate-900 border border-slate-800">
          <button
            type="button"
            onClick={() => navigateToView('suggestions')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              currentView === 'suggestions'
                ? 'bg-violet-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            1. Suggestions
          </button>

          <button
            type="button"
            onClick={() => navigateToView('generated_deck')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              currentView === 'generated_deck'
                ? 'bg-violet-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            2. Generated Deck
          </button>

          <button
            type="button"
            onClick={() => navigateToView('wishlist')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              currentView === 'wishlist'
                ? 'bg-amber-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            3. Wishlist Panel
          </button>
        </div>
      </div>

      {/* Screen 1: Commander Suggestions Grid */}
      {currentView === 'suggestions' && (
        <CommanderSuggestionsGrid
          commanders={commanders}
          onSelectCommander={handleSelectCommander}
        />
      )}

      {/* Screen 3: Generated Deck View */}
      {currentView === 'generated_deck' && activeDeck && (
        <GeneratedDeckView
          deck={activeDeck}
          onUpdateDeck={setActiveDeck}
          onOpenWishlist={() => setCurrentView('wishlist')}
          onOpenCompare={() => setIsCompareModalOpen(true)}
        />
      )}

      {/* Screen 4: Wishlist Panel */}
      {currentView === 'wishlist' && (
        <WishlistPanel
          items={wishlistItems}
          onMarkAcquired={handleMarkAcquired}
          onBackToDeck={() => setCurrentView('generated_deck')}
        />
      )}

      {/* Screen 2: Build Config Modal */}
      <CommanderBuildConfigModal
        commander={selectedCommander}
        isOpen={isConfigModalOpen}
        onClose={() => setIsConfigModalOpen(false)}
        onGenerate={handleGenerateDeck}
      />

      {/* Cross-Cutting: Deck Comparison Modal */}
      <DeckComparisonModal
        decks={comparisonDecks}
        isOpen={isCompareModalOpen}
        onClose={() => setIsCompareModalOpen(false)}
      />
    </div>
  );
}
