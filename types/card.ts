export interface Card {
  id: string;
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
