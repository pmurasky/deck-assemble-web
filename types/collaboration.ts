export interface DeckCollaborator {
  profileId: string;
  displayName: string;
  avatarUrl?: string;
  role: 'EDITOR' | 'VIEWER';
  invitedAt: string;
}

export interface InviteCollaboratorRequest {
  profileId: string;
  role?: 'EDITOR' | 'VIEWER';
}

export interface DeckCollaboratorListResponse {
  collaborators: DeckCollaborator[];
}
