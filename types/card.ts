export interface CardFace {
  name: string;
  manaCost?: string;
  typeLine?: string;
  oracleText?: string;
  flavorText?: string;
  power?: string;
  toughness?: string;
  loyalty?: string;
  imageUrl?: string;
}

export interface Card {
  id: string;
  printingId?: number;
  oracleId: string;
  name: string;
  imageUrl?: string;
  manaCost?: string;
  manaValue: number;
  colors: string[];
  colorIdentity: string[];
  typeLine: string;
  oracleText?: string;
  flavorText?: string;
  power?: string;
  toughness?: string;
  loyalty?: string;
  setCode: string;
  setName: string;
  rarity: string;
  legalities: Record<string, string>;
  faces?: CardFace[];
}

export interface CollectionCard {
  id: number;
  cardId: string;
  quantity: number;
  foilQuantity: number;
  setCode: string;
}

export interface Deck {
  id: number;
  name: string;
  format: string;
  commanderCardId?: string;
  description?: string;
  legalityStatus: string;
  cardCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface DeckCard {
  id: number;
  cardId: string;
  quantity: number;
  section: string;
  ownedQuantity: number;
}

export interface DeckRecommendation {
  cardId: string;
  replacementCardId?: string;
  reason: string;
  scoreImpact: number;
  owned: boolean;
  category: string;
}

export interface AdvancedCardSearchParams {
  name?: string;
  oracleText?: string;
  minCmc?: number;
  maxCmc?: number;
  power?: string;
  toughness?: string;
  loyalty?: string;
  rarity?: string;
  format?: string;
  keywords?: string;
  artist?: string;
  isReserved?: boolean;
  isFullArt?: boolean;
  isPromo?: boolean;
}

export interface DeckCategory {
  id: number;
  deckId: number;
  name: string;
  description?: string;
  color?: string;
  displayOrder?: number;
  cardCount?: number;
}

export interface DeckFolder {
  id: number;
  name: string;
  parentId?: number | null;
  icon?: string;
  color?: string;
  deckCount?: number;
}

export interface DeckTag {
  id: number;
  name: string;
  color?: string;
}

export interface CategoryTemplate {
  id: number;
  name: string;
  description?: string;
  categories: { name: string; description?: string; color?: string }[];
}

