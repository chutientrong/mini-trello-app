const { status: httpStatus } = require('http-status');
const BaseService = require('./BaseService');
const Task = require('../models/Task');
const Card = require('../models/Card');
const Board = require('../models/Board');
const ApiError = require('../utils/ApiError');
const socketManager = require('../socket/socket');

class TaskService extends BaseService {
  constructor() {
    super(Task, 'tasks');
  }

  async createTask(taskData, userId) {
    try {
      const { boardId, cardId, ...taskFields } = taskData;

      // Get the next order number for the task
      const existingTasks = await Task.findByCardId(cardId);
      const nextOrder = existingTasks.length;

      const task = new Task({
        ...taskFields,
        cardId,
        boardId,
        ownerId: userId,
        order: nextOrder,
      });

      // Update card task count
      const card = await Card.findById(cardId);
      card.taskCount = card.taskCount + 1;
      await card.save('cards');

      await task.save();
      
      // Emit WebSocket event for task creation
      const taskObject = task.toObject();
      socketManager.emitTaskCreated(boardId, taskObject);
      
      return { task: taskObject };
    } catch (error) {
      console.error('Error creating task:', error);
      throw error;
    }
  }

  async getTasks(boardId, cardId, userId, filters = {}) {
    try {
      // Build query with filters
      let query = { cardId };
      
      if (filters.dueComplete !== undefined) {
        query.dueComplete = filters.dueComplete;
      }
      
      if (filters.priority) {
        query.priority = filters.priority;
      }
      
      if (filters.assignedMembers) {
        query.assignedMembers = { operator: 'array-contains', value: filters.assignedMembers };
      }

      // Get tasks with filters applied at database level
      let tasks = await Task.find('tasks', query);

      // Apply search filter in memory (Firestore doesn't support full-text search)
      if (filters.search) {
        const searchTerm = filters.search.toLowerCase();
        tasks = tasks.filter(task =>
          task.title.toLowerCase().includes(searchTerm) ||
          task.description.toLowerCase().includes(searchTerm)
        );
      }

      // Sort tasks by order
      tasks.sort((a, b) => a.order - b.order);

      return {
        data: tasks.map(task => task.toObject()),
        pagination: {
          total: tasks.length,
          page: 1,
          limit: tasks.length,
        },
      };
    } catch (error) {
      console.error('Error getting tasks:', error);
      throw error;
    }
  }

  async getTask(boardId, cardId, taskId, userId) {
    try {
      // Get task
      const task = await Task.findById(taskId);
      if (!task) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Task not found');
      }

      return { task: task.toObject() };
    } catch (error) {
      console.error('Error getting task:', error);
      throw error;
    }
  }

  async updateTask(boardId, cardId, taskId, updateData, userId) {
    try {
      // Get task
      const task = await Task.findById(taskId);
      if (!task) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Task not found');
      }

      // Update task
      Object.assign(task, updateData);
      await task.save();

      // Emit WebSocket event for task update
      const taskObject = task.toObject();
      socketManager.emitTaskUpdated(boardId, taskObject);

      return { task: taskObject };
    } catch (error) {
      console.error('Error updating task:', error);
      throw error;
    }
  }

  async deleteTask(boardId, cardId, taskId, userId) {
    try {
      // Get task
      const task = await Task.findById(taskId);
      if (!task) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Task not found');
      }

      // Delete task
      await task.delete('tasks');

      // Update card task count
      const card = await Card.findById(cardId);
      card.taskCount = Math.max(0, card.taskCount - 1);
      await card.save('cards');

      // Emit WebSocket event for task deletion
      socketManager.emitTaskDeleted(boardId, taskId, cardId);

      return { message: 'Task deleted successfully' };
    } catch (error) {
      console.error('Error deleting task:', error);
      throw error;
    }
  }

  async reorderTasks(boardId, cardId, taskOrders, userId) {
    try {
      console.log('Reorder tasks called with:', { boardId, cardId, taskOrders });
      
      // Update order for each task
      for (const { taskId, order } of taskOrders) {
        const task = await Task.findById(taskId);
        if (task && task.cardId === cardId) {
          console.log(`Updating task ${taskId} order from ${task.order} to ${order}`);
          task.order = order;
          await task.save();
        } else {
          console.log(`Task ${taskId} not found or doesn't belong to card ${cardId}`);
        }
      }

      // Emit WebSocket event for task reordering
      socketManager.emitTaskReordered(boardId, cardId, taskOrders);

      return { message: 'Tasks reordered successfully' };
    } catch (error) {
      console.error('Error reordering tasks:', error);
      throw error;
    }
  }

  async assignMember(boardId, cardId, taskId, userId, memberId) {
    try {
      // Get task
      const task = await Task.findById(taskId);
      if (!task) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Task not found');
      }

      // Assign member to task
      await task.assignMember(memberId);

      // Emit WebSocket event for member assignment with task data
      socketManager.emitMemberAssigned(boardId, taskId, memberId, task);

      return { message: 'Member assigned successfully' };
    } catch (error) {
      console.error('Error assigning member:', error);
      throw error;
    }
  }

  async removeMemberAssignment(boardId, cardId, taskId, userId, memberId) {
    try {
      // Get task
      const task = await Task.findById(taskId);
      if (!task) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Task not found');
      }

      // Remove member assignment from task
      await task.removeMemberAssignment(memberId);

      // Emit WebSocket event for member unassignment with task data
      socketManager.emitMemberUnassigned(boardId, taskId, memberId, task);

      return { message: 'Member assignment removed successfully' };
    } catch (error) {
      console.error('Error removing member assignment:', error);
      throw error;
    }
  }

  async moveTaskToCard(boardId, taskId, sourceCardId, destCardId, newOrder, userId) {
    try {
      console.log('Move task to card called with:', { boardId, taskId, sourceCardId, destCardId, newOrder });
      
      // Get task
      const task = await Task.findById(taskId);
      if (!task) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Task not found');
      }

      // Verify task belongs to source card
      if (task.cardId !== sourceCardId) {
        throw new ApiError(httpStatus.BAD_REQUEST, 'Task does not belong to source card');
      }

      // Get all tasks in destination card to update their orders
      const destCardTasks = await Task.findByCardId(destCardId);
      
      // Update orders for tasks in destination card (shift tasks after newOrder)
      for (const destTask of destCardTasks) {
        if (destTask.order >= newOrder) {
          destTask.order = destTask.order + 1;
          await destTask.save();
        }
      }

      // Update orders for tasks in source card (shift tasks after the moved task's original position)
      const sourceCardTasks = await Task.findByCardId(sourceCardId);
      const originalOrder = task.order;
      
      for (const sourceTask of sourceCardTasks) {
        if (sourceTask.order > originalOrder) {
          sourceTask.order = sourceTask.order - 1;
          await sourceTask.save();
        }
      }

      // Move the task to destination card
      task.cardId = destCardId;
      task.order = newOrder;
      await task.save();

      // Emit WebSocket event for task movement with task data
      socketManager.emitTaskMoved(boardId, taskId, sourceCardId, destCardId, newOrder, task);

      return { message: 'Task moved successfully' };
    } catch (error) {
      console.error('Error moving task:', error);
      throw error;
    }
  }
}

const taskService = new TaskService();
module.exports = taskService;
