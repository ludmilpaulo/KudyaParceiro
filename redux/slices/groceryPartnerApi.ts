import { createApi } from "@reduxjs/toolkit/query/react";
import { createApiBaseQuery } from "../api/createApiBaseQuery";

export type GroceryPartnerProduct = {
  id: number;
  name: string;
  description: string;
  stock: string;
  selling_unit: string;
  selling_unit_label: string;
  price: string;
  price_per_unit: string;
  currency: string;
  allows_fractional: boolean;
  partner_status: string;
  image: string | null;
  brand: string;
  category_name: string;
  category_slug: string;
  subcategory: string;
  weight: string | null;
  weight_unit: string;
  low_stock_threshold: string;
};

export type GroceryPartnerOrderCard = {
  id: number;
  number: string;
  customer: string;
  items: number;
  total: number;
  status: string;
  payment_status?: string;
};

export type GroceryPartnerDashboard = {
  greeting_name: string;
  kpis: {
    today_sales: number;
    today_sales_change?: number;
    orders_today: number;
    orders_today_change?: number;
    products: number;
    low_stock: number;
    pending_orders: number;
    revenue: number;
    revenue_change?: number;
  };
  recent_orders: GroceryPartnerOrderCard[];
  store: { name: string; accepting_orders: boolean };
  low_stock_products?: Array<{ currency: string }>;
};

export type GroceryPartnerSales = {
  labels: string[];
  sales: number[];
  total_sales: number;
  order_count: number;
  average_order_value: number;
  completed_orders: number;
};

export type GroceryPartnerRevenue = {
  gross_sales: number;
  kudya_commission: number;
  delivery_charges: number;
  discounts: number;
  refunds: number;
  net_earnings: number;
  pending_payout: number;
  paid_out: number;
};

export type GroceryPartnerAnalytics = {
  sales: number;
  orders: number;
  average_order_value: number;
  customer_repeat_rate: number;
  best_selling: Array<{ id: number; name: string; sold: number }>;
};

export type GroceryPromotion = {
  id: number;
  product: number | null;
  product_name: string;
  title: string;
  discount_type: string;
  discount_value: string;
  start_at: string;
  end_at: string;
  is_active: boolean;
};

export type GroceryStockMovement = {
  id: number;
  product_name: string;
  previous_quantity: string;
  new_quantity: string;
  reason: string;
  created_at: string;
};

type ProductFilters = {
  q?: string;
  category?: string;
  status?: string;
  stock?: string;
};

