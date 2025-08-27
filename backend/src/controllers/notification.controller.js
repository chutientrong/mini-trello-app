const { status: httpStatus } = require("http-status");
const catchAsync = require("../utils/catchAsync");
const notificationService = require("../services/notification.service");

const getUserNotifications = catchAsync(async (req, res) => {
  const userId = req.user.id;
  const { limit, offset, unreadOnly } = req.query;
  const result = await notificationService.getUserNotifications(userId, {
    limit,
    offset,
    unreadOnly,
  });
  res.status(httpStatus.OK).json(result);
});

const getUnreadCount = catchAsync(async (req, res) => {
  const userId = req.user.id;
  const result = await notificationService.getUnreadCount(userId);
  res.status(httpStatus.OK).json(result);
});

const markAsRead = catchAsync(async (req, res) => {
  const { notificationId } = req.params;
  const userId = req.user.id;
  const result = await notificationService.markAsRead(notificationId, userId);
  res.status(httpStatus.OK).json(result);
});

const markAllAsRead = catchAsync(async (req, res) => {
  const userId = req.user.id;
  const result = await notificationService.markAllAsRead(userId);
  res.status(httpStatus.OK).json(result);
});

const deleteNotification = catchAsync(async (req, res) => {
  const { notificationId } = req.params;
  const userId = req.user.id;
  const result = await notificationService.deleteNotification(
    notificationId,
    userId
  );
  res.status(httpStatus.OK).json(result);
});

module.exports = {
  getUserNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
};
