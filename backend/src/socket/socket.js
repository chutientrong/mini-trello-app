const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const config = require('../config/config');

class SocketManager {
  constructor() {
    this.io = null;
    this.connectedUsers = new Map(); // userId -> socketId
    this.boardRooms = new Map(); // boardId -> Set of userIds
  }

  initialize(server) {
    this.io = new Server(server, {
      cors: {
        origin: process.env.FRONTEND_URL || "http://localhost:5173",
        methods: ["GET", "POST"],
        credentials: true
      }
    });

    this.setupMiddleware();
    this.setupEventHandlers();
  }

  setupMiddleware() {
    // Authentication middleware
    this.io.use(async (socket, next) => {
      try {
        const token = socket.handshake.auth.token;
        if (!token) {
          return next(new Error('Authentication error: No token provided'));
        }

        const decoded = jwt.verify(token, config.jwt.secret);
        socket.userId = decoded.sub;
        socket.user = decoded;
        next();
      } catch (error) {
        next(new Error('Authentication error: Invalid token'));
      }
    });
  }

  setupEventHandlers() {
    this.io.on('connection', (socket) => {
      console.log(`User ${socket.userId} connected with socket ${socket.id}`);
      
      // Store user connection
      this.connectedUsers.set(socket.userId, socket.id);

      // Join user to their boards
      socket.on('join-boards', (boardIds) => {
        if (Array.isArray(boardIds)) {
          boardIds.forEach(boardId => {
            socket.join(`board:${boardId}`);
            this.addUserToBoard(boardId, socket.userId);
          });
          console.log(`User ${socket.userId} joined boards:`, boardIds);
        }
      });

      // Leave boards
      socket.on('leave-boards', (boardIds) => {
        if (Array.isArray(boardIds)) {
          boardIds.forEach(boardId => {
            socket.leave(`board:${boardId}`);
            this.removeUserFromBoard(boardId, socket.userId);
          });
          console.log(`User ${socket.userId} left boards:`, boardIds);
        }
      });

      // Handle disconnection
      socket.on('disconnect', () => {
        console.log(`User ${socket.userId} disconnected`);
        this.connectedUsers.delete(socket.userId);
        this.removeUserFromAllBoards(socket.userId);
      });
    });
  }

  addUserToBoard(boardId, userId) {
    if (!this.boardRooms.has(boardId)) {
      this.boardRooms.set(boardId, new Set());
    }
    this.boardRooms.get(boardId).add(userId);
  }

  removeUserFromBoard(boardId, userId) {
    if (this.boardRooms.has(boardId)) {
      this.boardRooms.get(boardId).delete(userId);
      if (this.boardRooms.get(boardId).size === 0) {
        this.boardRooms.delete(boardId);
      }
    }
  }

  removeUserFromAllBoards(userId) {
    for (const [boardId, users] of this.boardRooms.entries()) {
      if (users.has(userId)) {
        users.delete(userId);
        if (users.size === 0) {
          this.boardRooms.delete(boardId);
        }
      }
    }
  }

  // Emit task updates to all users in a board
  emitTaskUpdate(boardId, event, data) {
    this.io.to(`board:${boardId}`).emit(event, {
      ...data,
      timestamp: new Date().toISOString()
    });
    console.log(`Emitted ${event} to board ${boardId}:`, data);
  }

  // Emit task created event
  emitTaskCreated(boardId, task) {
    this.emitTaskUpdate(boardId, 'task:created', { task });
  }

  // Emit task updated event
  emitTaskUpdated(boardId, task) {
    this.emitTaskUpdate(boardId, 'task:updated', { task });
  }

  // Emit task deleted event
  emitTaskDeleted(boardId, taskId, cardId) {
    this.emitTaskUpdate(boardId, 'task:deleted', { taskId, cardId });
  }

  // Emit task reordered event
  emitTaskReordered(boardId, cardId, taskOrders) {
    this.emitTaskUpdate(boardId, 'task:reordered', { cardId, taskOrders });
  }

  // Emit task moved event
  emitTaskMoved(boardId, taskId, sourceCardId, destCardId, newOrder, task = null) {
    this.emitTaskUpdate(boardId, 'task:moved', { 
      taskId, 
      sourceCardId, 
      destCardId, 
      newOrder,
      task 
    });
  }

  // Emit member assigned event
  emitMemberAssigned(boardId, taskId, memberId, task = null) {
    this.emitTaskUpdate(boardId, 'task:member-assigned', { taskId, memberId, task });
  }

  // Emit member unassigned event
  emitMemberUnassigned(boardId, taskId, memberId, task = null) {
    this.emitTaskUpdate(boardId, 'task:member-unassigned', { taskId, memberId, task });
  }

  // Get connected users for a board
  getConnectedUsersForBoard(boardId) {
    return this.boardRooms.get(boardId) || new Set();
  }

  // Get socket instance
  getIO() {
    return this.io;
  }
}

const socketManager = new SocketManager();
module.exports = socketManager;
