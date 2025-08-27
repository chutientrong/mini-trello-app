import { apiClient } from '@/services';
import type {
  Task,
  CreateTaskRequest,
  UpdateTaskRequest,
  TaskListResponse,
  TaskFilters,
  TaskResponse,
} from '../types';

export class TasksAPI {
  // Get all tasks for a card
  static async getTasks(boardId: string, cardId: string, params?: TaskFilters): Promise<TaskListResponse> {
    const queryParams = new URLSearchParams();
    
    // Required query parameters
    queryParams.append('boardId', boardId);
    queryParams.append('cardId', cardId);
    
    // Optional query parameters
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.search) queryParams.append('search', params.search);
    if (params?.sortBy) queryParams.append('sortBy', params.sortBy);
    if (params?.sortOrder) queryParams.append('sortOrder', params.sortOrder);
    if (params?.status) queryParams.append('status', params.status);
    if (params?.priority) queryParams.append('priority', params.priority);
    if (params?.assignedTo) queryParams.append('assignedTo', params.assignedTo);
    
    const url = `/tasks?${queryParams.toString()}`;
    return apiClient.get<TaskListResponse>(url);
  }

  // Get task by ID
  static async getTask(boardId: string, cardId: string, taskId: string): Promise<TaskResponse> {
    const queryParams = new URLSearchParams();
    queryParams.append('boardId', boardId);
    queryParams.append('cardId', cardId);
    
    return apiClient.get<TaskResponse>(`/tasks/${taskId}?${queryParams.toString()}`);
  }

  // Create new task
  static async createTask(boardId: string, cardId: string, data: CreateTaskRequest): Promise<TaskResponse> {
    const queryParams = new URLSearchParams();
    queryParams.append('boardId', boardId);
    queryParams.append('cardId', cardId);
    
    return apiClient.post<TaskResponse>(`/tasks?${queryParams.toString()}`, data);
  }

  // Update task
  static async updateTask(boardId: string, cardId: string, taskId: string, data: UpdateTaskRequest): Promise<TaskResponse> {
    const queryParams = new URLSearchParams();
    queryParams.append('boardId', boardId);
    queryParams.append('cardId', cardId);
    
    return apiClient.patch<TaskResponse>(`/tasks/${taskId}?${queryParams.toString()}`, data);
  }

  // Delete task
  static async deleteTask(boardId: string, cardId: string, taskId: string): Promise<void> {
    const queryParams = new URLSearchParams();
    queryParams.append('boardId', boardId);
    queryParams.append('cardId', cardId);
    
    return apiClient.delete(`/tasks/${taskId}?${queryParams.toString()}`);
  }

  // Reorder tasks
  static async reorderTasks(boardId: string, cardId: string, taskOrders: Array<{ taskId: string; order: number }>): Promise<void> {
    const queryParams = new URLSearchParams();
    queryParams.append('boardId', boardId);
    queryParams.append('cardId', cardId);
    
    return apiClient.patch(`/tasks/reorder?${queryParams.toString()}`, { taskOrders });
  }

  // Assign member to task
  static async assignMember(boardId: string, cardId: string, taskId: string, memberId: string): Promise<void> {
    const queryParams = new URLSearchParams();
    queryParams.append('boardId', boardId);
    queryParams.append('cardId', cardId);
    queryParams.append('memberId', memberId);
    
    return apiClient.post(`/tasks/${taskId}/assign?${queryParams.toString()}`);
  }

  // Remove member assignment from task
  static async removeMemberAssignment(boardId: string, cardId: string, taskId: string, memberId: string): Promise<void> {
    const queryParams = new URLSearchParams();
    queryParams.append('boardId', boardId);
    queryParams.append('cardId', cardId);
    queryParams.append('memberId', memberId);
    
    return apiClient.delete(`/tasks/${taskId}/assign?${queryParams.toString()}`);
  }

  // Move task to different card
  static async moveTaskToCard(boardId: string, taskId: string, sourceCardId: string, destCardId: string, newOrder: number): Promise<Task> {
    const queryParams = new URLSearchParams();
    queryParams.append('boardId', boardId);
    queryParams.append('sourceCardId', sourceCardId);
    queryParams.append('destCardId', destCardId);
    queryParams.append('newOrder', newOrder.toString());
    
    return apiClient.patch<Task>(`/tasks/${taskId}/move-to-card?${queryParams.toString()}`);
  }
}
