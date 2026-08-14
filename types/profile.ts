export interface ProfileResponse {
  id: number;
  displayName: string;
  email: string;
  preferredFormat?: string | null;
  experienceLevel?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ProfileUpdateRequest {
  displayName?: string;
  email?: string;
  preferredFormat?: string;
  experienceLevel?: string;
}
