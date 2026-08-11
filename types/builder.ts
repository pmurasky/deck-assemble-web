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

export interface DeckBuildConfig {
  commanderId: string;
  secondaryCommanderId?: string | null;
  ownedOnly: boolean;
  budgetLimit?: number;
  powerLevel: number; // 1 - 10
  playStyles: string[]; // e.g. ['Aggro', 'Combo']
}

export interface GenerateBuildRequest {
  commanderCardId: number | string;
  secondaryCommanderCardId?: number | string | null;
  desiredPowerLevel?: number;
  playStyle?: string;
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
