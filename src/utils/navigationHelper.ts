import * as Location from 'expo-location';
import { Linking, Alert } from 'react-native';

export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface LocationPermissionResult {
  granted: boolean;
  errorMessage?: string;
}

/**
 * Request location permissions and get current location
 */
export const getCurrentLocation = async (): Promise<Location.LocationObject | null> => {
  try {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      throw new Error('Location permission denied');
    }

    const location = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.High,
    });

    return location;
  } catch (error) {
    console.error('Error getting location:', error);
    return null;
  }
};

/**
 * Check if location permissions are granted
 */
export const checkLocationPermissions = async (): Promise<LocationPermissionResult> => {
  try {
    const { status } = await Location.getForegroundPermissionsAsync();
    
    if (status === 'granted') {
      return { granted: true };
    }
    
    const { status: newStatus } = await Location.requestForegroundPermissionsAsync();
    
    if (newStatus === 'granted') {
      return { granted: true };
    }
    
    return { 
      granted: false, 
      errorMessage: 'Location permission is required for navigation features' 
    };
  } catch (error) {
    return { 
      granted: false, 
      errorMessage: 'Failed to check location permissions' 
    };
  }
};

/**
 * Calculate distance between two coordinates (Haversine formula)
 */
export const calculateDistance = (
  coord1: Coordinates,
  coord2: Coordinates
): number => {
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
  const distance = R * c;
  
  return distance;
};

const toRadians = (degrees: number): number => {
  return degrees * (Math.PI / 180);
};

/**
 * Navigate to a location using external Google Maps app
 */
export const navigateToLocation = async (
  destination: Coordinates,
  destinationName?: string
): Promise<void> => {
  try {
    const currentLocation = await getCurrentLocation();
    
    if (!currentLocation) {
      Alert.alert('Error', 'Unable to get your current location');
      return;
    }

    const origin = `${currentLocation.coords.latitude},${currentLocation.coords.longitude}`;
    const dest = `${destination.latitude},${destination.longitude}`;
    
    // Try Google Maps first
    const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${dest}&travelmode=transit`;
    
    const canOpenGoogleMaps = await Linking.canOpenURL(googleMapsUrl);
    
    if (canOpenGoogleMaps) {
      await Linking.openURL(googleMapsUrl);
    } else {
      // Fallback to Apple Maps on iOS or default maps
      const appleMapsUrl = `http://maps.apple.com/?saddr=${origin}&daddr=${dest}&dirflg=r`;
      
      const canOpenAppleMaps = await Linking.canOpenURL(appleMapsUrl);
      
      if (canOpenAppleMaps) {
        await Linking.openURL(appleMapsUrl);
      } else {
        Alert.alert(
          'No Maps App',
          'Please install Google Maps or Apple Maps to use navigation'
        );
      }
    }
  } catch (error) {
    console.error('Navigation error:', error);
    Alert.alert('Error', 'Failed to open navigation. Please try again.');
  }
};

/**
 * Open Google Maps with transit directions
 */
export const openGoogleMapsTransit = async (
  origin: Coordinates,
  destination: Coordinates
): Promise<void> => {
  const originStr = `${origin.latitude},${origin.longitude}`;
  const destStr = `${destination.latitude},${destination.longitude}`;
  
  const url = `https://www.google.com/maps/dir/?api=1&origin=${originStr}&destination=${destStr}&travelmode=transit`;
  
  try {
    const supported = await Linking.canOpenURL(url);
    if (supported) {
      await Linking.openURL(url);
    } else {
      Alert.alert('Error', 'Google Maps is not available');
    }
  } catch (error) {
    console.error('Error opening Google Maps:', error);
    Alert.alert('Error', 'Failed to open Google Maps');
  }
};

/**
 * Format distance for display
 */
export const formatDistance = (distanceKm: number): string => {
  if (distanceKm < 1) {
    return `${Math.round(distanceKm * 1000)}m`;
  }
  return `${distanceKm.toFixed(1)}km`;
};

/**
 * Get nearby stations sorted by distance
 */
export const getNearbyStationsSorted = <T extends { name: string; lat: number; lng: number }>(
  userLocation: Coordinates,
  stations: T[]
): (T & { distance: number })[] => {
  return stations
    .map(station => ({
      ...station,
      distance: calculateDistance(userLocation, { latitude: station.lat, longitude: station.lng })
    }))
    .sort((a, b) => a.distance - b.distance);
};
