import { Card, CardFace } from './card';

export type OwnershipStatus = 'owned' | 'wishlist' | 'proxy';

export interface ScoreContribution {
  category: string; // 'coverage' | 'missing' | 'cost' | 'rank' | 'color support'
  score: number;
  explanation?: string;
  description?: string;
}

export interface CardQuantityDiff {
  cardId: number;
  cardName: string;
  manaCost?: string;
  typeLine?: string;
  baseQuantity: number;
  otherQuantity: number;
  delta: number;
}

export interface GameChangersDiff {
  added: string[];
  removed: string[];
}

export interface LegalityDelta {
  baseLegal: boolean;
  otherLegal: boolean;
  violationsAdded?: string[];
  violationsResolved?: string[];
}

export interface ComboDelta {
  addedCombos?: string[];
  removedCombos?: string[];
}

export interface DeckComparisonResponse {
  baseDeckId: number;
  otherDeckId: number;
  ownershipDelta: number;
  missingCostDeltaByCurrency: Record<string, number>;
  valueDeltaByCurrency?: Record<string, number>;
  added: CardQuantityDiff[];
  removed: CardQuantityDiff[];
  quantityChanged: CardQuantityDiff[];
  curveDelta?: Record<string, number>;
  categoryDelta?: Record<string, number>;
  legalityDelta?: LegalityDelta;
  gameChangersAdded?: string[];
  gameChangersRemoved?: string[];
  gameChangersDelta?: GameChangersDiff;
  comboDelta?: ComboDelta;
}

export interface CommanderSuggestion {
  id: string;
  name: string;
  imageUrl?: string;
  colors: string[];
  colorIdentity: string[];
  ownershipCoverage: number; // e.g., 68 for 68%
  missingStaplesCount: number;
  unpricedMissingCardCount?: number;
  estimatedCostToComplete: number; // in USD
  popularityRank: number | null;
  typeLine: string;
  faces?: CardFace[];
  explanations?: ScoreContribution[];
}

export type PlayStyleOption = 'aggro' | 'control' | 'combo' | 'tribal' | 'midrange';

export interface DeckBuildConfig {
  commanderId: string;
  secondaryCommanderId?: string | null;
  ownedOnly: boolean;
  budgetLimit?: number;
  powerLevel: number; // 1 - 10
  playStyles: string[]; // e.g. ['Aggro', 'Control', 'Combo', 'Tribal', 'Midrange']
}

export interface GenerateBuildRequest {
  commanderCardId: number | string;
  secondaryCommanderCardId?: number | string | null;
  desiredPowerLevel?: number;
  playStyle?: PlayStyleOption | string;
  useOwnedCardsOnly?: boolean;
  budgetLimit?: number;
}

export type DeckRoleSection =
  | 'Commander'
  | 'Main Deck'
  | 'Lands'
  | 'Ramp'
  | 'Draw'
  | 'Removal'
  | 'Board Wipes'
  | 'Protection'
  | 'Finisher'
  | 'Theme/Synergy'
  | 'LAND'
  | 'RAMP'
  | 'DRAW'
  | 'WIPE'
  | 'REMOVAL'
  | 'PROTECTION'
  | 'FINISHER'
  | 'SYNERGY';

export interface DeckCardRow {
  card: Card;
  quantity: number;
  section: DeckRoleSection;
  ownership: OwnershipStatus;
  estimatedPrice: number;
  synergyScore: number; // 1 - 100
  synergyReason: string;
  alternatives?: Card[];
}

export interface LegalityWarning {
  severity: 'warning' | 'error';
  rule: string; // e.g., 'Color Identity Mismatch', 'Banned Card', 'Deck Size'
  message: string;
  affectedCardIds?: string[];
}

export interface GeneratedDeck {
  id: string;
  name: string;
  commander: CommanderSuggestion;
  secondaryCommander?: CommanderSuggestion | null;
  gaps?: string[];
  cards: DeckCardRow[];
  totalCards: number;
  ownedPercentage: number;
  ownedCardsCount: number;
  wishlistCardsCount: number;
  unfillableSlotsCount: number;
  wishlistTotalCost: number;
  averageManaValue: number;
  legalityWarnings: LegalityWarning[];
  powerLevel: number;
  buildScore: number; // e.g. 92
}

export interface WishlistItem {
  card: Card;
  priority: 'High Synergy' | 'Key Staple' | 'Flex / Utility';
  estimatedPrice: number;
  acquired: boolean;
  quantity: number;
}

export interface DeckLegalityViolation {
  code: string;
  message: string;
}

export interface DeckLegalityResponse {
  legal: boolean;
  violations: DeckLegalityViolation[];
}

export interface SpellbookCombo {
  id: string;
  cards: string[];
  produces: string[];
  description: string;
  prerequisites: string;
}

export interface DeckComboResponse {
  available: boolean;
  combos: SpellbookCombo[];
}

export interface DeckWishlistItem {
  deckCardId: number;
  cardPrintingId: number;
  cardName: string;
  quantity: number;
  unitPriceUsd?: number | null;
  lineTotalUsd?: number | null;
}

export interface DeckWishlistResponse {
  items: DeckWishlistItem[];
  totalUsd?: number | null;
}

export interface OwnershipSyncChange {
  deckCardId: number;
  cardPrintingId: number;
  fromStatus: string;
  toStatus: string;
}

export interface OwnershipSyncResponse {
  changedCount: number;
  changes: OwnershipSyncChange[];
}

export interface DeckCardAlternativeReason {
  code: string;
  points: number;
  evidence: Record<string, string>;
}

export interface DeckCardAlternativeResponse {
  cardPrintingId: number;
  name: string;
  owned: boolean;
  priceUsd?: number | null;
  total: number;
  reasons: DeckCardAlternativeReason[];
}

export type DeckUpgradeObjective =
  | 'REPLACE_PROXIES_WITH_OWNED'
  | 'IMPROVE_UNDER_BUDGET'
  | 'CLOSE_CATEGORY_GAPS';

export interface DeckUpgradeRequest {
  objective: DeckUpgradeObjective;
  budget?: number | null;
  currency?: 'usd' | 'usdFoil' | 'eur' | 'tix' | string | null;
  maxChanges?: number | null;
}

export interface UpgradeSubstitutionResponse {
  deckCardId: number;
  removedPrintingId: number;
  removedName: string;
  removedOwnershipStatus: string;
  quantity: number;
  addedPrintingId: number;
  addedName: string;
  addedOwned: boolean;
  cost?: number | null;
  reasons: DeckCardAlternativeReason[];
}

export interface UpgradeMetricsResponse {
  ownershipBreakdown: Record<string, number>;
  valueByCurrency: Record<string, number>;
  missingCostByCurrency: Record<string, number>;
  functionalCategories: Record<string, number>;
  legal: boolean;
}

export interface DeckUpgradePlanResponse {
  objective: DeckUpgradeObjective;
  currency: string;
  budget?: number | null;
  maxChanges: number;
  substitutions: UpgradeSubstitutionResponse[];
  before: UpgradeMetricsResponse;
  after: UpgradeMetricsResponse;
}

