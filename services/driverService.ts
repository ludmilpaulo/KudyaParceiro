import { baseAPI } from './types';
import { UserOrder } from './ordertypes';
import { logoutUser } from "../redux/slices/authSlice";

export const getDriverProfile = async (userId: string, dispatch: any) => {
  try {
    const response = await fetch(`${baseAPI}/driver/profile/`, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ user_id: userId }),
    });
    const responseJson = await response.json();
    return responseJson;
  } catch (error) {
    if (error instanceof Error) {
      dispatch(logoutUser()); // Log the user out
      throw new Error('Falha ao buscar perfil do motorista: ' + error.message);
    } else {
      dispatch(logoutUser()); // Log the user out
      throw new Error('Falha ao buscar perfil do motorista: erro desconhecido');
    }
  }
};

export const getDriverOrders = async (dispatch: any) => {
  try {
    const response = await fetch(`${baseAPI}/driver/orders/ready/`);
    const { orders }: { orders: UserOrder[] } = await response.json();
    return orders;
  } catch (error) {
    if (error instanceof Error) {
      dispatch(logoutUser()); // Log the user out
      throw new Error('Falha ao buscar pedidos do motorista: ' + error.message);
    } else {
      dispatch(logoutUser()); // Log the user out
      throw new Error('Falha ao buscar pedidos do motorista: erro desconhecido');
    }
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
      throw new Error('Erro ao atualizar a localização');
    }

    return await response.json();
  } catch (error) {
    throw new Error('Falha ao atualizar a localização do motorista: ' + (error instanceof Error ? error.message : 'erro desconhecido'));
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



// Fetch the ongoing order for the driver
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
    const result = await response.json();
    return result;
  } catch (error) {
    console.error("Failed to fetch ongoing order:", error);
    throw error;
  }
};

// Accept an order
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
    const result = await response.json();
    return result;
  } catch (error) {
    console.error("Failed to accept order:", error);
    throw error;
  }
};

// Reject an order
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
    const result = await response.json();
    return result;
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
    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Failed to verify order:', error);
    throw error;
  }
};



// driverService.ts
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
      const result = await response.json();
      return result;
    } catch (error) {
      console.error("Failed to fetch verified order:", error);
      throw error;
    }
  };

// New delivery API (modern endpoints)
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
  