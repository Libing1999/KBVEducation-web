/** Mirrors the backend `PageResponse<T>`. */
export interface PageResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
  empty: boolean;
}

/** Common query params for paged/filterable list endpoints. */
export interface PageQuery {
  page?: number;
  size?: number;
  sort?: string;
  direction?: 'asc' | 'desc';
  search?: string;
}
