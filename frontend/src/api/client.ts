const API_BASE = '/girls/api';

function getAuthHeader(): Record<string, string> {
  const token = localStorage.getItem('access_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function readError(response: Response, fallback: string): Promise<Error> {
  const text = await response.text().catch(() => '');

  if (!text) {
    return new Error(fallback);
  }

  try {
    const data = JSON.parse(text) as { detail?: unknown };
    const detail = Array.isArray(data.detail)
      ? String((data.detail[0] as { msg?: string } | undefined)?.msg ?? fallback)
      : typeof data.detail === 'string'
        ? data.detail
        : fallback;
    return new Error(detail || fallback);
  } catch {
    return new Error(text || fallback);
  }
}

async function parseJson<T>(response: Response): Promise<T> {
  return (await response.json()) as T;
}

export async function apiRequest<T>(path: string, init: RequestInit = {}, fallback = 'Request failed'): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, init);
  if (!response.ok) {
    throw await readError(response, fallback);
  }
  return parseJson<T>(response);
}

export async function apiRequestVoid(path: string, init: RequestInit = {}, fallback = 'Request failed'): Promise<void> {
  const response = await fetch(`${API_BASE}${path}`, init);
  if (!response.ok) {
    throw await readError(response, fallback);
  }
}

export function jsonRequest(method: string, body?: unknown, withAuth = false): RequestInit {
  return {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(withAuth ? getAuthHeader() : {}),
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  };
}

export function authRequest(method: string): RequestInit {
  return {
    method,
    headers: getAuthHeader(),
  };
}
