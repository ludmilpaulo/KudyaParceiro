import type { FoodTranslationKey } from '../../configs/foodTranslations';
import type { FoodCapability, FoodPartnerAction, FoodPartnerMe, FoodPartnerTab } from './api/foodTypes';

export const FOOD_PARTNER_TABS: readonly FoodPartnerTab[] = [
  'new',
  'accepted',
  'preparing',
  'ready',
  'with_courier',
  'completed',
  'cancelled',
] as const;

const TAB_LABELS: Record<FoodPartnerTab, FoodTranslationKey> = {
  new: 'foodTabNew',
  accepted: 'foodTabAccepted',
  preparing: 'foodTabPreparing',
  ready: 'foodTabReady',
  with_courier: 'foodTabWithCourier',
  completed: 'foodTabCompleted',
  cancelled: 'foodTabCancelled',
};

export function tabLabelKey(tab: FoodPartnerTab): FoodTranslationKey {
  return TAB_LABELS[tab];
}

const STATUS_LABELS: Record<string, FoodTranslationKey> = {
  new: 'foodStatusNew',
  accepted: 'foodStatusAccepted',
  preparing: 'foodStatusPreparing',
  ready: 'foodStatusReady',
  courier_assigned: 'foodStatusCourierAssigned',
  picked_up: 'foodStatusPickedUp',
  out_for_delivery: 'foodStatusOutForDelivery',
  delivered: 'foodStatusDelivered',
  completed: 'foodStatusCompleted',
  cancelled: 'foodStatusCancelled',
  refunded: 'foodStatusRefunded',
};

export function statusLabelKey(status: string | null | undefined): FoodTranslationKey | null {
  if (!status) return null;
  return STATUS_LABELS[status] ?? null;
}

export const FOOD_PARTNER_ACTIONS: readonly FoodPartnerAction[] = [
  'accept',
  'reject',
  'start_preparing',
  'mark_ready',
  'handover',
  'collected',
] as const;

export function isFoodPartnerAction(value: unknown): value is FoodPartnerAction {
  return typeof value === 'string' && (FOOD_PARTNER_ACTIONS as readonly string[]).includes(value);
}

/** Only actions the backend offered (and that this client knows how to render), in backend order. */
export function partnerActionsFrom(actions: readonly unknown[] | null | undefined): FoodPartnerAction[] {
  if (!Array.isArray(actions)) return [];
  const seen = new Set<FoodPartnerAction>();
  for (const action of actions) {
    if (isFoodPartnerAction(action)) seen.add(action);
  }
  return Array.from(seen);
}

const ACTION_LABELS: Record<FoodPartnerAction, FoodTranslationKey> = {
  accept: 'foodActionAccept',
  reject: 'foodActionReject',
  start_preparing: 'foodActionStartPreparing',
  mark_ready: 'foodActionMarkReady',
  handover: 'foodActionHandover',
  collected: 'foodActionCollected',
};

export function actionLabelKey(action: FoodPartnerAction): FoodTranslationKey {
  return ACTION_LABELS[action];
}

export type FoodActionInput = 'prep_minutes' | 'reason' | 'pin' | null;

export function actionInput(action: FoodPartnerAction): FoodActionInput {
  if (action === 'accept') return 'prep_minutes';
  if (action === 'reject') return 'reason';
  if (action === 'collected') return 'pin';
  return null;
}

export function isDestructiveAction(action: FoodPartnerAction): boolean {
  return action === 'reject';
}

export function hasFoodCapability(me: FoodPartnerMe | null | undefined, capability: FoodCapability): boolean {
  return Boolean(me?.capabilities?.includes(capability));
}

export const MIN_PREP_MINUTES = 1;
export const MAX_PREP_MINUTES = 240;

/** Empty input means "use the store default"; anything else must be a whole number within 1-240. */
export function validatePrepMinutes(raw: string): { ok: true; value?: number } | { ok: false } {
  const text = raw.trim();
  if (!text) return { ok: true };
  if (!/^\d+$/.test(text)) return { ok: false };
  const value = Number(text);
  if (!Number.isInteger(value) || value < MIN_PREP_MINUTES || value > MAX_PREP_MINUTES) return { ok: false };
  return { ok: true, value };
}

export function defaultPrepMinutesText(storeMinutes: number | null | undefined): string {
  if (typeof storeMinutes !== 'number' || !Number.isInteger(storeMinutes)) return '';
  if (storeMinutes < MIN_PREP_MINUTES || storeMinutes > MAX_PREP_MINUTES) return '';
  return String(storeMinutes);
}

