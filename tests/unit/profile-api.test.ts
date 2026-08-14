import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  getProfile,
  updateProfile,
  fetchProfile,
  saveProfile,
} from '@/lib/api/profile';

describe('Profile API Client', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('getProfile calls backend with bearer token', async () => {
    const mockProfile = {
      id: 1,
      displayName: 'Peter',
      email: 'peter@example.com',
      preferredFormat: 'Commander',
      experienceLevel: 'ADVANCED',
      createdAt: '2026-08-01T00:00:00Z',
      updatedAt: '2026-08-01T00:00:00Z',
    };

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => mockProfile,
    });

    const res = await getProfile('test-token');
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/v1/profile'),
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: 'Bearer test-token',
        }),
      })
    );
    expect(res).toEqual(mockProfile);
  });

  it('updateProfile calls backend PATCH with body and token', async () => {
    const mockUpdated = {
      id: 1,
      displayName: 'Peter M',
      email: 'peter@example.com',
      preferredFormat: 'Commander',
      experienceLevel: 'EXPERT',
      createdAt: '2026-08-01T00:00:00Z',
      updatedAt: '2026-08-02T00:00:00Z',
    };

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => mockUpdated,
    });

    const res = await updateProfile('test-token', { displayName: 'Peter M', experienceLevel: 'EXPERT' });
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/v1/profile'),
      expect.objectContaining({
        method: 'PATCH',
        headers: expect.objectContaining({
          Authorization: 'Bearer test-token',
          'Content-Type': 'application/json',
        }),
        body: JSON.stringify({ displayName: 'Peter M', experienceLevel: 'EXPERT' }),
      })
    );
    expect(res).toEqual(mockUpdated);
  });

  it('fetchProfile calls /api/v1/profile on BFF', async () => {
    const mockProfile = {
      id: 1,
      displayName: 'Peter',
      email: 'peter@example.com',
      createdAt: '2026-08-01T00:00:00Z',
      updatedAt: '2026-08-01T00:00:00Z',
    };

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => mockProfile,
    });

    const res = await fetchProfile();
    expect(global.fetch).toHaveBeenCalledWith('/api/v1/profile');
    expect(res).toEqual(mockProfile);
  });

  it('saveProfile calls PATCH /api/v1/profile on BFF', async () => {
    const mockProfile = {
      id: 1,
      displayName: 'Peter Updated',
      email: 'peter@example.com',
      createdAt: '2026-08-01T00:00:00Z',
      updatedAt: '2026-08-01T00:00:00Z',
    };

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => mockProfile,
    });

    const res = await saveProfile({ displayName: 'Peter Updated' });
    expect(global.fetch).toHaveBeenCalledWith('/api/v1/profile', expect.objectContaining({
      method: 'PATCH',
      body: JSON.stringify({ displayName: 'Peter Updated' }),
    }));
    expect(res).toEqual(mockProfile);
  });
});
