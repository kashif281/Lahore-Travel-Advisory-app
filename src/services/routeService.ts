import { calculateDistance, Coordinates } from '../utils/navigationHelper';
import { AvailableRoute } from '../components/AvailableRoutesDropdown';
import { TransportMode } from '../types/navigation';

// Mock route data for Lahore
const LAHORE_ROUTES: AvailableRoute[] = [
  {
    id: 'route-1',
    name: 'Route 12 - Canal Road',
    mode: 'speedo',
    from: 'Thokar Niaz Baig',
    to: 'Mall Road',
    distance: 0,
    color: '#2196F3',
  },
  {
    id: 'route-2',
    name: 'Metro Bus - Main Line',
    mode: 'metrobus',
    from: 'Shahdara',
    to: 'Gajjumata',
    distance: 0,
    color: '#4CAF50',
  },
  {
    id: 'route-3',
    name: 'Orange Line Metro',
    mode: 'orange-line',
    from: 'Ali Town',
    to: 'Dera Gujran',
    distance: 0,
    color: '#FF9800',
  },
  {
    id: 'route-4',
    name: 'Route 7 - Gulberg',
    mode: 'speedo',
    from: 'Gulberg',
    to: 'Liberty Market',
    distance: 0,
    color: '#2196F3',
  },
  {
    id: 'route-5',
    name: 'Route 15 - Defense',
    mode: 'speedo',
    from: 'DHA Phase 1',
    to: 'Fortress Stadium',
    distance: 0,
    color: '#2196F3',
  },
  {
    id: 'route-6',
    name: 'Route 22 - Model Town',
    mode: 'speedo',
    from: 'Model Town',
    to: 'Kalma Chowk',
    distance: 0,
    color: '#2196F3',
  },
];

// Mock route stops/stations with coordinates
const ROUTE_STATIONS = {
  'route-1': [
    { name: 'Thokar Niaz Baig', lat: 31.4503, lng: 74.2728 },
    { name: 'Canal Road', lat: 31.4800, lng: 74.3200 },
    { name: 'Mall Road', lat: 31.5656, lng: 74.3242 },
  ],
  'route-2': [
    { name: 'Shahdara', lat: 31.6225, lng: 74.3570 },
    { name: 'Kalma Chowk', lat: 31.5006, lng: 74.3333 },
    { name: 'Gajjumata', lat: 31.4672, lng: 74.2728 },
  ],
  'route-3': [
    { name: 'Ali Town', lat: 31.5204, lng: 74.2000 },
    { name: 'Lahore Railway Station', lat: 31.5590, lng: 74.3407 },
    { name: 'Dera Gujran', lat: 31.6000, lng: 74.4000 },
  ],
  'route-4': [
    { name: 'Gulberg', lat: 31.5165, lng: 74.3425 },
    { name: 'Liberty Market', lat: 31.5107, lng: 74.3520 },
  ],
  'route-5': [
    { name: 'DHA Phase 1', lat: 31.4697, lng: 74.4044 },
    { name: 'Fortress Stadium', lat: 31.5092, lng: 74.3441 },
  ],
  'route-6': [
    { name: 'Model Town', lat: 31.5497, lng: 74.3436 },
    { name: 'Kalma Chowk', lat: 31.5006, lng: 74.3333 },
  ],
};

export interface PlannedJourney {
  id: string;
  fromAddress: string;
  toAddress: string;
  routes: {
    route: AvailableRoute;
    walkingDistanceFrom: number;
    walkingDistanceTo: number;
    estimatedTime: number;
    fare: number;
  }[];
  totalTime: number;
  totalFare: number;
  polylineCoordinates: Coordinates[];
}

/**
 * Fetch available routes near a given coordinate
 */
