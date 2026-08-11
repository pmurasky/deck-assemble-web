import { auth0 } from '@/lib/auth0';
import { fetchCardById, toCard } from '@/lib/api/catalog';
import { getDeckCards, type ApiDeckCard } from '@/lib/api/decks';
import type { Card } from '@/types/card';
import type {
  CommanderSuggestion,
  DeckCardRow,
  DeckRoleSection,
  GenerateBuildRequest,
  GeneratedDeck,
  LegalityWarning,
  OwnershipStatus,
  ScoreContribution,
  WishlistItem,
} from '@/types/builder';

const API_BASE_URL = process.env.API_BASE_URL ?? 'http://localhost:8080';

export interface CommanderRecommendationFilters {
  colorIdentity?: string[];
  maxBudget?: number;
  ownedOnly?: boolean;
}

export interface ApiCommanderSuggestion {
  commanderCardId: number;
  commanderName: string;
  colorIdentity: string;
  coveragePercent: number;
  missingCardCount: number;
  estimatedCompletionCostUsd: number;
  unpricedMissingCardCount: number;
  commanderRank: number | null;
  explanations?: ScoreContribution[];
}

export interface BackendDeck {
  id: number;
  name: string;
  commanderCardId: number;
  secondaryCommanderCardId?: number | null;
  commanderName: string;
  cardCount: number;
  formatCode: string;
  status: string;
  createdAt: string;
}

export interface LegalityViolation {
  code: string;
  message: string;
}

export interface DeckBuildResult {
  deck: BackendDeck;
  cardCount: number;
  ownedCount: number;
  wishlistCount: number;
  gaps: string[];
  score: number;
  legality: {
    legal: boolean;
    violations: LegalityViolation[];
  };
}

async function fetchRecommendationsBackend(path: string, init?: RequestInit) {
  const token = await auth0.getAccessToken();
  const headers = new Headers(init?.headers);
  headers.set('Authorization', `Bearer ${token.token}`);
  headers.set('Content-Type', 'application/json');
  return fetch(new URL(`/api/v1${path}`, API_BASE_URL), { ...init, cache: 'no-store', headers });
}

export async function getBackendCommanderSuggestions(queryString: string = ''): Promise<ApiCommanderSuggestion[]> {
  const path = `/recommendations/commanders${queryString ? `?${queryString}` : ''}`;
  const res = await fetchRecommendationsBackend(path);
  if (!res.ok) throw new Error('Failed to fetch commander recommendations');
  return res.json();
}

export async function createBackendDeckBuild(body: GenerateBuildRequest): Promise<DeckBuildResult> {
  const res = await fetchRecommendationsBackend('/recommendations/builds', {
    method: 'POST',
    body: JSON.stringify({
      commanderCardId: Number(body.commanderCardId),
      secondaryCommanderCardId: body.secondaryCommanderCardId ? Number(body.secondaryCommanderCardId) : null,
      desiredPowerLevel: body.desiredPowerLevel,
      playStyle: body.playStyle,
      useOwnedCardsOnly: body.useOwnedCardsOnly,
      budgetLimit: body.budgetLimit,
    }),
  });
  if (!res.ok) {
    const errData = await res.json().catch(() => null);
    const msg = errData?.error?.message || errData?.message || 'Failed to generate deck build';
    const err = new Error(msg) as Error & { status?: number };
    err.status = res.status;
    throw err;
  }
  return res.json();
}

export async function getCommanderRecommendations(
  filters?: CommanderRecommendationFilters
): Promise<CommanderSuggestion[]> {
  const params = new URLSearchParams();
  if (filters?.colorIdentity?.length) params.set('colorIdentity', filters.colorIdentity.join(','));
  if (filters?.maxBudget !== undefined) params.set('maxBudget', String(filters.maxBudget));
  if (filters?.ownedOnly !== undefined) params.set('ownedOnly', String(filters.ownedOnly));

  const url = `/api/v1/recommendations/commanders${params.toString() ? `?${params}` : ''}`;
  const res = await fetch(url, { cache: 'no-store' });
  if (!res.ok) throw new Error('Failed to fetch commander recommendations');

  const { data } = (await res.json()) as { data: ApiCommanderSuggestion[] };
  const cardDetails = await Promise.all(data.map((item) => fetchCardById(String(item.commanderCardId))));

  return data.map((item, idx) => mapApiCommanderToSuggestion(item, cardDetails[idx]));
}

function getScryfallFallbackImageUrl(name: string): string {
  if (!name) return '';
  return `https://api.scryfall.com/cards/named?exact=${encodeURIComponent(name)}&format=image`;
}

