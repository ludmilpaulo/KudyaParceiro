import { calculateDistance } from '../../utils/distance';

describe('Distance Utils', () => {
  it('should calculate distance between two points', () => {
    const start = { latitude: -8.8383, longitude: 13.2344 }; // Luanda, Angola
    const end = { latitude: -26.2041, longitude: 28.0473 }; // Johannesburg, South Africa
    
    const distance = calculateDistance(start, end);
    
    expect(distance).toBeGreaterThan(0);
    expect(typeof distance).toBe('number');
  });

  it('should return 0 for same coordinates', () => {
    const point = { latitude: -8.8383, longitude: 13.2344 };
    const distance = calculateDistance(point, point);
    
    expect(distance).toBe(0);
  });

  it('should handle nearby coordinates', () => {
    const start = { latitude: -8.8383, longitude: 13.2344 };
    const end = { latitude: -8.8393, longitude: 13.2354 }; // ~1km away
    
    const distance = calculateDistance(start, end);
    
    expect(distance).toBeGreaterThan(0);
    expect(distance).toBeLessThan(1);
  });
});
