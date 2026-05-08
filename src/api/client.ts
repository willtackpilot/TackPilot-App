import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '../constants/theme';

const REFRESH_PATH = '/v1/auth/refresh';
const AUTH_EXEMPT_PATHS = new Set([
  '/v1/auth/login',
  '/v1/auth/register',
  '/v1/auth/refresh',
]);

const STORAGE_KEYS = {
  jwt: 'jwt',
  refresh: 'refreshToken',
} as const;

let inflightRefresh: Promise<string | null> | null = null;
let onAuthFailure: (() => void) | null = null;

export function setAuthFailureHandler(handler: (() => void) | null): void {
  onAuthFailure = handler;
}

async function performRefresh(): Promise<string | null> {
  if (inflightRefresh) return inflightRefresh;

  inflightRefresh = (async () => {
    try {
      const refresh = await AsyncStorage.getItem(STORAGE_KEYS.refresh);
      if (!refresh) return null;

      const res = await fetch(`${API_BASE_URL}${REFRESH_PATH}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: refresh }),
      });
      if (!res.ok) return null;

      const data = await res.json().catch(() => null as unknown);
      const newAccess =
        (data as any)?.access_token ??
        (data as any)?.accessToken ??
        (data as any)?.token ??
        null;
      const newRefresh =
        (data as any)?.refresh_token ?? (data as any)?.refreshToken ?? null;

      if (newAccess) await AsyncStorage.setItem(STORAGE_KEYS.jwt, newAccess);
      if (newRefresh) await AsyncStorage.setItem(STORAGE_KEYS.refresh, newRefresh);
      return newAccess;
    } catch {
      return null;
    } finally {
      inflightRefresh = null;
    }
  })();

  return inflightRefresh;
}

async function clearAuthAndSignal(): Promise<void> {
  await AsyncStorage.multiRemove([STORAGE_KEYS.jwt, STORAGE_KEYS.refresh]);
  if (onAuthFailure) onAuthFailure();
}

function buildHeaders(
  options: RequestInit,
  token: string | null,
): Record<string, string> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...((options.headers as Record<string, string> | undefined) ?? {}),
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  return headers;
}

export async function apiRequest(
  path: string,
  options: RequestInit = {},
): Promise<Response> {
  const token = await AsyncStorage.getItem(STORAGE_KEYS.jwt);
  const headers = buildHeaders(options, token);

  let res = await fetch(`${API_BASE_URL}${path}`, { ...options, headers });

  if (res.status !== 401 || AUTH_EXEMPT_PATHS.has(path)) {
    return res;
  }

  const newToken = await performRefresh();
  if (!newToken) {
    await clearAuthAndSignal();
    return res;
  }

  const retryHeaders = buildHeaders(options, newToken);
  res = await fetch(`${API_BASE_URL}${path}`, { ...options, headers: retryHeaders });

  if (res.status === 401) {
    await clearAuthAndSignal();
  }
  return res;
}

class ApiError extends Error {
  status: number;
  body: unknown;
  constructor(status: number, message: string, body: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.body = body;
  }
}

async function asJson<T>(res: Response): Promise<T> {
  if (res.status === 204) return undefined as unknown as T;
  const text = await res.text();
  const body = text ? safeParse(text) : null;
  if (!res.ok) {
    const message =
      (body as any)?.detail ??
      (body as any)?.message ??
      (body as any)?.error ??
      `HTTP ${res.status}`;
    throw new ApiError(res.status, String(message), body);
  }
  return body as T;
}

function safeParse(text: string): unknown {
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

export async function apiGet<T>(path: string): Promise<T> {
  return asJson<T>(await apiRequest(path, { method: 'GET' }));
}

export async function apiPost<T>(path: string, body?: unknown): Promise<T> {
  return asJson<T>(
    await apiRequest(path, {
      method: 'POST',
      body: body === undefined ? undefined : JSON.stringify(body),
    }),
  );
}

export async function apiPatch<T>(path: string, body?: unknown): Promise<T> {
  return asJson<T>(
    await apiRequest(path, {
      method: 'PATCH',
      body: body === undefined ? undefined : JSON.stringify(body),
    }),
  );
}

export async function apiDelete<T>(path: string): Promise<T> {
  return asJson<T>(await apiRequest(path, { method: 'DELETE' }));
}

export { ApiError };