export const fetchAvailableRoutes = async (
  coordinate: Coordinates,
  radiusKm: number = 2
): Promise<AvailableRoute[]> => {
  console.log('fetchAvailableRoutes called with:', coordinate, 'radius:', radiusKm);
  
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000));

  try {
    // Filter routes based on proximity to their stations
    const nearbyRoutes = LAHORE_ROUTES.filter(route => {
      const stations = ROUTE_STATIONS[route.id as keyof typeof ROUTE_STATIONS] || [];
      console.log(`Checking route ${route.id} with ${stations.length} stations`);
      
      // Check if any station of this route is within the radius
      return stations.some(station => {
        const distance = calculateDistance(
          coordinate,
          { latitude: station.lat, longitude: station.lng }
        );
        console.log(`Distance to station ${station.name}: ${distance}km`);
        return distance <= radiusKm;
      });
    }).map(route => {
      // Calculate distance to nearest station
      const stations = ROUTE_STATIONS[route.id as keyof typeof ROUTE_STATIONS] || [];
      const distances = stations.map(station => 
        calculateDistance(
          coordinate,
          { latitude: station.lat, longitude: station.lng }
        )
      );
      
      return {
        ...route,
        distance: Math.min(...distances),
      };
    }).sort((a, b) => a.distance - b.distance);

    console.log('Found nearby routes:', nearbyRoutes);
    return nearbyRoutes;
  } catch (error) {
    console.error('Error in fetchAvailableRoutes:', error);
    throw error;
  }
};

/**
 * Plan a journey between two coordinates
 */
export const planJourney = async (
  fromCoordinate: Coordinates,
  toCoordinate: Coordinates,
  fromAddress: string,
  toAddress: string
): Promise<PlannedJourney | null> => {
  console.log('planJourney called with:', {
    fromCoordinate,
    toCoordinate,
    fromAddress,
    toAddress
  });
  
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1500));

  try {
    // Get routes near both from and to locations
    console.log('Fetching routes for from location...');
    const fromRoutes = await fetchAvailableRoutes(fromCoordinate, 1.5);
    console.log('From routes:', fromRoutes);
    
    console.log('Fetching routes for to location...');
    const toRoutes = await fetchAvailableRoutes(toCoordinate, 1.5);
    console.log('To routes:', toRoutes);

    // Find common routes or plan transfers
    const directRoutes = fromRoutes.filter(fromRoute =>
      toRoutes.some(toRoute => toRoute.id === fromRoute.id)
    );
    console.log('Direct routes found:', directRoutes);

    if (directRoutes.length > 0) {
      // Direct route found
      const bestRoute = directRoutes[0];
      const stations = ROUTE_STATIONS[bestRoute.id as keyof typeof ROUTE_STATIONS] || [];
      
      const journey: PlannedJourney = {
        id: `journey-${Date.now()}`,
        fromAddress,
        toAddress,
        routes: [{
          route: bestRoute,
          walkingDistanceFrom: bestRoute.distance,
          walkingDistanceTo: toRoutes.find(r => r.id === bestRoute.id)?.distance || 0,
          estimatedTime: 30 + (bestRoute.distance * 10), // Rough estimate
          fare: 20, // Mock fare
        }],
        totalTime: 30 + (bestRoute.distance * 10),
        totalFare: 20,
        polylineCoordinates: [
          fromCoordinate,
          ...stations.map(s => ({ latitude: s.lat, longitude: s.lng })),
          toCoordinate,
        ],
      };
      
      console.log('Created direct journey:', journey);
      return journey;
    } else {
      // No direct route, suggest transfer
      const bestFromRoute = fromRoutes[0];
      const bestToRoute = toRoutes[0];
      
      console.log('No direct route, planning transfer with:', { bestFromRoute, bestToRoute });
      
      if (bestFromRoute && bestToRoute) {
        const journey: PlannedJourney = {
          id: `journey-${Date.now()}`,
          fromAddress,
          toAddress,
          routes: [
            {
              route: bestFromRoute,
              walkingDistanceFrom: bestFromRoute.distance,
              walkingDistanceTo: 0,
              estimatedTime: 20,
              fare: 20,
            },
            {
              route: bestToRoute,
              walkingDistanceFrom: 0.2, // Transfer walking
              walkingDistanceTo: bestToRoute.distance,
              estimatedTime: 25,
              fare: 20,
            },
          ],
          totalTime: 50,
          totalFare: 40,
          polylineCoordinates: [
            fromCoordinate,
            toCoordinate,
          ],
        };
        
        console.log('Created transfer journey:', journey);
        return journey;
      }
    }

    console.log('No journey found');
    return null;
  } catch (error) {
    console.error('Error in planJourney:', error);
    throw error;
  }
};

/**
 * Get route coordinates for drawing polyline
 */
export const getRouteCoordinates = (routeId: string): Coordinates[] => {
  const stations = ROUTE_STATIONS[routeId as keyof typeof ROUTE_STATIONS] || [];
  return stations.map(station => ({
    latitude: station.lat,
    longitude: station.lng,
  }));
};
