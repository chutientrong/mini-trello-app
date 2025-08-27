import { useQuery, useMutation } from "@tanstack/react-query";
import { TasksAPI } from "../services";
import type {
  TaskFilters,
  CreateTaskRequest,
  UpdateTaskRequest,
} from "../types";

// Query keys
export const taskKeys = {
  all: (boardId: string, cardId: string) => ["tasks", boardId, cardId] as const,
  lists: () => ["tasks", "list"] as const,
  list: (boardId: string, cardId: string, filters?: TaskFilters) =>
    ["tasks", "list", boardId, cardId, filters] as const,
  details: () => ["tasks", "detail"] as const,
  detail: (boardId: string, cardId: string, taskId: string) =>
    ["tasks", "detail", boardId, cardId, taskId] as const,
};

// Tasks hooks
export const useTasks = (
  boardId: string,
  cardId: string,
  params?: TaskFilters
) => {
  return useQuery({
    queryKey: taskKeys.all(boardId, cardId),
    queryFn: () => TasksAPI.getTasks(boardId, cardId, params),
    enabled: !!boardId && !!cardId,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

export const useTask = (boardId: string, cardId: string, taskId: string) => {
  return useQuery({
    queryKey: taskKeys.detail(boardId, cardId, taskId),
    queryFn: () => TasksAPI.getTask(boardId, cardId, taskId),
    enabled: !!boardId && !!cardId && !!taskId,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

export const useCreateTask = () => {
  return useMutation({
    mutationFn: ({
      boardId,
      cardId,
      data,
    }: {
      boardId: string;
      cardId: string;
      data: CreateTaskRequest;
    }) => TasksAPI.createTask(boardId, cardId, data),
  });
};

export const useUpdateTask = () => {
  return useMutation({
    mutationFn: ({
      boardId,
      cardId,
      taskId,
      data,
    }: {
      boardId: string;
      cardId: string;
      taskId: string;
      data: UpdateTaskRequest;
    }) => TasksAPI.updateTask(boardId, cardId, taskId, data),
  });
};

export const useDeleteTask = () => {
  return useMutation({
    mutationFn: ({
      boardId,
      cardId,
      taskId,
    }: {
      boardId: string;
      cardId: string;
      taskId: string;
    }) => TasksAPI.deleteTask(boardId, cardId, taskId),
  });
};

export const useReorderTasks = () => {
  return useMutation({
    mutationFn: ({
      boardId,
      cardId,
      taskOrders,
    }: {
      boardId: string;
      cardId: string;
      taskOrders: Array<{ taskId: string; order: number }>;
    }) => TasksAPI.reorderTasks(boardId, cardId, taskOrders),
  });
};

export const useMoveTaskToCard = () => {
  return useMutation({
    mutationFn: ({
      boardId,
      taskId,
      sourceCardId,
      destCardId,
      newOrder,
    }: {
      boardId: string;
      taskId: string;
      sourceCardId: string;
      destCardId: string;
      newOrder: number;
    }) =>
      TasksAPI.moveTaskToCard(
        boardId,
        taskId,
        sourceCardId,
        destCardId,
        newOrder
      ),
  });
};

export const useAssignMember = () => {
  return useMutation({
    mutationFn: ({
      boardId,
      cardId,
      taskId,
      memberId,
    }: {
      boardId: string;
      cardId: string;
      taskId: string;
      memberId: string;
    }) => TasksAPI.assignMember(boardId, cardId, taskId, memberId),
  });
};

export const useRemoveMemberAssignment = () => {
  return useMutation({
    mutationFn: ({
      boardId,
      cardId,
      taskId,
      memberId,
    }: {
      boardId: string;
      cardId: string;
      taskId: string;
      memberId: string;
    }) => TasksAPI.removeMemberAssignment(boardId, cardId, taskId, memberId),
  });
};
