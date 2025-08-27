import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { BoardsAPI } from '../services/boards';
import { boardKeys } from './useBoards';


export const useBoardMembers = (boardId: string) => {
    return useQuery({
      queryKey: ['board-members', boardId],
      queryFn: () => BoardsAPI.getBoardMembers(boardId),
      enabled: !!boardId,
    });
  };
  
  // Add member to board
  export const useAddBoardMember = () => {
    const queryClient = useQueryClient();
    
    return useMutation({
      mutationFn: ({ boardId, userId, role }: { boardId: string; userId: string; role: string }) =>
        BoardsAPI.addMember(boardId, userId, role),
      onSuccess: (_, { boardId }) => {
        // Invalidate board details
        queryClient.invalidateQueries({ queryKey: boardKeys.detail(boardId) });
      },
    });
  };
  
  // Remove member from board
  export const useRemoveBoardMember = () => {
    const queryClient = useQueryClient();
    
    return useMutation({
      mutationFn: ({ boardId, userId }: { boardId: string; userId: string }) =>
        BoardsAPI.removeMember(boardId, userId),
      onSuccess: (_, { boardId }) => {
        // Invalidate board details
        queryClient.invalidateQueries({ queryKey: boardKeys.detail(boardId) });
      },
    });
  };

  // Invite member to board
  export const useInviteMember = () => {
    const queryClient = useQueryClient();
    
    return useMutation({
      mutationFn: ({ boardId, email, role }: { boardId: string; email: string; role: string }) =>
        BoardsAPI.inviteMember(boardId, email, role),
      onSuccess: (_, { boardId }) => {
        // Invalidate board members and invitations
        queryClient.invalidateQueries({ queryKey: ['board-members', boardId] });
        queryClient.invalidateQueries({ queryKey: ['board-invitations', boardId] });
      },
    });
  };
  