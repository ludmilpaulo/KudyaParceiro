import v1Client from '../../../shared/api/v1Client';

export async function fetchMyBusinesses() {
  const { data } = await v1Client.get('/businesses/me/');
  return data;
}
