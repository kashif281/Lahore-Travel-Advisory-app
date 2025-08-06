// Offline geocoding service for Lahore using local area data
export interface Coordinate {
  latitude: number;
  longitude: number;
}

export interface LocationInfo {
  coordinate: Coordinate;
  address: string;
  name: string;
}

// Comprehensive Lahore area mapping with improved precision
const LAHORE_AREAS = [
  // Central Lahore - High precision areas
  { name: "Gulberg Main Market", lat: 31.5204, lng: 74.3587, radius: 0.005 },
  { name: "Gulberg III", lat: 31.5180, lng: 74.3520, radius: 0.008 },
  { name: "Liberty Market", lat: 31.5107, lng: 74.3520, radius: 0.005 },
  { name: "MM Alam Road", lat: 31.5165, lng: 74.3425, radius: 0.008 },
  { name: "Main Boulevard Gulberg", lat: 31.5180, lng: 74.3450, radius: 0.010 },
  { name: "Hussain Chowk", lat: 31.5150, lng: 74.3480, radius: 0.005 },
  
  // Old City - Precise landmarks
  { name: "Anarkali Bazaar", lat: 31.5733, lng: 74.3182, radius: 0.005 },
  { name: "Mall Road", lat: 31.5656, lng: 74.3242, radius: 0.008 },
  { name: "GPO Chowk", lat: 31.5704, lng: 74.3387, radius: 0.004 },
  { name: "Data Darbar", lat: 31.5789, lng: 74.3406, radius: 0.005 },
  { name: "Bhati Gate", lat: 31.5820, lng: 74.3290, radius: 0.004 },
  { name: "Delhi Gate", lat: 31.5790, lng: 74.3350, radius: 0.004 },
  { name: "Lohari Gate", lat: 31.5800, lng: 74.3250, radius: 0.004 },
  
  // Cantt Area - Military and residential
  { name: "Fortress Stadium", lat: 31.5092, lng: 74.3441, radius: 0.005 },
  { name: "Cavalry Ground", lat: 31.5050, lng: 74.3380, radius: 0.008 },
  { name: "Mall Road Cantt", lat: 31.5020, lng: 74.3420, radius: 0.006 },
  { name: "Sarwar Road", lat: 31.5000, lng: 74.3400, radius: 0.008 },
  
  // Model Town - Residential sectors
  { name: "Model Town A Block", lat: 31.4850, lng: 74.2800, radius: 0.008 },
  { name: "Model Town B Block", lat: 31.4820, lng: 74.2820, radius: 0.008 },
  { name: "Model Town C Block", lat: 31.4800, lng: 74.2850, radius: 0.008 },
  { name: "Model Town Link Road", lat: 31.4850, lng: 74.2850, radius: 0.010 },
  
  // DHA - Defense phases
  { name: "DHA Phase 1", lat: 31.4704, lng: 74.4087, radius: 0.012 },
  { name: "DHA Phase 2", lat: 31.4604, lng: 74.4187, radius: 0.012 },
  { name: "DHA Phase 3", lat: 31.4504, lng: 74.4287, radius: 0.012 },
  { name: "DHA Phase 4", lat: 31.4404, lng: 74.4387, radius: 0.012 },
  { name: "DHA Phase 5", lat: 31.4304, lng: 74.4487, radius: 0.012 },
  { name: "DHA Phase 6", lat: 31.4204, lng: 74.4587, radius: 0.012 },
  
  // Johar Town - Commercial and residential
  { name: "Johar Town Phase 1", lat: 31.4750, lng: 74.2950, radius: 0.010 },
  { name: "Johar Town Phase 2", lat: 31.4700, lng: 74.3000, radius: 0.010 },
  { name: "Emporium Mall", lat: 31.4750, lng: 74.3050, radius: 0.005 },
  { name: "Expo Center", lat: 31.4720, lng: 74.3020, radius: 0.008 },
  
  // Other major areas
  { name: "Faisal Town", lat: 31.4204, lng: 74.2787, radius: 0.015 },
  { name: "Garden Town", lat: 31.5004, lng: 74.3187, radius: 0.012 },
  { name: "Iqbal Town", lat: 31.5304, lng: 74.2987, radius: 0.015 },
  { name: "Samanabad", lat: 31.5504, lng: 74.2987, radius: 0.012 },
  { name: "Shahdara", lat: 31.5804, lng: 74.3687, radius: 0.015 },
  
  // Transport and commercial hubs
  { name: "Railway Station", lat: 31.5590, lng: 74.3407, radius: 0.008 },
  { name: "Badami Bagh", lat: 31.5650, lng: 74.3450, radius: 0.010 },
  { name: "University of Punjab", lat: 31.5804, lng: 74.3287, radius: 0.010 },
  { name: "Walled City", lat: 31.5833, lng: 74.3333, radius: 0.010 },
  { name: "Lahore Fort", lat: 31.5881, lng: 74.3317, radius: 0.004 },
  { name: "Badshahi Mosque", lat: 31.5881, lng: 74.3142, radius: 0.004 },
  
  // Major intersections and transport hubs
  { name: "Kalma Chowk", lat: 31.5006, lng: 74.3333, radius: 0.005 },
  { name: "Chauburji", lat: 31.5104, lng: 74.3287, radius: 0.005 },
  { name: "Thokar Niaz Baig", lat: 31.4504, lng: 74.3587, radius: 0.008 },
  { name: "Gajjumata", lat: 31.4204, lng: 74.2987, radius: 0.008 },
  { name: "Yateem Khana Chowk", lat: 31.5500, lng: 74.3200, radius: 0.005 },
  
  // Shopping and commercial areas
  { name: "Packages Mall", lat: 31.4690, lng: 74.4020, radius: 0.004 },
  { name: "Xinhua Mall", lat: 31.5200, lng: 74.3600, radius: 0.004 },
  { name: "Pace Shopping Mall", lat: 31.4750, lng: 74.4100, radius: 0.004 },
  { name: "Mall of Lahore", lat: 31.4650, lng: 74.4050, radius: 0.004 },
  
  // Educational institutions
  { name: "LUMS", lat: 31.4180, lng: 74.4065, radius: 0.008 },
  { name: "UET Lahore", lat: 31.5804, lng: 74.3587, radius: 0.008 },
  { name: "Government College", lat: 31.5700, lng: 74.3200, radius: 0.006 },
  
  // Hospitals and medical
  { name: "Mayo Hospital", lat: 31.5650, lng: 74.3350, radius: 0.006 },
  { name: "Services Hospital", lat: 31.5450, lng: 74.3250, radius: 0.006 },
  { name: "Jinnah Hospital", lat: 31.5550, lng: 74.3150, radius: 0.006 },
];

