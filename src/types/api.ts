/**
 * API response type definitions
 */

export interface ResponseMeta {
  requestId: string;
  timestamp: string;
  version: string;
}

export interface ApiResponse<T> {
  data: T;
  meta: ResponseMeta;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: ResponseMeta;
  pagination: PaginationMeta;
}
