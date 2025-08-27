const z = require("zod");

const getNotifications = {
  query: z.object({
    limit: z
      .string()
      .optional()
      .transform((val) => parseInt(val)),
    offset: z
      .string()
      .optional()
      .transform((val) => parseInt(val)),
    unreadOnly: z.enum(["true", "false"]).optional(),
  }),
};

const markAsRead = {
  params: z.object({
    notificationId: z.string().min(1),
  }),
};

const deleteNotification = {
  params: z.object({
    notificationId: z.string().min(1),
  }),
};

module.exports = {
  getNotifications,
  markAsRead,
  deleteNotification,
};
