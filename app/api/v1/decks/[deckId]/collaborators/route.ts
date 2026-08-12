import { NextResponse, type NextRequest } from 'next/server';
import { getCollaborators, inviteCollaborator } from '@/lib/api/collaboration';
import { handleRouteError } from '@/lib/api/route-utils';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ deckId: string }> }
) {
  try {
    const { deckId } = await params;
    const data = await getCollaborators(Number(deckId));
    return NextResponse.json({ data });
  } catch (error) {
    return handleRouteError(error, 'Failed to fetch collaborators');
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ deckId: string }> }
) {
  try {
    const { deckId } = await params;
    const body = await req.json();
    if (!body?.profileId || typeof body.profileId !== 'string') {
      return NextResponse.json(
        { error: { code: 'VALIDATION_ERROR', message: 'profileId is required' } },
        { status: 400 }
      );
    }
    const data = await inviteCollaborator(Number(deckId), body.profileId, body.role);
    return NextResponse.json({ data }, { status: 201 });
  } catch (error) {
    return handleRouteError(error, 'Failed to invite collaborator');
  }
}
