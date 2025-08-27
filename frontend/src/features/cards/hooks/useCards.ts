import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { CardsAPI } from "../services/cards";
import type {
  CreateCardRequest,
  UpdateCardRequest,
  CardFilters,
  ReorderCardsRequest,
} from "../types/cards";

// Query keys
export const cardKeys = {
  all: ["cards"] as const,
  lists: () => [...cardKeys.all, "list"] as const,
  list: (boardId: string, filters?: CardFilters) =>
    [...cardKeys.lists(), boardId, filters] as const,
  details: () => [...cardKeys.all, "detail"] as const,
  detail: (cardId: string) => [...cardKeys.details(), cardId] as const,
  stats: (boardId: string) => [...cardKeys.all, "stats", boardId] as const,
};

// Get cards for a board
export const useCards = (boardId: string, filters?: CardFilters) => {
  return useQuery({
    queryKey: cardKeys.list(boardId, filters),
    queryFn: () => CardsAPI.getCards(boardId, filters),
    enabled: !!boardId,
  });
};

// Get a single card
export const useCard = (cardId: string) => {
  return useQuery({
    queryKey: cardKeys.detail(cardId),
    queryFn: () => CardsAPI.getCard(cardId),
    enabled: !!cardId,
  });
};

// Create card mutation
export const useCreateCard = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      boardId,
      cardData,
    }: {
      boardId: string;
      cardData: CreateCardRequest;
    }) => CardsAPI.createCard(boardId, cardData),
    onSuccess: (data, { boardId }) => {
      // Invalidate and refetch cards for this board
      queryClient.invalidateQueries({ queryKey: cardKeys.list(boardId) });
      queryClient.invalidateQueries({ queryKey: cardKeys.stats(boardId) });
    },
  });
};

// Update card mutation
export const useUpdateCard = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      cardId,
      updateData,
    }: {
      cardId: string;
      updateData: UpdateCardRequest;
    }) => CardsAPI.updateCard(cardId, updateData),
    onSuccess: (data, { cardId }) => {
      // Update the card in cache
      queryClient.setQueryData(cardKeys.detail(cardId), data);

      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: cardKeys.lists() });
      queryClient.invalidateQueries({ queryKey: cardKeys.all });
    },
  });
};

// Delete card mutation
export const useDeleteCard = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (cardId: string) => CardsAPI.deleteCard(cardId),
    onSuccess: (_data, cardId) => {
      // Remove the card from cache
      queryClient.removeQueries({ queryKey: cardKeys.detail(cardId) });

      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: cardKeys.lists() });
      queryClient.invalidateQueries({ queryKey: cardKeys.all });
    },
  });
};

// Reorder cards mutation
export const useReorderCards = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      boardId,
      cardOrders,
    }: {
      boardId: string;
      cardOrders: ReorderCardsRequest;
    }) => CardsAPI.reorderCards(boardId, cardOrders),
    onSuccess: (_data, { boardId }) => {
      // Invalidate cards for this board
      queryClient.invalidateQueries({ queryKey: cardKeys.list(boardId) });
    },
  });
};
