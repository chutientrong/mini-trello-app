const { status: httpStatus } = require("http-status");
const catchAsync = require("../utils/catchAsync");
const taskService = require("../services/task.service");

const createTask = catchAsync(async (req, res) => {
  const { boardId, cardId } = req.query;
  const taskData = { ...req.body, boardId, cardId };
  const userId = req.user.id;
  const result = await taskService.createTask(taskData, userId);
  res.status(httpStatus.CREATED).json(result);
});

const getTasks = catchAsync(async (req, res) => {
  const { boardId, cardId, ...filters } = req.query;
  const userId = req.user.id;
  const result = await taskService.getTasks(boardId, cardId, userId, filters);
  res.status(httpStatus.OK).json(result);
});

const getTask = catchAsync(async (req, res) => {
  const { boardId, cardId } = req.query;
  const { taskId } = req.params;
  const userId = req.user.id;
  const result = await taskService.getTask(boardId, cardId, taskId, userId);
  res.status(httpStatus.OK).json(result);
});

const updateTask = catchAsync(async (req, res) => {
  const { boardId, cardId } = req.query;
  const { taskId } = req.params;
  const userId = req.user.id;
  const result = await taskService.updateTask(
    boardId,
    cardId,
    taskId,
    req.body,
    userId
  );
  res.status(httpStatus.OK).json(result);
});

const deleteTask = catchAsync(async (req, res) => {
  const { boardId, cardId } = req.query;
  const { taskId } = req.params;
  const userId = req.user.id;
  const result = await taskService.deleteTask(boardId, cardId, taskId, userId);
  res.status(httpStatus.OK).json(result);
});

const reorderTasks = catchAsync(async (req, res) => {
  const { boardId, cardId } = req.query;
  const userId = req.user.id;
  const result = await taskService.reorderTasks(
    boardId,
    cardId,
    req.body.taskOrders,
    userId
  );
  res.status(httpStatus.OK).json(result);
});

const assignMember = catchAsync(async (req, res) => {
  const { boardId, cardId, memberId } = req.query;
  const { taskId } = req.params;
  const userId = req.user.id;
  const result = await taskService.assignMember(
    boardId,
    cardId,
    taskId,
    userId,
    memberId
  );
  res.status(httpStatus.OK).json(result);
});

const moveTaskToCard = catchAsync(async (req, res) => {
  const { boardId, sourceCardId, destCardId, newOrder } = req.query;
  const { taskId } = req.params;
  const userId = req.user.id;
  const result = await taskService.moveTaskToCard(
    boardId,
    taskId,
    sourceCardId,
    destCardId,
    parseInt(newOrder),
    userId
  );
  res.status(httpStatus.OK).json(result);
});

const removeMember = catchAsync(async (req, res) => {
  const { boardId, cardId, memberId } = req.query;
  const { taskId } = req.params;
  const userId = req.user.id;
  const result = await taskService.removeMemberAssignment(
    boardId,
    cardId,
    taskId,
    userId,
    memberId
  );
  res.status(httpStatus.OK).json(result);
});

module.exports = {
  createTask,
  getTasks,
  getTask,
  updateTask,
  deleteTask,
  reorderTasks,
  assignMember,
  moveTaskToCard,
  removeMember,
};
