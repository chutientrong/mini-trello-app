import { useMutation, useQueryClient } from '@tanstack/react-query';
import { BoardsAPI } from '../services/boards';
import { boardKeys } from './useBoards';

// Accept invitation
export const useAcceptInvitation = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (invitationId: string) => BoardsAPI.acceptInvitation(invitationId),
    onSuccess: (data) => {
      // Invalidate boards list to show the new board
      queryClient.invalidateQueries({ queryKey: boardKeys.lists() });
      
      // Invalidate specific board if we have the boardId
      if (data.board?.id) {
        queryClient.invalidateQueries({ queryKey: boardKeys.detail(data.board.id) });
      }
    },
  });
};

// Decline invitation
export const useDeclineInvitation = () => {
  // const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (invitationId: string) => BoardsAPI.declineInvitation(invitationId),
    onSuccess: () => {
      // No need to invalidate boards since declining doesn't change board data
    },
  });
};
