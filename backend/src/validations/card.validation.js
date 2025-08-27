const { z } = require("zod");

const createCard = {
  query: z.object({
    boardId: z.string().min(1, "Board ID is required"),
  }),
  body: z.object({
    title: z
      .string()
      .min(1, "Title is required")
      .max(100, "Title must be less than 100 characters"),
    description: z
      .string()
      .max(500, "Description must be less than 500 characters")
      .optional(),
  }),
};

const updateCard = {
  params: z.object({
    cardId: z.string().min(1, "Card ID is required"),
  }),
  body: z
    .object({
      title: z
        .string()
        .min(1, "Title is required")
        .max(100, "Title must be less than 100 characters")
        .optional(),
      description: z
        .string()
        .max(500, "Description must be less than 500 characters")
        .optional(),
    })
    .refine((data) => Object.keys(data).length > 0, {
      message: "At least one field must be provided",
    }),
};

const getCard = {
  params: z.object({
    cardId: z.string().min(1, "Card ID is required"),
  }),
};

const deleteCard = {
  params: z.object({
    cardId: z.string().min(1, "Card ID is required"),
  }),
};

const reorderCards = {
  query: z.object({
    boardId: z.string().min(1, "Board ID is required"),
  }),
  body: z.object({
    cardOrders: z
      .array(
        z.object({
          cardId: z.string().min(1, "Card ID is required"),
          order: z
            .number()
            .int()
            .min(0, "Order must be a non-negative integer"),
        })
      )
      .min(1, "At least one card order must be provided"),
  }),
};

const getCards = {
  query: z.object({
    boardId: z.string().min(1, "Board ID is required"),
    search: z.string().optional(),
  }),
};

module.exports = {
  createCard,
  updateCard,
  getCard,
  deleteCard,
  reorderCards,
  getCards,
};
