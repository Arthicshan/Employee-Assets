export interface ProblemDetails {
  type: string;
  title: string;
  status: number;
  detail: string;
  timestamp?: string;
  path?: string;
  validationErrors?: string[];
}

export interface PaginatedMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginatedMeta;
}

