export type TradeListVisibility = 'PUBLIC' | 'UNLISTED' | 'PRIVATE';

export interface TradeListItem {
  id?: number;
  cardName: string;
  printingId?: number;
  quantity: number;
  price?: number | null;
  currency?: string | null;
}

export interface TradeList {
  id: number;
  ownerProfileId: string;
  name: string;
  visibility: TradeListVisibility;
  items: TradeListItem[];
  createdAt: string;
  updatedAt?: string;
}

export interface CreateTradeListRequest {
  name: string;
  visibility: TradeListVisibility;
  items: TradeListItem[]; // items is required by UI
}

export interface UpdateTradeListRequest {
  name?: string;
  visibility?: TradeListVisibility;
  items: TradeListItem[]; // items is required by UI
}

export interface ValueDelta {
  currency: string;
  amount: number;
}

export interface TradeMatchItem {
  cardName: string;
  matchedQuantity: number;
  unitPrice?: number | null;
  currency?: string | null;
  missingPrice: boolean;
}

export interface TradeListMatchResult {
  leftListId: number;
  rightListId: number;
  leftToRightMatches: TradeMatchItem[];
  rightToLeftMatches: TradeMatchItem[];
  leftToRightValueDeltas: ValueDelta[];
  rightToLeftValueDeltas: ValueDelta[];
  hasMissingPrices: boolean;
}
