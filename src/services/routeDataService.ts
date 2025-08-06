import routesData from '../../assets/routes.json';
import speedoRoutesData from '../../assets/speedo-route.json';
import { TransportMode } from '../types/navigation';

export interface RouteStop {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  modes: TransportMode[];
  isRoute?: boolean;
  routeId?: string;
}

export interface RouteData {
  id: string;
  name: string;
  mode: string;
  origin: string;
  destination: string;
  stops: string[];
  frequency: string;
  fare: number;
  operatingHours: {
    weekday: { start: string; end: string };
    weekend: { start: string; end: string };
  };
}

// Mock coordinates for route stops (in a real app, these would come from a database)
const STOP_COORDINATES: Record<string, { latitude: number; longitude: number }> = {
  // Speedo Route 1 stops
  'Thokar Niaz Baig': { latitude: 31.4504, longitude: 74.3587 },
  'Multan Road': { latitude: 31.4704, longitude: 74.3487 },
  'Chauburji': { latitude: 31.5104, longitude: 74.3287 },
  'MAO College': { latitude: 31.5304, longitude: 74.3187 },
  'Railway Station': { latitude: 31.5590, longitude: 74.3407 },
  
  // Metrobus Line 1 stops
  'Gajjumata': { latitude: 31.4204, longitude: 74.2987 },
  'Kalma Chowk': { latitude: 31.5006, longitude: 74.3333 },
  'Niazi Station': { latitude: 31.5404, longitude: 74.3087 },
  'Shahdara': { latitude: 31.5804, longitude: 74.3687 },
  
  // Orange Line stops
  'Ali Town': { latitude: 31.4804, longitude: 74.2787 },
  'Anarkali': { latitude: 31.5733, longitude: 74.3182 },
  'Central Station': { latitude: 31.5604, longitude: 74.3287 },
  'GPO': { latitude: 31.5704, longitude: 74.3387 },
  'Dera Gujran': { latitude: 31.5904, longitude: 74.3787 },
};

// Map route modes to our TransportMode type
const mapRouteMode = (mode: string): TransportMode => {
  switch (mode.toLowerCase()) {
    case 'speedo':
      return 'speedo';
    case 'metrobus':
      return 'metrobus';
    case 'orangeline':
    case 'orange-line':
      return 'orange-line';
    default:
      return 'speedo';
  }
};

// Helper to convert speedo route JSON to RouteData format
const convertSpeedoToRouteData = (speedoRoute: any, idx: number): RouteData => {
  return {
    id: `SPD${speedoRoute.route_number.padStart(3, '0')}`,
    name: `Speedo Route ${speedoRoute.route_number}`,
    mode: 'Speedo',
    origin: speedoRoute.start_point,
    destination: speedoRoute.end_point,
    stops: speedoRoute.alignment.map((stop: any) => stop.name),
    frequency: '15 minutes', // Default, can be refined
    fare: 30, // Default, can be refined
    operatingHours: {
      weekday: { start: '06:00', end: '22:00' },
      weekend: { start: '07:00', end: '21:00' },
    },
  };
};

// Merge all routes
const mergedRoutes = [
  ...routesData.routes,
  ...((speedoRoutesData.routes || []).map(convertSpeedoToRouteData)),
];

// Helper to get coordinates from either STOP_COORDINATES or the speedo alignment
const getStopCoordinates = (stopName: string, speedoAlignment?: any[]): { latitude: number | null; longitude: number | null } | undefined => {
  if (STOP_COORDINATES[stopName]) {
    return STOP_COORDINATES[stopName];
  }
  if (speedoAlignment) {
    const found = speedoAlignment.find((s: any) => s.name === stopName && s.latitude && s.longitude);
    if (found) {
      return { latitude: found.latitude, longitude: found.longitude };
    }
  }
  return undefined;
};

