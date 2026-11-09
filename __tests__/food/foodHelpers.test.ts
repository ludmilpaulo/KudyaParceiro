import {
  FOOD_PARTNER_TABS,
  actionInput,
  actionLabelKey,
  apiErrorStatus,
  cleanReason,
  courierActionsFor,
  defaultPrepMinutesText,
  extractApiErrorDetail,
  hasFoodCapability,
  isNotFoodMemberError,
  isValidPin,
  parseAddonPrice,
  parseSelectBounds,
  partnerActionsFrom,
  sanitizePinInput,
  statusLabelKey,
  tabLabelKey,
  validatePrepMinutes,
} from '../../features/food/foodHelpers';
import type { FoodPartnerMe } from '../../features/food/api/foodTypes';

describe('restaurant order board tabs', () => {
  it('lists the documented tabs in board order', () => {
    expect(FOOD_PARTNER_TABS).toEqual([
      'new',
      'accepted',
      'preparing',
      'ready',
      'with_courier',
      'completed',
      'cancelled',
    ]);
  });

  it('maps every tab to a distinct label', () => {
    const labels = FOOD_PARTNER_TABS.map(tabLabelKey);
    expect(new Set(labels).size).toBe(FOOD_PARTNER_TABS.length);
    expect(tabLabelKey('with_courier')).toBe('foodTabWithCourier');
  });

  it('labels lifecycle statuses and ignores unknown ones', () => {
    expect(statusLabelKey('courier_assigned')).toBe('foodStatusCourierAssigned');
    expect(statusLabelKey('out_for_delivery')).toBe('foodStatusOutForDelivery');
    expect(statusLabelKey('something_else')).toBeNull();
    expect(statusLabelKey(undefined)).toBeNull();
  });
});

describe('partner actions', () => {
  it('keeps only known backend actions, in backend order, without duplicates', () => {
    expect(partnerActionsFrom(['start_preparing', 'reject', 'teleport', 'reject', 7])).toEqual([
      'start_preparing',
      'reject',
    ]);
    expect(partnerActionsFrom(undefined)).toEqual([]);
  });

  it('asks for the input each action needs', () => {
    expect(actionInput('accept')).toBe('prep_minutes');
    expect(actionInput('reject')).toBe('reason');
    expect(actionInput('collected')).toBe('pin');
    expect(actionInput('mark_ready')).toBeNull();
    expect(actionInput('handover')).toBeNull();
  });

  it('labels handover and collected differently', () => {
    expect(actionLabelKey('handover')).not.toBe(actionLabelKey('collected'));
  });

  it('checks capabilities from food/partner/me', () => {
    const kitchen: FoodPartnerMe = {
      store: { id: 1, name: 'S', is_approved: true, accepting_orders: true, supports_pickup: false },
      role: 'kitchen',
      capabilities: ['prepare_orders', 'view_orders'],
    };
    expect(hasFoodCapability(kitchen, 'prepare_orders')).toBe(true);
    expect(hasFoodCapability(kitchen, 'manage_menu')).toBe(false);
    expect(hasFoodCapability(null, 'view_orders')).toBe(false);
  });
});

describe('prep minutes', () => {
  it('accepts whole minutes from 1 to 240 and empty input as store default', () => {
    expect(validatePrepMinutes('')).toEqual({ ok: true });
    expect(validatePrepMinutes(' 25 ')).toEqual({ ok: true, value: 25 });
    expect(validatePrepMinutes('1')).toEqual({ ok: true, value: 1 });
    expect(validatePrepMinutes('240')).toEqual({ ok: true, value: 240 });
  });

  it('rejects out of range or non-integer values', () => {
    for (const raw of ['0', '241', '12.5', '-3', 'abc', '1e2']) {
      expect(validatePrepMinutes(raw)).toEqual({ ok: false });
    }
  });

  it('prefills the store preparation time only when it is valid', () => {
    expect(defaultPrepMinutesText(30)).toBe('30');
    expect(defaultPrepMinutesText(0)).toBe('');
    expect(defaultPrepMinutesText(500)).toBe('');
    expect(defaultPrepMinutesText(null)).toBe('');
  });
});

