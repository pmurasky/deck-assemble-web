export type CardConditionEnum = 'NM' | 'LP' | 'MP' | 'HP' | 'DAMAGED';

export interface CollectionLocation {
  id: number;
  name: string;
  parentId?: number | null;
  description?: string;
  createdAt?: string;
}

export interface CreateLocationRequest {
  name: string;
  parentId?: number | null;
  description?: string;
}

export interface UpdateLocationRequest {
  name?: string;
  parentId?: number | null;
  description?: string;
}

export interface CardPhysicalMetadata {
  collectionCardId: number;
  locationId?: number | null;
  locationName?: string | null;
  condition?: CardConditionEnum | null;
  purchasePrice?: number | null;
  currency?: string | null; // 3-letter currency code (USD, EUR, etc.)
  notes?: string | null;
}

export interface UpdatePhysicalMetadataRequest {
  locationId?: number | null;
  condition?: CardConditionEnum | null;
  purchasePrice?: number | null;
  currency?: string | null;
  notes?: string | null;
}
