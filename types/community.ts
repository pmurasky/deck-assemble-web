export interface CommunityProfile {
  id: string;
  displayName: string;
  avatarUrl?: string;
  bio?: string;
  isFollowing?: boolean;
}

export interface DiscoveryDeckItem {
  id: number;
  slug: string;
  name: string;
  formatCode: string;
  commanderName?: string;
  commanderColorIdentity?: string[];
  tags?: string[];
  categoryNames?: string[];
  favoriteCount: number;
  isFavoritedByViewer: boolean;
  ownerDisplayName: string;
  updatedAt: string;
}

export interface DiscoveryFilterParams {
  commander?: string;
  colors?: string[];
  tags?: string[];
  category?: string;
  updated?: string;
  favorite?: boolean;
  page?: number;
  size?: number;
  sort?: 'updatedAt,desc' | 'name,asc' | 'favoriteCount,desc';
}

export interface DiscoveryDeckListResponse {
  items: DiscoveryDeckItem[];
  total: number;
  page: number;
  size: number;
}

export interface CommunityFeedResponse {
  items: DiscoveryDeckItem[];
  total: number;
  page: number;
  size: number;
}
