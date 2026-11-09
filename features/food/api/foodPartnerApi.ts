import v1Client from '../../../shared/api/v1Client';
import type {
  FoodAddon,
  FoodAddonGroup,
  FoodAddonGroupInput,
  FoodAddonInput,
  FoodOrderDetail,
  FoodOrderListResponse,
  FoodPartnerAction,
  FoodPartnerDashboard,
  FoodPartnerMe,
  FoodPartnerProduct,
  FoodPartnerStore,
  FoodPartnerTab,
} from './foodTypes';

const BASE = '/food/partner';

export async function fetchFoodPartnerMe(): Promise<FoodPartnerMe> {
  const { data } = await v1Client.get<FoodPartnerMe>(`${BASE}/me/`);
  return data;
}

export async function fetchFoodPartnerStore(): Promise<FoodPartnerStore> {
  const { data } = await v1Client.get<FoodPartnerStore>(`${BASE}/store/`);
  return data;
}

export async function fetchFoodPartnerDashboard(): Promise<FoodPartnerDashboard> {
  const { data } = await v1Client.get<FoodPartnerDashboard>(`${BASE}/dashboard/`);
  return data;
}

export async function fetchFoodPartnerOrders(params: {
  tab: FoodPartnerTab;
  page?: number;
}): Promise<FoodOrderListResponse> {
  const { data } = await v1Client.get<FoodOrderListResponse>(`${BASE}/orders/`, {
    params: { tab: params.tab, page: params.page ?? 1 },
  });
  return {
    ...data,
    results: Array.isArray(data?.results) ? data.results : [],
    counts: data?.counts ?? {},
  };
}

export async function fetchFoodPartnerOrder(orderId: number): Promise<FoodOrderDetail> {
  const { data } = await v1Client.get<FoodOrderDetail>(`${BASE}/orders/${orderId}/`);
  return data;
}

export type FoodPartnerActionPayload = {
  action: FoodPartnerAction;
  prep_minutes?: number;
  reason?: string;
  pin?: string;
};

export async function postFoodPartnerOrderAction(
  orderId: number,
  payload: FoodPartnerActionPayload,
): Promise<FoodOrderDetail> {
  const { data } = await v1Client.post<FoodOrderDetail>(`${BASE}/orders/${orderId}/actions/`, payload);
  return data;
}

export async function fetchFoodPartnerProducts(): Promise<FoodPartnerProduct[]> {
  const { data } = await v1Client.get<FoodPartnerProduct[]>(`${BASE}/products/`);
  return Array.isArray(data) ? data : [];
}

export async function createFoodAddonGroup(input: FoodAddonGroupInput): Promise<FoodAddonGroup> {
  const { data } = await v1Client.post<FoodAddonGroup>(`${BASE}/addon-groups/`, input);
  return data;
}

export async function updateFoodAddonGroup(groupId: number, input: FoodAddonGroupInput): Promise<FoodAddonGroup> {
  const { data } = await v1Client.patch<FoodAddonGroup>(`${BASE}/addon-groups/${groupId}/`, input);
  return data;
}

export async function deleteFoodAddonGroup(groupId: number): Promise<void> {
  await v1Client.delete(`${BASE}/addon-groups/${groupId}/`);
}

export async function createFoodAddon(input: FoodAddonInput): Promise<FoodAddon> {
  const { data } = await v1Client.post<FoodAddon>(`${BASE}/addons/`, input);
  return data;
}

export async function updateFoodAddon(addonId: number, input: FoodAddonInput): Promise<FoodAddon> {
  const { data } = await v1Client.patch<FoodAddon>(`${BASE}/addons/${addonId}/`, input);
  return data;
}

export async function deleteFoodAddon(addonId: number): Promise<void> {
  await v1Client.delete(`${BASE}/addons/${addonId}/`);
}
