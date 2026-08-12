import { NextResponse, type NextRequest } from 'next/server';
import { removeCollaborator } from '@/lib/api/collaboration';
import { handleRouteError } from '@/lib/api/route-utils';

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ deckId: string; profileId: string }> }
) {
  try {
    const { deckId, profileId } = await params;
    await removeCollaborator(Number(deckId), decodeURIComponent(profileId));
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    return handleRouteError(error, 'Failed to remove collaborator');
  }
}
