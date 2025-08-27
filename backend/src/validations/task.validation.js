const { z } = require("zod");

const createTask = {
  body: z.object({
    title: z.string().min(1),
    description: z.string().optional(),
    priority: z.enum(["low", "medium", "high"]).default("medium"),
    dueDate: z.iso.datetime().optional(),
  }),
  query: z.object({
    boardId: z.string().min(1),
    cardId: z.string().min(1),
  }),
};

const getTasks = {
  query: z.object({
    boardId: z.string().min(1),
    cardId: z.string().min(1),
    priority: z.enum(["low", "medium", "high"]).optional(),
    assignedTo: z.string().optional(),
    dueComplete: z.boolean().optional(),
    search: z.string().optional(),
  }),
};

const getTask = {
  params: z.object({
    taskId: z.string().min(1),
  }),
  query: z.object({
    boardId: z.string().min(1),
    cardId: z.string().min(1),
  }),
};

const updateTask = {
  params: z.object({
    taskId: z.string().min(1),
  }),
  query: z.object({
    boardId: z.string().min(1),
    cardId: z.string().min(1),
  }),
  body: z
    .object({
      title: z.string().min(1).optional(),
      description: z.string().optional(),
      priority: z.enum(["low", "medium", "high"]).optional(),
      dueDate: z.iso.datetime().optional(),
      dueComplete: z.boolean().optional(),
    })
    .refine((data) => Object.keys(data).length > 0, {
      message: "At least one field must be provided",
    }),
};

const deleteTask = {
  params: z.object({
    taskId: z.string().min(1),
  }),
  query: z.object({
    boardId: z.string().min(1),
    cardId: z.string().min(1),
  }),
};

const reorderTasks = {
  query: z.object({
    boardId: z.string().min(1),
    cardId: z.string().min(1),
  }),
  body: z.object({
    taskOrders: z
      .array(
        z.object({
          taskId: z.string().min(1),
          order: z.number().int().min(0),
        })
      )
      .min(1),
  }),
};

const assignMember = {
  params: z.object({
    taskId: z.string().min(1),
  }),
  query: z.object({
    boardId: z.string().min(1),
    cardId: z.string().min(1),
    memberId: z.string().min(1),
  }),
};

const removeMember = {
  params: z.object({
    taskId: z.string().min(1),
  }),
  query: z.object({
    boardId: z.string().min(1),
    cardId: z.string().min(1),
    memberId: z.string().min(1),
  }),
};

const moveTaskToCard = {
  params: z.object({
    taskId: z.string().min(1),
  }),
  query: z.object({
    boardId: z.string().min(1),
    sourceCardId: z.string().min(1),
    destCardId: z.string().min(1),
    newOrder: z.string().regex(/^\d+$/).transform(Number),
  }),
};

module.exports = {
  createTask,
  getTasks,
  getTask,
  updateTask,
  deleteTask,
  reorderTasks,
  assignMember,
  removeMember,
  moveTaskToCard,
};
