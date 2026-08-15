import { apiFetch, parseApiResponse } from '../utils/apiClient';
import AsyncStorage from '@react-native-async-storage/async-storage';

type Raw = Record<string, unknown>;

function unwrap<T>(data: unknown): T[] {
  if (Array.isArray(data)) return data as T[];
  if (data && typeof data === 'object' && 'results' in data) {
    const results = (data as { results?: T[] }).results;
    return Array.isArray(results) ? results : [];
  }
  return [];
}

export async function getPartnerAuthHeaders(): Promise<HeadersInit> {
  let token: string | undefined;
  try {
    const { store } = require('../redux/store') as {
      store: { getState: () => { auth?: { user?: Record<string, string> } } };
    };
    const live = store.getState().auth?.user;
    token = live?.token || live?.access || live?.access_token;
  } catch {
    token = undefined;
  }
  if (!token) {
    try {
      const raw = await AsyncStorage.getItem('persist:root');
      if (raw) {
        const parsed = JSON.parse(raw) as { auth?: string };
        const user = parsed.auth
          ? (JSON.parse(parsed.auth) as { user?: Record<string, string> }).user
          : undefined;
        token = user?.token || user?.access || user?.access_token;
      }
    } catch {
      token = undefined;
    }
  }
  return {
    Accept: 'application/json',
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

async function authJson(path: string, init?: RequestInit): Promise<unknown> {
  const headers = await getPartnerAuthHeaders();
  const response = await apiFetch(path, {
    ...init,
    headers: { ...headers, ...(init?.headers || {}) },
  });
  return parseApiResponse(response);
}

export type PartnerService = {
  id: number;
  title: string;
  price: number;
  currency: string;
  duration_minutes: number;
};

export async function fetchMyPartnerServices(): Promise<PartnerService[]> {
  return unwrap<PartnerService>(await authJson('/api/services/services/mine/'));
}

export async function fetchServiceCategories(): Promise<Array<{ id: number; name: string }>> {
  return unwrap<{ id: number; name: string }>(await authJson('/api/services/categories/'));
}

export async function createPartnerService(payload: Raw): Promise<PartnerService> {
  return (await authJson('/api/services/services/', {
    method: 'POST',
    body: JSON.stringify(payload),
  })) as PartnerService;
}

export type PartnerBooking = {
  id: number;
  service_title?: string;
  status?: string;
  booking_date?: string;
};

export async function fetchPartnerBookings(): Promise<PartnerBooking[]> {
  return unwrap<PartnerBooking>(await authJson('/api/services/bookings/'));
}
