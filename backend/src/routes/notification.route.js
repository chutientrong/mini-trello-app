const express = require("express");
const auth = require("../middlewares/auth");
const validate = require("../middlewares/validate");
const notificationValidation = require("../validations/notification.validation");
const notificationController = require("../controllers/notification.controller");

const router = express.Router();

router.use(auth());

// Get user notifications
router
  .route("/")
  .get(
    validate(notificationValidation.getNotifications),
    notificationController.getUserNotifications
  );

// Get unread count
router.route("/unread-count").get(notificationController.getUnreadCount);

// Mark all as read
router.route("/mark-all-read").post(notificationController.markAllAsRead);

// Mark specific notification as read
router
  .route("/:notificationId/read")
  .post(
    validate(notificationValidation.markAsRead),
    notificationController.markAsRead
  );

// Delete notification
router
  .route("/:notificationId")
  .delete(
    validate(notificationValidation.deleteNotification),
    notificationController.deleteNotification
  );

module.exports = router;
