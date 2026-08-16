import type { ApiResponse } from '@/types/api';

export type BeginnerGuideStatus = 'DRAFT' | 'PUBLISHED' | 'STALE';

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

function buildGuideUrl(cardId: string, suffix = '', faceIndex?: number): string {
  const basePath = `/api/v1/cards/${encodeURIComponent(cardId)}/beginner-guide${suffix}`;
  if (faceIndex !== undefined && faceIndex !== null) {
    return `${basePath}?face=${faceIndex}`;
  }
  return basePath;
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
