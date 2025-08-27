import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { NotificationsAPI } from '../services/notifications';
import type { NotificationFilters } from '../types/notifications';

// Query keys
export const notificationKeys = {
  all: ['notifications'] as const,
  lists: () => [...notificationKeys.all, 'list'] as const,
  list: (filters: NotificationFilters) => [...notificationKeys.lists(), filters] as const,
  unreadCount: () => [...notificationKeys.all, 'unread-count'] as const,
};

// Get notifications
export const useNotifications = (filters: NotificationFilters = {}) => {
  return useQuery({
    queryKey: notificationKeys.list(filters),
    queryFn: () => NotificationsAPI.getNotifications(filters),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

// Get unread count
export const useUnreadCount = () => {
  return useQuery({
    queryKey: notificationKeys.unreadCount(),
    queryFn: () => NotificationsAPI.getUnreadCount(),
    staleTime: 1000 * 60 * 1, // 1 minute
    refetchInterval: 1000 * 60 * 2, // Refetch every 2 minutes
  });
};

// Mark notification as read
export const useMarkAsRead = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (notificationId: string) => NotificationsAPI.markAsRead(notificationId),
    onSuccess: () => {
      // Invalidate notifications and unread count
      queryClient.invalidateQueries({ queryKey: notificationKeys.lists() });
      queryClient.invalidateQueries({ queryKey: notificationKeys.unreadCount() });
    },
  });
};

// Mark all notifications as read
export const useMarkAllAsRead = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: () => NotificationsAPI.markAllAsRead(),
    onSuccess: () => {
      // Invalidate notifications and unread count
      queryClient.invalidateQueries({ queryKey: notificationKeys.lists() });
      queryClient.invalidateQueries({ queryKey: notificationKeys.unreadCount() });
    },
  });
};

// Delete notification
export const useDeleteNotification = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (notificationId: string) => NotificationsAPI.deleteNotification(notificationId),
    onSuccess: () => {
      // Invalidate notifications and unread count
      queryClient.invalidateQueries({ queryKey: notificationKeys.lists() });
      queryClient.invalidateQueries({ queryKey: notificationKeys.unreadCount() });
    },
  });
};
