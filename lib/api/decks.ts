import { auth0 } from '@/lib/auth0';
import type { ApiCard } from '@/lib/api/catalog';
import type {
  DeckComparisonResponse,
  DeckLegalityResponse,
  DeckComboResponse,
  DeckWishlistResponse,
  OwnershipSyncResponse,
  DeckCardAlternativeResponse,
  DeckUpgradeRequest,
  DeckUpgradePlanResponse,
} from '@/types/builder';

const API_BASE_URL = process.env.API_BASE_URL ?? 'http://localhost:8080';

export interface ApiDeck {
  id: number;
  name: string;
  formatCode: string;
  commanderCardId: number | null;
  cardCount?: number;
  commanderName?: string;
}

export type DeckSection = 'COMMANDER' | 'MAIN_DECK' | 'SIDEBOARD' | 'COMPANION' | 'MAYBE_BOARD';

export interface ApiDeckCard {
  id: number;
  cardPrintingId: number;
  quantity: number;
  deckSection: DeckSection;
  ownershipStatus?: string;
  card: ApiCard;
}

async function fetchDecks(path: string, init?: RequestInit) {
  const token = await auth0.getAccessToken();
  const headers = new Headers(init?.headers);
  headers.set('Authorization', `Bearer ${token.token}`);
  headers.set('Content-Type', 'application/json');
  return fetch(new URL(`/api/v1${path}`, API_BASE_URL), { ...init, cache: 'no-store', headers });
}

async function json<T>(res: Promise<Response>, fallbackMessage: string): Promise<T> {
  const response = await res;
  if (!response.ok) {
    const errData = await response.json().catch(() => null);
    const msg = errData?.error?.message || errData?.message || fallbackMessage;
    const err = new Error(msg) as Error & { status?: number };
    err.status = response.status;
    throw err;
  }
  return response.json() as Promise<T>;
}

export async function getDecks(): Promise<ApiDeck[]> {
  return json(fetchDecks('/decks'), 'Failed to fetch decks');
}

export async function createDeck(name: string, formatCode: string): Promise<ApiDeck> {
  return json(fetchDecks('/decks', {
    method: 'POST',
    body: JSON.stringify({ name, formatCode }),
  }), 'Failed to create deck');
}

export async function getDeck(id: number): Promise<ApiDeck> {
  return json(fetchDecks(`/decks/${id}`), 'Failed to fetch deck');
}

