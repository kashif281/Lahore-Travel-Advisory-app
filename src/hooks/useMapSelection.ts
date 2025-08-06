import { useState, useCallback } from 'react';
import * as Location from 'expo-location';
import { Alert } from 'react-native';

export interface MapCoordinate {
  latitude: number;
  longitude: number;
}

export interface LocationInfo {
  coordinate: MapCoordinate;
  address: string;
  name?: string;
}

export type LocationField = 'from' | 'to';

export const useMapSelection = () => {
  const [selectedField, setSelectedField] = useState<LocationField>('from');
  const [isReverseGeocoding, setIsReverseGeocoding] = useState(false);

  const reverseGeocode = useCallback(async (coordinate: MapCoordinate): Promise<LocationInfo | null> => {
    try {
      setIsReverseGeocoding(true);
      
      const [place] = await Location.reverseGeocodeAsync({
        latitude: coordinate.latitude,
        longitude: coordinate.longitude,
      });

      if (place) {
        // Build a readable address, avoiding Plus Codes and generic codes
        const addressParts = [];
        
        // Only add meaningful address components
        if (place.street && !place.street.match(/^[A-Z0-9+]+$/)) {
          addressParts.push(place.street);
        }
        if (place.district && place.district !== place.street) {
          addressParts.push(place.district);
        }
        if (place.city && place.city !== place.district) {
          addressParts.push(place.city);
        }
        if (place.region && place.region !== place.city) {
          addressParts.push(place.region);
        }

        // Create a meaningful address or use a generic location name
        let address;
        let name;
        
        if (addressParts.length > 0) {
          address = addressParts.join(', ');
          name = addressParts[0]; // Use the most specific part as name
        } else {
          // Fallback to area-based naming
          const lat = coordinate.latitude;
          const lng = coordinate.longitude;
          
          // Simple area detection for Lahore
          if (lat >= 31.45 && lat <= 31.65 && lng >= 74.20 && lng <= 74.45) {
            if (lat >= 31.50 && lng >= 74.30) {
              name = "Gulberg Area";
              address = "Gulberg, Lahore";
            } else if (lat >= 31.55 && lng <= 74.35) {
              name = "Old City Area";
              address = "Old City, Lahore";
            } else if (lat <= 31.52 && lng >= 74.35) {
              name = "Cantt Area";
              address = "Cantt, Lahore";
            } else {
              name = "Lahore Location";
              address = "Lahore, Punjab";
            }
          } else {
            name = "Selected Location";
            address = `Location (${coordinate.latitude.toFixed(4)}, ${coordinate.longitude.toFixed(4)})`;
          }
        }

        return {
          coordinate,
          address,
          name,
        };
      }

      // Fallback if no place found
      return {
        coordinate,
        address: `Location (${coordinate.latitude.toFixed(4)}, ${coordinate.longitude.toFixed(4)})`,
        name: "Selected Location",
      };
    } catch (error) {
      console.error('Reverse geocoding failed:', error);
      
      return {
        coordinate,
        address: `Location (${coordinate.latitude.toFixed(4)}, ${coordinate.longitude.toFixed(4)})`,
        name: "Selected Location",
      };
    } finally {
      setIsReverseGeocoding(false);
    }
  }, []);

  const handleMapPress = useCallback(async (
    coordinate: MapCoordinate,
    onLocationUpdate: (field: LocationField, locationInfo: LocationInfo) => void
  ) => {
    const locationInfo = await reverseGeocode(coordinate);
    
    if (locationInfo) {
      onLocationUpdate(selectedField, locationInfo);
    }
  }, [selectedField, reverseGeocode]);

  return {
    selectedField,
    setSelectedField,
    isReverseGeocoding,
    reverseGeocode,
    handleMapPress,
  };
};
