import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { BoardsAPI } from '../services/boards';
import type {
  CreateBoardRequest,
  UpdateBoardRequest,
  BoardFilters,
} from '../types/boards';

// Query keys
export const boardKeys = {
  all: ['boards'] as const,
  lists: () => [...boardKeys.all, 'list'] as const,
  list: (filters: BoardFilters) => [...boardKeys.lists(), filters] as const,
  details: () => [...boardKeys.all, 'detail'] as const,
  detail: (id: string) => [...boardKeys.details(), id] as const,
  stats: (id: string) => [...boardKeys.detail(id), 'stats'] as const,
};

// Get all boards
export const useBoards = (filters?: BoardFilters) => {
  return useQuery({
    queryKey: boardKeys.list(filters || {}),
    queryFn: () => BoardsAPI.getBoards(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Get board by ID
export const useBoard = (id: string) => {
  return useQuery({
    queryKey: boardKeys.detail(id),
    queryFn: () => BoardsAPI.getBoard(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Create board
export const useCreateBoard = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: CreateBoardRequest) => BoardsAPI.createBoard(data),
    onSuccess: () => {
      // Invalidate boards list
      queryClient.invalidateQueries({ queryKey: boardKeys.lists() });
    },
  });
};

// Update board
export const useUpdateBoard = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateBoardRequest }) =>
      BoardsAPI.updateBoard(id, data),
    onSuccess: (_, { id }) => {
      // Invalidate specific board and list
      queryClient.invalidateQueries({ queryKey: boardKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: boardKeys.lists() });
    },
  });
};

// Delete board
export const useDeleteBoard = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => BoardsAPI.deleteBoard(id),
    onSuccess: () => {
      // Invalidate boards list
      queryClient.invalidateQueries({ queryKey: boardKeys.lists() });
    },
  });
};