export async function updateDeck(id: number, name?: string, formatCode?: string, commanderCardId?: number | null): Promise<ApiDeck> {
  const body: Record<string, unknown> = {};
  if (name !== undefined) body.name = name;
  if (formatCode !== undefined) body.formatCode = formatCode;
  if (commanderCardId !== undefined) body.commanderCardId = commanderCardId;
  
  return json(fetchDecks(`/decks/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(body),
  }), 'Failed to update deck');
}

export async function deleteDeck(id: number): Promise<void> {
  const res = await fetchDecks(`/decks/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Failed to delete deck');
}

export async function getDeckCards(deckId: number): Promise<ApiDeckCard[]> {
  return json(fetchDecks(`/decks/${deckId}/cards`), 'Failed to fetch deck cards');
}

export async function addCardToDeck(
  deckId: number,
  cardPrintingId: number,
  quantity: number,
  deckSection: DeckSection
): Promise<ApiDeckCard> {
  return json(fetchDecks(`/decks/${deckId}/cards`, {
    method: 'POST',
    body: JSON.stringify({ cardPrintingId, quantity, deckSection }),
  }), 'Failed to add card to deck');
}

export async function updateDeckCard(
  deckId: number,
  deckCardId: number,
  quantity: number,
  deckSection: DeckSection
): Promise<ApiDeckCard> {
  return json(fetchDecks(`/decks/${deckId}/cards/${deckCardId}`, {
    method: 'PATCH',
    body: JSON.stringify({ quantity, deckSection }),
  }), 'Failed to update deck card');
}

export async function removeDeckCard(deckId: number, deckCardId: number): Promise<void> {
  const res = await fetchDecks(`/decks/${deckId}/cards/${deckCardId}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Failed to remove deck card');
}

export interface ManaCurveItem {
  cmc: string;
  count: number;
}

export interface ColorDemandItem {
  color: string;
  count: number;
}

export interface TypeDistributionItem {
  type: string;
  count: number;
}

export interface OwnershipBreakdown {
  ownedCount: number;
  missingCount: number;
  ownedPercentage: number;
}

export interface CategoryItem {
  name: string;
  count: number;
  isCustom?: boolean;
}

export interface FunctionalCategoryItem {
  name: string;
  count: number;
  isCustom?: boolean;
}

export interface ComboItem {
  name: string;
  cards: string[];
  description?: string;
}

export interface DeckAnalysisData {
  deckId: number;
  totalCards: number;
  manaCurve: ManaCurveItem[];
  colorDemand: ColorDemandItem[];
  typeDistribution: TypeDistributionItem[];
  ownership: OwnershipBreakdown;
  valueByCurrency: Record<string, number>;
  categories: CategoryItem[];
  functionalCategories?: FunctionalCategoryItem[];
  combos: ComboItem[];
}

export async function getDeckAnalysis(deckId: number): Promise<DeckAnalysisData> {
  const res = await fetch(`/api/v1/decks/${deckId}/analysis`);
  if (!res.ok) {
    const errData = await res.json().catch(() => null);
    const msg = errData?.error?.message || errData?.message || 'Failed to fetch deck analysis';
    const err = new Error(msg) as Error & { status?: number };
    err.status = res.status;
    throw err;
  }
  const jsonRes = await res.json();
  return (jsonRes.data ?? jsonRes) as DeckAnalysisData;
}

export async function getDeckCategories(deckId: number): Promise<import('@/types/card').DeckCategory[]> {
  const res = await fetch(`/api/v1/decks/${deckId}/categories`);
  if (!res.ok) throw new Error('Failed to fetch deck categories');
  const jsonRes = await res.json();
  return (jsonRes.data ?? jsonRes) as import('@/types/card').DeckCategory[];
}

export async function createDeckCategory(
  deckId: number,
  data: { name: string; description?: string; color?: string }
): Promise<import('@/types/card').DeckCategory> {
  const res = await fetch(`/api/v1/decks/${deckId}/categories`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to create deck category');
  const jsonRes = await res.json();
  return (jsonRes.data ?? jsonRes) as import('@/types/card').DeckCategory;
}

export async function updateDeckCategory(
  deckId: number,
  categoryId: number,
  data: { name?: string; description?: string; color?: string }
): Promise<import('@/types/card').DeckCategory> {
  const res = await fetch(`/api/v1/decks/${deckId}/categories/${categoryId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to update deck category');
  const jsonRes = await res.json();
  return (jsonRes.data ?? jsonRes) as import('@/types/card').DeckCategory;
}

export async function deleteDeckCategory(deckId: number, categoryId: number): Promise<void> {
  const res = await fetch(`/api/v1/decks/${deckId}/categories/${categoryId}`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error('Failed to delete deck category');
}

export async function bulkReplaceCategoryCards(
  deckId: number,
  categoryId: number,
  cardPrintingIds: number[]
): Promise<void> {
  const res = await fetch(`/api/v1/decks/${deckId}/categories/${categoryId}/cards`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ cardPrintingIds }),
  });
  if (!res.ok) throw new Error('Failed to bulk replace category cards');
}


export async function getDeckCategoriesBackend(deckId: number) {
  return json(fetchDecks(`/decks/${deckId}/categories`), 'Failed to fetch deck categories');
}

export async function createDeckCategoryBackend(
  deckId: number,
  data: { name: string; description?: string; color?: string }
) {
  return json(
    fetchDecks(`/decks/${deckId}/categories`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
    'Failed to create deck category'
  );
}

export async function updateDeckCategoryBackend(
  deckId: number,
  categoryId: number,
  data: { name?: string; description?: string; color?: string }
) {
  return json(
    fetchDecks(`/decks/${deckId}/categories/${categoryId}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),
    'Failed to update deck category'
  );
}

export async function deleteDeckCategoryBackend(deckId: number, categoryId: number): Promise<void> {
  const res = await fetchDecks(`/decks/${deckId}/categories/${categoryId}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Failed to delete deck category');
}

export async function bulkReplaceCategoryCardsBackend(
  deckId: number,
  categoryId: number,
  cardPrintingIds: number[]
): Promise<void> {
  const res = await fetchDecks(`/decks/${deckId}/categories/${categoryId}/cards`, {
    method: 'PUT',
    body: JSON.stringify({ cardPrintingIds }),
  });
  if (!res.ok) throw new Error('Failed to bulk replace category cards');
}

// Client API helpers for Folders, Tags, Templates
export async function getDeckFolders(): Promise<import('@/types/card').DeckFolder[]> {
  const res = await fetch('/api/v1/deck-folders');
  if (!res.ok) throw new Error('Failed to fetch deck folders');
  const jsonRes = await res.json();
  return (jsonRes.data ?? jsonRes) as import('@/types/card').DeckFolder[];
}

export async function createDeckFolder(data: { name: string; parentId?: number | null; icon?: string; color?: string }) {
  const res = await fetch('/api/v1/deck-folders', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to create deck folder');
  const jsonRes = await res.json();
  return (jsonRes.data ?? jsonRes) as import('@/types/card').DeckFolder;
}

export async function setDeckFolder(deckId: number, folderId: number | null): Promise<void> {
  const res = await fetch(`/api/v1/decks/${deckId}/folder`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ folderId }),
  });
  if (!res.ok) throw new Error('Failed to set deck folder');
}

export async function getDeckTags(): Promise<import('@/types/card').DeckTag[]> {
  const res = await fetch('/api/v1/deck-tags');
  if (!res.ok) throw new Error('Failed to fetch deck tags');
  const jsonRes = await res.json();
  return (jsonRes.data ?? jsonRes) as import('@/types/card').DeckTag[];
}

export async function createDeckTag(data: { name: string; color?: string }) {
  const res = await fetch('/api/v1/deck-tags', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to create deck tag');
  const jsonRes = await res.json();
  return (jsonRes.data ?? jsonRes) as import('@/types/card').DeckTag;
}

export async function setDeckTags(deckId: number, tagIds: number[]): Promise<void> {
  const res = await fetch(`/api/v1/decks/${deckId}/tags`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ tagIds }),
  });
  if (!res.ok) throw new Error('Failed to set deck tags');
}

export async function getCategoryTemplates(): Promise<import('@/types/card').CategoryTemplate[]> {
  const res = await fetch('/api/v1/category-templates');
  if (!res.ok) throw new Error('Failed to fetch category templates');
  const jsonRes = await res.json();
  return (jsonRes.data ?? jsonRes) as import('@/types/card').CategoryTemplate[];
}

export async function applyCategoryTemplate(deckId: number, templateId: number): Promise<void> {
  const res = await fetch(`/api/v1/decks/${deckId}/categories/from-template`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ templateId }),
  });
  if (!res.ok) throw new Error('Failed to apply category template');
}