// Build a global unique list of all stops from all alignments (including Speedo)
const allUniqueStops: RouteStop[] = (() => {
  const stopMap = new Map<string, RouteStop>();

  // Add stops from main routes.json
  routesData.routes.forEach((route: any) => {
    const transportMode = mapRouteMode(route.mode);
    (route.stops || []).forEach((stopName: string, idx: number) => {
      if (!stopMap.has(stopName)) {
        const coords = STOP_COORDINATES[stopName] || { latitude: null, longitude: null };
        stopMap.set(stopName, {
          id: `${route.id || route.name}-${idx}`,
          name: stopName,
          address: `${stopName}, Lahore`,
          latitude: coords.latitude,
          longitude: coords.longitude,
          modes: [transportMode],
        });
      }
    });
  });

  // Add stops from all Speedo alignments
  (speedoRoutesData.routes || []).forEach((route: any, routeIdx: number) => {
    const transportMode = 'speedo';
    (route.alignment || []).forEach((stop: any, idx: number) => {
      if (!stopMap.has(stop.name)) {
        stopMap.set(stop.name, {
          id: `SPD${route.route_number.padStart(3, '0')}-${idx}`,
          name: stop.name,
          address: `${stop.name}, Lahore`,
          latitude: stop.latitude ?? null,
          longitude: stop.longitude ?? null,
          modes: [transportMode],
        });
      }
    });
  });

  return Array.from(stopMap.values()).sort((a, b) => a.name.localeCompare(b.name));
})();

export const getAllStops = (): RouteStop[] => allUniqueStops;

export const getAllRouteStops = (): RouteStop[] => {
  const allStops: RouteStop[] = [];
  const processedStops = new Set<string>();

  // Process each route
  mergedRoutes.forEach((route: RouteData, routeIdx) => {
    const transportMode = mapRouteMode(route.mode);
    // If this is a Speedo route, get the alignment from speedoRoutesData
    let speedoAlignment: any[] | undefined = undefined;
    if (route.mode.toLowerCase() === 'speedo') {
      const speedoRaw = (speedoRoutesData.routes || []).find((r: any) => `SPD${r.route_number.padStart(3, '0')}` === route.id);
      if (speedoRaw) speedoAlignment = speedoRaw.alignment;
    }
    // Add each stop from the route
    route.stops.forEach((stopName, index) => {
      let coordinates = getStopCoordinates(stopName, speedoAlignment);
      // If coordinates are missing, set to null
      if (!coordinates) {
        coordinates = { latitude: null, longitude: null };
      }
      if (!processedStops.has(stopName)) {
        processedStops.add(stopName);
        allStops.push({
          id: `${route.id}-${index}`,
          name: stopName,
          address: `${stopName}, Lahore`,
          latitude: coordinates.latitude,
          longitude: coordinates.longitude,
          modes: [transportMode],
          isRoute: false,
        });
      }
    });
    // Also add the route itself as a selectable option (if origin/dest have coordinates)
    let originCoords = getStopCoordinates(route.origin, speedoAlignment);
    let destCoords = getStopCoordinates(route.destination, speedoAlignment);
    if (originCoords && originCoords.latitude && originCoords.longitude) {
      allStops.push({
        id: `route-${route.id}-origin`,
        name: `${route.name} - ${route.origin}`,
        address: `${route.origin} (${route.name} Origin)`,
        latitude: originCoords.latitude,
        longitude: originCoords.longitude,
        modes: [transportMode],
        isRoute: true,
        routeId: route.id,
      });
    }
    if (destCoords && destCoords.latitude && destCoords.longitude && route.destination !== route.origin) {
      allStops.push({
        id: `route-${route.id}-dest`,
        name: `${route.name} - ${route.destination}`,
        address: `${route.destination} (${route.name} Destination)`,
        latitude: destCoords.latitude,
        longitude: destCoords.longitude,
        modes: [transportMode],
        isRoute: true,
        routeId: route.id,
      });
    }
  });
  // Remove duplicates and sort by name
  const uniqueStops = allStops.filter((stop, index, self) =>
    index === self.findIndex(s => s.name === stop.name)
  );
  return uniqueStops.sort((a, b) => a.name.localeCompare(b.name));
};

export const getRoutesByMode = (mode: TransportMode): RouteData[] => {
  return mergedRoutes.filter(route => mapRouteMode(route.mode) === mode);
};

export const getAllRoutes = (): RouteData[] => {
  return mergedRoutes;
};

export const searchStops = (query: string, stops: RouteStop[]): RouteStop[] => {
  if (!query.trim()) {
    return stops;
  }
  
  const searchTerm = query.toLowerCase();
  return stops.filter(stop => 
    stop.name.toLowerCase().includes(searchTerm) ||
    stop.address.toLowerCase().includes(searchTerm) ||
    (stop.routeId && stop.routeId.toLowerCase().includes(searchTerm))
  );
};