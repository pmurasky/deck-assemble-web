import { NextRequest, NextResponse } from 'next/server';
import { getProfile, updateProfile } from '@/lib/api/profile';
import { auth0 } from '@/lib/auth0';
import { handleRouteError } from '@/lib/api/route-utils';
import type { ProfileUpdateRequest } from '@/types/profile';

export async function GET() {
  try {
    const { token } = await auth0.getAccessToken();
    const profile = await getProfile(token);
    return NextResponse.json(profile);
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const { token } = await auth0.getAccessToken();
    const body: ProfileUpdateRequest = await request.json();
    const updated = await updateProfile(token, body);
    return NextResponse.json(updated);
  } catch (error) {
    return handleRouteError(error);
  }
}
