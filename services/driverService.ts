import { baseAPI } from './types';
import { UserOrder } from './ordertypes';

export const getDriverProfile = async (userId: string, _dispatch?: unknown) => {
  try {
    const response = await fetch(`${baseAPI}/driver/profile/`, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ user_id: userId }),
    });
    if (!response.ok) {
      return null;
    }
    try {
      return await response.json();
    } catch {
      return null;
    }
  } catch {
    return null;
  }
};

export const getDriverOrders = async (_dispatch?: unknown): Promise<UserOrder[]> => {
  try {
    const response = await fetch(`${baseAPI}/driver/orders/ready/`);
    if (!response.ok) {
      return [];
    }
    const body = await response.json();
    return Array.isArray(body?.orders) ? body.orders : [];
  } catch {
    return [];
  }
};

export const updateDriverLocation = async (userId: string, access_token:string, latitude: number, longitude: number) => {
  try {
    const response = await fetch(`${baseAPI}/driver/location/update/`, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ user_id: userId, access_token:access_token, location:{ latitude, longitude} }),
    });

    if (!response.ok) {
      return null;
    }

    try {
      return await response.json();
    } catch {
      return null;
    }
  } catch {
    return null;
  }
};

export const updateDriverProfile = async (formData: FormData) => {
  try {
    const response = await fetch(`${baseAPI}/driver/profile/update/`, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'multipart/form-data',
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error('Erro ao atualizar perfil');
    }

    return await response.json();
  } catch (error) {
    throw new Error('Falha ao atualizar perfil do motorista: ' + (error instanceof Error ? error.message : 'erro desconhecido'));
  }
};

export const fetchOngoingOrder = async (accessToken: string) => {
  try {
    const response = await fetch(`${baseAPI}/driver/ongoing-order/`, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ access_token: accessToken }),
    });
    if (!response.ok) {
      return { status: 'error' };
    }
    return await response.json();
  } catch {
    return { status: 'error' };
  }
};

export const acceptOrder = async (orderId: number, accessToken: string) => {
  try {
    const response = await fetch(`${baseAPI}/driver/order/pick/`, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ order_id: orderId, access_token: accessToken }),
    });
    return await response.json();
  } catch (error) {
    console.error("Failed to accept order:", error);
    throw error;
  }
};

export const rejectOrder = async (orderId: number, accessToken: string) => {
  try {
    const response = await fetch(`${baseAPI}/driver/reject-order/`, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ order_id: orderId, access_token: accessToken }),
    });
    return await response.json();
  } catch (error) {
    console.error("Failed to reject order:", error);
    throw error;
  }
};

interface VerifyOrderParams {
  access_token: string;
  order_id: number;
  pin: string;
  received_items: boolean[];
}

export const verifyOrder = async ({ access_token, order_id, pin, received_items }: VerifyOrderParams) => {
  try {
    const response = await fetch(`${baseAPI}/driver/verify-order/`, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        access_token,
        order_id,
        pin,
        received_items,
      }),
    });
    return await response.json();
  } catch (error) {
    console.error('Failed to verify order:', error);
    throw error;
  }
};

export const fetchVerifiedOrder = async (accessToken: string) => {
  try {
    const response = await fetch(`${baseAPI}/driver/verified-order/`, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ access_token: accessToken }),
    });
    if (!response.ok) {
      return { status: 'error' };
    }
    return await response.json();
  } catch {
    return { status: 'error' };
  }
};

export const toggleOnline = async (driverId: number) => {
  const res = await fetch(`${baseAPI}/drivers/api/drivers/${driverId}/toggle_online/`, { method: 'POST' });
  return res.json();
};

export const toggleAvailable = async (driverId: number) => {
  const res = await fetch(`${baseAPI}/drivers/api/drivers/${driverId}/toggle_available/`, { method: 'POST' });
  return res.json();
};

export const fetchAvailableDeliveries = async () => {
  const res = await fetch(`${baseAPI}/drivers/api/deliveries/available/`);
  return res.json();
};

export const fetchActiveDeliveries = async () => {
  const res = await fetch(`${baseAPI}/drivers/api/deliveries/active/`);
  return res.json();
};

export const acceptDelivery = async (deliveryId: number) => {
  const res = await fetch(`${baseAPI}/drivers/api/deliveries/${deliveryId}/accept/`, { method: 'POST' });
  return res.json();
};

export const rejectDeliveryNew = async (deliveryId: number, reason = '') => {
  const res = await fetch(`${baseAPI}/drivers/api/deliveries/${deliveryId}/reject/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ reason })
  });
  return res.json();
};