// Backend Auth0 proxy handlers for BFF routes
export async function getDeckFoldersBackend() {
  return json(fetchDecks('/deck-folders'), 'Failed to fetch deck folders');
}

export async function createDeckFolderBackend(data: { name: string; parentId?: number | null; icon?: string; color?: string }) {
  return json(fetchDecks('/deck-folders', { method: 'POST', body: JSON.stringify(data) }), 'Failed to create deck folder');
}

export async function updateDeckFolderBackend(id: number, data: Record<string, unknown>) {
  return json(fetchDecks(`/deck-folders/${id}`, { method: 'PATCH', body: JSON.stringify(data) }), 'Failed to update deck folder');
}

export async function deleteDeckFolderBackend(id: number) {
  const res = await fetchDecks(`/deck-folders/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Failed to delete deck folder');
}

export async function setDeckFolderBackend(deckId: number, folderId: number | null) {
  return json(fetchDecks(`/decks/${deckId}/folder`, { method: 'PUT', body: JSON.stringify({ folderId }) }), 'Failed to set deck folder');
}

export async function getDeckTagsBackend() {
  return json(fetchDecks('/deck-tags'), 'Failed to fetch deck tags');
}

export async function createDeckTagBackend(data: { name: string; color?: string }) {
  return json(fetchDecks('/deck-tags', { method: 'POST', body: JSON.stringify(data) }), 'Failed to create deck tag');
}

export async function updateDeckTagBackend(id: number, data: Record<string, unknown>) {
  return json(fetchDecks(`/deck-tags/${id}`, { method: 'PATCH', body: JSON.stringify(data) }), 'Failed to update deck tag');
}

export async function deleteDeckTagBackend(id: number) {
  const res = await fetchDecks(`/deck-tags/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Failed to delete deck tag');
}

export async function setDeckTagsBackend(deckId: number, tagIds: number[]) {
  return json(fetchDecks(`/decks/${deckId}/tags`, { method: 'PUT', body: JSON.stringify({ tagIds }) }), 'Failed to set deck tags');
}

export async function getCategoryTemplatesBackend() {
  return json(fetchDecks('/category-templates'), 'Failed to fetch category templates');
}

export async function createCategoryTemplateBackend(data: Record<string, unknown>) {
  return json(fetchDecks('/category-templates', { method: 'POST', body: JSON.stringify(data) }), 'Failed to create category template');
}

export async function updateCategoryTemplateBackend(id: number, data: Record<string, unknown>) {
  return json(fetchDecks(`/category-templates/${id}`, { method: 'PATCH', body: JSON.stringify(data) }), 'Failed to update category template');
}

export async function deleteCategoryTemplateBackend(id: number) {
  const res = await fetchDecks(`/category-templates/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Failed to delete category template');
}

export async function applyCategoryTemplateBackend(deckId: number, templateId: number) {
  return json(fetchDecks(`/decks/${deckId}/categories/from-template`, { method: 'POST', body: JSON.stringify({ templateId }) }), 'Failed to apply category template');
}

export async function getDeckComparison(deckId: number, otherDeckId: number): Promise<DeckComparisonResponse> {
  const res = await fetch(`/api/v1/decks/${deckId}/comparison/${otherDeckId}`, { cache: 'no-store' });
  if (!res.ok) {
    const errData = await res.json().catch(() => null);
    const msg = errData?.error?.message || errData?.message || 'Failed to fetch deck comparison';
    throw new Error(msg);
  }
  const jsonRes = await res.json();
  return (jsonRes.data ?? jsonRes) as DeckComparisonResponse;
}

export async function getDeckComparisonBackend(deckId: number, otherDeckId: number): Promise<DeckComparisonResponse> {
  return json(fetchDecks(`/decks/${deckId}/comparison/${otherDeckId}`), 'Failed to fetch deck comparison');
}

export async function getDeckLegality(deckId: number): Promise<DeckLegalityResponse> {
  return json(fetchDecks(`/decks/${deckId}/legality`), 'Failed to fetch deck legality');
}

export async function getDeckCombos(deckId: number): Promise<DeckComboResponse> {
  return json(fetchDecks(`/decks/${deckId}/combos`), 'Failed to fetch deck combos');
}

export async function duplicateDeck(deckId: number): Promise<ApiDeck> {
  return json(fetchDecks(`/decks/${deckId}/duplicate`, { method: 'POST' }), 'Failed to duplicate deck');
}

export async function archiveDeck(deckId: number): Promise<ApiDeck> {
  return json(fetchDecks(`/decks/${deckId}/archive`, { method: 'POST' }), 'Failed to archive deck');
}

export async function syncDeckOwnership(deckId: number): Promise<OwnershipSyncResponse> {
  return json(fetchDecks(`/decks/${deckId}/sync-ownership`, { method: 'POST' }), 'Failed to sync deck ownership');
}

export async function getDeckWishlist(deckId: number): Promise<DeckWishlistResponse> {
  return json(fetchDecks(`/decks/${deckId}/wishlist`), 'Failed to fetch deck wishlist');
}

export async function acquireDeckCard(deckId: number, deckCardId: number): Promise<ApiDeckCard> {
  return json(fetchDecks(`/decks/${deckId}/cards/${deckCardId}/acquire`, { method: 'POST' }), 'Failed to acquire deck card');
}

export async function getDeckCardAlternatives(
  deckId: number,
  deckCardId: number,
  limit?: number,
  ownedFirst?: boolean
): Promise<DeckCardAlternativeResponse[]> {
  const query = new URLSearchParams();
  if (limit !== undefined) query.set('limit', String(limit));
  if (ownedFirst !== undefined) query.set('ownedFirst', String(ownedFirst));
  const queryString = query.toString();
  const path = `/decks/${deckId}/cards/${deckCardId}/alternatives${queryString ? `?${queryString}` : ''}`;
  return json(fetchDecks(path), 'Failed to fetch deck card alternatives');
}

export async function createDeckUpgradePlan(
  deckId: number,
  req: DeckUpgradeRequest
): Promise<DeckUpgradePlanResponse> {
  return json(
    fetchDecks(`/decks/${deckId}/upgrade-plans`, {
      method: 'POST',
      body: JSON.stringify(req),
    }),
    'Failed to create deck upgrade plan'
  );
}

// Client-side BFF wrappers
export async function fetchDeckLegality(deckId: number): Promise<DeckLegalityResponse> {
  const res = await fetch(`/api/v1/decks/${deckId}/legality`);
  if (!res.ok) throw new Error('Failed to fetch deck legality');
  const jsonRes = await res.json();
  return (jsonRes.data ?? jsonRes) as DeckLegalityResponse;
}

export async function fetchDeckCombos(deckId: number): Promise<DeckComboResponse> {
  const res = await fetch(`/api/v1/decks/${deckId}/combos`);
  if (!res.ok) throw new Error('Failed to fetch deck combos');
  const jsonRes = await res.json();
  return (jsonRes.data ?? jsonRes) as DeckComboResponse;
}

export async function fetchDeckWishlist(deckId: number): Promise<DeckWishlistResponse> {
  const res = await fetch(`/api/v1/decks/${deckId}/wishlist`);
  if (!res.ok) throw new Error('Failed to fetch deck wishlist');
  const jsonRes = await res.json();
  return (jsonRes.data ?? jsonRes) as DeckWishlistResponse;
}

export async function fetchDeckCardAlternatives(
  deckId: number,
  deckCardId: number,
  limit?: number,
  ownedFirst?: boolean
): Promise<DeckCardAlternativeResponse[]> {
  const query = new URLSearchParams();
  if (limit !== undefined) query.set('limit', String(limit));
  if (ownedFirst !== undefined) query.set('ownedFirst', String(ownedFirst));
  const queryString = query.toString();
  const res = await fetch(`/api/v1/decks/${deckId}/cards/${deckCardId}/alternatives${queryString ? `?${queryString}` : ''}`);
  if (!res.ok) throw new Error('Failed to fetch deck card alternatives');
  const jsonRes = await res.json();
  return (jsonRes.data ?? jsonRes) as DeckCardAlternativeResponse[];
}

export async function requestDeckUpgradePlan(
  deckId: number,
  req: DeckUpgradeRequest
): Promise<DeckUpgradePlanResponse> {
  const res = await fetch(`/api/v1/decks/${deckId}/upgrade-plans`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(req),
  });
  if (!res.ok) throw new Error('Failed to create deck upgrade plan');
  const jsonRes = await res.json();
  return (jsonRes.data ?? jsonRes) as DeckUpgradePlanResponse;
}

export async function acquireDeckCardClient(deckId: number, deckCardId: number): Promise<ApiDeckCard> {
  const res = await fetch(`/api/v1/decks/${deckId}/cards/${deckCardId}/acquire`, {
    method: 'POST',
  });
  if (!res.ok) throw new Error('Failed to acquire deck card');
  const jsonRes = await res.json();
  return (jsonRes.data ?? jsonRes) as ApiDeckCard;
}

export async function syncDeckOwnershipClient(deckId: number): Promise<OwnershipSyncResponse> {
  const res = await fetch(`/api/v1/decks/${deckId}/sync-ownership`, {
    method: 'POST',
  });
  if (!res.ok) throw new Error('Failed to sync deck ownership');
  const jsonRes = await res.json();
  return (jsonRes.data ?? jsonRes) as OwnershipSyncResponse;
}

export async function duplicateDeckClient(deckId: number): Promise<ApiDeck> {
  const res = await fetch(`/api/v1/decks/${deckId}/duplicate`, {
    method: 'POST',
  });
  if (!res.ok) throw new Error('Failed to duplicate deck');
  const jsonRes = await res.json();
  return (jsonRes.data ?? jsonRes) as ApiDeck;
}

export async function archiveDeckClient(deckId: number): Promise<ApiDeck> {
  const res = await fetch(`/api/v1/decks/${deckId}/archive`, {
    method: 'POST',
  });
  if (!res.ok) throw new Error('Failed to archive deck');
  const jsonRes = await res.json();
  return (jsonRes.data ?? jsonRes) as ApiDeck;
}






