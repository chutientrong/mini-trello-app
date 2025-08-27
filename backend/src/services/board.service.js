const { status: httpStatus } = require("http-status");
const BaseService = require("./BaseService");
const Board = require("../models/Board");
const User = require("../models/User");
const BoardInvitation = require("../models/BoardInvitation");
const notificationService = require("./notification.service");
const ApiError = require("../utils/ApiError");
const logger = require("../config/logger");

class BoardService extends BaseService {
  constructor() {
    super(Board, "boards");
  }

  async createBoard(boardData, userId) {
    const data = {
      ...boardData,
      ownerId: userId,
    };

    const board = await Board.create(data);
    return {
      board: board.toObject(),
    };
  }

  // Get user's boards (owned and shared)
  async getBoards(userId, filters = {}) {
    // Get boards owned by user
    const ownedBoards = await Board.findByOwnerId(userId);

    // Get boards where user is a member
    const memberBoards = await Board.findByMemberId(userId);

    // Combine and deduplicate boards
    const allBoards = [...ownedBoards, ...memberBoards];
    const uniqueBoards = allBoards.filter(
      (board, index, self) => index === self.findIndex((b) => b.id === board.id)
    );

    // Add user role information to each board
    const boardsWithRole = uniqueBoards.map((board) => {
      const boardObj = board.toObject();
      const isOwner = board.ownerId === userId;
      const isMember = board.members.includes(userId);

      return {
        ...boardObj,
        userRole: isOwner ? "owner" : "member",
        isOwner,
        isMember,
      };
    });

    let filteredBoards = boardsWithRole;

    // Apply filters
    if (filters.search) {
      const searchRegex = new RegExp(filters.search, "i");
      filteredBoards = filteredBoards.filter(
        (board) =>
          board.name.toLowerCase().includes(filters.search.toLowerCase()) ||
          (board.description &&
            board.description
              .toLowerCase()
              .includes(filters.search.toLowerCase()))
      );
    }

    if (filters.isPublic !== undefined) {
      filteredBoards = filteredBoards.filter(
        (board) => board.isPublic === filters.isPublic
      );
    }

    // Filter by role if specified
    if (filters.role) {
      filteredBoards = filteredBoards.filter(
        (board) => board.userRole === filters.role
      );
    }

    // Sort boards: owned boards first, then by name
    filteredBoards.sort((a, b) => {
      if (a.isOwner && !b.isOwner) return -1;
      if (!a.isOwner && b.isOwner) return 1;
      return a.name.localeCompare(b.name);
    });

    // Apply pagination
    const page = parseInt(filters.page) || 1;
    const limit = parseInt(filters.limit) || 10;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedBoards = filteredBoards.slice(startIndex, endIndex);

    return {
      data: paginatedBoards,
      pagination: {
        page,
        limit,
        total: filteredBoards.length,
        totalPages: Math.ceil(filteredBoards.length / limit),
      },
    };
  }

  async getBoard(boardId, userId) {
    const board = await Board.findById(boardId);

    if (!board) {
      throw new ApiError(httpStatus.NOT_FOUND, "Board not found");
    }

    return {
      board: board.toObject(),
    };
  }

  async updateBoard(boardId, updateData, userId) {
    const board = await Board.findByIdAndUpdate(boardId, updateData);
    return {
      board: board.toObject(),
    };
  }

  async deleteBoard(boardId, userId) {
    await Board.findByIdAndDelete(boardId);
    return {
      message: "Board deleted successfully",
    };
  }

  async addMember(boardId, userId, role, currentUserId) {
    const board = await Board.findById(boardId);
    await board.addMember(userId);

    return {
      message: "Member added successfully",
    };
  }

  async removeMember(boardId, userId, currentUserId) {
    const board = await Board.findById(boardId);
    await board.removeMember(userId);

    return {
      message: "Member removed successfully",
    };
  }

  async inviteMember(boardId, inviteeEmail, role, currentUserId) {
    const board = await Board.findById(boardId);

    if (!board) {
      throw new ApiError(httpStatus.NOT_FOUND, "Board not found");
    }

    // Check if current user is board owner
    if (board.ownerId !== currentUserId) {
      throw new ApiError(
        httpStatus.FORBIDDEN,
        "Only board owner can invite members"
      );
    }

    // Check if user is already a member
    const existingUser = await User.findOneByEmail(inviteeEmail);
    if (existingUser && board.hasAccess(existingUser.id)) {
      throw new ApiError(
        httpStatus.CONFLICT,
        "User is already a member of this board"
      );
    }

    // Check if invitation already exists
    const existingInvitations = await BoardInvitation.findByEmail(inviteeEmail);
    const pendingInvitation = existingInvitations.find(
      (inv) =>
        inv.boardId === boardId && inv.status === "pending" && !inv.isExpired()
    );

    if (pendingInvitation) {
      throw new ApiError(
        httpStatus.CONFLICT,
        "Invitation already sent to this email"
      );
    }

    // Create invitation
    const invitation = new BoardInvitation({
      boardId,
      inviterId: currentUserId,
      inviteeEmail: inviteeEmail.toLowerCase().trim(),
      role,
    });

    // Generate token and set expiration
    invitation.generateToken();
    invitation.setExpiration();

    // Save invitation
    await invitation.save();

    // Get inviter details
    const inviter = await User.findById(currentUserId);
    const inviterName = inviter?.fullName || inviter?.email || "Someone";

    // Create notification instead of email
    await notificationService.createBoardInvitationNotification(
      invitation,
      board,
      inviter
    );

    return {
      message: "Invitation sent successfully",
      invitation: invitation.toObject(),
    };
  }

