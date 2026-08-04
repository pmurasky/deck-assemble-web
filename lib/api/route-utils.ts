import { NextResponse } from 'next/server';

export function handleRouteError(error: unknown, fallbackMessage: string = 'Request failed') {
  const message = error instanceof Error ? error.message : fallbackMessage;
  const lowerMsg = message.toLowerCase();

  const status =
    typeof error === 'object' && error !== null && 'status' in error && typeof (error as { status?: unknown }).status === 'number'
      ? (error as { status: number }).status
      : typeof error === 'object' && error !== null && 'statusCode' in error && typeof (error as { statusCode?: unknown }).statusCode === 'number'
      ? (error as { statusCode: number }).statusCode
      : undefined;

  const errorName = error instanceof Error ? error.name : '';
  const errorCode =
    typeof error === 'object' && error !== null && 'code' in error && typeof (error as { code?: unknown }).code === 'string'
      ? (error as { code: string }).code.toLowerCase()
      : '';

  const isAuthError =
    status === 401 ||
    status === 403 ||
    errorName === 'AccessTokenError' ||
    errorCode.includes('access_token') ||
    errorCode.includes('unauthorized') ||
    errorCode.includes('auth') ||
    lowerMsg.includes('auth') ||
    lowerMsg.includes('token') ||
    lowerMsg.includes('login') ||
    lowerMsg.includes('unauthorized') ||
    lowerMsg.includes('401') ||
    lowerMsg.includes('session') ||
    lowerMsg.includes('not authenticated') ||
    lowerMsg.includes('access_token') ||
    lowerMsg.includes('invalid_grant') ||
    lowerMsg.includes('audience') ||
    lowerMsg.includes('secret');

  if (isAuthError) {
    return NextResponse.json(
      { error: { code: 'UNAUTHORIZED', message: 'Authentication required' } },
      { status: 401 }
    );
  }

  const isNetworkError =
    lowerMsg.includes('fetch failed') ||
    lowerMsg.includes('econnrefused') ||
    lowerMsg.includes('enotfound') ||
    lowerMsg.includes('networkerror') ||
    status === 503;

  if (isNetworkError) {
    return NextResponse.json(
      { error: { code: 'UPSTREAM_UNAVAILABLE', message: 'Upstream API is unavailable' } },
      { status: 503 }
    );
  }

  const responseStatus = status && status >= 400 && status < 600 ? status : 502;
  const code = responseStatus >= 500 ? 'UPSTREAM_ERROR' : 'REQUEST_FAILED';

  return NextResponse.json(
    { error: { code, message } },
    { status: responseStatus }
  );
}
