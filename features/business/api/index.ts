import v1Client from '../../../shared/api/v1Client';

export type PartnerBusiness = {
  id: number;
  name: string;
  category_slug?: string;
  status?: string;
};

export async function fetchMyBusinesses(): Promise<PartnerBusiness[]> {
  const { data } = await v1Client.get('/businesses/me/');
  if (Array.isArray(data)) return data as PartnerBusiness[];
  if (data && typeof data === 'object' && 'results' in data) {
    const results = (data as { results?: PartnerBusiness[] }).results;
    return Array.isArray(results) ? results : [];
  }
  return [];
}
