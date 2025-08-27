const { status: httpStatus } = require("http-status");
const catchAsync = require("../utils/catchAsync");
const boardService = require("../services/board.service");

const createBoard = catchAsync(async (req, res) => {
  const userId = req.user.id;
  const result = await boardService.createBoard(req.body, userId);
  res.status(httpStatus.CREATED).json(result);
});

const getBoards = catchAsync(async (req, res) => {
  const userId = req.user.id;
  const { ...filters } = req.query;
  const result = await boardService.getBoards(userId, filters);
  res.status(httpStatus.OK).json(result);
});

const getBoard = catchAsync(async (req, res) => {
  const { boardId } = req.params;
  const userId = req.user.id;
  const result = await boardService.getBoard(boardId, userId);
  res.status(httpStatus.OK).json(result);
});

const updateBoard = catchAsync(async (req, res) => {
  const { boardId } = req.params;
  const userId = req.user.id;
  const result = await boardService.updateBoard(boardId, req.body, userId);
  res.status(httpStatus.OK).json(result);
});

const deleteBoard = catchAsync(async (req, res) => {
  const { boardId } = req.params;
  const userId = req.user.id;
  const result = await boardService.deleteBoard(boardId, userId);
  res.status(httpStatus.OK).json(result);
});

const inviteMember = catchAsync(async (req, res) => {
  const { boardId } = req.params;
  const { email, role } = req.body;
  const userId = req.user.id;
  const result = await boardService.inviteMember(boardId, email, role, userId);
  res.status(httpStatus.OK).json(result);
});

const getBoardMembers = catchAsync(async (req, res) => {
  const { boardId } = req.params;
  const userId = req.user.id;
  const result = await boardService.getBoardMembers(boardId, userId);
  res.status(httpStatus.OK).json(result);
});

const getBoardInvitations = catchAsync(async (req, res) => {
  const { boardId } = req.params;
  const userId = req.user.id;
  const result = await boardService.getBoardInvitations(boardId, userId);
  res.status(httpStatus.OK).json(result);
});

const acceptInvitation = catchAsync(async (req, res) => {
  const { invitationId } = req.params;
  const userId = req.user.id;
  const result = await boardService.acceptInvitation(invitationId, userId);
  res.status(httpStatus.OK).json(result);
});

const declineInvitation = catchAsync(async (req, res) => {
  const { invitationId } = req.params;
  const userId = req.user.id;
  const result = await boardService.declineInvitation(invitationId, userId);
  res.status(httpStatus.OK).json(result);
});

const cancelInvitation = catchAsync(async (req, res) => {
  const { invitationId } = req.params;
  const userId = req.user.id;
  const result = await boardService.cancelInvitation(invitationId, userId);
  res.status(httpStatus.OK).json(result);
});

const setBoardGitHubRepository = catchAsync(async (req, res) => {
  const result = await boardService.setBoardGitHubRepository(
    req.params.boardId,
    req.user.id,
    req.body.repository
  );
  res.status(httpStatus.OK).json(result);
});

const getBoardGitHubRepository = catchAsync(async (req, res) => {
  const result = await boardService.getBoardGitHubRepository(
    req.params.boardId,
    req.user.id
  );
  res.status(httpStatus.OK).json(result);
});

const removeBoardGitHubRepository = catchAsync(async (req, res) => {
  const result = await boardService.removeBoardGitHubRepository(
    req.params.boardId,
    req.user.id
  );
  res.status(httpStatus.OK).json(result);
});

module.exports = {
  createBoard,
  getBoards,
  getBoard,
  updateBoard,
  deleteBoard,
  inviteMember,
  getBoardMembers,
  getBoardInvitations,
  acceptInvitation,
  declineInvitation,
  cancelInvitation,
  setBoardGitHubRepository,
  getBoardGitHubRepository,
  removeBoardGitHubRepository,
};
