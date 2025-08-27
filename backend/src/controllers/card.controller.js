const { status: httpStatus } = require("http-status");
const cardService = require("../services/card.service");
const catchAsync = require("../utils/catchAsync");

const createCard = catchAsync(async (req, res) => {
  const { boardId } = req.query;
  const cardData = { ...req.body, boardId };
  const userId = req.user.id;

  const result = await cardService.createCard(cardData, userId);
  res.status(httpStatus.CREATED).json(result);
});

const getCards = catchAsync(async (req, res) => {
  const { boardId, ...filters } = req.query;
  const userId = req.user.id;

  const result = await cardService.getCards(boardId, userId, filters);
  res.status(httpStatus.OK).json(result);
});

const getCard = catchAsync(async (req, res) => {
  const { cardId } = req.params;
  const userId = req.user.id;

  const result = await cardService.getCard(cardId, userId);
  res.status(httpStatus.OK).json(result);
});

const updateCard = catchAsync(async (req, res) => {
  const { cardId } = req.params;
  const updateData = req.body;
  const userId = req.user.id;

  const result = await cardService.updateCard(cardId, updateData, userId);
  res.status(httpStatus.OK).json(result);
});

const deleteCard = catchAsync(async (req, res) => {
  const { cardId } = req.params;
  const userId = req.user.id;

  const result = await cardService.deleteCard(cardId, userId);
  res.status(httpStatus.OK).json(result);
});

const reorderCards = catchAsync(async (req, res) => {
  const { boardId } = req.query;
  const { cardOrders } = req.body;
  const userId = req.user.id;

  const result = await cardService.reorderCards(boardId, cardOrders, userId);
  res.status(httpStatus.OK).json(result);
});

module.exports = {
  createCard,
  getCards,
  getCard,
  updateCard,
  deleteCard,
  reorderCards,
};
