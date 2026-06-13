import { apiFetch, readJsonResponse } from '../utils/apiClient';

export type ClientPlatform = 'web' | 'mobile';

export interface BusinessCategory {
  id: number;
  name: string;
  slug: string;
  description: string;
  icon: string;
  color: string;
  gradient: [string, string];
  dashboard_route: string;
  feature_keys: string[];
  isActive: boolean;
  availableOnWeb: boolean;
  availableOnMobile: boolean;
  sortOrder: number;
}

type RawBusinessCategory = {
  id: number;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  color?: string;
  gradient?: string[] | [string, string];
  gradient_start?: string;
  gradient_end?: string;
  dashboard_route: string;
  feature_keys?: string[];
  isActive?: boolean;
  is_active?: boolean;
  availableOnWeb?: boolean;
  available_on_web?: boolean;
  availableOnMobile?: boolean;
  available_on_mobile?: boolean;
  sortOrder?: number;
  sort_order?: number;
};

function normalizeCategory(raw: RawBusinessCategory): BusinessCategory {
  const gradientStart = raw.gradient?.[0] || raw.gradient_start || raw.color || '#0171CE';
  const gradientEnd = raw.gradient?.[1] || raw.gradient_end || '#0359A8';
  return {
    id: raw.id,
    name: raw.name,
    slug: raw.slug,
    description: raw.description || '',
    icon: raw.icon || 'briefcase',
    color: raw.color || '#0171CE',
    gradient: [gradientStart, gradientEnd],
    dashboard_route: raw.dashboard_route,
    feature_keys: raw.feature_keys || [],
    isActive: raw.isActive ?? raw.is_active ?? true,
    availableOnWeb: raw.availableOnWeb ?? raw.available_on_web ?? true,
    availableOnMobile: raw.availableOnMobile ?? raw.available_on_mobile ?? true,
    sortOrder: raw.sortOrder ?? raw.sort_order ?? 0,
  };
}

export async function fetchBusinessCategories(
  lang = 'en',
  platform: ClientPlatform = 'mobile',
): Promise<BusinessCategory[]> {
  const params = new URLSearchParams({ platform });
  const response = await apiFetch(`/api/platform/business-categories/?${params.toString()}`, {
    headers: {
      Accept: 'application/json',
      'Accept-Language': lang,
    },
  });
  if (!response.ok) {
    throw new Error(`Failed to load business categories (${response.status})`);
  }
  const data = await readJsonResponse<RawBusinessCategory[]>(response);
  const categories = data.map(normalizeCategory).filter((c) => c.isActive);
  if (categories.length === 0) {
    throw new Error('No business categories returned from the API.');
  }
  return categories.sort((a, b) => a.sortOrder - b.sortOrder);
}

const CATEGORY_ICONS: Record<string, string> = {
  restaurant: 'utensils',
  grocery: 'shopping-basket',
  property: 'home',
  stay: 'bed',
  doctor: 'stethoscope',
  service_provider: 'briefcase',
  car_rental: 'car',
  courier: 'package',
  business: 'building',
};

export function getCategoryIcon(slug: string): string {
  return CATEGORY_ICONS[slug] || 'briefcase';
}

export const STORE_LIKE_CATEGORY_SLUGS = new Set(['restaurant', 'grocery']);

export function isStoreLikeCategory(slug: string): boolean {
  return STORE_LIKE_CATEGORY_SLUGS.has(slug);
}
