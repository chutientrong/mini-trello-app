import { apiClient } from './apiClient';
import type { SearchParams } from '../types/common';

export abstract class CRUDService {
  protected abstract endpoint: string;

  // Generic CRUD operations
  protected async getList<T>(params?: SearchParams): Promise<T> {
    const queryParams = new URLSearchParams();
    
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.search) queryParams.append('search', params.search);
    if (params?.sortBy) queryParams.append('sortBy', params.sortBy);
    if (params?.sortOrder) queryParams.append('sortOrder', params.sortOrder);
    
    const url = `${this.endpoint}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return apiClient.get<T>(url);
  }

  protected async getById<T>(id: string): Promise<T> {
    return apiClient.get<T>(`${this.endpoint}/${id}`);
  }

  protected async create<T, D = Record<string, unknown>>(data: D): Promise<T> {
    return apiClient.post<T>(this.endpoint, data);
  }

  protected async update<T, D = Record<string, unknown>>(id: string, data: D): Promise<T> {
    return apiClient.put<T>(`${this.endpoint}/${id}`, data);
  }

  protected async delete(id: string): Promise<void> {
    return apiClient.delete(`${this.endpoint}/${id}`);
  }

  protected async patch<T, D = Record<string, unknown>>(id: string, data: D): Promise<T> {
    return apiClient.patch<T>(`${this.endpoint}/${id}`, data);
  }

  protected async postAction<T, D = Record<string, unknown>>(id: string, action: string, data?: D): Promise<T> {
    return apiClient.post<T>(`${this.endpoint}/${id}/${action}`, data);
  }
}
