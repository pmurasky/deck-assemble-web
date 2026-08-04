import { describe, it, expect } from 'vitest';
import { handleRouteError } from '@/lib/api/route-utils';

describe('handleRouteError utility', () => {
  it('returns 401 for authentication errors', async () => {
    const res = handleRouteError(new Error('The user is not authenticated'));
    expect(res.status).toBe(401);
    const body = await res.json();
    expect(body.error.code).toBe('UNAUTHORIZED');
  });

  it('returns 401 for AccessTokenError objects', async () => {
    const err = new Error('Token acquisition failed');
    err.name = 'AccessTokenError';
    const res = handleRouteError(err);
    expect(res.status).toBe(401);
    const body = await res.json();
    expect(body.error.code).toBe('UNAUTHORIZED');
  });

  it('returns 401 when error status is 401 or 403', async () => {
    const err = Object.assign(new Error('Unauthorized upstream'), { status: 401 });
    const res = handleRouteError(err);
    expect(res.status).toBe(401);
    const body = await res.json();
    expect(body.error.code).toBe('UNAUTHORIZED');
  });

  it('returns 401 for token or audience configuration failures', async () => {
    const res = handleRouteError(new Error('Missing required parameter: audience'));
    expect(res.status).toBe(401);
    const body = await res.json();
    expect(body.error.code).toBe('UNAUTHORIZED');
  });

  it('returns 503 for network failure or unavailable upstream API', async () => {
    const res = handleRouteError(new Error('TypeError: fetch failed'));
    expect(res.status).toBe(503);
    const body = await res.json();
    expect(body.error.code).toBe('UPSTREAM_UNAVAILABLE');
    expect(body.error.message).toBe('Upstream API is unavailable');
  });

  it('returns 503 when error status is 503', async () => {
    const err = Object.assign(new Error('Service Unavailable'), { status: 503 });
    const res = handleRouteError(err);
    expect(res.status).toBe(503);
    const body = await res.json();
    expect(body.error.code).toBe('UPSTREAM_UNAVAILABLE');
  });

  it('returns 500 for internal server error upstream', async () => {
    const err = Object.assign(new Error('Database error'), { status: 500 });
    const res = handleRouteError(err);
    expect(res.status).toBe(500);
    const body = await res.json();
    expect(body.error.code).toBe('UPSTREAM_ERROR');
    expect(body.error.message).toBe('Database error');
  });

  it('returns 400 for bad request upstream', async () => {
    const err = Object.assign(new Error('Invalid payload'), { status: 400 });
    const res = handleRouteError(err);
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error.code).toBe('REQUEST_FAILED');
    expect(body.error.message).toBe('Invalid payload');
  });

  it('returns 502 for general upstream errors', async () => {
    const res = handleRouteError(new Error('Backend connection failed'));
    expect(res.status).toBe(502);
    const body = await res.json();
    expect(body.error.code).toBe('UPSTREAM_ERROR');
    expect(body.error.message).toBe('Backend connection failed');
  });
});
