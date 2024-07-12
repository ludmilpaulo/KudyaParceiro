import haversine from 'haversine';

export const calculateDistance = (start: { latitude: number; longitude: number }, end: { latitude: number; longitude: number }) => {
  const startPoint = {
    latitude: start.latitude,
    longitude: start.longitude
  };

  const endPoint = {
    latitude: end.latitude,
    longitude: end.longitude
  };

  return haversine(startPoint, endPoint, { unit: 'km' });
};
