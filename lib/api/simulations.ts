import { auth0 } from '@/lib/auth0';
import type {
  MulliganConfig,
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

export async function generateSampleHands(
  deckId: number,
  count: number,
  mulliganConfig?: MulliganConfig
): Promise<SampleHandsResponse> {
  return json(
    fetchSimulations(`/decks/${deckId}/sample-hands`, {
      method: 'POST',
      body: JSON.stringify({ count, mulliganConfig }),
    }),
    'Failed to generate sample hands'
  );
}

export async function runDeckSimulation(
  deckId: number,
  iterations: number,
  turns: number,
  mulliganConfig?: MulliganConfig
): Promise<SimulationResponse> {
  return json(
    fetchSimulations(`/decks/${deckId}/simulations`, {
      method: 'POST',
      body: JSON.stringify({ iterations, turns, mulliganConfig }),
    }),
    'Failed to run deck simulation'
  );
}

export async function startPracticeSession(deckId: number): Promise<PracticeSessionResponse> {
  return json(
    fetchSimulations(`/decks/${deckId}/practice-sessions`, { method: 'POST' }),
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

