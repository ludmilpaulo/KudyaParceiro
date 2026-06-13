import { apiFetch, parseApiResponse } from '../utils/apiClient';
import { getDeviceLanguage } from './api';
import { normalizeAuthResponse, AuthSessionPayload } from './authTypes';

/** Password login — unified JWT API (`/api/auth/login/`). */
export const loginUserService = async (
  username: string,
  password: string,
): Promise<AuthSessionPayload> => {
  try {
    const response = await apiFetch('/api/auth/login/', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        'Accept-Language': getDeviceLanguage(),
      },
      body: JSON.stringify({ username, password }),
    });
    const data = await parseApiResponse<Record<string, unknown>>(response);
    return normalizeAuthResponse(data);
  } catch (error) {
    throw error instanceof Error
      ? error
      : new Error('Sem ligação ao servidor. Verifique a internet e tente novamente.');
  }
};

export const refreshAccessToken = async (refresh: string): Promise<{ access: string; token: string }> => {
  const response = await apiFetch('/api/auth/refresh/', {
    method: 'POST',
    headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
    body: JSON.stringify({ refresh }),
  });
  const data = await parseApiResponse<Record<string, unknown>>(response);
  const access = String(data.access || data.token || '');
  return { access, token: access };
};
