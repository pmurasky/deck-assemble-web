import { auth0 } from '@/lib/auth0';
import type { UserNotification, NotificationListResponse } from '@/types/notifications';

const API_BASE_URL = process.env.API_BASE_URL ?? 'http://localhost:8080';

async function fetchNotifications(path: string, init?: RequestInit) {
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

export async function getNotifications(page = 0, size = 20): Promise<NotificationListResponse> {
  const query = new URLSearchParams({ page: String(page), size: String(size) }).toString();
  return json(
    fetchNotifications(`/notifications?${query}`),
    'Failed to fetch notifications'
  );
}

export async function markNotificationRead(id: number): Promise<UserNotification> {
  return json(
    fetchNotifications(`/notifications/${id}/read`, {
      method: 'POST',
    }),
    'Failed to mark notification as read'
  );
}

export async function markAllNotificationsRead(): Promise<{ updatedCount: number }> {
  return json(
    fetchNotifications('/notifications/read-all', {
      method: 'POST',
    }),
    'Failed to mark all notifications as read'
  );
}
