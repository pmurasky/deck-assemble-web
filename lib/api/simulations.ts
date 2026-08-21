import { auth0 } from '@/lib/auth0';
import { getLatestDeckRevisionNumber } from '@/lib/api/revisions';
import type {
  MulliganConfig,
  MulliganStrategy,
  PracticeSessionRequest,
  PracticeSessionResponse,
  SampleHandsResponse,
  SimulationResponse,
} from '@/types/m3';

const API_BASE_URL = process.env.API_BASE_URL ?? 'http://localhost:8080';

async function fetchSimulations(path: string, init?: RequestInit) {
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

function buildMulliganBody(
  config?: MulliganConfig,
  overrides?: { minimumLands?: number; maximumLands?: number; seed?: number | string; mulliganStrategy?: MulliganStrategy }
): Record<string, unknown> {
  const mulliganStrategy = overrides?.mulliganStrategy ?? config?.mulliganStrategy ?? 'NONE';
  const minimumLands = overrides?.minimumLands ?? config?.minimumLands;
  const maximumLands = overrides?.maximumLands ?? config?.maximumLands;
  const rawSeed = overrides?.seed ?? config?.seed;
  const body: Record<string, unknown> = { mulliganStrategy };
  if (minimumLands !== undefined) body.minimumLands = minimumLands;
  if (maximumLands !== undefined) body.maximumLands = maximumLands;
  if (rawSeed !== undefined) {
    const num = Number(rawSeed);
    if (!Number.isNaN(num)) body.seed = num;
  }
  return body;
}

export interface RunSimulationOptions {
  mulliganConfig?: MulliganConfig;
  onThePlay?: boolean;
  revision?: number;
}

export async function generateSampleHands(
  deckId: number,
  count: number,
  mulliganConfig?: MulliganConfig,
  revision?: number
): Promise<SampleHandsResponse> {
  const effectiveRevision = revision ?? (await getLatestDeckRevisionNumber(deckId));
  const body = {
    revision: effectiveRevision,
    handCount: count,
    ...buildMulliganBody(mulliganConfig),
  };
  return json(
    fetchSimulations(`/decks/${deckId}/sample-hands`, {
      method: 'POST',
      body: JSON.stringify(body),
    }),
    'Failed to generate sample hands'
  );
}

export async function runDeckSimulation(
  deckId: number,
  iterations: number,
  turns: number,
  options?: MulliganConfig | RunSimulationOptions,
  revision?: number
): Promise<SimulationResponse> {
  const isOptionsObj = Boolean(options && ('onThePlay' in options || 'revision' in options));
  const optionsObj = isOptionsObj ? (options as RunSimulationOptions) : undefined;
  const mulliganConfig = isOptionsObj ? optionsObj?.mulliganConfig : (options as MulliganConfig | undefined);
  const onThePlay = optionsObj?.onThePlay ?? true;
  const effectiveRevision = optionsObj?.revision ?? revision ?? (await getLatestDeckRevisionNumber(deckId));

  const body = {
    revision: effectiveRevision,
    iterations,
    turns,
    onThePlay,
    ...buildMulliganBody(mulliganConfig),
  };
  return json(
    fetchSimulations(`/decks/${deckId}/simulations`, {
      method: 'POST',
      body: JSON.stringify(body),
    }),
    'Failed to run deck simulation'
  );
}

export async function startPracticeSession(
  deckId: number,
  config?: PracticeSessionRequest
): Promise<PracticeSessionResponse> {
  const effectiveRevision = config?.revision ?? (await getLatestDeckRevisionNumber(deckId));
  const body = {
    revision: effectiveRevision,
    onThePlay: config?.onThePlay ?? true,
    ...buildMulliganBody(undefined, config),
  };
  return json(
    fetchSimulations(`/decks/${deckId}/practice-sessions`, {
      method: 'POST',
      body: JSON.stringify(body),
    }),
    'Failed to start practice session'
  );
}

export async function playPracticeCard(
  deckId: number,
  sessionId: string,
  printingId: number
): Promise<PracticeSessionResponse> {
  return json(
    fetchSimulations(`/decks/${deckId}/practice-sessions/${sessionId}/play`, {
      method: 'POST',
      body: JSON.stringify({ printingId }),
    }),
    'Failed to play card'
  );
}

export async function tapPracticeCard(
  deckId: number,
  sessionId: string,
  printingId: number
): Promise<PracticeSessionResponse> {
  return json(
    fetchSimulations(`/decks/${deckId}/practice-sessions/${sessionId}/tap`, {
      method: 'POST',
      body: JSON.stringify({ printingId }),
    }),
    'Failed to tap card'
  );
}

export async function stepPracticeSession(
  deckId: number,
  sessionId: string
): Promise<PracticeSessionResponse> {
  return json(
    fetchSimulations(`/decks/${deckId}/practice-sessions/${sessionId}/steps`, {
      method: 'POST',
    }),
    'Failed to step practice session'
  );
}

export async function resetPracticeSession(
  deckId: number,
  sessionId: string
): Promise<PracticeSessionResponse> {
  return json(
    fetchSimulations(`/decks/${deckId}/practice-sessions/${sessionId}/reset`, {
      method: 'POST',
    }),
    'Failed to reset practice session'
  );
}

