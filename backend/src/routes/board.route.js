const express = require("express");
const auth = require("../middlewares/auth");
const validate = require("../middlewares/validate");
const {
  checkBoardPermission,
  checkInvitationManagementPermission,
  checkInvitationActionPermission,
} = require("../middlewares/boardPermission");
const boardValidation = require("../validations/board.validation");
const boardController = require("../controllers/board.controller");

const router = express.Router();

router
  .route("/")
  .post(
    auth(),
    checkBoardPermission("create"),
    validate(boardValidation.createBoard),
    boardController.createBoard
  )
  .get(auth(), boardController.getBoards);

router
  .route("/:boardId")
  .get(
    auth(),
    checkBoardPermission("read"),
    validate(boardValidation.getBoard),
    boardController.getBoard
  )
  .patch(
    auth(),
    checkBoardPermission("update"),
    validate(boardValidation.updateBoard),
    boardController.updateBoard
  )
  .delete(
    auth(),
    checkBoardPermission("delete"),
    validate(boardValidation.deleteBoard),
    boardController.deleteBoard
  );

router
  .route("/:boardId/invite")
  .post(
    auth(),
    checkInvitationManagementPermission,
    validate(boardValidation.inviteMember),
    boardController.inviteMember
  );

router
  .route("/:boardId/members")
  .get(auth(), checkBoardPermission("read"), boardController.getBoardMembers);

router
  .route("/:boardId/invitations")
  .get(
    auth(),
    checkBoardPermission("read"),
    validate(boardValidation.getBoardInvitations),
    boardController.getBoardInvitations
  );

// Invitation acceptance/decline routes
router
  .route("/invitations/:invitationId/accept")
  .post(
    auth(),
    checkInvitationActionPermission,
    validate(boardValidation.acceptInvitation),
    boardController.acceptInvitation
  );

router
  .route("/invitations/:invitationId/decline")
  .post(
    auth(),
    checkInvitationActionPermission,
    validate(boardValidation.declineInvitation),
    boardController.declineInvitation
  );

router
  .route("/invitations/:invitationId/cancel")
  .delete(
    auth(),
    checkInvitationManagementPermission,
    validate(boardValidation.cancelInvitation),
    boardController.cancelInvitation
  );

// GitHub repository management
router
  .route("/:boardId/github-repository")
  .post(
    auth(),
    checkBoardPermission("update"),
    boardController.setBoardGitHubRepository
  )
  .get(
    auth(),
    checkBoardPermission("read"),
    boardController.getBoardGitHubRepository
  )
  .delete(
    auth(),
    checkBoardPermission("update"),
    boardController.removeBoardGitHubRepository
  );

module.exports = router;
