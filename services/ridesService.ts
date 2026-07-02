import { baseAPI } from './types';

export type DriverRideStop = {
  id: number;
  sort_order: number;
  address: string;
  latitude: string;
  longitude: string;
};

export type DriverRideOffer = {
  id: number;
  ride_id: number;
  ride_number: string;
  pickup_address: string;
  destination_address: string;
  pickup_lat: string;
  pickup_lng: string;
  destination_lat: string;
  destination_lng: string;
  estimated_price: string;
  default_calculated_price?: string;
  customer_price_offer: string | null;
  driver_counter_offer?: string | null;
  negotiation_status?: string;
  payment_method?: string;
  distance_km?: string;
  duration_minutes?: number;
  stops?: DriverRideStop[];
  stop_count?: number;
  currency: string;
  search_radius_km: string;
  distance_to_pickup_km: string;
  estimated_pickup_minutes: number;
  status: string;
  notified_at: string;
  expires_at: string;
  responded_at: string | null;
  search_cycle: number;
  response_timeout_seconds: number;
};

export type SetDriverOnlineResult = {
  ok: boolean;
  detail?: string;
  is_online?: boolean;
  can_operate?: boolean;
};

function authHeaders(token: string): Record<string, string> {
  return {
    Accept: 'application/json',
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  };
}

export async function fetchDriverOffers(token: string): Promise<DriverRideOffer[]> {
  const res = await fetch(`${baseAPI}/api/rides/driver/offers/`, {
    headers: authHeaders(token),
  });
  if (!res.ok) return [];
  const data = await res.json();
  return Array.isArray(data) ? data : [];
}

export async function setDriverOnline(token: string, isOnline: boolean): Promise<SetDriverOnlineResult> {
  const res = await fetch(`${baseAPI}/api/rides/driver/online/`, {
    method: 'POST',
    headers: authHeaders(token),
    body: JSON.stringify({ is_online: isOnline }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    return { ok: false, detail: data.detail || 'Could not update online status' };
  }
  return { ok: true, is_online: data.is_online, can_operate: data.can_operate };
}

export async function updateDriverRideLocation(
  token: string,
  latitude: number,
  longitude: number,
): Promise<boolean> {
  const res = await fetch(`${baseAPI}/api/rides/driver/location/`, {
    method: 'POST',
    headers: authHeaders(token),
    body: JSON.stringify({ latitude, longitude }),
  });
  return res.ok;
}

export async function acceptRideOffer(
  token: string,
  rideId: number,
  offerId: number,
): Promise<boolean> {
  const res = await fetch(`${baseAPI}/api/rides/${rideId}/accept/`, {
    method: 'POST',
    headers: authHeaders(token),
    body: JSON.stringify({ offer_id: offerId }),
  });
  return res.ok;
}

export async function sendRideCounterOffer(
  token: string,
  rideId: number,
  offerId: number,
  amount: number,
): Promise<boolean> {
  const res = await fetch(`${baseAPI}/api/rides/${rideId}/counter-offer/`, {
    method: 'POST',
    headers: authHeaders(token),
    body: JSON.stringify({ offer_id: offerId, amount }),
  });
  return res.ok;
}

export async function rejectRideOffer(
  token: string,
  rideId: number,
  offerId: number,
): Promise<boolean> {
  const res = await fetch(`${baseAPI}/api/rides/${rideId}/reject/`, {
    method: 'POST',
    headers: authHeaders(token),
    body: JSON.stringify({ offer_id: offerId }),
  });
  return res.ok;
}
