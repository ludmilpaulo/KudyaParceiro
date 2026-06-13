import type { AuthSessionPayload } from '../services/authTypes';

export type BusinessProfile = {
  id: number;
  businessName: string;
  category: string;
  dashboardRoute: string;
  isApproved: boolean;
  isActive: boolean;
};

export type DriverServiceMode = 'taxi' | 'food_delivery' | 'parcel_delivery';

export const DRIVER_SERVICE_MODES: DriverServiceMode[] = [
  'taxi',
  'food_delivery',
  'parcel_delivery',
];

export const PARTNER_BUSINESS_ROLES = new Set([
  'restaurant',
  'merchant',
  'grocery_store_owner',
  'agent',
  'host',
  'doctor',
  'service_provider',
  'rental_partner',
  'courier',
  'business_admin',
  'landlord',
]);

export function isPartnerRole(role: string): boolean {
  return PARTNER_BUSINESS_ROLES.has(role.toLowerCase());
}

export function getUserRole(payload: {
  user?: Record<string, unknown>;
  role?: string;
}): string {
  const user = payload.user as { role?: string } | undefined;
  return String(user?.role || payload.role || '').toLowerCase();
}

export function getPartnerCategorySlug(payload: {
  business_profile?: BusinessProfile;
  user?: Record<string, unknown>;
}): string | null {
  const fromProfile = payload.business_profile?.category;
  if (fromProfile) return fromProfile;
  const user = payload.user as { business_profile?: { category?: string } } | undefined;
  const nested = user?.business_profile?.category;
  return nested ? String(nested) : null;
}

export function canUsePartnerApp(
  payload: Pick<AuthSessionPayload, 'is_driver' | 'is_customer' | 'user'> & {
    business_profile?: BusinessProfile;
  },
): boolean {
  if (payload.is_driver) return false;
  if (payload.is_customer) return false;
  if (payload.business_profile) return true;
  return isPartnerRole(getUserRole(payload));
}

export function canUseRiderApp(
  payload: Pick<AuthSessionPayload, 'is_driver' | 'is_customer' | 'user'>,
): boolean {
  if (payload.is_driver) return true;
  return getUserRole(payload) === 'driver';
}

export function resolvePartnerRoles(data: Record<string, unknown>): Pick<
  AuthSessionPayload,
  'is_driver' | 'is_customer'
> {
  const role = getUserRole(data as { user?: Record<string, unknown>; role?: string });
  const is_driver = Boolean(data.is_driver) || role === 'driver';
  const is_customer =
    (Boolean(data.is_customer) || role === 'customer') &&
    !is_driver &&
    !isPartnerRole(role);
  return { is_driver, is_customer };
}

export function getPartnerDashboardKind(categorySlug: string | null): 'store' | 'doctor' | 'category' {
  if (categorySlug && ['restaurant', 'grocery'].includes(categorySlug)) {
    return 'store';
  }
  if (categorySlug === 'doctor') {
    return 'doctor';
  }
  return 'category';
}
