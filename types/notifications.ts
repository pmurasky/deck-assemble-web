export type NotificationReason =
  | 'COLLABORATOR_ADDED'
  | 'COLLABORATOR_REMOVED'
  | 'COMMENT'
  | 'FOLLOW'
  | 'FAVORITE'
  | 'FORK'
  | 'COMMENT_REPLY';

export interface UserNotification {
  id: number;
  recipientProfileId: string;
  actorProfileId: string;
  actorDisplayName: string;
  actorAvatarUrl?: string;
  reason: NotificationReason;
  targetId?: string;
  targetSlug?: string;
  message: string;
  read: boolean;
  createdAt: string;
}

export interface NotificationListResponse {
  items: UserNotification[];
  unreadCount: number;
  total: number;
  page: number;
  size: number;
}