export const groceryPartnerApi = createApi({
  reducerPath: "groceryPartnerApi",
  baseQuery: createApiBaseQuery("/api/v1/groceries/partner"),
  tagTypes: ["Dash", "Products", "Orders", "Settings", "Promos", "Inventory"],
  endpoints: (builder) => ({
    getGroceryPartnerDashboard: builder.query<GroceryPartnerDashboard, void>({
      query: () => "/dashboard/",
      providesTags: ["Dash"],
    }),
    getGroceryPartnerProducts: builder.query<GroceryPartnerProduct[], ProductFilters | void>({
      query: (params) => ({ url: "/products/", params: params ?? {} }),
      providesTags: ["Products"],
    }),
    getGroceryPartnerMeta: builder.query<{
      selling_units: Array<{ value: string; label: string }>;
      weight_units: Array<{ value: string; label: string }>;
      categories: Array<{ slug: string; name: string; subcategories: string[] }>;
    }, void>({
      query: () => "/meta/",
    }),
    getGroceryPartnerProduct: builder.query<GroceryPartnerProduct, number>({
      query: (id) => `/products/${id}/`,
      providesTags: ["Products"],
    }),
    createGroceryPartnerProduct: builder.mutation<GroceryPartnerProduct, FormData>({
      query: (body) => ({ url: "/products/", method: "POST", body }),
      invalidatesTags: ["Products", "Dash"],
    }),
    updateGroceryPartnerProduct: builder.mutation<GroceryPartnerProduct, { id: number; body: FormData }>({
      query: ({ id, body }) => ({ url: `/products/${id}/`, method: "PATCH", body }),
      invalidatesTags: ["Products", "Dash"],
    }),
    adjustGroceryStock: builder.mutation<
      { product: GroceryPartnerProduct },
      { id: number; delta: string; reason?: string }
    >({
      query: ({ id, ...body }) => ({ url: `/inventory/${id}/adjust/`, method: "POST", body }),
      invalidatesTags: ["Products", "Dash", "Inventory"],
    }),
    getGroceryStockHistory: builder.query<GroceryStockMovement[], void>({
      query: () => "/inventory/history/",
      providesTags: ["Inventory"],
    }),
    getGroceryPartnerOrders: builder.query<GroceryPartnerOrderCard[], string | void>({
      query: (status) => ({ url: "/orders/", params: status ? { status } : {} }),
      providesTags: ["Orders"],
    }),
    getGroceryPartnerOrder: builder.query<{
      id: number;
      number: string;
      customer: string;
      status: string;
      total: number;
      lines: Array<{
        id: number;
        name: string;
        quantity: string;
        selling_unit: string;
        selling_unit_label: string;
        pick_status: string;
        product_id: number;
        unit_price?: string;
        sub_total?: string;
        substituted_product_name?: string | null;
      }>;
    }, number>({
      query: (id) => `/orders/${id}/`,
      providesTags: ["Orders"],
    }),
    updateGroceryPartnerOrderStatus: builder.mutation<unknown, { id: number; status: string }>({
      query: ({ id, status }) => ({ url: `/orders/${id}/status/`, method: "PATCH", body: { status } }),
      invalidatesTags: ["Orders", "Dash"],
    }),
    pickGroceryOrderLine: builder.mutation<unknown, { id: number; line_id: number; pick_status: string }>({
      query: ({ id, ...body }) => ({ url: `/orders/${id}/pick/`, method: "PATCH", body }),
      invalidatesTags: ["Orders"],
    }),
    substituteGroceryOrderLine: builder.mutation<
      unknown,
      { id: number; line_id: number; substitute_product_id: number }
    >({
      query: ({ id, ...body }) => ({ url: `/orders/${id}/substitute/`, method: "POST", body }),
      invalidatesTags: ["Orders"],
    }),
    getGroceryPartnerSettings: builder.query<{
      accepting_orders: boolean;
      store_name: string;
      phone: string;
      address: string;
    }, void>({
      query: () => "/settings/",
      providesTags: ["Settings"],
    }),
    updateGroceryPartnerSettings: builder.mutation<unknown, { accepting_orders: boolean }>({
      query: (body) => ({ url: "/settings/", method: "PATCH", body }),
      invalidatesTags: ["Settings", "Dash"],
    }),
    getGroceryPartnerSales: builder.query<GroceryPartnerSales, string | void>({
      query: (period) => ({ url: "/sales/", params: { period: period || "7d" } }),
    }),
    getGroceryPartnerRevenue: builder.query<GroceryPartnerRevenue, string | void>({
      query: (period) => ({ url: "/revenue/", params: { period: period || "month" } }),
    }),
    getGroceryPartnerAnalytics: builder.query<GroceryPartnerAnalytics, void>({
      query: () => "/analytics/",
    }),
    getGroceryPartnerPromotions: builder.query<GroceryPromotion[], void>({
      query: () => "/promotions/",
      providesTags: ["Promos"],
    }),
    createGroceryPartnerPromotion: builder.mutation<GroceryPromotion, Partial<GroceryPromotion>>({
      query: (body) => ({ url: "/promotions/", method: "POST", body }),
      invalidatesTags: ["Promos"],
    }),
    getGroceryPartnerCustomers: builder.query<
      Array<{ id: number; name: string; phone: string; orders: number; spent: number }>,
      void
    >({
      query: () => "/customers/",
    }),
    getGroceryPartnerReviews: builder.query<
      Array<{ id: number; product_name: string; rating: number; comment: string }>,
      void
    >({
      query: () => "/reviews/",
    }),
    getGroceryPartnerNotifications: builder.query<
      { count: number; results: Array<{ id: string; title: string; created_at: string }> },
      void
    >({
      query: () => "/notifications/",
    }),
  }),
});

export const {
  useGetGroceryPartnerDashboardQuery,
  useGetGroceryPartnerProductsQuery,
  useGetGroceryPartnerProductQuery,
  useGetGroceryPartnerMetaQuery,
  useCreateGroceryPartnerProductMutation,
  useUpdateGroceryPartnerProductMutation,
  useAdjustGroceryStockMutation,
  useGetGroceryStockHistoryQuery,
  useGetGroceryPartnerOrdersQuery,
  useGetGroceryPartnerOrderQuery,
  useUpdateGroceryPartnerOrderStatusMutation,
  usePickGroceryOrderLineMutation,
  useSubstituteGroceryOrderLineMutation,
  useGetGroceryPartnerSettingsQuery,
  useUpdateGroceryPartnerSettingsMutation,
  useGetGroceryPartnerSalesQuery,
  useGetGroceryPartnerRevenueQuery,
  useGetGroceryPartnerAnalyticsQuery,
  useGetGroceryPartnerPromotionsQuery,
  useCreateGroceryPartnerPromotionMutation,
  useGetGroceryPartnerCustomersQuery,
  useGetGroceryPartnerReviewsQuery,
  useGetGroceryPartnerNotificationsQuery,
} = groceryPartnerApi;
