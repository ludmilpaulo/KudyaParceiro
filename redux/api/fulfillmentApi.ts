import { createApi } from '@reduxjs/toolkit/query/react';
import { createApiBaseQuery } from '../api/createApiBaseQuery';

export type FulfillmentDelivery = {
  id: number;
  request_number?: string;
  status: string;
  request_type?: string;
  pickup_address?: string;
  delivery_address?: string;
  driver_name?: string;
  customer_name?: string;
  created_at?: string;
};

type RawRecord = Record<string, unknown>;

function unwrapList(data: unknown): FulfillmentDelivery[] {
  if (Array.isArray(data)) return data as FulfillmentDelivery[];
  if (data && typeof data === 'object' && Array.isArray((data as RawRecord).results)) {
    return (data as RawRecord).results as FulfillmentDelivery[];
  }
  return [];
}

export const fulfillmentApi = createApi({
  reducerPath: 'fulfillmentApi',
  baseQuery: createApiBaseQuery('/api/v1/fulfillment'),
  tagTypes: ['FulfillmentAvailable', 'FulfillmentActive'],
  endpoints: (builder) => ({
    getAvailableDeliveries: builder.query<FulfillmentDelivery[], void>({
      query: () => '/deliveries/available/',
      transformResponse: (response: unknown) => unwrapList(response),
      providesTags: ['FulfillmentAvailable'],
    }),
    getActiveDeliveries: builder.query<FulfillmentDelivery[], void>({
      query: () => '/deliveries/active/',
      transformResponse: (response: unknown) => unwrapList(response),
      providesTags: ['FulfillmentActive'],
    }),
    getFulfillmentStats: builder.query<RawRecord, void>({
      query: () => '/stats/',
    }),
    acceptDelivery: builder.mutation<RawRecord, number>({
      query: (id) => ({ url: `/deliveries/${id}/accept/`, method: 'POST' }),
      invalidatesTags: ['FulfillmentAvailable', 'FulfillmentActive'],
    }),
    rejectDelivery: builder.mutation<RawRecord, { id: number; reason?: string }>({
      query: ({ id, reason }) => ({
        url: `/deliveries/${id}/reject/`,
        method: 'POST',
        body: { reason: reason ?? '' },
      }),
      invalidatesTags: ['FulfillmentAvailable', 'FulfillmentActive'],
    }),
    toggleDriverOnline: builder.mutation<RawRecord, number>({
      query: (driverId) => ({ url: `/drivers/${driverId}/toggle_online/`, method: 'POST' }),
    }),
    toggleDriverAvailable: builder.mutation<RawRecord, number>({
      query: (driverId) => ({ url: `/drivers/${driverId}/toggle_available/`, method: 'POST' }),
    }),
  }),
});

export const {
  useGetAvailableDeliveriesQuery,
  useGetActiveDeliveriesQuery,
  useGetFulfillmentStatsQuery,
  useAcceptDeliveryMutation,
  useRejectDeliveryMutation,
  useToggleDriverOnlineMutation,
  useToggleDriverAvailableMutation,
} = fulfillmentApi;
