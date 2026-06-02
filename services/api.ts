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

async function readPersistedAuth(): Promise<{ token?: string; refresh?: string } | null> {
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
    };
  } catch {
    return null;
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

export default API;
