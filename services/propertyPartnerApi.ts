import { apiFetch, readJsonResponse } from '../utils/apiClient';

export type PropertyDashboardMetrics = {
  total_listings: number;
  active_listings: number;
  pending_approval: number;
  new_enquiries: number;
  scheduled_viewings: number;
  rental_applications: number;
};

export type PropertyDashboardEnquiry = {
  id: number;
  property_listing: number;
  property_title: string;
  enquiry_type: string;
  message: string;
  status: string;
  created_at: string;
};

export type PropertyPartnerDashboardData = {
  metrics: PropertyDashboardMetrics;
  recent_enquiries: PropertyDashboardEnquiry[];
};

export async function fetchPropertyPartnerDashboard(
  token?: string,
): Promise<PropertyPartnerDashboardData> {
  const headers = new Headers({ Accept: 'application/json' });
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await apiFetch('/api/properties/dashboard/', { headers });
  const data = await readJsonResponse<PropertyPartnerDashboardData | { detail?: string }>(response);
  if (!response.ok) {
    const errorBody = data as { detail?: string };
    throw new Error(errorBody.detail || `Property dashboard failed (${response.status})`);
  }
  return data as PropertyPartnerDashboardData;
}
