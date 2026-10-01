import { ApiError } from './api-error';
import { ProblemDetails } from '@/types';
import { sessionManager } from './session-storage';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

interface RequestOptions extends RequestInit {
  params?: Record<string, string | number | boolean | undefined | null>;
}

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl.replace(/\/+$/, '');
  }

  private buildUrl(path: string, params?: Record<string, string | number | boolean | undefined | null>): string {
    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    const url = new URL(`${this.baseUrl}${cleanPath}`);

    if (params) {
      Object.entries(params).forEach(([key, val]) => {
        if (val !== undefined && val !== null && val !== '') {
          url.searchParams.append(key, String(val));
        }
      });
    }

    return url.toString();
  }

  private async request<T>(path: string, options: RequestOptions = {}): Promise<T> {
    const { params, headers = {}, ...restOptions } = options;
    const url = this.buildUrl(path, params);

    const token = sessionManager.getToken();
    const requestHeaders: Record<string, string> = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(headers as Record<string, string>),
    };

    let response: Response;
    try {
      response = await fetch(url, {
        ...restOptions,
        headers: requestHeaders,
      });
    } catch (err: any) {
      throw new ApiError(0, `Network error: unable to connect to ${this.baseUrl}. ${err?.message || ''}`);
    }

    // Handle 204 No Content
    if (response.status === 204) {
      return {} as T;
    }

    const contentType = response.headers.get('content-type') || '';
    const isJson = contentType.includes('application/json');

    let body: any = null;
    if (isJson) {
      try {
        body = await response.json();
      } catch {
        body = null;
      }
    } else {
      body = await response.text();
    }

    if (!response.ok) {
      // Check if response is Problem Details (RFC 7807)
      if (body && typeof body === 'object') {
        const problem = body as ProblemDetails;
        const message = problem.detail || problem.title || `HTTP error ${response.status}`;
        throw new ApiError(response.status, message, problem);
      }
      throw new ApiError(response.status, body || `HTTP ${response.status} Error`);
    }

    return body as T;
  }

  public get<T>(path: string, params?: Record<string, any>, options?: RequestOptions): Promise<T> {
    return this.request<T>(path, { method: 'GET', params, ...options });
  }

  public post<T>(path: string, data?: any, options?: RequestOptions): Promise<T> {
    return this.request<T>(path, {
      method: 'POST',
      body: data !== undefined ? JSON.stringify(data) : undefined,
      ...options,
    });
  }

  public put<T>(path: string, data?: any, options?: RequestOptions): Promise<T> {
    return this.request<T>(path, {
      method: 'PUT',
      body: data !== undefined ? JSON.stringify(data) : undefined,
      ...options,
    });
  }

  public patch<T>(path: string, data?: any, options?: RequestOptions): Promise<T> {
    return this.request<T>(path, {
      method: 'PATCH',
      body: data !== undefined ? JSON.stringify(data) : undefined,
      ...options,
    });
  }

  public delete<T>(path: string, options?: RequestOptions): Promise<T> {
    return this.request<T>(path, { method: 'DELETE', ...options });
  }
}

export const apiClient = new ApiClient(API_BASE_URL);