describe('PIN input', () => {
  it('keeps digits only and caps at 6', () => {
    expect(sanitizePinInput('12 34-56 78')).toBe('123456');
    expect(sanitizePinInput('ab')).toBe('');
  });

  it('accepts 4 to 6 digit PINs only', () => {
    expect(isValidPin('1234')).toBe(true);
    expect(isValidPin('123456')).toBe(true);
    expect(isValidPin('123')).toBe(false);
    expect(isValidPin('1234567')).toBe(false);
    expect(isValidPin('12a4')).toBe(false);
    expect(isValidPin('')).toBe(false);
  });
});

describe('reasons', () => {
  it('requires text and truncates to the backend limit', () => {
    expect(cleanReason('   ')).toBeNull();
    expect(cleanReason('  Out of stock ')).toBe('Out of stock');
    expect(cleanReason('x'.repeat(300))).toHaveLength(255);
  });
});

describe('add-on validation', () => {
  it('accepts select bounds 0-20 with min <= max', () => {
    expect(parseSelectBounds('0', '3')).toEqual({ ok: true, min: 0, max: 3 });
    expect(parseSelectBounds('', '')).toEqual({ ok: true, min: 0, max: 1 });
    expect(parseSelectBounds('2', '0')).toEqual({ ok: true, min: 2, max: 0 });
    expect(parseSelectBounds('3', '2')).toEqual({ ok: false });
    expect(parseSelectBounds('0', '21')).toEqual({ ok: false });
    expect(parseSelectBounds('-1', '2')).toEqual({ ok: false });
  });

  it('normalises prices to two decimals', () => {
    expect(parseAddonPrice('1,5')).toBe('1.50');
    expect(parseAddonPrice('200')).toBe('200.00');
    expect(parseAddonPrice('')).toBe('0.00');
    expect(parseAddonPrice('-1')).toBeNull();
    expect(parseAddonPrice('1.234')).toBeNull();
    expect(parseAddonPrice('abc')).toBeNull();
  });
});

describe('courier actions', () => {
  it('offers release only before pickup and fail only after', () => {
    expect(courierActionsFor('courier_assigned')).toEqual(['pickup', 'release']);
    expect(courierActionsFor('picked_up')).toEqual(['depart', 'deliver', 'fail']);
    expect(courierActionsFor('out_for_delivery')).toEqual(['deliver', 'fail']);
    expect(courierActionsFor('ready')).toEqual([]);
    expect(courierActionsFor('completed')).toEqual([]);
  });
});

describe('API errors', () => {
  const axiosLike = (status: number, data: unknown) => ({ response: { status, data } });

  it('prefers the backend detail', () => {
    expect(extractApiErrorDetail(axiosLike(400, { detail: 'The customer PIN is incorrect.', code: 'invalid_pin' }), 'x')).toBe(
      'The customer PIN is incorrect.',
    );
    expect(extractApiErrorDetail(axiosLike(400, { error: 'Store closed' }), 'x')).toBe('Store closed');
    expect(extractApiErrorDetail(axiosLike(400, { min_select: ['Too big.'] }), 'x')).toBe('Too big.');
  });

  it('falls back for HTML or unknown errors', () => {
    expect(extractApiErrorDetail(axiosLike(500, '<html>oops</html>'), 'fallback')).toBe('fallback');
    expect(extractApiErrorDetail(new Error('Network'), 'fallback')).toBe('fallback');
    expect(extractApiErrorDetail(null, 'fallback')).toBe('fallback');
  });

  it('treats 403/404 from partner/me as "no restaurant workspace"', () => {
    expect(apiErrorStatus(axiosLike(409, {}))).toBe(409);
    expect(isNotFoodMemberError(axiosLike(403, {}))).toBe(true);
    expect(isNotFoodMemberError(axiosLike(404, {}))).toBe(true);
    expect(isNotFoodMemberError(axiosLike(500, {}))).toBe(false);
    expect(isNotFoodMemberError(new Error('offline'))).toBe(false);
  });
});
