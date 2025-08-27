const ApiError = require("../utils/ApiError");
const { status: httpStatus } = require("http-status");
const Board = require("../models/Board");
const BoardInvitation = require("../models/BoardInvitation");
const User = require("../models/User");
/**
 * Middleware to check board permissions
 * @param {string} operation - 'create', 'read', 'update', 'delete'
 */
const checkBoardPermission = (operation) => {
  return async (req, res, next) => {
    try {
      const { boardId } = req.params;
      const userId = req.user.id;

      // only board owners can create boards
      if (operation === "create") {
        const userBoards = await Board.find("boards", { ownerId: userId });
        if (userBoards.length === 0) {
          throw new ApiError(
            httpStatus.FORBIDDEN,
            "Access denied: Only board owners can create new boards"
          );
        }
        return next();
      }

      if (!boardId) {
        throw new ApiError(httpStatus.BAD_REQUEST, "Board ID is required");
      }

      const board = await Board.findById(boardId);
      if (!board) {
        throw new ApiError(httpStatus.NOT_FOUND, "Board not found");
      }

      // Check if user is board member
      const isBoardMember =
        board.ownerId === userId || board.members.includes(userId);
      if (!isBoardMember) {
        throw new ApiError(
          httpStatus.FORBIDDEN,
          "Access denied: You are not a member of this board"
        );
      }

      // board members can read
      if (operation === "read") {
        return next();
      }

      // only board owners can update/delete boards
      if (operation === "update" || operation === "delete") {
        const isOwner = board.ownerId === userId;
        if (!isOwner) {
          throw new ApiError(
            httpStatus.FORBIDDEN,
            `Access denied: Only board owner can ${operation} boards`
          );
        }
        return next();
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

/**
 * Check if user can manage board members (for removing members)
 */
const checkMemberManagementPermission = async (req, res, next) => {
  try {
    const { boardId } = req.params;
    const { memberId } = req.query;
    const userId = req.user.id;

    if (!boardId) {
      throw new ApiError(httpStatus.BAD_REQUEST, "Board ID is required");
    }

    if (!memberId) {
      throw new ApiError(httpStatus.BAD_REQUEST, "Member ID is required");
    }

    // Check if board exists
    const board = await Board.findById(boardId);
    if (!board) {
      throw new ApiError(httpStatus.NOT_FOUND, "Board not found");
    }

    const isOwner = board.ownerId === userId;
    if (!isOwner) {
      throw new ApiError(
        httpStatus.FORBIDDEN,
        "Access denied: Only board owner can manage members"
      );
    }

    // cannot remove the board owner
    if (memberId === board.ownerId) {
      throw new ApiError(
        httpStatus.BAD_REQUEST,
        "Cannot remove board owner from the board"
      );
    }

    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Check if user can manage board invitations (only board owner)
 */
const checkInvitationManagementPermission = async (req, res, next) => {
  try {
    const { boardId, invitationId } = req.params;
    const userId = req.user.id;

    if (invitationId && !boardId) {
      const invitation = await BoardInvitation.findById(invitationId);

      if (!invitation) {
        throw new ApiError(httpStatus.NOT_FOUND, "Invitation not found");
      }

      const board = await Board.findById(invitation.boardId);
      if (!board) {
        throw new ApiError(httpStatus.NOT_FOUND, "Board not found");
      }

      // Only board owners can cancel invitations
      const isOwner = board.ownerId === userId;
      if (!isOwner) {
        throw new ApiError(
          httpStatus.FORBIDDEN,
          "Access denied: Only board owner can cancel invitations"
        );
      }

      return next();
    }

    // Only board owners can invite members
    if (!boardId) {
      throw new ApiError(httpStatus.BAD_REQUEST, "Board ID is required");
    }

    const board = await Board.findById(boardId);
    if (!board) {
      throw new ApiError(httpStatus.NOT_FOUND, "Board not found");
    }

    const isOwner = board.ownerId === userId;
    if (!isOwner) {
      throw new ApiError(
        httpStatus.FORBIDDEN,
        "Access denied: Only board owner can invite members"
      );
    }

    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Invitee - Check if user can accept/decline invitations
 */
const checkInvitationActionPermission = async (req, res, next) => {
  try {
    const { invitationId } = req.params;
    const userId = req.user.id;

    if (!invitationId) {
      throw new ApiError(httpStatus.BAD_REQUEST, "Invitation ID is required");
    }

    const invitation = await BoardInvitation.findById(invitationId);
    if (!invitation) {
      throw new ApiError(httpStatus.NOT_FOUND, "Invitation not found");
    }

    const user = await User.findById(userId);
    if (!user) {
      throw new ApiError(httpStatus.NOT_FOUND, "User not found");
    }

    if (user.email?.toLowerCase() !== invitation.inviteeEmail?.toLowerCase()) {
      throw new ApiError(
        httpStatus.FORBIDDEN,
        "This invitation is not for your email address"
      );
    }

    if (invitation.status !== "pending") {
      throw new ApiError(
        httpStatus.BAD_REQUEST,
        "Invitation has already been processed"
      );
    }

    if (invitation.isExpired()) {
      throw new ApiError(httpStatus.BAD_REQUEST, "Invitation has expired");
    }

    next();
  } catch (error) {
    next(error);
  }
};

module.exports = {
  checkBoardPermission,
  checkMemberManagementPermission,
  checkInvitationManagementPermission,
  checkInvitationActionPermission,
};
