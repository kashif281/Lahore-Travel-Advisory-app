import React, { useState, useEffect } from 'react';
import { View, ScrollView, StyleSheet, FlatList } from 'react-native';
import { Text, Card, ActivityIndicator, Chip, Button, List, Divider } from 'react-native-paper';
import * as Location from 'expo-location';
import { Station, TransportMode } from '../types/navigation';
import { 
  getCurrentLocation, 
  getNearbyStationsSorted, 
  navigateToLocation, 
  formatDistance 
} from '../utils/navigationHelper';

// Mock stations data for Lahore
const LAHORE_STATIONS: Station[] = [
  {
    name: 'Kalma Chowk Station',
    lat: 31.5006,
    lng: 74.3333,
    modes: ['metrobus'],
  },
  {
    name: 'Ichra Stop',
    lat: 31.5104,
    lng: 74.3287,
    modes: ['speedo'],
  },
  {
    name: 'Lahore Railway Station',
    lat: 31.5590,
    lng: 74.3407,
    modes: ['orange-line'],
  },
  {
    name: 'Liberty Market',
    lat: 31.5107,
    lng: 74.3520,
    modes: ['speedo'],
  },
  {
    name: 'Gulberg Main Boulevard',
    lat: 31.5165,
    lng: 74.3425,
    modes: ['metrobus', 'speedo'],
  },
  {
    name: 'Fortress Stadium',
    lat: 31.5092,
    lng: 74.3441,
    modes: ['speedo'],
  },
  {
    name: 'Mall Road',
    lat: 31.5656,
    lng: 74.3242,
    modes: ['speedo'],
  },
  {
    name: 'Anarkali Bazaar',
    lat: 31.5733,
    lng: 74.3182,
    modes: ['speedo'],
  },
  {
    name: 'Data Darbar',
    lat: 31.5789,
    lng: 74.3406,
    modes: ['orange-line'],
  },
  {
    name: 'Shahdara',
    lat: 31.6225,
    lng: 74.3570,
    modes: ['orange-line'],
  },
];

const TRANSPORT_MODE_COLORS: Record<TransportMode, string> = {
  'speedo': '#2196F3',
  'metrobus': '#4CAF50',
  'orange-line': '#FF9800',
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: 'white',
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  headerText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  subHeaderText: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  listContainer: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  stationItem: {
    backgroundColor: 'white',
    marginBottom: 8,
    borderRadius: 8,
    elevation: 1,
  },
  stationContent: {
    paddingVertical: 12,
  },
  stationName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  distanceText: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 8,
    marginBottom: 8,
  },
  chip: {
    height: 28,
  },
  chipText: {
    fontSize: 12,
    color: '#fff',
  },
  navigationButton: {
    marginTop: 4,
  },
  errorText: {
    color: '#f44336',
    textAlign: 'center',
    marginTop: 8,
  },
});

interface StationWithDistance extends Station {
  distance: number;
}

export default function NearestStationsScreen() {
  const [userLocation, setUserLocation] = useState<Location.LocationObject | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [nearestStations, setNearestStations] = useState<StationWithDistance[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadNearestStations();
  }, []);

  const loadNearestStations = async () => {
    try {
      setLoading(true);
      const { status } = await Location.requestForegroundPermissionsAsync();
      
      if (status !== 'granted') {
        setErrorMsg('Location permission is required to find nearest stations');
        setLoading(false);
        return;
      }

      const location = await getCurrentLocation();
      
      if (!location) {
        setErrorMsg('Unable to get your current location. Please try again.');
        setLoading(false);
        return;
      }

      setUserLocation(location);
      
      // Get stations sorted by distance
      const sortedStations = getNearbyStationsSorted(location.coords, LAHORE_STATIONS);
      setNearestStations(sortedStations as StationWithDistance[]);
      
    } catch (error) {
      console.error('Error loading nearest stations:', error);
      setErrorMsg('Failed to load nearest stations. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleNavigateToStation = async (station: StationWithDistance) => {
    try {
      await navigateToLocation(
        { latitude: station.lat, longitude: station.lng },
        station.name
      );
    } catch (error) {
      console.error('Navigation error:', error);
    }
  };

  const renderStationItem = ({ item: station }: { item: StationWithDistance }) => (
    <Card style={styles.stationItem}>
      <Card.Content style={styles.stationContent}>
        <Text style={styles.stationName}>{station.name}</Text>
        
        <Text style={styles.distanceText}>
          📍 {formatDistance(station.distance)} away
        </Text>
        
        <View style={styles.chipContainer}>
          {station.modes.map((mode) => (
            <Chip
              key={mode}
              style={[
                styles.chip,
                { backgroundColor: TRANSPORT_MODE_COLORS[mode] }
              ]}
              textStyle={styles.chipText}
            >
              {mode.split('-').map(word => 
                word.charAt(0).toUpperCase() + word.slice(1)
              ).join(' ')}
            </Chip>
          ))}
        </View>
        
        <Button
          mode="contained"
          style={styles.navigationButton}
          onPress={() => handleNavigateToStation(station)}
          icon="navigation"
        >
          Navigate to Station
        </Button>
      </Card.Content>
    </Card>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2196F3" />
        <Text style={{ marginTop: 16, fontSize: 16 }}>
          Finding nearest stations...
        </Text>
      </View>
    );
  }

  if (errorMsg) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.errorText}>{errorMsg}</Text>
        <Button 
          mode="contained" 
          onPress={loadNearestStations}
          style={{ marginTop: 16 }}
        >
          Try Again
        </Button>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>Nearest Stations</Text>
        <Text style={styles.subHeaderText}>
          {nearestStations.length} stations found near you
        </Text>
      </View>
      
      <FlatList
        data={nearestStations}
        renderItem={renderStationItem}
        keyExtractor={(item, index) => `${item.name}-${index}`}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}
