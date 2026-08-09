'use client';

import React, { useState, useEffect } from 'react';
import { useUser } from '@auth0/nextjs-auth0/client';
import { CommanderSuggestion, DeckBuildConfig, GeneratedDeck, WishlistItem } from '@/types/builder';
import { generateBuildDeck, getCommanderRecommendations, extractWishlistFromDeck } from '@/lib/api/recommendations';
import { CommanderSuggestionsGrid } from './CommanderSuggestionsGrid';
import { CommanderBuildConfigModal } from './CommanderBuildConfigModal';
import { GeneratedDeckView } from './GeneratedDeckView';
import { WishlistPanel } from './WishlistPanel';
import { DeckComparisonModal } from './DeckComparisonModal';
import { AuthGate } from '@/components/auth/AuthGate';
import { Sparkles, AlertCircle, Loader2 } from 'lucide-react';

export function RecommendationsClient() {
  const { user, isLoading: isUserLoading } = useUser();
  const [commanders, setCommanders] = useState<CommanderSuggestion[]>([]);
  const [selectedCommander, setSelectedCommander] = useState<CommanderSuggestion | null>(null);
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);

  const [activeDeck, setActiveDeck] = useState<GeneratedDeck | null>(null);
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);
  const [currentView, setCurrentView] = useState<'suggestions' | 'generated_deck' | 'wishlist'>('suggestions');
  const [isCompareModalOpen, setIsCompareModalOpen] = useState(false);
  const [comparisonDecks, setComparisonDecks] = useState<GeneratedDeck[]>([]);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [buildError, setBuildError] = useState<string | null>(null);
  const [isBuilding, setIsBuilding] = useState(false);

  useEffect(() => {
    let isMounted = true;
    getCommanderRecommendations()
      .then((fetched) => {
        if (isMounted) {
          setCommanders(fetched);
          setIsLoading(false);
        }
      })
      .catch((err) => {
        if (isMounted) {
          setError(err instanceof Error ? err.message : 'Failed to load commander recommendations');
          setIsLoading(false);
        }
      });
    return () => {
      isMounted = false;
    };
  }, []);

  const isUnauthorized =
    (!isUserLoading && !user) ||
    Boolean(
      error &&
        (error.includes('401') ||
          error.toLowerCase().includes('unauthorized') ||
          error.toLowerCase().includes('login') ||
          error.toLowerCase().includes('authenticated') ||
          (!user && (error.includes('502') || error.toLowerCase().includes('failed with status'))))
    );

  if (isUnauthorized) {
    return (
      <AuthGate
        title="Log In for Commander Recommendations"
        description="Sign in to your account to generate synergistic EDH decks, calculate card ownership match percentages, and create custom wishlists."
        features={[
          'AI-powered Commander recommendations based on your collection',
          'Automated 100-card EDH deck building with custom power levels',
          'Wishlist tracking & missing card price estimation',
        ]}
        icon={<Sparkles className="w-8 h-8 text-violet-400" />}
      />
    );
  }

  // Step 1: User clicks "Build Deck" on a Commander tile
  const handleSelectCommander = (commander: CommanderSuggestion) => {
    setSelectedCommander(commander);
    setBuildError(null);
    setIsConfigModalOpen(true);
  };

  // Step 2: User submits Build Config Modal
  const handleGenerateDeck = async (config: DeckBuildConfig) => {
    if (!selectedCommander) return;

    setIsBuilding(true);
    setBuildError(null);

    const payload = {
      commanderCardId: selectedCommander.id,
      secondaryCommanderCardId: config.secondaryCommanderId ?? null,
      desiredPowerLevel: config.powerLevel,
      playStyle: config.playStyles[0]?.toLowerCase() ?? 'midrange',
      useOwnedCardsOnly: config.ownedOnly,
      budgetLimit: config.budgetLimit,
    };

    try {
      setIsBuilding(true);
      const generated = await generateBuildDeck(payload);

      setActiveDeck(generated);
      setWishlistItems(extractWishlistFromDeck(generated));
      setIsConfigModalOpen(false);
      setCurrentView('generated_deck');

      setComparisonDecks((prev) => {
        if (prev.some((d) => d.id === generated.id)) return prev;
        return [...prev.slice(-2), generated];
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to generate build deck';
      setBuildError(msg);
    } finally {
      setIsBuilding(false);
    }
  };

  // Switch tabs safely, ensuring an active deck exists for tabs 2 and 3
  const navigateToView = (view: 'suggestions' | 'generated_deck' | 'wishlist') => {
    if (!activeDeck && (view === 'generated_deck' || view === 'wishlist')) {
      return;
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
            disabled={!activeDeck}
            onClick={() => navigateToView('generated_deck')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              !activeDeck
                ? 'opacity-40 cursor-not-allowed text-slate-500'
                : currentView === 'generated_deck'
                ? 'bg-violet-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            2. Generated Deck
          </button>

          <button
            type="button"
            disabled={!activeDeck}
            onClick={() => navigateToView('wishlist')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              !activeDeck
                ? 'opacity-40 cursor-not-allowed text-slate-500'
                : currentView === 'wishlist'
                ? 'bg-amber-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            3. Wishlist Panel
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-950/40 border border-rose-500/40 text-rose-300 flex items-center gap-3 text-sm">
          <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
          <div>
            <span className="font-bold">Error: </span>
            <span>{error}</span>
          </div>
        </div>
      )}

      {buildError && (
        <div className="p-4 rounded-xl bg-rose-950/40 border border-rose-500/40 text-rose-300 flex items-center gap-3 text-sm">
          <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
          <div>
            <span className="font-bold">Deck Build Failed: </span>
            <span>{buildError}</span>
          </div>
        </div>
      )}

      {/* Screen 1: Commander Suggestions Grid */}
      {currentView === 'suggestions' && (
        isLoading ? (
          <div className="p-12 flex items-center justify-center text-slate-400 gap-3">
            <Loader2 className="w-6 h-6 animate-spin text-violet-400" />
            <span className="text-sm font-semibold">Loading recommendations from backend...</span>
          </div>
        ) : (
          <CommanderSuggestionsGrid
            commanders={commanders}
            onSelectCommander={handleSelectCommander}
          />
        )
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
