import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

const TOKEN_KEY = '@dms_token';
const API_URL_KEY = '@dms_api_base_url';

// Default development API host (Laravel port is 8001 as specified in README.md)
const getDefaultBaseUrl = (): string => {
  if (Platform.OS === 'android') {
    // Android emulator alias for host machine
    return 'http://10.0.2.2:8001/api/v1';
  }
  // iOS simulator, Web, or default localhost
  return 'http://127.0.0.1:8001/api/v1';
};

let cachedBaseUrl: string | null = null;
let cachedToken: string | null = null;
let onUnauthorizedCallback: (() => void) | null = null;

export class ApiError extends Error {
  status: number;
  errors: Record<string, string[]>;

  constructor(message: string, status: number, errors: Record<string, string[]> = {}) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.errors = errors;
  }

  firstError(field?: string): string {
    if (field && this.errors[field]?.[0]) {
      return this.errors[field][0];
    }
    const firstKey = Object.keys(this.errors)[0];
    if (firstKey && this.errors[firstKey]?.[0]) {
      return this.errors[firstKey][0];
    }
    return this.message;
  }
}

export const apiClient = {
  async getBaseUrl(): Promise<string> {
    if (cachedBaseUrl) return cachedBaseUrl;
    const stored = await AsyncStorage.getItem(API_URL_KEY);
    cachedBaseUrl = stored || getDefaultBaseUrl();
    return cachedBaseUrl;
  },

  async setBaseUrl(url: string): Promise<void> {
    const cleanUrl = url.trim().replace(/\/+$/, '');
    cachedBaseUrl = cleanUrl;
    await AsyncStorage.setItem(API_URL_KEY, cleanUrl);
  },

  async getToken(): Promise<string | null> {
    if (cachedToken) return cachedToken;
    cachedToken = await AsyncStorage.getItem(TOKEN_KEY);
    return cachedToken;
  },

  async setToken(token: string): Promise<void> {
    cachedToken = token;
    await AsyncStorage.setItem(TOKEN_KEY, token);
  },

  async clearToken(): Promise<void> {
    cachedToken = null;
    await AsyncStorage.removeItem(TOKEN_KEY);
  },

  setOnUnauthorized(cb: () => void) {
    onUnauthorizedCallback = cb;
  },

  async request<T = any>(
    method: 'GET' | 'POST' | 'PUT' | 'DELETE',
    endpoint: string,
    body?: unknown,
  ): Promise<T> {
    const baseUrl = await this.getBaseUrl();
    const token = await this.getToken();

    const headers: Record<string, string> = {
      Accept: 'application/json',
    };

    if (body !== undefined) {
      headers['Content-Type'] = 'application/json';
    }

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const url = `${baseUrl}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

    let res: Response;
    try {
      res = await fetch(url, {
        method,
        headers,
        body: body !== undefined ? JSON.stringify(body) : undefined,
      });
    } catch (err: any) {
      throw new ApiError(
        'Haiwezi kufikia seva ya mfumo. Hakikisha simu imeunganishwa na mtandao.',
        0,
      );
    }

    let json: any = null;
    const text = await res.text();
    if (text) {
      try {
        json = JSON.parse(text);
      } catch {
        json = null;
      }
    }

    if (!res.ok) {
      if (res.status === 401 && token && onUnauthorizedCallback) {
        onUnauthorizedCallback();
      }
      throw new ApiError(
        json?.message || 'Hitilafu imetokea wakati wa kuwasiliana na seva.',
        res.status,
        json?.errors || {},
      );
    }

    return json as T;
  },

  get<T = any>(endpoint: string): Promise<T> {
    return this.request<T>('GET', endpoint);
  },

  post<T = any>(endpoint: string, body?: unknown): Promise<T> {
    return this.request<T>('POST', endpoint, body ?? {});
  },

  put<T = any>(endpoint: string, body?: unknown): Promise<T> {
    return this.request<T>('PUT', endpoint, body ?? {});
  },

  delete<T = any>(endpoint: string): Promise<T> {
    return this.request<T>('DELETE', endpoint);
  },
};
