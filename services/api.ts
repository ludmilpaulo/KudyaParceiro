import axios from 'axios';
import { getLanguage, detectDeviceLanguage } from '../configs/i18n';
import { baseAPI } from './types';

export function getDeviceLanguage(): string {
  return getLanguage() || detectDeviceLanguage();
}

const API = axios.create({
  baseURL: baseAPI,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

async function readPersistedAuth(): Promise<{ token?: string; refresh?: string; user?: Record<string, unknown> } | null> {
  try {
    const AsyncStorage = (await import('@react-native-async-storage/async-storage')).default;
    const raw = await AsyncStorage.getItem('persist:root');
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    const auth = parsed.auth ? JSON.parse(parsed.auth) : null;
    const user = auth?.user;
    return {
      token: user?.token || user?.access_token || user?.access,
      refresh: user?.refresh,
      user,
    };
  } catch {
    return null;
  }
}

async function writePersistedAuthToken(access: string, refresh?: string) {
  try {
    const AsyncStorage = (await import('@react-native-async-storage/async-storage')).default;
    const raw = await AsyncStorage.getItem('persist:root');
    if (!raw) return;
    const parsed = JSON.parse(raw);
    const auth = parsed.auth ? JSON.parse(parsed.auth) : {};
    if (auth.user) {
      auth.user.token = access;
      auth.user.access = access;
      auth.user.access_token = access;
      if (refresh) auth.user.refresh = refresh;
    }
    parsed.auth = JSON.stringify(auth);
    await AsyncStorage.setItem('persist:root', JSON.stringify(parsed));
  } catch {
    // ignore
  }
}

API.interceptors.request.use(async (config) => {
  config.headers['Accept-Language'] = getDeviceLanguage();
  const auth = await readPersistedAuth();
  if (auth?.token) {
    config.headers.Authorization = `Bearer ${auth.token}`;
  }
  return config;
});

API.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;
    if (!original || original._retry || error.response?.status !== 401) {
      return Promise.reject(error);
    }
    const auth = await readPersistedAuth();
    if (!auth?.refresh) {
      return Promise.reject(error);
    }
    try {
      const { refreshAccessToken } = await import('./authService');
      const refreshed = await refreshAccessToken(auth.refresh);
      await writePersistedAuthToken(refreshed.access, auth.refresh);
      original._retry = true;
      original.headers = original.headers || {};
      original.headers.Authorization = `Bearer ${refreshed.access}`;
      return API(original);
    } catch {
      return Promise.reject(error);
    }
  },
);

export default API;
