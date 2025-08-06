import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Button, Chip } from 'react-native-paper';
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from 'react-native-maps';
import { TransportMode } from '../types/navigation';

const LAHORE_REGION = {
  latitude: 31.5204,
  longitude: 74.3587,
  latitudeDelta: 0.0922,
  longitudeDelta: 0.0421,
};

// Mock data - Replace with actual route data
const TRANSPORT_MODES: { mode: TransportMode; color: string }[] = [
  { mode: 'speedo', color: '#2196F3' },
  { mode: 'metrobus', color: '#4CAF50' },
  { mode: 'orange-line', color: '#FF9800' },
];

export default function MapViewScreen() {
  const [selectedModes, setSelectedModes] = useState<TransportMode[]>(['speedo', 'metrobus', 'orange-line']);

  const toggleMode = (mode: TransportMode) => {
    setSelectedModes(prev =>
      prev.includes(mode)
        ? prev.filter(m => m !== mode)
        : [...prev, mode]
    );
  };

  return (
    <View style={styles.container}>
      <MapView
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        initialRegion={LAHORE_REGION}
        showsUserLocation
        showsMyLocationButton
      >
        {/* TODO: Add markers for stations and polylines for routes */}
      </MapView>

      <View style={styles.filterContainer}>
        {TRANSPORT_MODES.map(({ mode, color }) => (
          <Chip
            key={mode}
            selected={selectedModes.includes(mode)}
            onPress={() => toggleMode(mode)}
            style={{ backgroundColor: selectedModes.includes(mode) ? color : '#fff' }}
            textStyle={{ color: selectedModes.includes(mode) ? '#fff' : '#000' }}
          >
            {mode.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
          </Chip>
        ))}
      </View>

      <View style={styles.buttonContainer}>
        <Button
          mode="contained"
          onPress={() => {}}
        >
          Find Nearest Station
        </Button>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  map: {
    flex: 1,
  },
  filterContainer: {
    position: 'absolute',
    top: 10,
    left: 10,
    right: 10,
    flexDirection: 'row',
    gap: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    padding: 8,
    borderRadius: 8,
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
});
