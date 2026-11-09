import v1Client from '../../../shared/api/v1Client';
import { appendFormDataFile } from '../../../utils/formDataFile';
import type { FoodCourierEarnings, FoodCourierOrder, FoodProofPhoto } from './foodTypes';

const BASE = '/food/courier';

export async function fetchFoodCourierAvailable(): Promise<FoodCourierOrder[]> {
  const { data } = await v1Client.get<FoodCourierOrder[]>(`${BASE}/available/`);
  return Array.isArray(data) ? data : [];
}

export async function fetchFoodCourierActive(): Promise<FoodCourierOrder[]> {
  const { data } = await v1Client.get<FoodCourierOrder[]>(`${BASE}/active/`);
  return Array.isArray(data) ? data : [];
}

export async function fetchFoodCourierEarnings(): Promise<FoodCourierEarnings> {
  const { data } = await v1Client.get<FoodCourierEarnings>(`${BASE}/earnings/`);
  return data;
}

export async function acceptFoodCourierOrder(orderId: number): Promise<FoodCourierOrder> {
  const { data } = await v1Client.post<FoodCourierOrder>(`${BASE}/orders/${orderId}/accept/`, {});
  return data;
}

export async function releaseFoodCourierOrder(orderId: number): Promise<FoodCourierOrder> {
  const { data } = await v1Client.post<FoodCourierOrder>(`${BASE}/orders/${orderId}/release/`, {});
  return data;
}

export async function pickupFoodCourierOrder(orderId: number): Promise<FoodCourierOrder> {
  const { data } = await v1Client.post<FoodCourierOrder>(`${BASE}/orders/${orderId}/pickup/`, {});
  return data;
}

export async function departFoodCourierOrder(orderId: number): Promise<FoodCourierOrder> {
  const { data } = await v1Client.post<FoodCourierOrder>(`${BASE}/orders/${orderId}/depart/`, {});
  return data;
}

export async function deliverFoodCourierOrder(
  orderId: number,
  pin: string,
  proofPhoto?: FoodProofPhoto | null,
): Promise<FoodCourierOrder> {
  const path = `${BASE}/orders/${orderId}/deliver/`;
  if (!proofPhoto) {
    const { data } = await v1Client.post<FoodCourierOrder>(path, { pin });
    return data;
  }
  const formData = new FormData();
  formData.append('pin', pin);
  await appendFormDataFile(formData, 'proof_photo', proofPhoto);
  const { data } = await v1Client.post<FoodCourierOrder>(path, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data;
}

export async function failFoodCourierOrder(orderId: number, reason: string): Promise<FoodCourierOrder> {
  const { data } = await v1Client.post<FoodCourierOrder>(`${BASE}/orders/${orderId}/fail/`, { reason });
  return data;
}
