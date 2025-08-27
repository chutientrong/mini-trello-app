const { status: httpStatus } = require("http-status");
const BaseService = require("./BaseService");
const Card = require("../models/Card");
const Board = require("../models/Board");
const Task = require("../models/Task");
const ApiError = require("../utils/ApiError");

class CardService extends BaseService {
  constructor() {
    super(Card, "cards");
  }

  async createCard(cardData, userId) {
    try {
      // Get the next order number for the card
      const existingCards = await Card.findByBoardId(cardData.boardId);
      const nextOrder = existingCards.length;

      const card = new Card({
        ...cardData,
        createdBy: userId,
        order: nextOrder,
      });

      // Update board card count
      const board = await Board.findById(cardData.boardId);
      board.cardCount = board.cardCount + 1;
      await board.save("boards");

      await card.save();
      return { card: card.toObject() };
    } catch (error) {
      console.error("Error creating card:", error);
      throw error;
    }
  }

  async getCards(boardId, userId, filters = {}) {
    try {
      // Build query with filters
      let query = { boardId };



      if (filters.priority) {
        query.priority = filters.priority;
      }

      if (filters.assignedTo) {
        query.assignedTo = {
          operator: "array-contains",
          value: filters.assignedTo,
        };
      }

      // Get cards with filters applied at database level
      let cards = await Card.find("cards", query);

      // Apply search filter in memory (Firestore doesn't support full-text search)
      if (filters.search) {
        const searchTerm = filters.search.toLowerCase();
        cards = cards.filter(
          (card) =>
            card.title.toLowerCase().includes(searchTerm) ||
            card.description.toLowerCase().includes(searchTerm)
        );
      }

      // Sort cards by order
      cards.sort((a, b) => a.order - b.order);

      // Get tasks for each card
      const cardsWithTasks = await Promise.all(
        cards.map(async (card) => {
          const tasks = await Task.findByCardId(card.id);
          // Sort tasks by order
          tasks.sort((a, b) => a.order - b.order);
          const cardObj = card.toObject();
          cardObj.tasks = tasks.map((task) => task.toObject());
          return cardObj;
        })
      );

      return {
        data: cardsWithTasks,
        pagination: {
          total: cards.length,
          page: 1,
          limit: cards.length,
        },
      };
    } catch (error) {
      console.error("Error getting cards:", error);
      throw error;
    }
  }

  async getCard(cardId, userId) {
    try {
      const card = await Card.findById(cardId);
      if (!card) {
        throw new ApiError(httpStatus.NOT_FOUND, "Card not found");
      }

      // Verify user has access to the board
      const board = await Board.findById(card.boardId);
      if (!board) {
        throw new ApiError(httpStatus.NOT_FOUND, "Board not found");
      }

      if (board.ownerId !== userId && !board.members.includes(userId)) {
        throw new ApiError(httpStatus.FORBIDDEN, "Access denied");
      }

      return { card: card.toObject() };
    } catch (error) {
      console.error("Error getting card:", error);
      throw error;
    }
  }

  async updateCard(cardId, updateData, userId) {
    try {
      const card = await Card.findById(cardId);
      if (!card) {
        throw new ApiError(httpStatus.NOT_FOUND, "Card not found");
      }

      // Verify user has access to the board
      const board = await Board.findById(card.boardId);
      if (!board) {
        throw new ApiError(httpStatus.NOT_FOUND, "Board not found");
      }

      if (board.ownerId !== userId && !board.members.includes(userId)) {
        throw new ApiError(httpStatus.FORBIDDEN, "Access denied");
      }

      // Update card
      Object.assign(card, updateData);
      await card.save();

      return { card: card.toObject() };
    } catch (error) {
      console.error("Error updating card:", error);
      throw error;
    }
  }

  async deleteCard(cardId, userId) {
    try {
      const card = await Card.findById(cardId);
      if (!card) {
        throw new ApiError(httpStatus.NOT_FOUND, "Card not found");
      }

      // Verify user has access to the board
      const board = await Board.findById(card.boardId);
      if (!board) {
        throw new ApiError(httpStatus.NOT_FOUND, "Board not found");
      }

      if (board.ownerId !== userId && !board.members.includes(userId)) {
        throw new ApiError(httpStatus.FORBIDDEN, "Access denied");
      }

      // Delete associated tasks first
      const tasks = await Task.findByCardId(cardId);
      for (const task of tasks) {
        await Task.findByIdAndDelete(task.id);
      }

      board.cardCount = board.cardCount - 1;
      await board.save("boards");

      // Delete the card
      await card.delete("cards");

      return { message: "Card deleted successfully" };
    } catch (error) {
      console.error("Error deleting card:", error);
      throw error;
    }
  }

  async reorderCards(boardId, cardOrders, userId) {
    try {
      // Verify board exists and user has access
      const board = await Board.findById(boardId);
      if (!board) {
        throw new ApiError(httpStatus.NOT_FOUND, "Board not found");
      }

      if (board.ownerId !== userId && !board.members.includes(userId)) {
        throw new ApiError(httpStatus.FORBIDDEN, "Access denied");
      }

      // Update order for each card
      for (const { cardId, order } of cardOrders) {
        const card = await Card.findById(cardId);
        if (card && card.boardId === boardId) {
          card.order = order;
          await card.save();
        }
      }

      return { message: "Cards reordered successfully" };
    } catch (error) {
      console.error("Error reordering cards:", error);
      throw error;
    }
  }
}

const cardService = new CardService();
module.exports = cardService;
