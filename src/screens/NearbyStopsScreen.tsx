import React, { useState, useEffect } from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { Text, Card, ActivityIndicator, Chip, Button } from 'react-native-paper';
import * as Location from 'expo-location';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { Station, TransportMode } from '../types/navigation';
import { getCurrentLocation, getNearbyStationsSorted, navigateToLocation, formatDistance } from '../utils/navigationHelper';

// Mock nearby stations data
const MOCK_STATIONS: Station[] = [
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
  map: {
    flex: 1,
  },
  content: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    maxHeight: '50%',
    padding: 16,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  stationCard: {
    marginBottom: 12,
    elevation: 2,
    borderRadius: 8,
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
  },
});

export default function NearbyStopsScreen() {
  const [userLocation, setUserLocation] = useState<Location.LocationObject | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [nearbyStations, setNearbyStations] = useState<Station[]>([]);
  const [selectedStation, setSelectedStation] = useState<Station | null>(null);

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Permission to access location was denied');
        return;
      }

      const location = await getCurrentLocation();
      setUserLocation(location);
      
      if (location) {
        const sortedStations = getNearbyStationsSorted(location.coords, MOCK_STATIONS);
        setNearbyStations(sortedStations);
      }
    })();
  }, []);

  if (!userLocation) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
        {errorMsg && <Text style={{ marginTop: 8, color: '#f44336' }}>{errorMsg}</Text>}
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <MapView
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        initialRegion={{
          latitude: userLocation.coords.latitude,
          longitude: userLocation.coords.longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        }}
        showsUserLocation
      >
        {nearbyStations.map((station, index) => (
          <Marker
            key={index}
            coordinate={{ latitude: station.lat, longitude: station.lng }}
            title={station.name}
            onPress={() => {
              setSelectedStation(station);
              navigateToLocation({ latitude: station.lat, longitude: station.lng }, station.name);
            }}
          />
        ))}
      </MapView>

      <ScrollView style={[styles.content, { backgroundColor: '#f3f4f6' }]}>
        <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 16 }}>Nearby Stations & Stops</Text>
        
        {nearbyStations.map((station, index) => (
          <Card
            key={index}
            style={styles.stationCard}
          >
            <Card.Content>
              <Text style={{ fontSize: 18, fontWeight: 'bold' }}>{station.name}</Text>
              <View style={styles.chipContainer}>
                {station.modes.map((mode) => (
                  <Chip
                    key={mode}
                    style={{ backgroundColor: TRANSPORT_MODE_COLORS[mode] }}
                    textStyle={{ color: '#fff' }}
                  >
                    {mode.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                  </Chip>
                ))}
              </View>
              <Text style={{ marginTop: 8, color: '#666' }}>
                {formatDistance((station as any).distance || 0)} away
              </Text>
              <Button
                mode="contained"
                style={{ marginTop: 8 }}
                onPress={() => {
                  setSelectedStation(station);
                  navigateToLocation({ latitude: station.lat, longitude: station.lng }, station.name);
                }}
              >
                Navigate Here
              </Button>
            </Card.Content>
          </Card>
        ))}
      </ScrollView>
    </View>
  );
}