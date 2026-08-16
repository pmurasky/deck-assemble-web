import type { ApiResponse } from '@/types/api';

export type BeginnerGuideStatus = 'DRAFT' | 'PUBLISHED' | 'STALE';
export type BeginnerGuideReviewStatus = 'DRAFT' | 'PUBLISHED' | 'STALE' | 'REPORTED';

export interface BeginnerGuide {
  cardId: string;
  status: BeginnerGuideStatus;
  summary: string;
  examples: string | string[];
  whenToUse: string;
  publishedAt: string;
}

export interface BeginnerGuideRequestResult {
  cardId: string;
  status: BeginnerGuideStatus;
}

export interface BeginnerGuideReportResult {
  success: boolean;
}

export interface AdminBeginnerGuideItem {
  cardId: string;
  cardName: string;
  status: BeginnerGuideReviewStatus;
  summary: string;
  examples: string | string[];
  whenToUse: string;
  sourceRulingsSnapshot?: string | string[] | null;
  generatedAt?: string | null;
  reviewedBy?: string | null;
}

export interface AdminBeginnerGuidePage {
  content: AdminBeginnerGuideItem[];
  totalElements: number;
}

export interface UpdateAdminBeginnerGuidePayload {
  summary: string;
  examples: string | string[];
  whenToUse: string;
}

export interface AdminBeginnerGuidesQueryParams {
  status?: string;
  page?: number;
  size?: number;
}

function buildGuideUrl(cardId: string, suffix = '', faceIndex?: number): string {
  const basePath = `/api/v1/cards/${encodeURIComponent(cardId)}/beginner-guide${suffix}`;
  if (faceIndex !== undefined && faceIndex !== null) {
    return `${basePath}?face=${faceIndex}`;
  }
  return basePath;
}

async function parseJsonResponse<T>(res: Response, fallbackMessage: string): Promise<T> {
  if (!res.ok) {
    const json: ApiResponse<never> = await res.json().catch(() => null);
    const msg = json?.error?.message || `${fallbackMessage} (${res.status})`;
    const error = new Error(msg) as Error & { status?: number };
    error.status = res.status;
    throw error;
  }
  const json: ApiResponse<T> = await res.json();
  return (json.data ?? json) as T;
}

export async function getBeginnerGuide(
  cardId: string,
  faceIndex?: number
): Promise<BeginnerGuide | null> {
  const url = buildGuideUrl(cardId, '', faceIndex);
  const res = await fetch(url);

  if (res.status === 404) {
    return null;
  }

  if (!res.ok) {
    const json: ApiResponse<never> = await res.json().catch(() => null);
    throw new Error(json?.error?.message || `Failed to fetch beginner guide (${res.status})`);
  }

  const json: ApiResponse<BeginnerGuide> = await res.json();
  return json.data ?? null;
}

export async function requestBeginnerGuide(
  cardId: string,
  faceIndex?: number
): Promise<BeginnerGuideRequestResult> {
  const url = buildGuideUrl(cardId, '/request', faceIndex);
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  });

  if (!res.ok) {
    const json: ApiResponse<never> = await res.json().catch(() => null);
    const msg = json?.error?.message || `Failed to request beginner guide (${res.status})`;
    const error = new Error(msg) as Error & { status?: number };
    error.status = res.status;
    throw error;
  }

  const json: ApiResponse<BeginnerGuideRequestResult> = await res.json();
  return json.data ?? { cardId, status: 'DRAFT' };
}

export async function reportBeginnerGuide(
  cardId: string,
  faceIndex?: number
): Promise<BeginnerGuideReportResult> {
  const url = buildGuideUrl(cardId, '/report', faceIndex);
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  });

  if (!res.ok) {
    const json: ApiResponse<never> = await res.json().catch(() => null);
    const msg = json?.error?.message || `Failed to report beginner guide (${res.status})`;
    const error = new Error(msg) as Error & { status?: number };
    error.status = res.status;
    throw error;
  }

  const json: ApiResponse<BeginnerGuideReportResult> = await res.json().catch(() => ({ data: { success: true } }));
  return json.data ?? { success: true };
}

export async function getAdminBeginnerGuides(
  params?: AdminBeginnerGuidesQueryParams
): Promise<AdminBeginnerGuidePage> {
  const query = new URLSearchParams({
    status: params?.status ?? 'DRAFT,STALE,REPORTED',
    page: String(params?.page ?? 0),
    size: String(params?.size ?? 20),
  });
  const res = await fetch(`/api/v1/admin/beginner-guides?${query.toString()}`);
  return parseJsonResponse<AdminBeginnerGuidePage>(res, 'Failed to fetch beginner guides review queue');
}

export async function updateAdminBeginnerGuide(
  cardId: string,
  payload: UpdateAdminBeginnerGuidePayload
): Promise<AdminBeginnerGuideItem> {
  const res = await fetch(`/api/v1/admin/beginner-guides/${encodeURIComponent(cardId)}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return parseJsonResponse<AdminBeginnerGuideItem>(res, 'Failed to update beginner guide');
}

export async function publishAdminBeginnerGuide(
  cardId: string
): Promise<AdminBeginnerGuideItem> {
  const res = await fetch(`/api/v1/admin/beginner-guides/${encodeURIComponent(cardId)}/publish`, {
    method: 'POST',
  });
  return parseJsonResponse<AdminBeginnerGuideItem>(res, 'Failed to publish beginner guide');
}

export async function regenerateAdminBeginnerGuide(
  cardId: string
): Promise<AdminBeginnerGuideItem> {
  const res = await fetch(`/api/v1/admin/beginner-guides/${encodeURIComponent(cardId)}/regenerate`, {
    method: 'POST',
  });
  return parseJsonResponse<AdminBeginnerGuideItem>(res, 'Failed to regenerate beginner guide');
}

export async function rejectAdminBeginnerGuide(
  cardId: string
): Promise<void> {
  const res = await fetch(`/api/v1/admin/beginner-guides/${encodeURIComponent(cardId)}/reject`, {
    method: 'POST',
  });
  if (!res.ok) {
    const json: ApiResponse<never> = await res.json().catch(() => null);
    const msg = json?.error?.message || `Failed to reject beginner guide (${res.status})`;
    const error = new Error(msg) as Error & { status?: number };
    error.status = res.status;
    throw error;
  }
}
