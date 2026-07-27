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
  commanderRank: number;
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

function mapApiCommanderToSuggestion(item: ApiCommanderSuggestion, card: Card | null): CommanderSuggestion {
  const colorIdentityArray = item.colorIdentity ? item.colorIdentity.split(',').filter(Boolean) : [];
  return {
    id: String(item.commanderCardId),
    name: item.commanderName,
    imageUrl: card?.imageUrl ?? '',
    colors: card?.colors ?? colorIdentityArray,
    colorIdentity: colorIdentityArray,
    ownershipCoverage: item.coveragePercent,
    missingStaplesCount: item.missingCardCount,
    estimatedCostToComplete: item.estimatedCompletionCostUsd,
    popularityRank: item.commanderRank,
    typeLine: card?.typeLine ?? '',
    faces: card?.faces,
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
      imageUrl: card.imageUrl,
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
  return {
    id: String(fallbackId ?? 0),
    name: fallbackName ?? 'Unknown Commander',
    colors: [],
    colorIdentity: [],
    ownershipCoverage: 0,
    missingStaplesCount: 0,
    estimatedCostToComplete: 0,
    popularityRank: 1,
    typeLine: '',
  };
}

export async function generateBuildDeck(request: GenerateBuildRequest): Promise<GeneratedDeck> {
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

  return {
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
