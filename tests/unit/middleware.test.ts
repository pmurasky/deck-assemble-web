import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { middleware } from '@/middleware';
import { auth0 } from '@/lib/auth0';

vi.mock('@/lib/auth0', () => ({
  auth0: {
    middleware: vi.fn(),
  },
}));

describe('middleware', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('delegates to auth0.middleware on success', async () => {
    const mockResponse = new Response(null, { status: 200 });
    vi.mocked(auth0.middleware).mockResolvedValue(mockResponse as never);

    const req = new NextRequest('http://localhost/decks/10');
    const res = await middleware(req);

    expect(auth0.middleware).toHaveBeenCalledWith(req);
    expect(res).toBe(mockResponse);
  });

  it('handles auth0.middleware error on /api/ routes by logging and returning 401 JSON', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.mocked(auth0.middleware).mockRejectedValue(new Error('Auth0 token refresh failed'));

    const req = new NextRequest('http://localhost/api/v1/decks/38/practice-sessions', {
      method: 'POST',
    });
    const res = await middleware(req);
    const json = await res.json();

    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining('Auth0 middleware error'),
      '/api/v1/decks/38/practice-sessions',
      expect.any(Error)
    );
    expect(res.status).toBe(401);
    expect(json.error.code).toBe('AUTH_MIDDLEWARE_ERROR');
    expect(json.error.message).toContain('Authentication session error');
  });

  it('handles auth0.middleware error on page routes by logging and redirecting to /login', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.mocked(auth0.middleware).mockRejectedValue(new Error('Auth0 session invalid'));

    const req = new NextRequest('http://localhost/decks/38');
    const res = await middleware(req);

    expect(consoleSpy).toHaveBeenCalled();
    expect(res.status).toBe(307);
    expect(res.headers.get('location')).toContain('/login');
  });
});
