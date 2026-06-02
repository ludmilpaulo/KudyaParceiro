import type { AuthSessionPayload } from '../services/authTypes';

export function resolvePartnerRoles(data: Record<string, unknown>): Pick<
  AuthSessionPayload,
  'is_driver' | 'is_customer'
> {
  const user = data.user as { role?: string } | undefined;
  const role = String(user?.role || data.role || '').toLowerCase();
  const is_driver = Boolean(data.is_driver) || role === 'driver';
  const is_customer =
    Boolean(data.is_customer) || role === 'customer' || (role === '' && !is_driver && !isPartnerRole(role));
  return { is_driver, is_customer: is_customer && !is_driver && !isPartnerRole(role) };
}

export function isPartnerRole(role: string): boolean {
  return ['restaurant', 'merchant', 'grocery_store_owner', 'pharmacy', 'landlord'].includes(role);
}

export function canUsePartnerApp(payload: Pick<AuthSessionPayload, 'is_driver' | 'is_customer' | 'user'>): boolean {
  if (payload.is_driver) return true;
  if (payload.is_customer) return false;
  const role = String((payload.user as { role?: string } | undefined)?.role || '').toLowerCase();
  return isPartnerRole(role) || (!payload.is_customer && !payload.is_driver);
}
