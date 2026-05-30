import { SignupData } from '../screens/SignupScreen';
import { baseAPI } from './types';
import { normalizeAuthResponse, AuthSessionPayload } from './authTypes';

export const signup = async (role: string, data: SignupData) => {
  let endpoint = '';

  switch (role) {
    case 'restaurant':
      endpoint = `${baseAPI}/restaurant/fornecedor/`;
      break;
    case 'entregador':
      endpoint = `${baseAPI}/driver/signup/driver/`;
      break;
    case 'parceiro':
      endpoint = `${baseAPI}/customer/signup/`;
      break;
    default:
      throw new Error('Role inválido');
  }

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  const responseData = await response.json();

  return {
    status: response.status,
    data: responseData,
  };
};

/** Password login — unified JWT API (`/api/auth/login/`). */
export const loginUserService = async (
  username: string,
  password: string,
): Promise<AuthSessionPayload> => {
  const response = await fetch(`${baseAPI}/api/auth/login/`, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ username, password }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.detail || data.message || 'Falha ao entrar. Por favor, tente novamente.',
    );
  }

  return normalizeAuthResponse(data);
};

export const refreshAccessToken = async (refresh: string): Promise<{ access: string; token: string }> => {
  const response = await fetch(`${baseAPI}/api/auth/refresh/`, {
    method: 'POST',
    headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
    body: JSON.stringify({ refresh }),
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.detail || 'Sessão expirada. Faça login novamente.');
  }
  const access = String(data.access || data.token || '');
  return { access, token: access };
};
