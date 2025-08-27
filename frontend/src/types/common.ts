export interface BaseEntity {
  id: string;
  createdAt?: Date;
  updatedAt?: Date;
}
export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}
export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface SearchParams extends PaginationParams {
  search?: string;
}

export interface ApiErrorResponse {
  code: number;
  message: string;
  errors?: Record<string, string[]>;
}
