import type { BaseEntity, SearchParams, PaginatedResponse } from '@/types';

// Task Types
export interface Task extends BaseEntity {
  title: string;
  description?: string;
  cardId: string;
  boardId: string;
  ownerId: string;
  order: number;
  assignedMembers: string[];
  priority: 'low' | 'medium' | 'high';
  dueDate?: string;
  dueComplete?: boolean;
  githubAttachments: unknown[];
}

export interface CreateTaskRequest {
  title: string;
  description?: string;
  priority?: 'low' | 'medium' | 'high';
  dueDate?: string;
  dueComplete?: boolean;
}

export interface UpdateTaskRequest {
  title?: string;
  description?: string;
  priority?: 'low' | 'medium' | 'high';
  dueDate?: string;
  dueComplete?: boolean;
}

export interface TaskResponse {
  task: Task; 
}

export interface TaskListResponse extends PaginatedResponse<Task> {
  tasks: Task[]; // Override for backward compatibility
}

export interface TaskFilters extends SearchParams {
  cardId?: string;
  priority?: 'low' | 'medium' | 'high';
  assignedTo?: string;
  dueDate?: string;
  dueComplete?: boolean;
}