import { auth0 } from '@/lib/auth0';

const API_BASE_URL = process.env.API_BASE_URL ?? 'http://localhost:8080';

export interface LatestCommanderRankRun {
  id: number;
  cardsUpdated: number;
  completedAt: string;
}

export interface CommanderRankRefreshResult {
  status: 'COMPLETED' | 'FAILED' | string;
  cardsUpdated: number;
  errorSummary: string | null;
}

export async function fetchLatestCommanderRankRun(): Promise<LatestCommanderRankRun | null> {
  const token = await auth0.getAccessToken();
  const res = await fetch(new URL('/api/v1/admin/commander-ranks/latest', API_BASE_URL), {
    cache: 'no-store',
    headers: { Authorization: `Bearer ${token.token}` },
  });
  if (res.status === 404) {
    return null;
  }
  if (!res.ok) {
    throw new Error(`Commander rank latest returned ${res.status}`);
  }
  return res.json() as Promise<LatestCommanderRankRun>;
}

export async function triggerCommanderRankRefresh(): Promise<CommanderRankRefreshResult> {
  const token = await auth0.getAccessToken();
  const url = new URL('/api/v1/admin/commander-ranks/refresh', API_BASE_URL);
  const res = await fetch(url, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token.token}` },
  });
  if (!res.ok) {
    const errData = await res.json().catch(() => null);
    const msg = errData?.errorSummary || errData?.error?.message || `Commander rank refresh trigger returned ${res.status}`;
    const err = new Error(msg) as Error & { status?: number };
    err.status = res.status;
    throw err;
  }
  return res.json() as Promise<CommanderRankRefreshResult>;
}
