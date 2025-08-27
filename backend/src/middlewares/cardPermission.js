const ApiError = require("../utils/ApiError");
const { status: httpStatus } = require("http-status");
const Board = require("../models/Board");
const Card = require("../models/Card");

/**
 * Check card permissions
 * @param {string} operation - 'create', 'read', 'update', 'delete', 'reorder'
 */
const checkCardPermission = (operation) => {
  return async (req, res, next) => {
    try {
      const { boardId } = req.query;
      const { cardId } = req.params;
      const userId = req.user.id;

      if (!boardId) {
        throw new ApiError(httpStatus.BAD_REQUEST, "Board ID is required");
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

      if (operation === "read") {
        return next();
      }

      // only board owners can create/update/delete cards
      if (operation === "create") {
        const isOwner = board.ownerId === userId;
        if (!isOwner) {
          throw new ApiError(
            httpStatus.FORBIDDEN,
            "Access denied: Only board owner can create cards"
          );
        }
        return next();
      }

      if (operation === "update" || operation === "delete") {
        if (!cardId) {
          throw new ApiError(httpStatus.BAD_REQUEST, "Card ID is required");
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

        const isOwner = card.ownerId === userId || board.ownerId === userId;
        if (!isOwner) {
          throw new ApiError(
            httpStatus.FORBIDDEN,
            `Access denied: Only card owner or board owner can ${operation} cards`
          );
        }

        return next();
      }

      if (operation === "reorder") {
        const isOwner = board.ownerId === userId;
        if (!isOwner) {
          const userCards = await Card.find("cards", {
            boardId,
            ownerId: userId,
          });
          if (userCards.length === 0) {
            throw new ApiError(
              httpStatus.FORBIDDEN,
              "Access denied: Only board owner or card owners can reorder cards"
            );
          }
        }
        return next();
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

module.exports = {
  checkCardPermission,
};
