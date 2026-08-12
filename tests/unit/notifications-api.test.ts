import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  getNotifications,
  markNotificationRead,
  markAllNotificationsRead,
} from '@/lib/api/notifications';

vi.mock('@/lib/auth0', () => ({
  auth0: {
    getAccessToken: vi.fn().mockResolvedValue({ token: 'mock-token' }),
  },
}));

describe('notifications API', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('fetches user notifications', async () => {
    const mockResponse = {
      items: [
        {
          id: 1,
          recipientProfileId: 'me',
          actorProfileId: 'u2',
          actorDisplayName: 'Bob',
          reason: 'FAVORITE',
          targetSlug: 'my-deck',
          message: 'Bob favorited your deck',
          read: false,
          createdAt: '2026-08-11T10:00:00Z',
        },
      ],
      unreadCount: 1,
      total: 1,
      page: 0,
      size: 20,
    };

    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: async () => mockResponse,
    }));

    const result = await getNotifications();
    expect(result.unreadCount).toBe(1);
    expect(result.items[0].reason).toBe('FAVORITE');
  });

  it('marks a notification as read', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ id: 1, read: true }),
    }));

    const result = await markNotificationRead(1);
    expect(result.read).toBe(true);
  });

  it('marks all notifications as read', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ updatedCount: 5 }),
    }));

    const result = await markAllNotificationsRead();
    expect(result.updatedCount).toBe(5);
  });
});