export const MAX_REASON_LENGTH = 255;

export function cleanReason(raw: string): string | null {
  const text = raw.trim();
  if (!text) return null;
  return text.slice(0, MAX_REASON_LENGTH);
}

export const PIN_MAX_LENGTH = 6;

export function sanitizePinInput(raw: string): string {
  return raw.replace(/\D/g, '').slice(0, PIN_MAX_LENGTH);
}

export function isValidPin(pin: string): boolean {
  return /^\d{4,6}$/.test(pin.trim());
}

export const MAX_ADDON_SELECT = 20;

/** Add-on group selection bounds as the backend accepts them: whole numbers 0-20 with min <= max. */
export function parseSelectBounds(
  minText: string,
  maxText: string,
): { ok: true; min: number; max: number } | { ok: false } {
  const minRaw = minText.trim() || '0';
  const maxRaw = maxText.trim() || '1';
  if (!/^\d+$/.test(minRaw) || !/^\d+$/.test(maxRaw)) return { ok: false };
  const min = Number(minRaw);
  const max = Number(maxRaw);
  if (min > MAX_ADDON_SELECT || max > MAX_ADDON_SELECT) return { ok: false };
  if (max > 0 && min > max) return { ok: false };
  return { ok: true, min, max };
}

/** Normalises "1,5" / "1.5" to "1.50"; null when the price is not a non-negative amount. */
export function parseAddonPrice(raw: string): string | null {
  const text = raw.trim().replace(',', '.');
  if (!text) return '0.00';
  if (!/^\d+(\.\d{1,2})?$/.test(text)) return null;
  const value = Number(text);
  if (!Number.isFinite(value) || value < 0) return null;
  return value.toFixed(2);
}

export type FoodCourierAction = 'pickup' | 'release' | 'depart' | 'deliver' | 'fail';

/** Courier buttons per status; release is only offered before pickup, fail only after. */
export function courierActionsFor(status: string): FoodCourierAction[] {
  switch (status) {
    case 'courier_assigned':
      return ['pickup', 'release'];
    case 'picked_up':
      return ['depart', 'deliver', 'fail'];
    case 'out_for_delivery':
      return ['deliver', 'fail'];
    default:
      return [];
  }
}

const COURIER_ACTION_LABELS: Record<FoodCourierAction, FoodTranslationKey> = {
  pickup: 'foodCourierPickup',
  release: 'foodCourierRelease',
  depart: 'foodCourierDepart',
  deliver: 'foodCourierDeliver',
  fail: 'foodCourierFail',
};

export function courierActionLabelKey(action: FoodCourierAction): FoodTranslationKey {
  return COURIER_ACTION_LABELS[action];
}

export function formatFoodMoney(amount: string | number | null | undefined, currency?: string | null): string {
  const value = amount == null || amount === '' ? '0.00' : String(amount);
  return currency ? `${value} ${currency}` : value;
}

type ErrorWithResponse = {
  response?: { status?: number; data?: unknown };
  message?: unknown;
};

function asErrorWithResponse(error: unknown): ErrorWithResponse | null {
  return error && typeof error === 'object' ? (error as ErrorWithResponse) : null;
}

export function apiErrorStatus(error: unknown): number | undefined {
  const status = asErrorWithResponse(error)?.response?.status;
  return typeof status === 'number' ? status : undefined;
}

/** Backend `detail` (or `error` / first field error) for display; never the raw request. */
export function extractApiErrorDetail(error: unknown, fallback: string): string {
  const data = asErrorWithResponse(error)?.response?.data;
  if (typeof data === 'string' && data.trim() && !data.trim().startsWith('<')) return data.trim();
  if (data && typeof data === 'object') {
    const record = data as Record<string, unknown>;
    for (const key of ['detail', 'error', 'message']) {
      const value = record[key];
      if (typeof value === 'string' && value.trim()) return value.trim();
    }
    if (Array.isArray(record.non_field_errors) && typeof record.non_field_errors[0] === 'string') {
      return record.non_field_errors[0];
    }
    for (const value of Object.values(record)) {
      if (Array.isArray(value) && typeof value[0] === 'string') return value[0];
    }
  }
  return fallback;
}

/** 403/404 from `food/partner/me/` means this account has no restaurant seat (e.g. a non-food shop). */
export function isNotFoodMemberError(error: unknown): boolean {
  const status = apiErrorStatus(error);
  return status === 403 || status === 404;
}
