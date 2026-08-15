import API from './api';

function unwrapList<T>(data: unknown): T[] {
  if (Array.isArray(data)) return data;
  if (data && typeof data === 'object' && 'results' in data) {
    const results = (data as { results?: T[] }).results;
    return Array.isArray(results) ? results : [];
  }
  return [];
}

export type PartnerService = {
  id: number;
  title: string;
  price: number | string;
  currency: string;
  duration_minutes: number;
  category: number;
};

export type ServiceCategory = { id: number; name: string };

export type PartnerBooking = {
  id: number;
  status: string;
  booking_date: string;
  booking_time: string;
  service_title?: string;
};

export async function fetchServiceCategories(): Promise<ServiceCategory[]> {
  const { data } = await API.get('/services/categories/');
  return unwrapList<ServiceCategory>(data);
}

export async function fetchMyServices(): Promise<PartnerService[]> {
  const { data } = await API.get('/services/services/mine/');
  return unwrapList<PartnerService>(data);
}

export async function createPartnerService(payload: Record<string, unknown>): Promise<PartnerService> {
  const { data } = await API.post('/services/services/', payload);
  return data as PartnerService;
}

export async function fetchPartnerBookings(): Promise<PartnerBooking[]> {
  const { data } = await API.get('/services/bookings/');
  return unwrapList<PartnerBooking>(data);
}

export async function updateBookingAction(id: number, action: 'confirm' | 'start' | 'complete' | 'cancel') {
  const { data } = await API.post(`/services/bookings/${id}/${action}/`);
  return data;
}

export type RentalVehicle = {
  id: number;
  make: string;
  model: string;
  year: number;
  daily_price: string;
  currency: string;
  is_approved: boolean;
};

export type RentalBooking = {
  id: number;
  booking_number: string;
  status: string;
  start_date: string;
  end_date: string;
};

export async function fetchMyRentalVehicles(): Promise<RentalVehicle[]> {
  const { data } = await API.get('/api/rentals/me/vehicles/');
  return unwrapList<RentalVehicle>(data);
}

export async function createRentalVehicle(payload: Record<string, unknown>): Promise<RentalVehicle> {
  const { data } = await API.post('/api/rentals/me/vehicles/', payload);
  return data as RentalVehicle;
}

export async function fetchPartnerRentalBookings(): Promise<RentalBooking[]> {
  const { data } = await API.get('/api/rentals/me/vehicles/bookings/');
  return unwrapList<RentalBooking>(data);
}

export async function updateRentalBookingStatus(id: number, nextStatus: string) {
  const { data } = await API.patch(`/api/rentals/bookings/${id}/status/`, { status: nextStatus });
  return data;
}

export type LinkedBusiness = {
  id: number;
  name?: string;
  legal_name?: string;
  status?: string;
};

export async function fetchMyBusinesses(): Promise<LinkedBusiness[]> {
  const { data } = await API.get('/api/v1/businesses/me/');
  return unwrapList<LinkedBusiness>(data);
}

export async function fetchCountries(): Promise<Array<{ id: number; name: string; code: string }>> {
  const { data } = await API.get('/api/countries/');
  return unwrapList(data);
}
