import { apiClient } from "@/services/apiClient";
import type {
  CardFilters,
  CardResponse,
  CardsResponse,
  CreateCardRequest,
  ReorderCardsRequest,
  UpdateCardRequest
} from "../types/cards";

export class CardsAPI {
  // Get all cards for a board
  static async getCards(
    boardId: string,
    filters?: CardFilters
  ): Promise<CardsResponse> {
    const params = new URLSearchParams();
    params.append("boardId", boardId);

    if (filters?.search) params.append("search", filters.search);

    const queryString = params.toString();
    const url = `/cards?${queryString}`;

    return apiClient.get(url);
  }

  // Get a single card
  static async getCard(cardId: string): Promise<CardResponse> {
    return apiClient.get(`/cards/${cardId}`);
  }

  // Create a new card
  static async createCard(
    boardId: string,
    cardData: CreateCardRequest
  ): Promise<CardResponse> {
    const params = new URLSearchParams();
    params.append("boardId", boardId);
    const queryString = params.toString();
    return apiClient.post(`/cards?${queryString}`, cardData);
  }

  // Update a card
  static async updateCard(
    cardId: string,
    updateData: UpdateCardRequest
  ): Promise<CardResponse> {
    return apiClient.patch(`/cards/${cardId}`, updateData);
  }

  // Delete a card
  static async deleteCard(cardId: string): Promise<{ message: string }> {
    return apiClient.delete(`/cards/${cardId}`);
  }

  // Reorder cards
  static async reorderCards(
    boardId: string,
    cardOrders: ReorderCardsRequest
  ): Promise<{ message: string }> {
    const params = new URLSearchParams();
    params.append("boardId", boardId);
    const queryString = params.toString();
    return apiClient.patch(`/cards/reorder?${queryString}`, cardOrders);
  }
}
