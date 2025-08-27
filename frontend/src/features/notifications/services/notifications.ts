import { apiClient } from '@/services';
import type { 
  Notification, 
  NotificationsResponse, 
  UnreadCountResponse, 
  NotificationFilters 
} from '../types';

export class NotificationsAPI {
  // Get user notifications
  static async getNotifications(filters: NotificationFilters = {}): Promise<NotificationsResponse> {
    const params = new URLSearchParams();
    
    if (filters.limit) params.append('limit', filters.limit.toString());
    if (filters.offset) params.append('offset', filters.offset.toString());
    if (filters.unreadOnly) params.append('unreadOnly', 'true');
    
    const queryString = params.toString();
    const url = queryString ? `/notifications?${queryString}` : '/notifications';
    
    return apiClient.get(url);
  }

  // Get unread count
  static async getUnreadCount(): Promise<UnreadCountResponse> {
    return apiClient.get('/notifications/unread-count');
  }

  // Mark notification as read
  static async markAsRead(notificationId: string): Promise<Notification> {
    return apiClient.post(`/notifications/${notificationId}/read`);
  }

  // Mark all notifications as read
  static async markAllAsRead(): Promise<{ message: string }> {
    return apiClient.post('/notifications/mark-all-read');
  }

  // Delete notification
  static async deleteNotification(notificationId: string): Promise<{ message: string }> {
    return apiClient.delete(`/notifications/${notificationId}`);
  }
}
