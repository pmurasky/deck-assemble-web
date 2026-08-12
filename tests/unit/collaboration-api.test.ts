import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getCollaborators, inviteCollaborator, removeCollaborator } from '@/lib/api/collaboration';

vi.mock('@/lib/auth0', () => ({
  auth0: {
    getAccessToken: vi.fn().mockResolvedValue({ token: 'mock-token' }),
  },
}));

describe('collaboration API', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    vi.mocked(global.fetch).mockReset?.();
  });

  it('fetches deck collaborators', async () => {
    const mockCollaborators = [
      { profileId: 'user-1', displayName: 'Alice', role: 'EDITOR', invitedAt: '2026-08-01' },
    ];
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: async () => mockCollaborators,
    }));

    const result = await getCollaborators(10);
    expect(result).toEqual(mockCollaborators);
  });

  it('invites a collaborator', async () => {
    const mockCollaborator = { profileId: 'user-2', displayName: 'Bob', role: 'EDITOR', invitedAt: '2026-08-02' };
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: async () => mockCollaborator,
    }));

    const result = await inviteCollaborator(10, 'user-2');
    expect(result).toEqual(mockCollaborator);
  });

  it('handles self-invite error (400)', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: false,
      status: 400,
      json: async () => ({ error: { message: 'Cannot invite yourself' } }),
    }));

    await expect(inviteCollaborator(10, 'my-own-id')).rejects.toThrow('Cannot invite yourself');
  });

  it('removes a collaborator', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      status: 204,
    }));

    await expect(removeCollaborator(10, 'user-2')).resolves.toBeUndefined();
  });
});
