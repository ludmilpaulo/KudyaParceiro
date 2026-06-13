/** Normalized auth payload from Django `/api/auth/*` (JWT + legacy fields). */
export type BusinessProfilePayload = {
  id: number;
  businessName: string;
  category: string;
  dashboardRoute: string;
  isApproved: boolean;
  isActive: boolean;
};

export type DriverServiceMode = 'taxi' | 'food_delivery' | 'parcel_delivery';

export type AuthSessionPayload = {
  access: string;
  refresh: string;
  token: string;
  access_token: string;
  api_token?: string;
  auth_scheme: 'Bearer';
  user_id: number;
  username: string;
  role?: string;
  is_customer: boolean;
  is_driver: boolean;
  message: string;
  user?: Record<string, unknown>;
  business_profile?: BusinessProfilePayload;
  driver_service_modes?: DriverServiceMode[];
};

export function normalizeAuthResponse(data: Record<string, unknown>): AuthSessionPayload {
  const access = String(data.access || data.token || '');
  const refresh = String(data.refresh || '');
  if (!access) {
    throw new Error(String(data.detail || data.message || 'Token não retornado.'));
  }
  const user = data.user as { role?: string; id?: number; email?: string } | undefined;
  const role = String(user?.role || data.role || '').toLowerCase();
  const is_driver = Boolean(data.is_driver) || role === 'driver';
  const is_customer =
    (Boolean(data.is_customer) || role === 'customer') &&
    !is_driver &&
    !['restaurant', 'merchant', 'grocery_store_owner', 'agent', 'host', 'doctor', 'service_provider', 'rental_partner', 'courier', 'business_admin', 'landlord'].includes(role);

  const rawProfile = data.business_profile as Record<string, unknown> | undefined;
  let business_profile: BusinessProfilePayload | undefined;
  if (rawProfile) {
    business_profile = {
      id: Number(rawProfile.id || 0),
      businessName: String(rawProfile.businessName || rawProfile.business_name || ''),
      category: String(rawProfile.category || ''),
      dashboardRoute: String(rawProfile.dashboardRoute || rawProfile.dashboard_route || ''),
      isApproved: Boolean(rawProfile.isApproved ?? rawProfile.is_approved),
      isActive: Boolean(rawProfile.isActive ?? rawProfile.is_active ?? true),
    };
  }

  const driverModes = data.driver_service_modes as DriverServiceMode[] | undefined;

  return {
    access,
    refresh,
    token: access,
    access_token: access,
    api_token: data.api_token ? String(data.api_token) : undefined,
    auth_scheme: 'Bearer',
    user_id: Number(data.user_id ?? user?.id ?? 0),
    username: String(data.username || user?.email || ''),
    role,
    is_customer,
    is_driver,
    message: String(data.message || 'Login com sucesso'),
    user: data.user as Record<string, unknown> | undefined,
    business_profile,
    driver_service_modes: Array.isArray(driverModes) ? driverModes : undefined,
  };
}

export type SocialAuthResult = AuthSessionPayload;