  async getBoardInvitations(boardId, currentUserId) {
    const board = await Board.findById(boardId);

    if (!board) {
      throw new ApiError(httpStatus.NOT_FOUND, "Board not found");
    }

    // Check if user has access to this board
    if (!board.hasAccess(currentUserId)) {
      throw new ApiError(
        httpStatus.FORBIDDEN,
        "Access denied: You are not a member of this board"
      );
    }

    const invitations = await BoardInvitation.findByBoardId(boardId);

    return {
      invitations: invitations.map((inv) => inv.toObject()),
      total: invitations.length,
    };
  }

  // Accept invitation
  async acceptInvitation(invitationId, currentUserId) {
    const invitation = await BoardInvitation.findById(invitationId);

    // Get board
    const board = await Board.findById(invitation.boardId);
    if (!board) {
      throw new ApiError(httpStatus.NOT_FOUND, "Board not found");
    }

    // Check if user is already a member
    if (board.hasAccess(currentUserId)) {
      // Mark invitation as accepted even if already member
      invitation.accept();
      await invitation.save();
      throw new ApiError(
        httpStatus.CONFLICT,
        "You are already a member of this board"
      );
    }

    // Add user to board
    await board.addMember(currentUserId);

    // Mark invitation as accepted
    invitation.accept();
    await invitation.save();

    return {
      message: "Invitation accepted successfully",
      board: board.toObject(),
    };
  }

  async declineInvitation(invitationId, currentUserId) {
    const invitation = await BoardInvitation.findById(invitationId);

    // Mark invitation as declined
    invitation.decline();
    await invitation.save();

    return {
      message: "Invitation declined successfully",
    };
  }

  async getBoardMembers(boardId, userId) {
    const board = await Board.findById(boardId);

    if (!board) {
      throw new ApiError(httpStatus.NOT_FOUND, "Board not found");
    }

    // Check if user has access to this board
    if (!board.hasAccess(userId)) {
      throw new ApiError(
        httpStatus.FORBIDDEN,
        "Access denied: You are not a member of this board"
      );
    }

    // Get all member IDs (including owner)
    const allMemberIds = [board.ownerId, ...board.members];

    // Fetch user details for each member
    const members = await Promise.all(
      allMemberIds.map(async (memberId) => {
        const user = await User.findById(memberId);
        return {
          userId: memberId,
          email: user?.email || memberId,
          fullName: user?.fullName || memberId,
          role: memberId === board.ownerId ? "owner" : "member",
          joinedAt: user?.createdAt || new Date().toISOString(),
        };
      })
    );

    return {
      members,
      total: members.length,
    };
  }

  // Set GitHub repository for a board
  async setBoardGitHubRepository(boardId, userId, repositoryData) {
    const board = await Board.findById(boardId);

    if (!board) {
      throw new ApiError(httpStatus.NOT_FOUND, "Board not found");
    }

    if (!board.hasAccess(userId)) {
      throw new ApiError(httpStatus.FORBIDDEN, "Access denied to this board");
    }

    // Validate repository data
    if (!repositoryData || !repositoryData.full_name) {
      throw new ApiError(httpStatus.BAD_REQUEST, "Invalid repository data");
    }

    await board.setGitHubRepository(repositoryData);

    logger.info(
      `GitHub repository ${repositoryData.full_name} linked to board ${boardId}`
    );

    return {
      message: "GitHub repository linked successfully",
      repository: repositoryData,
    };
  }

  // Get GitHub repository for a board
  async getBoardGitHubRepository(boardId, userId) {
    const board = await Board.findById(boardId);

    if (!board) {
      throw new ApiError(httpStatus.NOT_FOUND, "Board not found");
    }

    if (!board.hasAccess(userId)) {
      throw new ApiError(httpStatus.FORBIDDEN, "Access denied to this board");
    }

    return {
      repository: board.getGitHubRepository(),
    };
  }

  // Remove GitHub repository from a board
  async removeBoardGitHubRepository(boardId, userId) {
    const board = await Board.findById(boardId);

    if (!board) {
      throw new ApiError(httpStatus.NOT_FOUND, "Board not found");
    }

    if (!board.hasAccess(userId)) {
      throw new ApiError(httpStatus.FORBIDDEN, "Access denied to this board");
    }

    await board.setGitHubRepository(null);

    logger.info(`GitHub repository removed from board ${boardId}`);

    return {
      message: "GitHub repository removed successfully",
    };
  }
}

// Create singleton instance
const boardService = new BoardService();

module.exports = boardService;
