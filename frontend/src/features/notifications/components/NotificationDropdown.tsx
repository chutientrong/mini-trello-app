import { Bell, Check, CheckCircle, Trash2, Users, X, XCircle } from 'lucide-react';
import React, { memo, useCallback } from 'react';
import { Button, LoadingSpinner } from '@/components';
import { useAcceptInvitation, useDeclineInvitation } from '@/features/boards/hooks/useBoardInvitations';
import { useDeleteNotification, useMarkAllAsRead, useMarkAsRead, useNotifications, useUnreadCount } from '../hooks';
import type { Notification } from '../types';

interface NotificationDropdownProps {
  isOpen: boolean;
  onClose: () => void;
}

const NotificationDropdownComponent: React.FC<NotificationDropdownProps> = ({
  isOpen,
  onClose,
}) => {
  const { data: notificationsData, isLoading } = useNotifications({ limit: 20 });
  const { data: unreadData } = useUnreadCount();
  const markAsReadMutation = useMarkAsRead();
  const markAllAsReadMutation = useMarkAllAsRead();
  const deleteNotificationMutation = useDeleteNotification();
  const acceptInvitationMutation = useAcceptInvitation();
  const declineInvitationMutation = useDeclineInvitation();

  const notifications = notificationsData?.notifications || [];
  const unreadCount = unreadData?.count || 0;

  const handleMarkAsRead = useCallback((notificationId: string) => {
    markAsReadMutation.mutate(notificationId);
  }, [markAsReadMutation]);

  const handleMarkAllAsRead = useCallback(() => {
    markAllAsReadMutation.mutate();
  }, [markAllAsReadMutation]);

  const handleDeleteNotification = useCallback((notificationId: string) => {
    deleteNotificationMutation.mutate(notificationId);
  }, [deleteNotificationMutation]);

  const handleAcceptInvitation = useCallback((notification: Notification) => {
    if (notification.type === 'board_invitation' && notification.data.invitationId) {
      acceptInvitationMutation.mutate(notification.data.invitationId);
      handleMarkAsRead(notification.id);
    }
  }, [acceptInvitationMutation, handleMarkAsRead]);

  const handleDeclineInvitation = useCallback((notification: Notification) => {
    if (notification.type === 'board_invitation' && notification.data.invitationId) {
      declineInvitationMutation.mutate(notification.data.invitationId);
      handleMarkAsRead(notification.id);
    }
  }, [declineInvitationMutation, handleMarkAsRead]);

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'board_invitation':
        return <Users className="h-4 w-4 text-blue-500" />;
      case 'task_assigned':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'mention':
        return <Bell className="h-4 w-4 text-yellow-500" />;
      default:
        return <Bell className="h-4 w-4 text-gray-500" />;
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;
    
    return date.toLocaleDateString();
  };

  if (!isOpen) return null;

  return (
    <div className="absolute right-0 top-full mt-2 w-96 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">Notifications</h3>
        <div className="flex items-center space-x-2">
          {unreadCount > 0 && (
            <Button
              onClick={handleMarkAllAsRead}
              disabled={markAllAsReadMutation.isPending}
              className="text-sm text-blue-600 hover:text-blue-800 disabled:opacity-50"
            >
              Mark all read
            </Button>
          )}
          <Button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="max-h-96 overflow-y-auto">
        {isLoading ? (
          <div className="flex items-center justify-center p-8">
            <LoadingSpinner  />
          </div>
        ) : notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-8 text-gray-500">
            <Bell className="h-8 w-8 mb-2" />
            <p className="text-sm">No notifications yet</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={`p-4 hover:bg-gray-50 transition-colors ${
                  !notification.isRead ? 'bg-blue-50' : ''
                }`}
              >
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 mt-1">
                    {getNotificationIcon(notification.type)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">
                          {notification.title}
                        </p>
                        <p className="text-sm text-gray-600 mt-1">
                          {notification.message}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          {formatTimeAgo(notification.updatedAt)}
                        </p>
                      </div>
                      
                      <div className="flex items-center space-x-1 ml-2">
                        {!notification.isRead && (
                          <Button
                            onClick={() => handleMarkAsRead(notification.id)}
                            disabled={markAsReadMutation.isPending}
                            className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-50"
                            title="Mark as read"
                          >
                            <Check className="h-3 w-3" />
                          </Button>
                        )}
                        
                        <Button
                          onClick={() => handleDeleteNotification(notification.id)}
                          disabled={deleteNotificationMutation.isPending}
                          className="p-1 text-gray-400 hover:text-red-600 disabled:opacity-50"
                          title="Delete notification"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>

                    {/* Action buttons for board invitations */}
                    {notification.type === 'board_invitation' && !notification.isRead && (
                      <div className="flex items-center space-x-2 mt-3">
                        <Button
                          onClick={() => handleAcceptInvitation(notification)}
                          disabled={acceptInvitationMutation.isPending}
                          className="flex items-center space-x-1 px-3 py-1 text-xs bg-green-100 text-green-700 rounded-full hover:bg-green-200 disabled:opacity-50"
                        >
                          <CheckCircle className="h-3 w-3" />
                          <span>Accept</span>
                        </Button>
                        
                        <Button
                          onClick={() => handleDeclineInvitation(notification)}
                          disabled={declineInvitationMutation.isPending}
                          className="flex items-center space-x-1 px-3 py-1 text-xs bg-red-100 text-red-700 rounded-full hover:bg-red-200 disabled:opacity-50"
                        >
                          <XCircle className="h-3 w-3" />
                          <span>Decline</span>
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      {notifications.length > 0 && (
        <div className="p-3 border-t border-gray-200 bg-gray-50">
          <p className="text-xs text-gray-500 text-center">
            {unreadCount > 0 ? `${unreadCount} unread` : 'All caught up!'}
          </p>
        </div>
      )}
    </div>
  );
};

export const NotificationDropdown = memo(NotificationDropdownComponent);
