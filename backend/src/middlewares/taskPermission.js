const ApiError = require("../utils/ApiError");
const { status: httpStatus } = require("http-status");
const Board = require("../models/Board");
const Card = require("../models/Card");
const Task = require("../models/Task");

/**
 * Check task permissions
 * @param {string} operation - 'create', 'read', 'update', 'delete'
 */
const checkTaskPermission = (operation) => {
  return async (req, res, next) => {
    try {
      const { boardId, cardId, sourceCardId, destCardId } = req.query;
      const { taskId } = req.params;
      const userId = req.user.id;

      if (operation === "update" && req.path.includes("move-to-card")) {
        if (!boardId || !sourceCardId || !destCardId) {
          throw new ApiError(
            httpStatus.BAD_REQUEST,
            "Board ID, Source Card ID, and Destination Card ID are required"
          );
        }
      } else {
        if (!boardId || !cardId) {
          throw new ApiError(
            httpStatus.BAD_REQUEST,
            "Board ID and Card ID are required"
          );
        }
      }

      const board = await Board.findById(boardId);
      if (!board) {
        throw new ApiError(httpStatus.NOT_FOUND, "Board not found");
      }

      // board members can read
      const isBoardMember =
        board.ownerId === userId || board.members.includes(userId);
      if (!isBoardMember) {
        throw new ApiError(
          httpStatus.FORBIDDEN,
          "Access denied: You are not a member of this board"
        );
      }

      let card;
      if (operation === "update" && req.path.includes("move-to-card")) {
        const sourceCard = await Card.findById(sourceCardId);
        const destCard = await Card.findById(destCardId);

        if (!sourceCard) {
          throw new ApiError(httpStatus.NOT_FOUND, "Source card not found");
        }
        if (!destCard) {
          throw new ApiError(
            httpStatus.NOT_FOUND,
            "Destination card not found"
          );
        }

        if (sourceCard.boardId !== boardId) {
          throw new ApiError(
            httpStatus.BAD_REQUEST,
            "Source card does not belong to this board"
          );
        }
        if (destCard.boardId !== boardId) {
          throw new ApiError(
            httpStatus.BAD_REQUEST,
            "Destination card does not belong to this board"
          );
        }

        card = sourceCard;
      } else {
        card = await Card.findById(cardId);
        if (!card) {
          throw new ApiError(httpStatus.NOT_FOUND, "Card not found");
        }

        if (card.boardId !== boardId) {
          throw new ApiError(
            httpStatus.BAD_REQUEST,
            "Card does not belong to this board"
          );
        }
      }

      // board members can read
      if (operation === "read") {
        return next();
      }

      // board members can create tasks
      if (operation === "create") {
        return next();
      }

      // only task owners or card owners, or board owners can update/delete tasks
      if (operation === "update" || operation === "delete") {
        if (!taskId) {
          throw new ApiError(httpStatus.BAD_REQUEST, "Task ID is required");
        }

        const task = await Task.findById(taskId);
        if (!task) {
          throw new ApiError(httpStatus.NOT_FOUND, "Task not found");
        }

        if (operation === "update" && req.path.includes("move-to-card")) {
          if (task.cardId !== sourceCardId) {
            throw new ApiError(
              httpStatus.BAD_REQUEST,
              "Task does not belong to the source card"
            );
          }
        } else {
          if (task.cardId !== cardId) {
            throw new ApiError(
              httpStatus.BAD_REQUEST,
              "Task does not belong to this card"
            );
          }
        }

        // task owners, card owners, or board owners can update/delete tasks
        const isOwner =
          task.ownerId === userId ||
          card.ownerId === userId ||
          board.ownerId === userId;
        const isBoardMember =
          board.ownerId === userId || board.members.includes(userId);

        if (!isOwner && !isBoardMember) {
          throw new ApiError(
            httpStatus.FORBIDDEN,
            `Access denied: Only task owner, card owner, board owner, or board members can ${operation} tasks`
          );
        }

        return next();
      }

      // board members can reorder tasks
      if (operation === "reorder") {
        return next();
      }

      // board members can assign tasks
      if (operation === "assign") {
        return next();
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

/**
 * Check if user can assign members to tasks
 */
const checkAssignPermission = async (req, res, next) => {
  try {
    const { boardId, cardId } = req.query;
    const { taskId } = req.params;
    const { memberId } = req.query;
    const userId = req.user.id;

    if (!boardId || !cardId || !taskId || !memberId) {
      throw new ApiError(
        httpStatus.BAD_REQUEST,
        "Board ID, Card ID, Task ID, and Member ID are required"
      );
    }

    const board = await Board.findById(boardId);
    if (!board) {
      throw new ApiError(httpStatus.NOT_FOUND, "Board not found");
    }

    // board members can assign tasks
    const isBoardMember =
      board.ownerId === userId || board.members.includes(userId);
    if (!isBoardMember) {
      throw new ApiError(
        httpStatus.FORBIDDEN,
        "Access denied: You are not a member of this board"
      );
    }

    // member to be assigned must be a board member
    const isMemberInBoard =
      board.ownerId === memberId || board.members.includes(memberId);
    if (!isMemberInBoard) {
      throw new ApiError(
        httpStatus.BAD_REQUEST,
        "Cannot assign task to user who is not a board member"
      );
    }

    const card = await Card.findById(cardId);
    if (!card) {
      throw new ApiError(httpStatus.NOT_FOUND, "Card not found");
    }

    if (card.boardId !== boardId) {
      throw new ApiError(
        httpStatus.BAD_REQUEST,
        "Card does not belong to this board"
      );
    }

    const task = await Task.findById(taskId);
    if (!task) {
      throw new ApiError(httpStatus.NOT_FOUND, "Task not found");
    }

    if (task.cardId !== cardId) {
      throw new ApiError(
        httpStatus.BAD_REQUEST,
        "Task does not belong to this card"
      );
    }

    next();
  } catch (error) {
    next(error);
  }
};

module.exports = {
  checkTaskPermission,
  checkAssignPermission,
};
