export interface Notification {
  id: string;
  userId: string;
  type: 'board_invitation' | 'task_assigned' | 'mention' | 'board_activity';
  title: string;
  message: string;
  data: NotificationData;
  isRead: boolean;
  readAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface NotificationData {
  // Board invitation data
  boardId?: string;
  boardName?: string;
  invitationId?: string;
  inviterId?: string;
  inviterName?: string;
  role?: string;
  
  // Task assignment data
  taskId?: string;
  taskTitle?: string;
  cardId?: string;
  assignerId?: string;
  assignerName?: string;
  
  // Mention data
  contextType?: string;
  contextId?: string;
  contextContent?: string;
  mentionerId?: string;
  mentionerName?: string;
  
  // Board activity data
  activityType?: string;
  activityData?: Record<string, unknown>;
}

export interface NotificationsResponse {
  notifications: Notification[];
  total: number;
}

export interface UnreadCountResponse {
  count: number;
}

export interface NotificationFilters {
  limit?: number;
  offset?: number;
  unreadOnly?: boolean;
}
