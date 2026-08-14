import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { GET, PATCH } from '@/app/api/v1/profile/route';
import * as profileApi from '@/lib/api/profile';
import { auth0 } from '@/lib/auth0';

vi.mock('@/lib/api/profile');
vi.mock('@/lib/auth0');

describe('Profile BFF Routes', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    vi.mocked(auth0.getAccessToken).mockResolvedValue({ token: 'test-token' } as never);
  });

  it('GET /api/v1/profile calls getProfile and returns JSON', async () => {
    const mockProfile = {
      id: 1,
      displayName: 'Peter',
      email: 'peter@example.com',
      createdAt: '2026-08-01T00:00:00Z',
      updatedAt: '2026-08-01T00:00:00Z',
    };
    vi.mocked(profileApi.getProfile).mockResolvedValue(mockProfile);

    const req = new NextRequest('http://localhost:3000/api/v1/profile');
    const res = await GET(req);

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toEqual(mockProfile);
    expect(profileApi.getProfile).toHaveBeenCalledWith('test-token');
  });

  it('PATCH /api/v1/profile calls updateProfile with request body', async () => {
    const mockProfile = {
      id: 1,
      displayName: 'Peter Updated',
      email: 'peter@example.com',
      createdAt: '2026-08-01T00:00:00Z',
      updatedAt: '2026-08-02T00:00:00Z',
    };
    vi.mocked(profileApi.updateProfile).mockResolvedValue(mockProfile);

    const req = new NextRequest('http://localhost:3000/api/v1/profile', {
      method: 'PATCH',
      body: JSON.stringify({ displayName: 'Peter Updated' }),
    });
    const res = await PATCH(req);

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toEqual(mockProfile);
    expect(profileApi.updateProfile).toHaveBeenCalledWith('test-token', { displayName: 'Peter Updated' });
  });
});
