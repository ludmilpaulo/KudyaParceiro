import { createApi } from "@reduxjs/toolkit/query/react";
import type { PartnerMeResponse, PartnerType } from "../../types/partner";
import { createApiBaseQuery } from "../api/createApiBaseQuery";

type RawRecord = Record<string, unknown>;

function mapPartnerMe(raw: RawRecord): PartnerMeResponse {
  return {
    id: String(raw.id ?? ""),
    partnerType: (typeof raw.partnerType === "string" ? raw.partnerType : raw.partner_type) as PartnerType,
    verificationStatus: String(raw.verificationStatus ?? raw.verification_status ?? "draft"),
    isActiveOnPlatform: Boolean(raw.isActiveOnPlatform ?? raw.is_active_on_platform),
    displayName: String(raw.displayName ?? raw.display_name ?? ""),
    categorySlug: raw.categorySlug ? String(raw.categorySlug) : raw.category_slug ? String(raw.category_slug) : null,
  };
}

export const partnerApi = createApi({
  reducerPath: "partnerApi",
  baseQuery: createApiBaseQuery("/api/v1/partner"),
  tagTypes: ["PartnerMe", "GroceryDashboard", "GroceryProducts", "GroceryOrders", "GroceryInventory", "GroceryPromotions"],
  endpoints: (builder) => ({
    getPartnerMe: builder.query<PartnerMeResponse, void>({
      query: () => "/me/",
      transformResponse: (response: RawRecord) => mapPartnerMe(response),
      providesTags: ["PartnerMe"],
    }),
    getGroceryDashboard: builder.query<RawRecord, void>({
      query: () => "/grocery/dashboard/",
      providesTags: ["GroceryDashboard"],
    }),
    getGroceryProducts: builder.query<RawRecord[], void>({
      query: () => "/products/",
      transformResponse: (response: RawRecord[] | { results?: RawRecord[] }) =>
        Array.isArray(response) ? response : response.results ?? [],
      providesTags: ["GroceryProducts"],
    }),
    getGroceryOrders: builder.query<RawRecord[], void>({
      query: () => "/orders/",
      transformResponse: (response: RawRecord[] | { results?: RawRecord[] }) =>
        Array.isArray(response) ? response : response.results ?? [],
      providesTags: ["GroceryOrders"],
    }),
    getGroceryInventory: builder.query<RawRecord[], void>({
      query: () => "/grocery/inventory/",
      providesTags: ["GroceryInventory"],
    }),
    getGroceryMeta: builder.query<RawRecord, void>({
      query: () => "/grocery/meta/",
    }),
    getGrocerySales: builder.query<RawRecord, string | void>({
      query: (range) => ({ url: "/grocery/sales/", params: { range: range || "7d" } }),
    }),
    getGroceryRevenue: builder.query<RawRecord, { range?: string; start_date?: string; end_date?: string } | void>({
      query: (params) => ({ url: "/grocery/revenue/", params: params || { range: "month" } }),
    }),
    getGroceryPromotions: builder.query<RawRecord[], void>({
      query: () => "/grocery/promotions/",
      transformResponse: (response: RawRecord[] | { results?: RawRecord[] }) =>
        Array.isArray(response) ? response : response.results ?? [],
      providesTags: ["GroceryPromotions"],
    }),
    createGroceryPromotion: builder.mutation<RawRecord, Record<string, unknown>>({
      query: (body) => ({ url: "/grocery/promotions/", method: "POST", body }),
      invalidatesTags: ["GroceryPromotions"],
    }),
    updateGroceryStore: builder.mutation<RawRecord, Record<string, unknown>>({
      query: (body) => ({ url: "/store/", method: "PATCH", body }),
      invalidatesTags: ["GroceryDashboard"],
    }),
    pickGroceryOrderItem: builder.mutation<
      RawRecord,
      { orderId: number; itemId: number; pick_status: string; substituted_product?: number; pick_note?: string }
    >({
      query: ({ orderId, itemId, ...body }) => ({
        url: `/grocery/orders/${orderId}/items/${itemId}/pick/`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: ["GroceryOrders"],
    }),
    createGroceryProduct: builder.mutation<RawRecord, FormData>({
      query: (body) => ({ url: "/products/", method: "POST", body }),
      invalidatesTags: ["GroceryProducts", "GroceryDashboard", "GroceryInventory"],
    }),
    adjustGroceryStock: builder.mutation<RawRecord, { id: number; adjustment: number; reason?: string }>({
      query: ({ id, ...body }) => ({
        url: `/grocery/inventory/${id}/adjust/`,
        method: "POST",
        body,
      }),
      invalidatesTags: ["GroceryInventory", "GroceryProducts", "GroceryDashboard"],
    }),
    updateGroceryOrderStatus: builder.mutation<RawRecord, { id: number; status: string }>({
      query: ({ id, status }) => ({
        url: `/grocery/orders/${id}/status/`,
        method: "PATCH",
        body: { status },
      }),
      invalidatesTags: ["GroceryOrders", "GroceryDashboard"],
    }),
    updateGroceryAvailability: builder.mutation<RawRecord, { accepting_orders: boolean }>({
      query: (body) => ({ url: "/grocery/availability/", method: "PATCH", body }),
      invalidatesTags: ["GroceryDashboard"],
    }),
  }),
});

export const {
  useGetPartnerMeQuery,
  useGetGroceryDashboardQuery,
  useGetGroceryProductsQuery,
  useGetGroceryOrdersQuery,
  useGetGroceryInventoryQuery,
  useGetGroceryMetaQuery,
  useGetGrocerySalesQuery,
  useGetGroceryRevenueQuery,
  useGetGroceryPromotionsQuery,
  useCreateGroceryPromotionMutation,
  useUpdateGroceryStoreMutation,
  usePickGroceryOrderItemMutation,
  useCreateGroceryProductMutation,
  useAdjustGroceryStockMutation,
  useUpdateGroceryOrderStatusMutation,
  useUpdateGroceryAvailabilityMutation,
} = partnerApi;
