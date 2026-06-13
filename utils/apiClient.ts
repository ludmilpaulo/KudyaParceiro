import { getApiConnectionHint, resolveApiBaseUrl } from './resolveApiBaseUrl';

export { getApiConnectionHint, resolveApiBaseUrl };

export function getBaseApiUrl(): string {
  return resolveApiBaseUrl();
}

/** @deprecated use getBaseApiUrl() — kept for imports that expect a string constant */
export const baseAPI = getBaseApiUrl();

export async function apiFetch(
  path: string,
  init?: RequestInit & { timeoutMs?: number },
): Promise<Response> {
  const timeoutMs = init?.timeoutMs ?? 20000;
  const base = getBaseApiUrl();
  const url = path.startsWith('http') ? path : `${base}${path.startsWith('/') ? path : `/${path}`}`;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const { timeoutMs: _t, ...fetchInit } = init || {};
    return await fetch(url, { ...fetchInit, signal: controller.signal });
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error(`Request timed out at ${url}. ${getApiConnectionHint()}`);
    }
    throw new Error(`Cannot reach ${url}. ${getApiConnectionHint()}`);
  } finally {
    clearTimeout(timer);
  }
}

export async function readJsonResponse<T = Record<string, unknown>>(
  response: Response,
): Promise<T> {
  const text = await response.text();
  if (!text) {
    if (response.status === 404) {
      throw new Error(`API route not found (404). ${getApiConnectionHint()}`);
    }
    throw new Error(`Empty server response (${response.status}). ${getApiConnectionHint()}`);
  }

  try {
    return JSON.parse(text) as T;
  } catch {
    if (response.status === 404) {
      throw new Error(
        `Wrong API server (404) — use Kudya backend (www_kudya_shop) on port ${process.env.EXPO_PUBLIC_API_PORT || '8000'}, not another Django app on 8001. ${getApiConnectionHint()}`,
      );
    }
    throw new Error(`Invalid server response (${response.status}). ${getApiConnectionHint()}`);
  }
}

export async function parseApiResponse<T = Record<string, unknown>>(
  response: Response,
): Promise<T> {
  const data = await readJsonResponse<T>(response);
  if (!response.ok) {
    const body = data as Record<string, unknown>;
    throw new Error(
      String(body.detail || body.message || `Request failed (${response.status})`),
    );
  }
  return data;
}
