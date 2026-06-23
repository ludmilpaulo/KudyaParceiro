import { getBaseApiUrl } from '../../../utils/apiClient';
import { getDeviceLanguage } from '../../../services/api';

const API_V1_PREFIX = '/api/v1';

export type PartnerReportData = {
  revenue: number[];
  orders: number[];
  products?: { labels: string[]; data: number[] };
  drivers?: { labels: string[]; data: number[] };
  customers?: { labels: string[]; data: number[] };
  total_store_amount?: number;
  total_paid_amount?: number;
  proof_of_payment?: string;
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
  const response = await fetch(`${getBaseApiUrl()}${API_V1_PREFIX}${path}`, {
    ...init,
    headers,
  });
  if (!response.ok) {
    throw new Error(`Request failed (${response.status})`);
  }
  return response.json();
}

export async function fetchPartnerReport(params?: {
  timeframe?: string;
  start_date?: string;
  end_date?: string;
}): Promise<PartnerReportData> {
  const query = new URLSearchParams();
  if (params?.timeframe) query.set('timeframe', params.timeframe);
  if (params?.start_date) query.set('start_date', params.start_date);
  if (params?.end_date) query.set('end_date', params.end_date);
  const suffix = query.toString() ? `?${query.toString()}` : '';
  return partnerFetch(`/partner/reports/${suffix}`);
}

export async function fetchPartnerReportCustomers() {
  return partnerFetch('/partner/reports/customers/');
}

export async function fetchPartnerReportDrivers() {
  return partnerFetch(`/partner/reports/drivers/`);
}
