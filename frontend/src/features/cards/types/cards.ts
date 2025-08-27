import type { BaseEntity } from "@/types";
import type { Task } from "@/features/tasks/types/tasks";

export interface Card extends BaseEntity {
  title: string;
  description: string;
  boardId: string;
  order: number;
  taskCount: number;
  createdBy: string;
  attachments: CardAttachment[];
  tasks?: Task[]; // Optional for frontend use
}

export interface CardAttachment {
  id: string;
  name: string;
  url: string;
  type: string;
  size: number;
  uploadedAt: string;
}

export interface CreateCardRequest {
  title: string;
  description?: string;
}

export interface UpdateCardRequest {
  title?: string;
  description?: string;
}

export interface CardFilters {
  search?: string;
}

export interface CardOrder {
  cardId: string;
  order: number;
}

export interface ReorderCardsRequest {
  cardOrders: CardOrder[];
}

export interface CardsResponse {
  data: Card[];
  pagination: {
    total: number;
    page: number;
    limit: number;
  };
}

export interface CardResponse {
  card: Card;
}
