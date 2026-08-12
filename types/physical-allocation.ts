export interface PhysicalCardAllocationSlice {
  collectionCardId: number;
  printingId: number;
  allocatedQuantity: number;
  isExactPrinting: boolean;
}

export interface PhysicalCardAllocation {
  allocationId: number;
  deckId: number;
  cardName: string;
  totalAllocatedQuantity: number;
  slices: PhysicalCardAllocationSlice[];
  createdAt: string;
}

export interface CreateAllocationRequest {
  cardName: string;
  targetQuantity: number;
  exactPrintingOnly?: boolean;
  preferredPrintingId?: number;
}

export interface UpdateAllocationRequest {
  targetQuantity: number;
  exactPrintingOnly?: boolean;
}

export interface UnavailableCardItem {
  cardName: string;
  neededQuantity: number;
  allocatedQuantity: number;
  unfulfilledQuantity: number;
  reason: 'INSUFFICIENT_COPIES' | 'LOCATION_LOCKED' | 'MISMATCHED_PRINTING';
}

export interface UnavailableCardsResponse {
  deckId: number;
  unavailableItems: UnavailableCardItem[];
}
