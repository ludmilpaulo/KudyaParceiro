
import {
  advancePartnerOrderStatus,
  createPartnerOpeningHour,
  createPartnerProduct,
  deletePartnerProduct,
  fetchPartnerOpeningHours,
  fetchPartnerOrders,
  fetchPartnerProductCategories,
  fetchPartnerProducts,
  fetchPartnerStore,
  updatePartnerLocation,
  updatePartnerProduct,
  updatePartnerStore,
} from '../features/partner/api/partnerDashboardApi';
import { baseAPI, Categoria, FornecedorType, OpeningHourType, OrderTypes, Product, RestaurantType } from './types';

export const fetchFornecedorData = async (_userId: number): Promise<FornecedorType | null> => {
  try {
    return (await fetchPartnerStore()) as FornecedorType;
  } catch (error) {
    console.error('An error occurred while fetching fornecedor data:', error);
    throw error;
  }
};

export const updateLocation = async (_userId: number, location: string) => {
  try {
    return await updatePartnerLocation(location);
  } catch (error) {
    console.error('Error updating location:', error);
    throw error;
  }
};

export const fetchCategorias = async (): Promise<Categoria[]> => {
  return fetchPartnerProductCategories();
};

export const fetchRestaurantCategory = async (): Promise<Categoria[]> => {
  return fetchPartnerProductCategories();
};

export const fetchProducts = async (_userId: number): Promise<Product[]> => {
  return fetchPartnerProducts();
};

function stripLegacyAuthFormFields(formData: FormData): FormData {
  const stripped = new FormData();
  const entries = (
    formData as FormData & { entries(): IterableIterator<[string, FormDataEntryValue]> }
  ).entries();
  for (const [key, value] of entries) {
    if (key === 'user_id' || key === 'access_token') continue;
    stripped.append(key, value);
  }
  return stripped;
}

export const addProduct = async (formData: FormData): Promise<Product> => {
  return createPartnerProduct(stripLegacyAuthFormFields(formData));
};

export const updateProduct = async (productId: number, formData: FormData): Promise<void> => {
  await updatePartnerProduct(productId, stripLegacyAuthFormFields(formData));
};

export const deleteProduct = async (productId: number, _userId: number): Promise<void> => {
  await deletePartnerProduct(productId);
};

export const fetchOrders = async (_userId: number): Promise<OrderTypes[]> => {
  return fetchPartnerOrders();
};

export const updateOrderStatus = async (_userId: number, orderId: number): Promise<void> => {
  await advancePartnerOrderStatus(orderId);
};

export const getRestaurant = async (_userId: number): Promise<RestaurantType> => {
  return fetchPartnerStore();
};

export const updateRestaurant = async (_userId: number, data: FormData): Promise<RestaurantType> => {
  return updatePartnerStore(data);
};

export const getOpeningHours = async (_restaurantId: number): Promise<OpeningHourType[]> => {
  return fetchPartnerOpeningHours();
};

export const createOpeningHour = async (_restaurantId: number, data: OpeningHourType): Promise<OpeningHourType> => {
  return createPartnerOpeningHour(data as unknown as Record<string, unknown>);
};

const API_URL = baseAPI;

export const googleAPi = (
  process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY ?? ''
).trim();

export const apiUrl = baseAPI;

export const fetchData = async (endpoint: string) => {
  try {
    const response = await fetch(apiUrl + endpoint);
    return response.json();
  } catch (error) {
    console.error('Error fetching data:', error);
    throw error;
  }
};

export const getOrder = async (endpoint: string) => {
  try {
    const response = await fetch(apiUrl + endpoint);
    return response.json();
  } catch (error) {
    console.error('Error fetching data:', error);
    throw error;
  }
};

import * as Device from 'expo-device';
import * as Location from 'expo-location';
import { Platform } from 'react-native';

export const userLocation = async () => {
  if (Platform.OS === 'android' && !Device.isDevice) {
    alert(
      'Oops, this will not work on Snack in an Android Emulator. Try it on your device!',
    );
    return;
  }
  const { status } = await Location.requestForegroundPermissionsAsync();
  if (status !== 'granted') {
    alert('Permission to access location was denied');
    return;
  }

  const location = await Location.getCurrentPositionAsync({});
  return location.coords;
};
