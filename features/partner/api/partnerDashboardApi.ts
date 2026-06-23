import { getBaseApiUrl } from '../../../utils/apiClient';
import { getDeviceLanguage } from '../../../services/api';

const API_V1_PREFIX = '/api/v1';

type MultipartConfig = {
  headers?: Record<string, string>;
};

async function readAuthToken(): Promise<string | undefined> {
  try {
    const AsyncStorage = (await import('@react-native-async-storage/async-storage')).default;
    const raw = await AsyncStorage.getItem('persist:root');
    if (!raw) return undefined;
    const parsed = JSON.parse(raw) as { auth?: string };
    const auth = parsed.auth ? (JSON.parse(parsed.auth) as { user?: Record<string, string> }) : undefined;
    const user = auth?.user;
    return user?.token || user?.access || user?.access_token;
  } catch {
    return undefined;
  }
}

async function partnerFetch(path: string, init: RequestInit = {}) {
  const token = await readAuthToken();
  const headers = new Headers(init.headers);
  headers.set('Accept-Language', getDeviceLanguage());
  if (token) headers.set('Authorization', `Bearer ${token}`);
  if (!(init.body instanceof FormData) && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }
  const response = await fetch(`${getBaseApiUrl()}${API_V1_PREFIX}/partner${path}`, {
    ...init,
    headers,
  });
  if (!response.ok) {
    let message = `Request failed (${response.status})`;
    try {
      const body = await response.json();
      message = body.error || body.detail || message;
    } catch {
      // ignore
    }
    throw new Error(message);
  }
  if (response.status === 204) return null;
  return response.json();
}

function multipartConfig(): MultipartConfig {
  return {};
}

export async function fetchPartnerStore() {
  return partnerFetch('/store/');
}

export async function updatePartnerStore(data: FormData) {
  return partnerFetch('/store/', { method: 'PATCH', body: data });
}

export async function fetchPartnerProducts() {
  return partnerFetch('/products/');
}

export async function createPartnerProduct(formData: FormData) {
  return partnerFetch('/products/', { method: 'POST', body: formData });
}

export async function updatePartnerProduct(productId: number, formData: FormData) {
  return partnerFetch(`/products/${productId}/`, { method: 'PATCH', body: formData });
}

export async function deletePartnerProduct(productId: number) {
  return partnerFetch(`/products/${productId}/`, { method: 'DELETE' });
}

export async function fetchPartnerOrders() {
  return partnerFetch('/orders/');
}

export async function advancePartnerOrderStatus(orderId: number) {
  return partnerFetch(`/orders/${orderId}/status/`, { method: 'PATCH' });
}

export async function fetchPartnerProductCategories() {
  return partnerFetch('/product-categories/');
}

export async function fetchPartnerOpeningHours() {
  return partnerFetch('/opening-hours/');
}

export async function createPartnerOpeningHour(payload: Record<string, unknown>) {
  return partnerFetch('/opening-hours/', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function updatePartnerLocation(location: string) {
  return partnerFetch('/location/', {
    method: 'POST',
    body: JSON.stringify({ location }),
  });
}

export { multipartConfig };
