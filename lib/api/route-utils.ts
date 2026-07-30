import { NextResponse } from 'next/server';

export function handleRouteError(error: unknown, fallbackMessage: string = 'Request failed') {
  const message = error instanceof Error ? error.message : fallbackMessage;
  const lowerMsg = message.toLowerCase();

  const isAuthError =
    lowerMsg.includes('auth') ||
    lowerMsg.includes('token') ||
    lowerMsg.includes('login') ||
    lowerMsg.includes('unauthorized') ||
    lowerMsg.includes('401') ||
    lowerMsg.includes('session') ||
    lowerMsg.includes('not authenticated');

  if (isAuthError) {
    return NextResponse.json(
      { error: { code: 'UNAUTHORIZED', message: 'Authentication required' } },
      { status: 401 }
    );
  }

  return NextResponse.json(
    { error: { code: 'UPSTREAM_ERROR', message } },
    { status: 502 }
  );
}
