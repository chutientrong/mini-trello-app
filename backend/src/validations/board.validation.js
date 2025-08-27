const { z } = require("zod");

const createBoard = {
  body: z.object({
    name: z.string().min(1, "Name is required"),
    description: z.string().optional(),
    isPublic: z.boolean().optional(),
  }),
};

const getBoards = {
  query: z
    .object({
      search: z.string().optional(),
      isPublic: z.coerce.boolean().optional(),
      role: z.enum(["owner", "member"]).optional(),
      page: z.coerce.number().int().min(1).optional(),
      limit: z.coerce.number().int().min(1).max(100).optional(),
    })
    .optional(),
};

const getBoard = {
  params: z.object({
    boardId: z.string().min(1),
  }),
};

const updateBoard = {
  params: z.object({
    boardId: z.string().min(1),
  }),
  body: z
    .object({
      name: z.string().min(1).optional(),
      description: z.string().optional(),
      isPublic: z.boolean().optional(),
    })
    .refine((data) => Object.keys(data).length > 0, {
      message: "At least one field must be provided",
    }),
};

const deleteBoard = {
  params: z.object({
    boardId: z.string().min(1),
  }),
};

const inviteMember = {
  params: z.object({
    boardId: z.string().min(1),
  }),
  body: z.object({
    email: z.string().email("Valid email is required"),
    role: z.enum(["member", "admin", "viewer"]).default("member"),
  }),
};

const getBoardInvitations = {
  params: z.object({
    boardId: z.string().min(1),
  }),
};

const acceptInvitation = {
  params: z.object({
    invitationId: z.string().min(1),
  }),
};

const declineInvitation = {
  params: z.object({
    invitationId: z.string().min(1),
  }),
};

const cancelInvitation = {
  params: z.object({
    invitationId: z.string().min(1),
  }),
};

module.exports = {
  createBoard,
  getBoards,
  getBoard,
  updateBoard,
  deleteBoard,
  inviteMember,
  getBoardInvitations,
  acceptInvitation,
  declineInvitation,
  cancelInvitation,
};
