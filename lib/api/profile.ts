import { auth0 } from '@/lib/auth0';
import type { ProfileResponse, ProfileUpdateRequest } from '@/types/profile';

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:8080';

export async function getProfile(token?: string): Promise<ProfileResponse> {
  const authToken = token || (await auth0.getAccessToken()).token;
  const res = await fetch(`${API_BASE_URL}/api/v1/profile`, {
    headers: {
      Authorization: `Bearer ${authToken}`,
      'Content-Type': 'application/json',
    },
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch profile: ${res.statusText}`);
  }

  return res.json();
}

export async function updateProfile(
  token: string | undefined,
  req: ProfileUpdateRequest
): Promise<ProfileResponse> {
  const authToken = token || (await auth0.getAccessToken()).token;
  const res = await fetch(`${API_BASE_URL}/api/v1/profile`, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${authToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(req),
  });

  if (!res.ok) {
    throw new Error(`Failed to update profile: ${res.statusText}`);
  }

  return res.json();
}

export async function fetchProfile(): Promise<ProfileResponse> {
  const res = await fetch('/api/v1/profile');
  if (!res.ok) {
    throw new Error('Failed to fetch profile');
  }
  return res.json();
}

export async function saveProfile(req: ProfileUpdateRequest): Promise<ProfileResponse> {
  const res = await fetch('/api/v1/profile', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(req),
  });
  if (!res.ok) {
    throw new Error('Failed to update profile');
  }
  return res.json();
}
