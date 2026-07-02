import type { DriverOnlineService, DriverServiceMode } from '../services/authTypes';

const FOOD_MODES: DriverServiceMode[] = ['food_delivery', 'grocery', 'store_delivery', 'medical'];
const PARCEL_MODES: DriverServiceMode[] = ['parcel_delivery', 'store_delivery', 'grocery', 'medical'];

export function showFoodTab(modes?: DriverServiceMode[]): boolean {
  if (!modes?.length) return false;
  return modes.some((mode) => FOOD_MODES.includes(mode));
}

export function showParcelTab(modes?: DriverServiceMode[]): boolean {
  if (!modes?.length) return false;
  return modes.some((mode) => PARCEL_MODES.includes(mode));
}

export function showTaxiTab(modes?: DriverServiceMode[]): boolean {
  return Boolean(modes?.includes('taxi'));
}

export function canGoOnlineForService(
  modes: DriverServiceMode[] | undefined,
  service: DriverOnlineService,
): boolean {
  if (!modes?.length) return false;
  switch (service) {
    case 'taxi':
      return modes.includes('taxi');
    case 'food_delivery':
      return FOOD_MODES.some((mode) => modes.includes(mode));
    case 'parcel_delivery':
      return PARCEL_MODES.some((mode) => modes.includes(mode));
    case 'product_delivery':
      return modes.includes('store_delivery');
    case 'grocery_delivery':
      return modes.includes('grocery');
    case 'medical_delivery':
      return modes.includes('medical');
    default:
      return false;
  }
}

export function serviceBlockedMessage(service: DriverOnlineService): string {
  switch (service) {
    case 'taxi':
      return 'Your approved vehicle is not configured for taxi / ride services.';
    case 'food_delivery':
      return 'Your approved vehicle is not configured for food delivery.';
    case 'parcel_delivery':
      return 'Your approved vehicle is not configured for parcel delivery.';
    default:
      return 'Your approved vehicle is not configured for this service.';
  }
}
