
import axios from "axios";
import * as Device from "expo-device";
import * as Location from "expo-location";
import { useState } from "react";
import { Platform } from "react-native";
import { useSelector } from "react-redux";
import { selectUser } from "../redux/slices/authSlice";
import { baseAPI, Categoria, FornecedorType, OpeningHourType, OrderTypes, Product, RestaurantType } from "./types";

export const fetchFornecedorData = async (userId: number): Promise<FornecedorType | null> => {
    try {
      const response = await fetch(`${baseAPI}/restaurant/get_fornecedor/?user_id=${userId}`);
      if (!response.ok) {
        throw new Error("Failed to fetch fornecedor data");
      }
      const data = await response.json();
      if (data.fornecedor && data.fornecedor.length > 0) {
        return data.fornecedor[0];
      }
      return null;
    } catch (error) {
      console.error("An error occurred while fetching fornecedor data:", error);
      throw error;
    }
  };




  export const updateLocation = async (userId: number, location: string) => {
    try {
      const response = await axios.post(`${baseAPI}/restaurant/update-location/`, { user_id: userId, location });
      return response.data;
    } catch (error) {
      console.error("Error updating location:", error);
      throw error;
    }
  };






export const fetchCategorias = async (): Promise<Categoria[]> => {
  const response = await fetch(`${baseAPI}/restaurant/meal-categories/`);
  if (!response.ok) {
    throw new Error("Failed to fetch categories");
  }
  return response.json();
};

export const fetchRestaurantCategory = async (): Promise<Categoria[]> => {
    const response = await fetch(`${baseAPI}/restaurant/restaurant-categories/`);
    if (!response.ok) {
      throw new Error("Failed to fetch categories");
    }
    return response.json();
  };

export const fetchProducts = async (userId: number): Promise<Product[]> => {
  const response = await fetch(`${baseAPI}/restaurant/get_products/?user_id=${userId}`);
  if (!response.ok) {
    throw new Error("Failed to fetch products");
  }
  return response.json();
};

export const addProduct = async (formData: FormData): Promise<Product> => {
    const response = await fetch(`${baseAPI}/restaurant/add-product/`, {
      method: "POST",
      body: formData,
    });
  
    if (!response.ok) {
      const errorData = await response.json();
      const errorMessage = errorData.error || "Failed to add product";
      throw new Error(errorMessage);
    }
  
    return response.json();
  };
  
  export const updateProduct = async (productId: number, formData: FormData): Promise<void> => {
    const response = await fetch(`${baseAPI}/restaurant/update-product/${productId}/`, {
      method: "PUT",
      body: formData,
    });
    if (!response.ok) {
      const errorData = await response.json();
      const errorMessage = errorData.error || "Failed to update product";
      throw new Error(errorMessage);
    }
  };
  

  
  export const deleteProduct = async (productId: number, userId: number): Promise<void> => {
    try {
      const response = await axios.delete(`${baseAPI}/restaurant/delete-product/${productId}/`, {
        data: {
          user_id: userId
        }
      });
      if (response.status !== 204) {
        throw new Error("Failed to delete product");
      }
    } catch (error:any) {
      console.error('Error deleting product:', error.response?.data || error.message);
      throw error;
    }
  };
  


export const fetchOrders = async (userId: number): Promise<OrderTypes[]> => {
    const response = await fetch(`${baseAPI}/restaurant/restaurant/orders/?user_id=${userId}`);
    if (!response.ok) {
      throw new Error("Failed to fetch orders");
    }
    return response.json();
  };

  export const updateOrderStatus = async (userId: number, orderId: number): Promise<void> => {
    console.log("order status");
    const response = await fetch(`${baseAPI}/restaurant/restaurant/status/`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ user_id: userId, id: orderId }),
    });
    if (!response.ok) {
      throw new Error("Falha ao atualizar o status do pedido");
    }
  };
  


const API_URL = baseAPI;

export const getRestaurant = async (userId: number): Promise<RestaurantType> => {
    const response = await axios.get(`${API_URL}/restaurant/restaurants/${userId}/`);
    return response.data;
};

export const updateRestaurant = async (userId: number, data: FormData): Promise<RestaurantType> => {
    const response = await axios.put(`${API_URL}/restaurant/restaurants/${userId}/`, data, {
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    });
    return response.data;
};

export const getOpeningHours = async (restaurantId: number): Promise<OpeningHourType[]> => {
    const response = await axios.get(`${API_URL}/restaurant/restaurants/${restaurantId}/opening_hours/`);
    return response.data;
};

export const createOpeningHour = async (restaurantId: number, data: OpeningHourType): Promise<OpeningHourType> => {
    const response = await axios.post(`${API_URL}/restaurant/restaurants/${restaurantId}/opening_hours/`, data);
    return response.data;
};

////////////////////////////////////////////
export const googleAPi = "AIzaSyDn1X_BlFj-57ydasP6uZK_X_WTERNJb78";

export const apiUrl = baseAPI;

export const fetchData = async (endpoint: string) => {
  try {
    const response = await axios.get(apiUrl + endpoint);
    return response.data;
  } catch (error) {
    console.error("Error fetching data:", error);
    throw error;
  }
};

export const getOrder = async (endpoint: string) => {
  try {
    const response = await axios.get(apiUrl + endpoint);
    return response.data;
  } catch (error) {
    console.error("Error fetching data:", error);
    throw error;
  }
};

export const userLocation = async () => {
  if (Platform.OS === "android" && !Device.isDevice) {
    alert(
      "Oops, this will not work on Snack in an Android Emulator. Try it on your device!",
    );
    return;
  }
  let { status } = await Location.requestForegroundPermissionsAsync();
  if (status !== "granted") {
    alert("Permission to access location was denied");
    return;
  }

  let location = await Location.getCurrentPositionAsync({});
  return location.coords;
  //setLatitude(location.coords.latitude);
};