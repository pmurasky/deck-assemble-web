import { Card, CardFace } from './card';

export type OwnershipStatus = 'owned' | 'wishlist' | 'proxy';

export interface CommanderSuggestion {
  id: string;
  name: string;
  imageUrl?: string;
  colors: string[];
  colorIdentity: string[];
  ownershipCoverage: number; // e.g., 68 for 68%
  missingStaplesCount: number;
  estimatedCostToComplete: number; // in USD
  popularityRank: number;
  typeLine: string;
  faces?: CardFace[];
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
  | 'Lands'
  | 'Ramp'
  | 'Draw'
  | 'Removal'
  | 'Board Wipes'
  | 'Theme/Synergy';

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
