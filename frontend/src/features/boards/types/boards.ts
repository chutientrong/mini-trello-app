import type {BaseEntity, SearchParams } from '@/types';

export interface Board extends BaseEntity {
  name: string;
  description?: string;
  cardCount: number;
  memberCount: number;
  isPublic: boolean;
  ownerId: string;
  members: BoardMember[];
  createdAt: Date;
  updatedAt: Date;
  userRole?: 'owner' | 'member';
  isOwner?: boolean;
  isMember?: boolean;
}

export interface BoardMember extends BaseEntity {
  userId: string;
  fullName: string;
  email: string;
  boardId: string;
  role: 'owner' | 'admin' | 'member' | 'viewer';
  joinedAt: Date;
}

export interface CreateBoardRequest {
  name: string;
  description?: string;
  isPublic?: boolean;
}

export interface UpdateBoardRequest {
  name?: string;
  description?: string;
  isPublic?: boolean;
}

export interface BoardFilters extends SearchParams {
  isPublic?: boolean;
  ownerId?: string;
  role?: 'owner' | 'member';
}

export interface BoardInvitation {
  id: string;
  boardId: string;
  inviterId: string;
  inviteeEmail: string;
  role: 'member' | 'admin' | 'viewer';
  status: 'pending' | 'accepted' | 'declined' | 'expired';
  token: string;
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface InviteMemberResponse {
  message: string;
  invitation: BoardInvitation;
}
