import { baseAPI } from './types';
import type { DriverOnlineService } from './authTypes';
import { setDriverOnline, type SetDriverOnlineResult } from './ridesService';

function authHeaders(token: string): Record<string, string> {
  return {
    Accept: 'application/json',
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  };
}

/** Go online/offline for a specific approved vehicle service. */
export async function setDriverOnlineForService(
  token: string,
  isOnline: boolean,
  service: DriverOnlineService,
): Promise<SetDriverOnlineResult> {
  if (service === 'taxi') {
    return setDriverOnline(token, isOnline);
  }

  const res = await fetch(`${baseAPI}/api/partner/driver/availability/`, {
    method: 'PATCH',
    headers: authHeaders(token),
    body: JSON.stringify({ isOnline, service }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    return { ok: false, detail: data.detail || 'Could not update online status' };
  }
  return {
    ok: true,
    is_online: Boolean(data.isOnline ?? data.is_online),
    can_operate: data.canOperate ?? data.can_operate,
  };
}