function mapApiCommanderToSuggestion(item: ApiCommanderSuggestion, card: Card | null): CommanderSuggestion {
  const colorIdentityArray = item.colorIdentity ? item.colorIdentity.split(',').filter(Boolean) : [];
  const imageUrl = card?.imageUrl || (card?.faces && card.faces[0]?.imageUrl) || getScryfallFallbackImageUrl(item.commanderName);
  return {
    id: String(item.commanderCardId),
    name: item.commanderName,
    imageUrl,
    colors: card?.colors?.length ? card.colors : colorIdentityArray,
    colorIdentity: colorIdentityArray,
    ownershipCoverage: item.coveragePercent,
    missingStaplesCount: item.missingCardCount,
    unpricedMissingCardCount: item.unpricedMissingCardCount ?? 0,
    estimatedCostToComplete: item.estimatedCompletionCostUsd,
    popularityRank: item.commanderRank,
    typeLine: card?.typeLine ?? '',
    faces: card?.faces,
    explanations: item.explanations ?? [],
  };
}

async function fetchDeckCardsForBuild(deckId: number): Promise<ApiDeckCard[]> {
  if (typeof window !== 'undefined') {
    const res = await fetch(`/api/v1/decks/${deckId}/cards`, { cache: 'no-store' });
    if (!res.ok) throw new Error('Failed to fetch deck cards');
    const { data } = await res.json();
    return data;
  }
  return getDeckCards(deckId);
}

function mapDeckCardToRow(row: ApiDeckCard): DeckCardRow {
  const card = toCard(row.card);
  let section: DeckRoleSection = 'Main Deck';
  if (row.deckSection === 'COMMANDER') section = 'Commander';
  const ownership = (row.ownershipStatus?.toLowerCase() ?? 'owned') as OwnershipStatus;

  return {
    card,
    quantity: row.quantity,
    section,
    ownership,
    estimatedPrice: 0,
    synergyScore: 85,
    synergyReason: 'Selected by recommendation algorithm based on mana curve and synergy.',
  };
}

function mapCommanderFromRow(row?: ApiDeckCard, fallbackId?: number, fallbackName?: string): CommanderSuggestion {
  if (row) {
    const card = toCard(row.card);
    return {
      id: card.id,
      name: card.name,
      imageUrl: card.imageUrl || getScryfallFallbackImageUrl(card.name),
      colors: card.colors,
      colorIdentity: card.colorIdentity,
      ownershipCoverage: 100,
      missingStaplesCount: 0,
      estimatedCostToComplete: 0,
      popularityRank: 1,
      typeLine: card.typeLine,
      faces: card.faces,
    };
  }
  const name = fallbackName ?? 'Unknown Commander';
  return {
    id: String(fallbackId ?? 0),
    name,
    imageUrl: getScryfallFallbackImageUrl(name),
    colors: [],
    colorIdentity: [],
    ownershipCoverage: 0,
    missingStaplesCount: 0,
    estimatedCostToComplete: 0,
    popularityRank: 1,
    typeLine: '',
  };
}

const buildDeckCache = new Map<string, GeneratedDeck>();

export function getBuildCacheKey(request: GenerateBuildRequest): string {
  return [
    request.commanderCardId,
    request.secondaryCommanderCardId ?? '',
    request.desiredPowerLevel ?? 7,
    request.playStyle ?? 'midrange',
    request.useOwnedCardsOnly ?? false,
    request.budgetLimit ?? '',
  ].join(':');
}

export function getCachedBuildDeck(request: GenerateBuildRequest): GeneratedDeck | null {
  const key = getBuildCacheKey(request);
  return buildDeckCache.get(key) ?? null;
}

export function getFastMissingStaplesPreview(commander: CommanderSuggestion): WishlistItem[] {
  // Check if a build for this commander is already cached
  const defaultKey = getBuildCacheKey({
    commanderCardId: commander.id,
    desiredPowerLevel: 7,
    playStyle: 'midrange',
    useOwnedCardsOnly: false,
  });

  const cached = buildDeckCache.get(defaultKey);
  if (cached) {
    return extractWishlistFromDeck(cached);
  }

  // Generate instant placeholder missing staples based on missing card count and commander attributes
  const missingCount = commander.missingStaplesCount || 10;
  const estCardPrice = missingCount > 0 ? Number((commander.estimatedCostToComplete / missingCount).toFixed(2)) : 5.0;

  const stapleCategories = [
    'Sol Ring',
    'Arcane Signet',
    'Command Tower',
    'Lightning Greaves',
    'Rhystic Study',
    'Smothering Tithe',
    'Cyclonic Rift',
    'Demonic Tutor',
    'Heroic Intervention',
    'Fierce Guardianship',
    'Teferi\'s Protection',
    'Toxic Deluge',
  ];

  return Array.from({ length: Math.min(missingCount, 12) }, (_, i) => {
    const cardName = stapleCategories[i % stapleCategories.length] || `Synergy Staple ${i + 1}`;
    return {
      card: {
        id: `preview-staple-${commander.id}-${i}`,
        oracleId: `oracle-preview-${commander.id}-${i}`,
        name: cardName,
        typeLine: i % 3 === 0 ? 'Artifact' : i % 3 === 1 ? 'Instant' : 'Enchantment',
        manaCost: '{2}',
        manaValue: 2,
        colors: commander.colors,
        colorIdentity: commander.colorIdentity,
        setCode: 'EDH',
        setName: 'Commander Essentials',
        rarity: i % 2 === 0 ? 'rare' : 'mythic',
        legalities: { commander: 'legal' },
        imageUrl: `https://api.scryfall.com/cards/named?exact=${encodeURIComponent(cardName)}&format=image`,
      },
      priority: i < 3 ? 'High Synergy' : 'Key Staple',
      estimatedPrice: estCardPrice > 0 ? estCardPrice : 3.5,
      acquired: false,
      quantity: 1,
    };
  });
}

