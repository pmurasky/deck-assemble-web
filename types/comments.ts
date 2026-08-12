export interface DeckComment {
  id: number;
  deckSlug: string;
  authorProfileId: string;
  authorDisplayName: string;
  authorAvatarUrl?: string;
  content: string;
  createdAt: string;
  updatedAt?: string;
}

export interface DeckCommentListResponse {
  items: DeckComment[];
  total: number;
  page: number;
  size: number;
}

export interface CreateCommentRequest {
  content: string;
}

export interface UpdateCommentRequest {
  content: string;
}

export interface CommunityReport {
  id: number;
  reporterProfileId: string;
  targetType: 'DECK' | 'COMMENT' | 'PROFILE';
  targetId: string;
  reason: string;
  status: 'PENDING' | 'RESOLVED' | 'DISMISSED';
  createdAt: string;
}

export interface CreateReportRequest {
  targetType: 'DECK' | 'COMMENT' | 'PROFILE';
  targetId: string;
  reason: string;
}
