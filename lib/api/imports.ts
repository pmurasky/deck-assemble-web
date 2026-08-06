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

export interface ImportPreviewRow {
  lineNumber: number;
  rawText: string;
  status: 'resolved' | 'ambiguous' | 'unmatched' | 'invalid';
  cardName?: string;
  quantity?: number;
  candidatePrintingIds?: number[];
  errorMessage?: string;
}

export interface ImportPreviewResult {
  previewToken: string;
  expiresAt: string;
  totalRows: number;
  rows: ImportPreviewRow[];
}

export interface ImportCommitParams {
  previewToken: string;
  excludedLineNumbers: number[];
  selectedPrintings?: Record<number, number>;
  deckName?: string;
  formatCode?: string;
  idempotencyKey: string;
  targetType: 'decks' | 'collections';
}

export interface ImportCommitResult {
  success: boolean;
  importedCount: number;
  failedCount: number;
  errorsUrl?: string;
  deckId?: number;
  collectionId?: number;
}

export async function uploadImportPreview(
  file: File,
  targetType: 'decks' | 'collections'
): Promise<ImportPreviewResult> {
  const formData = new FormData();
  formData.append('file', file);

  const res = await fetch(`/api/v1/${targetType}/import/preview`, {
    method: 'POST',
    body: formData,
  });

  if (!res.ok) {
    const errData = await res.json().catch(() => null);
    const msg = errData?.error?.message || errData?.message || `Import preview failed (${res.status})`;
    const err = new Error(msg) as Error & { status?: number };
    err.status = res.status;
    throw err;
  }

  return res.json() as Promise<ImportPreviewResult>;
}

export async function commitImport(params: ImportCommitParams): Promise<ImportCommitResult> {
  const { targetType, idempotencyKey, ...payload } = params;

  const res = await fetch(`/api/v1/${targetType}/import/commit`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Idempotency-Key': idempotencyKey,
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const errData = await res.json().catch(() => null);
    const msg = errData?.error?.message || errData?.message || `Import commit failed (${res.status})`;
    const err = new Error(msg) as Error & { status?: number };
    err.status = res.status;
    throw err;
  }

  return res.json() as Promise<ImportCommitResult>;
}

export interface ImportResult {
  runId: number;
  status?: string;
  recordsRead?: number;
  recordsCreated?: number;
  recordsUpdated?: number;
  recordsFailed?: number;
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
  if (!res.ok && res.status !== 202) {
    throw new Error(`Import trigger returned ${res.status}`);
  }
  return res.json() as Promise<ImportResult>;
}

export function getImportErrorsDownloadUrl(token: string, targetType: 'decks' | 'collections'): string {
  return `/api/v1/${targetType}/import/errors?token=${encodeURIComponent(token)}`;
}


