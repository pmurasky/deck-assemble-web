import { auth0 } from '@/lib/auth0';
import type {
  TradeList,
  CreateTradeListRequest,
  UpdateTradeListRequest,
  TradeListMatchResult,
} from '@/types/trade-lists';

const API_BASE_URL = process.env.API_BASE_URL ?? 'http://localhost:8080';

async function fetchTrade(path: string, init?: RequestInit) {
  const token = await auth0.getAccessToken();
  const headers = new Headers(init?.headers);
  headers.set('Authorization', `Bearer ${token.token}`);
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

export async function getTradeLists(): Promise<TradeList[]> {
  return json(fetchTrade('/trade-lists'), 'Failed to fetch trade lists');
}

export async function createTradeList(req: CreateTradeListRequest): Promise<TradeList> {
  return json(
    fetchTrade('/trade-lists', {
      method: 'POST',
      body: JSON.stringify(req),
    }),
    'Failed to create trade list'
  );
}

export async function getTradeListById(id: number): Promise<TradeList> {
  return json(fetchTrade(`/trade-lists/${id}`), 'Failed to fetch trade list');
}

export async function updateTradeList(id: number, req: UpdateTradeListRequest): Promise<TradeList> {
  return json(
    fetchTrade(`/trade-lists/${id}`, {
      method: 'PUT',
      body: JSON.stringify(req),
    }),
    'Failed to update trade list'
  );
}

export async function deleteTradeList(id: number): Promise<void> {
  const res = await fetchTrade(`/trade-lists/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Failed to delete trade list');
}

export async function matchTradeLists(leftListId: number, rightListId: number): Promise<TradeListMatchResult> {
  const query = new URLSearchParams({
    leftListId: String(leftListId),
    rightListId: String(rightListId),
  }).toString();
  return json(
    fetchTrade(`/trade-lists/match?${query}`),
    'Failed to match trade lists'
  );
}
