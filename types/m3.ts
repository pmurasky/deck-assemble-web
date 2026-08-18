import type { ApiDeck, ApiDeckCard } from '@/lib/api/decks';

export type DeckRevisionChangeType =
  | 'CREATED'
  | 'METADATA_UPDATED'
  | 'COMMANDER_CHANGED'
  | 'CARD_ADDED'
  | 'CARD_UPDATED'
  | 'CARD_REMOVED'
  | 'CATEGORY_CHANGED'
  | 'TAG_CHANGED'
  | 'FOLDER_CHANGED'
  | 'IMPORTED'
  | 'RESTORED'
  | 'FORKED';

export interface DeckRevisionSummary {
  id: number;
  revisionNumber: number;
  changeType: DeckRevisionChangeType;
  description?: string;
  createdAt: string;
  createdBy?: string;
}

export interface DeckRevisionListResponse {
  items: DeckRevisionSummary[];
  total: number;
  page: number;
  size: number;
}

export interface ApiDeckSnapshot extends ApiDeck {
  cards: ApiDeckCard[];
  folderId?: number | null;
  tagIds?: number[];
  categories?: unknown[];
  revisionNumber: number;
}

export interface DeckRevisionDetail {
  revisionNumber: number;
  createdAt: string;
  snapshot: ApiDeckSnapshot;
}

export interface DeckRevisionDiff {
  revisionA: number;
  revisionB: number;
  metadataChanges?: Record<string, { old: unknown; new: unknown }>;
  cardChanges?: Array<{
    cardName: string;
    oldQuantity: number;
    newQuantity: number;
    section: string;
  }>;
  categoryChanges?: Array<{
    categoryName: string;
    type: 'ADDED' | 'REMOVED' | 'UPDATED';
  }>;
  tagChanges?: Array<{
    tag: string;
    action: 'ADDED' | 'REMOVED';
  }>;
}

export interface RestoreRevisionRequest {
  expectedCurrentRevision: number;
}

export type MulliganStrategy = 'NONE' | 'LONDON_LAND_RANGE';

export interface MulliganConfig {
  mulliganStrategy: MulliganStrategy;
  minimumLands?: number;
  maximumLands?: number;
  seed?: string;
}

export interface SampleHandRequest {
  count: number;
  mulliganConfig?: MulliganConfig;
}

export interface SampleHand {
  id: string;
  handNumber: number;
  cards: Array<{
    id: number;
    name: string;
    imageUrl?: string;
    manaCost?: string;
    typeLine?: string;
  }>;
  mulliganCount: number;
}

export interface SampleHandsResponse {
  seed: string;
  hands: SampleHand[];
}

export interface SimulationRequest {
  iterations: number;
  turns: number;
  mulliganConfig?: MulliganConfig;
}

export interface SimulationConfidence {
  marginOfErrorPercent95: number;
}

export interface SimulationResponse {
  seed: string;
  landDropProbabilityByTurn: Record<number, number>;
  colorAvailabilityByTurn: Record<string, Record<number, number>>;
  cardsSeenByTurn: Record<number, number>;
  castabilityByTurn: Record<number, number>;
  playableSpellCountByTurn: Record<number, number>;
  confidence: SimulationConfidence;
}

export type DeckVisibility = 'PRIVATE' | 'UNLISTED' | 'PUBLIC';

export interface UpdatePublishingRequest {
  visibility: DeckVisibility;
}

export interface PublishDeckResponse {
  deckId: number;
  publishedRevisionNumber: number;
  publishedAt: string;
  slug: string;
}

export interface SetPrimerRequest {
  title?: string;
  content: string;
}

export interface DeckPrimer {
  title?: string;
  content: string;
  updatedAt?: string;
}

export interface SharedDeckResponse {
  id: number;
  name: string;
  formatCode: string;
  commanderName?: string;
  cards: ApiDeckCard[];
  primer?: DeckPrimer;
  publishedAt: string;
  slug: string;
  visibility: DeckVisibility;
  publishedRevisionNumber: number;
}

export interface ForkDeckResponse {
  newDeckId: number;
  newDeck: ApiDeck;
}

export interface PracticeCard {
  id: number | string;
  name: string;
  typeLine?: string;
  manaCost?: string;
  oracleText?: string;
  imageUrl?: string;
  tapped?: boolean;
}

export type PracticePhase =
  | 'UNTAP'
  | 'UPKEEP'
  | 'DRAW'
  | 'MAIN_1'
  | 'COMBAT'
  | 'MAIN_2'
  | 'END';

export interface PracticeSessionResponse {
  sessionId: string;
  turn: number;
  phase: PracticePhase;
  hand: PracticeCard[];
  battlefield: PracticeCard[];
  graveyard: PracticeCard[];
  libraryCount: number;
  manaPool: Record<string, number>;
  logs?: string[];
}

