/** Food API v1 payloads (`/api/v1/food/partner/` and `/api/v1/food/courier/`). See docs/api/FOOD.md. */

export type FoodOrderStatus =
  | 'new'
  | 'accepted'
  | 'preparing'
  | 'ready'
  | 'courier_assigned'
  | 'picked_up'
  | 'out_for_delivery'
  | 'delivered'
  | 'completed'
  | 'cancelled'
  | 'refunded';

export type FoodPartnerTab =
  | 'new'
  | 'accepted'
  | 'preparing'
  | 'ready'
  | 'with_courier'
  | 'completed'
  | 'cancelled';

export type FoodPartnerAction =
  | 'accept'
  | 'reject'
  | 'start_preparing'
  | 'mark_ready'
  | 'handover'
  | 'collected';

export type FoodCapability =
  | 'view_orders'
  | 'accept_orders'
  | 'prepare_orders'
  | 'handover_orders'
  | 'manage_menu'
  | 'manage_hours'
  | 'manage_team'
  | 'manage_store'
  | 'view_reports'
  | 'view_finance';

export type FoodPartnerMe = {
  store: {
    id: number;
    name: string;
    is_approved: boolean;
    accepting_orders: boolean;
    supports_pickup: boolean;
    verification_status?: string;
  };
  role: string;
  capabilities: string[];
};

export type FoodPartnerStore = {
  id: number;
  name: string;
  preparation_time_minutes?: number | null;
  accepting_orders?: boolean;
  supports_pickup?: boolean;
};

export type FoodOrderCard = {
  id: number;
  number: string;
  status: FoodOrderStatus | string;
  status_label?: string;
  fulfilment_type: 'delivery' | 'pickup' | string;
  customer_name: string;
  item_count: string | number;
  items_preview: string[];
  total: string;
  payment_method?: string;
  created_at: string;
  prep_estimate_minutes?: number | null;
  has_courier?: boolean;
};

export type FoodOrderLine = {
  id: number;
  name: string;
  quantity: string;
  unit_price: string;
  subtotal: string;
  addons: { name: string; price: string }[];
  special_instructions?: string | null;
};

export type FoodOrderTimelineEvent = {
  status: string;
  label?: string | null;
  at: string;
};

export type FoodOrderDetail = FoodOrderCard & {
  currency?: string;
  lines: FoodOrderLine[];
  subtotal?: string;
  delivery_fee?: string;
  discount_amount?: string;
  delivery_notes?: string;
  cancellation_reason?: string | null;
  payment_status?: string;
  courier: { name: string; vehicle?: string } | null;
  timeline: FoodOrderTimelineEvent[];
  settlement?: { gross: string; platform_fee: string; net: string; paid_out: boolean } | null;
  actions: string[];
};

export type FoodOrderListResponse = {
  count: number;
  next?: string | null;
  previous?: string | null;
  results: FoodOrderCard[];
  counts: Partial<Record<FoodPartnerTab, number>>;
};

export type FoodPartnerDashboard = {
  currency?: string;
  today: Partial<Record<FoodPartnerTab, number>> & { orders?: number; revenue?: string };
  open?: Partial<Record<FoodPartnerTab, number>>;
  outstanding_payouts?: string;
  rating?: { average: number | null; count: number };
  popular_products?: { name: string; quantity: string; revenue: string }[];
  accepting_orders?: boolean;
  is_approved?: boolean;
};

export type FoodAddon = {
  id: number;
  name: string;
  price: string;
  is_active: boolean;
  sort_order?: number;
};

export type FoodAddonGroup = {
  id: number;
  product: number;
  name: string;
  required: boolean;
  min_select: number;
  max_select: number;
  sort_order?: number;
  addons: FoodAddon[];
};

export type FoodPartnerProduct = {
  id: number;
  name: string;
  addon_groups?: FoodAddonGroup[];
};

export type FoodAddonGroupInput = {
  product?: number;
  name?: string;
  required?: boolean;
  min_select?: number;
  max_select?: number;
};

export type FoodAddonInput = {
  group?: number;
  name?: string;
  price?: string;
  is_active?: boolean;
};

export type FoodCourierOrder = {
  id: number;
  number: string;
  status: FoodOrderStatus | string;
  restaurant: {
    name: string;
    address?: string | null;
    phone?: string | null;
    latitude?: number | null;
    longitude?: number | null;
  };
  items: { name: string; quantity: string }[];
  delivery_fee: string;
  earning: string;
  currency?: string;
  payment_method?: string;
  collect_cash: boolean;
  total: string;
  created_at: string;
  customer?: {
    name: string;
    phone_masked?: string | null;
    address?: string | null;
    location?: string | null;
    delivery_notes?: string;
  };
  dropoff_area?: string;
};

export type FoodCourierEarnings = {
  today: string;
  week: string;
  all_time: string;
  deliveries: number;
  recent: { id: number; number: string; earning: string; at: string }[];
};

export type FoodProofPhoto = {
  uri: string;
  name: string;
  type: string;
};
