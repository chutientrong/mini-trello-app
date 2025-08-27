const { status: httpStatus } = require("http-status");
const ApiError = require("../utils/ApiError");
const Notification = require("../models/Notification");
const User = require("../models/User");
const Board = require("../models/Board");

class NotificationService {
  // Get user notifications
  async getUserNotifications(userId, options = {}) {
    const { limit = 20, offset = 0, unreadOnly = false } = options;

    const notifications = await Notification.findByUserId(userId, {
      limit: parseInt(limit),
      offset: parseInt(offset),
      unreadOnly: unreadOnly === "true",
    });

    return {
      notifications: notifications.map((n) => n.toObject()),
      total: notifications.length,
    };
  }

  // Get unread count
  async getUnreadCount(userId) {
    const count = await Notification.findUnreadCount(userId);
    return { count };
  }

  // Mark notification as read
  async markAsRead(notificationId, userId) {
    const notification = await Notification.markAsRead(notificationId, userId);
    return notification.toObject();
  }

  // Mark all notifications as read
  async markAllAsRead(userId) {
    const count = await Notification.markAllAsRead(userId);
    return { message: `Marked ${count} notifications as read` };
  }

  // Delete notification
  async deleteNotification(notificationId, userId) {
    await Notification.deleteById(notificationId, userId);
    return { message: "Notification deleted successfully" };
  }

  // Create board invitation notification
  async createBoardInvitationNotification(invitation, board, inviter) {
    // Find the user by email
    const user = await User.findOneByEmail(invitation.inviteeEmail);
    if (!user) {
      // User doesn't exist yet, we'll create notification when they sign up
      return null;
    }

    const notification = new Notification({
      userId: user.id,
      type: "board_invitation",
      title: "Board Invitation",
      message: `${inviter.fullName || inviter.email} invited you to join "${board.name}"`,
      data: {
        boardId: board.id,
        boardName: board.name,
        invitationId: invitation.id,
        inviterId: inviter.id,
        inviterName: inviter.fullName || inviter.email,
        role: invitation.role || "member",
      },
    });

    const savedNotification = await notification.save();
    return savedNotification.toObject();
  }

  // Create task assignment notification
  async createTaskAssignmentNotification(task, assignedUser, assigner) {
    const notification = new Notification({
      userId: assignedUser.id,
      type: "task_assigned",
      title: "Task Assigned",
      message: `${assigner.fullName || assigner.email} assigned you a task: "${task.title}"`,
      data: {
        taskId: task.id,
        taskTitle: task.title,
        boardId: task.boardId,
        cardId: task.cardId,
        assignerId: assigner.id,
        assignerName: assigner.fullName || assigner.email,
      },
    });

    const savedNotification = await notification.save();
    return savedNotification.toObject();
  }

  // Create mention notification
  async createMentionNotification(mentionedUser, mentioner, context) {
    const notification = new Notification({
      userId: mentionedUser.id,
      type: "mention",
      title: "You were mentioned",
      message: `${mentioner.fullName || mentioner.email} mentioned you in "${context.type}": "${context.content}"`,
      data: {
        contextType: context.type, // 'task', 'card', 'comment'
        contextId: context.id,
        contextContent: context.content,
        boardId: context.boardId,
        mentionerId: mentioner.id,
        mentionerName: mentioner.fullName || mentioner.email,
      },
    });

    const savedNotification = await notification.save();
    return savedNotification.toObject();
  }

  // Create board activity notification
  async createBoardActivityNotification(userId, activity) {
    const notification = new Notification({
      userId,
      type: "board_activity",
      title: "Board Activity",
      message: activity.message,
      data: {
        boardId: activity.boardId,
        activityType: activity.type,
        activityData: activity.data,
      },
    });

    const savedNotification = await notification.save();
    return savedNotification.toObject();
  }

  // Delete notifications by type and data
  async deleteNotificationsByType(userId, type, data = {}) {
    const notifications = await Notification.findByUserId(userId);

    const notificationsToDelete = notifications.filter((notification) => {
      if (notification.type !== type) return false;

      // Check if data matches
      for (const [key, value] of Object.entries(data)) {
        if (notification.data[key] !== value) return false;
      }

      return true;
    });

    const batch = Notification.db.batch();
    notificationsToDelete.forEach((notification) => {
      batch.delete(notification.ref);
    });

    await batch.commit();
    return notificationsToDelete.length;
  }
}

const notificationService = new NotificationService();
module.exports = notificationService;
