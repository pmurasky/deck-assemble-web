import { describe, it, expect } from 'vitest';
import { handleRouteError } from '@/lib/api/route-utils';

describe('handleRouteError utility', () => {
  it('returns 401 for authentication errors', async () => {
    const res = handleRouteError(new Error('The user is not authenticated'));
    expect(res.status).toBe(401);
    const body = await res.json();
    expect(body.error.code).toBe('UNAUTHORIZED');
  });

  it('returns 502 for general upstream errors', async () => {
    const res = handleRouteError(new Error('Backend connection refused'));
    expect(res.status).toBe(502);
    const body = await res.json();
    expect(body.error.code).toBe('UPSTREAM_ERROR');
    expect(body.error.message).toBe('Backend connection refused');
  });
});
