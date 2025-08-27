import { apiClient } from '@/services';
import type {
  Board,
  BoardMember,
  CreateBoardRequest,
  UpdateBoardRequest,
  BoardFilters,
  InviteMemberResponse,
} from '../types/boards';
import type { PaginatedResponse } from '@/types';

export class BoardsAPI {
  // Get all boards
  static async getBoards(filters?: BoardFilters): Promise<PaginatedResponse<Board>> {
    const params = new URLSearchParams();
    if (filters?.search) params.append('search', filters.search);
    if (filters?.isPublic !== undefined) params.append('isPublic', filters.isPublic.toString());
    if (filters?.ownerId) params.append('ownerId', filters.ownerId);
    if (filters?.role) params.append('role', filters.role);
    if (filters?.page) params.append('page', filters.page.toString());
    if (filters?.limit) params.append('limit', filters.limit.toString());
    
    return apiClient.get(`/boards?${params.toString()}`);
  }

  // Get board by ID
  static async getBoard(id: string): Promise<{ board: Board }> {
    return apiClient.get(`/boards/${id}`);
  }

  // Create new board
  static async createBoard(data: CreateBoardRequest): Promise<{ board: Board }> {
    return apiClient.post('/boards', data);
  }

  // Update board
  static async updateBoard(id: string, data: UpdateBoardRequest): Promise<{ board: Board }> {
    return apiClient.patch(`/boards/${id}`, data);
  }

  // Delete board
  static async deleteBoard(id: string): Promise<{ message: string }> {
    return apiClient.delete(`/boards/${id}`);
  }

  // Add member to board
  static async addMember(boardId: string, userId: string, role: string): Promise<{ message: string }> {
    return apiClient.post(`/boards/${boardId}/members`, { userId, role });
  }

  // Remove member from board
  static async removeMember(boardId: string, userId: string): Promise<{ message: string }> {
    return apiClient.delete(`/boards/${boardId}/members/${userId}`);
  }

  // Get board members
  static async getBoardMembers(boardId: string): Promise<{ members: BoardMember[]; total: number }> {
    return apiClient.get(`/boards/${boardId}/members`);
  }

  // Invite member to board
  static async inviteMember(boardId: string, email: string, role: string): Promise<InviteMemberResponse> {
    return apiClient.post(`/boards/${boardId}/invite`, { email, role });
  }

  // Accept invitation
  static async acceptInvitation(invitationId: string): Promise<{ message: string; board?: Board }> {
    return apiClient.post(`/boards/invitations/${invitationId}/accept`);
  }

  // Decline invitation
  static async declineInvitation(invitationId: string): Promise<{ message: string }> {
    return apiClient.post(`/boards/invitations/${invitationId}/decline`);
  }
}
