import type { Location } from '../types';

// Illustrative connection between two points, not road routing or turn-by-turn navigation.
export function getApproximateRoute(a: Location, b: Location): [number, number][] {
  const delhiJaipur = [a.city, b.city].includes('New Delhi') && [a.city, b.city].includes('Jaipur');
  if (delhiJaipur) {
    const route: [number, number][] = [
      [28.643, 77.22], [28.617, 77.201], [28.554, 77.116], [28.464, 77.026],
      [28.294, 76.884], [28.107, 76.828], [27.875, 76.419], [27.7, 76.205],
      [27.61, 76.073], [27.395, 75.969], [27.192, 75.961], [27.046, 75.856],
    ];
    if (a.city === 'Jaipur') route.reverse();
    return [[a.lat, a.lng], ...route, [b.lat, b.lng]];
  }
  return [[a.lat, a.lng], [(a.lat + b.lat) / 2 + (b.lng - a.lng) * 0.035, (a.lng + b.lng) / 2], [b.lat, b.lng]];
}
