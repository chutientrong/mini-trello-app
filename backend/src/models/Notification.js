const BaseModel = require("./BaseModel");

class Notification extends BaseModel {
  constructor(data = {}) {
    super(data);
    this.userId = data.userId;
    this.type = data.type; // 'board_invitation', 'task_assigned', 'mention', etc.
    this.title = data.title;
    this.message = data.message;
    this.data = data.data || {}; // Additional data like boardId, invitationId, etc.
    this.isRead = data.isRead || false;
    this.readAt = data.readAt;
  }

  markAsRead() {
    this.isRead = true;
    this.readAt = new Date().toISOString();
  }

  toObject() {
    return {
      id: this.id,
      userId: this.userId,
      type: this.type,
      title: this.title,
      message: this.message,
      data: this.data,
      isRead: this.isRead,
      readAt: this.readAt,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }

  // Static methods for database operations
  static async create(notificationData) {
    return super.create("notifications", notificationData);
  }

  static async findById(id) {
    return super.findById("notifications", id);
  }

  static async findByUserId(userId, options = {}) {
    const { limit = 50, offset = 0, unreadOnly = false } = options;

    let query = { userId: { operator: "==", value: userId } };

    if (unreadOnly) {
      query.isRead = { operator: "==", value: false };
    }

    const notifications = await super.find("notifications", query, {
      limit,
      offset,
    });
    return notifications.sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    );
  }

  static async findUnreadCount(userId) {
    const notifications = await super.find("notifications", {
      userId: { operator: "==", value: userId },
      isRead: { operator: "==", value: false },
    });
    return notifications.length;
  }

  static async markAsRead(id, userId) {
    const notification = await this.findById(id);
    if (!notification) {
      throw new Error("Notification not found");
    }

    if (notification.userId !== userId) {
      throw new Error("Access denied");
    }

    notification.markAsRead();
    return await notification.save();
  }

  static async markAllAsRead(userId) {
    const notifications = await this.findByUserId(userId, { unreadOnly: true });

    const batch = this.db.batch();
    notifications.forEach((notification) => {
      notification.markAsRead();
      batch.update(notification.ref, notification.toObject());
    });

    await batch.commit();
    return notifications.length;
  }

  static async deleteById(id, userId) {
    const notification = await this.findById(id);
    if (!notification) {
      throw new Error("Notification not found");
    }

    if (notification.userId !== userId) {
      throw new Error("Access denied");
    }

    return super.findByIdAndDelete("notifications", id);
  }

  async save() {
    return super.save("notifications");
  }
}

module.exports = Notification;
