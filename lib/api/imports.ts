import { auth0 } from '@/lib/auth0';

const API_BASE_URL = process.env.API_BASE_URL ?? 'http://localhost:8080';

export interface LatestImport {
  id: number;
  provider: string;
  query: string;
  recordsRead: number;
  completedAt: string;
}

export interface ImportRun {
  id: number;
  provider: string;
  query: string;
  status: string;
  recordsRead: number;
  recordsCreated: number;
  recordsUpdated: number;
  recordsFailed: number;
  startedAt: string;
  completedAt: string | null;
}

export async function fetchLatestImport(): Promise<LatestImport | null> {
  const res = await fetch(new URL('/api/v1/card-imports/latest', API_BASE_URL), {
    next: { revalidate: 300 },
  });
  if (res.status === 404) {
    return null;
  }
  if (!res.ok) {
    throw new Error(`Import status returned ${res.status}`);
  }
  return res.json() as Promise<LatestImport>;
}

export interface ImportResult {
  runId: number;
  recordsRead: number;
  recordsCreated: number;
  recordsUpdated: number;
  recordsFailed: number;
}

export async function fetchImportRuns(): Promise<ImportRun[]> {
  const token = await auth0.getAccessToken();
  const res = await fetch(new URL('/api/v1/admin/card-imports', API_BASE_URL), {
    cache: 'no-store',
    headers: { Authorization: `Bearer ${token.token}` },
  });
  if (!res.ok) {
    throw new Error(`Import history returned ${res.status}`);
  }
  return res.json() as Promise<ImportRun[]>;
}

export async function triggerImport(query: string): Promise<ImportResult> {
  const token = await auth0.getAccessToken();
  const url = new URL('/api/v1/admin/card-imports', API_BASE_URL);
  url.searchParams.set('query', query);
  const res = await fetch(url, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token.token}` },
  });
  if (!res.ok) {
    throw new Error(`Import trigger returned ${res.status}`);
  }
  return res.json() as Promise<ImportResult>;
}