// Calculate distance between two coordinates
const calculateDistance = (coord1: Coordinate, coord2: Coordinate): number => {
  const R = 6371; // Earth's radius in kilometers
  const dLat = toRadians(coord2.latitude - coord1.latitude);
  const dLon = toRadians(coord2.longitude - coord1.longitude);
  
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(coord1.latitude)) *
      Math.cos(toRadians(coord2.latitude)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

const toRadians = (degrees: number): number => {
  return degrees * (Math.PI / 180);
};

// Enhanced location detection with multiple matching strategies
export const offlineReverseGeocode = (coordinate: Coordinate): LocationInfo => {
  let bestMatch = null;
  let minDistance = Infinity;
  let matchesInRadius = [];
  
  // First pass: Find all areas within their defined radius
  for (const area of LAHORE_AREAS) {
    const distance = calculateDistance(coordinate, { latitude: area.lat, longitude: area.lng });
    
    if (distance <= area.radius) {
      matchesInRadius.push({ area, distance });
    }
    
    // Also track the closest area overall
    if (distance < minDistance) {
      minDistance = distance;
      bestMatch = area;
    }
  }
  
  // If we have matches within radius, pick the closest one
  if (matchesInRadius.length > 0) {
    const closest = matchesInRadius.sort((a, b) => a.distance - b.distance)[0];
    return {
      coordinate,
      name: closest.area.name,
      address: `${closest.area.name}, Lahore`,
    };
  }
  
  // If no exact matches but we have a close area (within 2km), use it with distance info
  if (bestMatch && minDistance <= 2.0) {
    const distanceText = minDistance < 0.5 ? 'near' : `${minDistance.toFixed(1)}km from`;
    return {
      coordinate,
      name: `${distanceText} ${bestMatch.name}`,
      address: `${distanceText} ${bestMatch.name}, Lahore`,
    };
  }
  
  // Enhanced fallback with more precise area detection
  const lat = coordinate.latitude;
  const lng = coordinate.longitude;
  
  // More precise Lahore area detection
  if (lat >= 31.40 && lat <= 31.65 && lng >= 74.20 && lng <= 74.50) {
    // DHA area
    if (lat <= 31.48 && lng >= 74.40) {
      return {
        coordinate,
        name: "DHA Area",
        address: "Defense Housing Authority, Lahore",
      };
    }
    // Old City and surroundings
    else if (lat >= 31.55 && lng <= 74.35) {
      return {
        coordinate,
        name: "Old City Area",
        address: "Old City, Lahore",
      };
    }
    // Gulberg and central areas
    else if (lat >= 31.50 && lat <= 31.55 && lng >= 74.33 && lng <= 74.38) {
      return {
        coordinate,
        name: "Central Lahore",
        address: "Central Lahore, Punjab",
      };
    }
    // Cantt area
    else if (lat >= 31.49 && lat <= 31.52 && lng >= 74.33 && lng <= 74.36) {
      return {
        coordinate,
        name: "Cantt Area",
        address: "Cantonment, Lahore",
      };
    }
    // Model Town area
    else if (lat >= 31.47 && lat <= 31.50 && lng >= 74.27 && lng <= 74.32) {
      return {
        coordinate,
        name: "Model Town Area",
        address: "Model Town, Lahore",
      };
    }
    // Johar Town area
    else if (lat >= 31.46 && lat <= 31.49 && lng >= 74.29 && lng <= 74.32) {
      return {
        coordinate,
        name: "Johar Town Area",
        address: "Johar Town, Lahore",
      };
    }
    // General Lahore
    else {
      return {
        coordinate,
        name: "Lahore",
        address: "Lahore, Punjab",
      };
    }
  }
  
  // Final fallback for coordinates outside Lahore
  return {
    coordinate,
    name: "Selected Location",
    address: `Location (${coordinate.latitude.toFixed(4)}, ${coordinate.longitude.toFixed(4)})`,
  };
};

// Get nearby areas for suggestions
export const getNearbyAreas = (coordinate: Coordinate, limit: number = 5): LocationInfo[] => {
  const areas = LAHORE_AREAS.map(area => ({
    area,
    distance: calculateDistance(coordinate, { latitude: area.lat, longitude: area.lng })
  }))
  .sort((a, b) => a.distance - b.distance)
  .slice(0, limit);
  
  return areas.map(({ area }) => ({
    coordinate: { latitude: area.lat, longitude: area.lng },
    name: area.name,
    address: `${area.name}, Lahore`,
  }));
};

// Search areas by name
export const searchAreas = (query: string): LocationInfo[] => {
  const searchTerm = query.toLowerCase();
  const matchingAreas = LAHORE_AREAS.filter(area => 
    area.name.toLowerCase().includes(searchTerm)
  );
  
  return matchingAreas.map(area => ({
    coordinate: { latitude: area.lat, longitude: area.lng },
    name: area.name,
    address: `${area.name}, Lahore`,
  }));
};