export async function generateBuildDeck(request: GenerateBuildRequest): Promise<GeneratedDeck> {
  const cacheKey = getBuildCacheKey(request);
  if (buildDeckCache.has(cacheKey)) {
    return buildDeckCache.get(cacheKey)!;
  }

  const payload = {
    commanderCardId: Number(request.commanderCardId),
    secondaryCommanderCardId: request.secondaryCommanderCardId ? Number(request.secondaryCommanderCardId) : null,
    desiredPowerLevel: request.desiredPowerLevel,
    playStyle: request.playStyle,
    useOwnedCardsOnly: request.useOwnedCardsOnly,
    budgetLimit: request.budgetLimit,
  };

  const res = await fetch('/api/v1/recommendations/builds', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const errData = await res.json().catch(() => null);
    const msg = errData?.error?.message || errData?.message || 'Failed to generate build deck';
    throw new Error(msg);
  }

  const { data: buildResult } = (await res.json()) as { data: DeckBuildResult };
  const deckCards = await fetchDeckCardsForBuild(buildResult.deck.id);

  const commanderRows = deckCards.filter((r) => r.deckSection === 'COMMANDER');
  const primaryRow = commanderRows.find((r) => String(r.card.id) === String(buildResult.deck.commanderCardId)) || commanderRows[0];
  const secondaryRow = commanderRows.find((r) => r !== primaryRow && String(r.card.id) === String(buildResult.deck.secondaryCommanderCardId)) || commanderRows.find((r) => r !== primaryRow);

  const commander = mapCommanderFromRow(primaryRow, Number(buildResult.deck.commanderCardId), buildResult.deck.commanderName);
  const secondaryCommander = secondaryRow ? mapCommanderFromRow(secondaryRow) : null;
  const cards = deckCards.map(mapDeckCardToRow);

  const nonLandCards = cards.filter((c) => !c.card.typeLine.toLowerCase().includes('land'));
  const totalManaValue = nonLandCards.reduce((sum, c) => sum + c.card.manaValue * c.quantity, 0);
  const totalNonLandQuantity = nonLandCards.reduce((sum, c) => sum + c.quantity, 0);
  const averageManaValue = totalNonLandQuantity > 0 ? Number((totalManaValue / totalNonLandQuantity).toFixed(2)) : 0;

  const legalityWarnings: LegalityWarning[] = (buildResult.legality?.violations ?? []).map((v) => ({
    severity: buildResult.legality?.legal ? 'warning' : 'error',
    rule: v.code || 'Legality Check',
    message: v.message,
  }));

  const generatedDeck: GeneratedDeck = {
    id: String(buildResult.deck.id),
    name: buildResult.deck.name,
    commander,
    secondaryCommander,
    gaps: buildResult.gaps ?? [],
    cards,
    totalCards: buildResult.cardCount,
    ownedPercentage: buildResult.cardCount > 0 ? Math.round((buildResult.ownedCount / buildResult.cardCount) * 100) : 0,
    ownedCardsCount: buildResult.ownedCount,
    wishlistCardsCount: buildResult.wishlistCount,
    unfillableSlotsCount: buildResult.gaps ? buildResult.gaps.length : 0,
    wishlistTotalCost: 0,
    averageManaValue,
    legalityWarnings,
    powerLevel: request.desiredPowerLevel ?? 7,
    buildScore: buildResult.score ?? 85,
  };

  buildDeckCache.set(cacheKey, generatedDeck);
  return generatedDeck;
}

export function extractWishlistFromDeck(deck: GeneratedDeck): WishlistItem[] {
  return deck.cards
    .filter((c) => c.ownership === 'wishlist')
    .map((c) => ({
      card: c.card,
      priority: c.synergyScore >= 95 ? 'High Synergy' : 'Key Staple',
      estimatedPrice: c.estimatedPrice,
      acquired: false,
      quantity: c.quantity,
    }));
}
