import v1Client from '../../../shared/api/v1Client';

export async function fetchFulfillmentDeliveries(params?: { status?: string }) {
  const { data } = await v1Client.get('/fulfillment/deliveries/', { params });
  return Array.isArray(data) ? data : data.results ?? [];
}

export async function fetchAvailableFulfillmentDeliveries() {
  const { data } = await v1Client.get('/fulfillment/deliveries/available/');
  return Array.isArray(data) ? data : data.results ?? [];
}

export async function acceptFulfillmentDelivery(id: number) {
  const { data } = await v1Client.post(`/fulfillment/deliveries/${id}/accept/`, {});
  return data;
}

export async function rejectFulfillmentDelivery(id: number, reason = '') {
  const { data } = await v1Client.post(`/fulfillment/deliveries/${id}/reject/`, { reason });
  return data;
}
