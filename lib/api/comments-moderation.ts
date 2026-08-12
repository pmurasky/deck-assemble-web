import { auth0 } from '@/lib/auth0';
import type {
  DeckComment,
  DeckCommentListResponse,
  CommunityReport,
  CreateReportRequest,
} from '@/types/comments';

const API_BASE_URL = process.env.API_BASE_URL ?? 'http://localhost:8080';

async function fetchCommentsMod(path: string, init?: RequestInit, requireAuth = true) {
  const headers = new Headers(init?.headers);
  if (requireAuth) {
    const token = await auth0.getAccessToken();
    headers.set('Authorization', `Bearer ${token.token}`);
  }
  headers.set('Content-Type', 'application/json');
  return fetch(new URL(`/api/v1${path}`, API_BASE_URL), { ...init, cache: 'no-store', headers });
}

async function json<T>(res: Promise<Response>, fallbackMessage: string): Promise<T> {
  const response = await res;
  if (!response.ok) {
    const errData = await response.json().catch(() => null);
    const msg = errData?.error?.message || errData?.message || fallbackMessage;
    const err = new Error(msg) as Error & { status?: number };
    err.status = response.status;
    throw err;
  }
  return response.json() as Promise<T>;
}

export async function setCommentsEnabled(
  deckId: number,
  enabled: boolean
): Promise<{ deckId: number; commentsEnabled: boolean }> {
  return json(
    fetchCommentsMod(`/decks/${deckId}/comments-enabled`, {
      method: 'PATCH',
      body: JSON.stringify({ commentsEnabled: enabled }),
    }),
    'Failed to update comments settings'
  );
}

export async function getDeckComments(
  slug: string,
  page = 0,
  size = 20
): Promise<DeckCommentListResponse> {
  const query = new URLSearchParams({ page: String(page), size: String(size) }).toString();
  return json(
    fetchCommentsMod(`/shared/decks/${encodeURIComponent(slug)}/comments?${query}`, {}, false),
    'Failed to fetch deck comments'
  );
}

export async function createDeckComment(
  slug: string,
  content: string
): Promise<DeckComment> {
  return json(
    fetchCommentsMod(`/shared/decks/${encodeURIComponent(slug)}/comments`, {
      method: 'POST',
      body: JSON.stringify({ content }),
    }),
    'Failed to create deck comment'
  );
}

export async function updateDeckComment(
  slug: string,
  commentId: number,
  content: string
): Promise<DeckComment> {
  return json(
    fetchCommentsMod(`/shared/decks/${encodeURIComponent(slug)}/comments/${commentId}`, {
      method: 'PATCH',
      body: JSON.stringify({ content }),
    }),
    'Failed to update comment'
  );
}

export async function deleteDeckComment(
  slug: string,
  commentId: number
): Promise<void> {
  const res = await fetchCommentsMod(`/shared/decks/${encodeURIComponent(slug)}/comments/${commentId}`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error('Failed to delete comment');
}

export async function submitCommunityReport(req: CreateReportRequest): Promise<CommunityReport> {
  return json(
    fetchCommentsMod('/community/reports', {
      method: 'POST',
      body: JSON.stringify(req),
    }),
    'Failed to submit community report'
  );
}

export async function resolveCommunityReport(reportId: number): Promise<CommunityReport> {
  return json(
    fetchCommentsMod(`/community/reports/${reportId}/resolve`, {
      method: 'POST',
    }),
    'Failed to resolve community report'
  );
}

export async function dismissCommunityReport(reportId: number): Promise<CommunityReport> {
  return json(
    fetchCommentsMod(`/community/reports/${reportId}/dismiss`, {
      method: 'POST',
    }),
    'Failed to dismiss community report'
  );
}
