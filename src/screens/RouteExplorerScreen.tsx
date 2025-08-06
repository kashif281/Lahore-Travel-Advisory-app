import React, { useState } from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { Text, Searchbar, Chip, Card, List } from 'react-native-paper';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5'
  },
  searchContainer: {
    padding: 16,
    backgroundColor: '#fff',
    marginBottom: 8,
  },
  filterContainer: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 8
  },
  chip: {
    borderWidth: 1,
    borderColor: '#ddd',
  },
  card: {
    marginHorizontal: 16,
    marginBottom: 12,
    elevation: 2,
    borderRadius: 8,
  },
  routeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  stopsList: {
    fontWeight: 'bold',
    marginTop: 8,
    marginBottom: 4,
    paddingHorizontal: 16
  }
});
import { Route, TransportMode } from '../types/navigation';

// Mock routes data
const MOCK_ROUTES: Route[] = [
  {
    mode: 'metrobus',
    routeId: 'M1',
    name: 'Gajjumata - Shahdara',
    stops: [
      { name: 'Gajjumata Station', lat: 31.4815, lng: 74.2415, modes: ['metrobus'] },
      { name: 'Kalma Station', lat: 31.5006, lng: 74.3333, modes: ['metrobus'] },
      { name: 'Shahdara Station', lat: 31.5815, lng: 74.2815, modes: ['metrobus'] },
    ],
    firstService: '06:00',
    lastService: '22:00',
    frequencyMin: 7,
    fare: 30,
  },
  {
    mode: 'speedo',
    routeId: 'S1',
    name: 'Thokar - Jallo',
    stops: [
      { name: 'Thokar Bus Stop', lat: 31.4815, lng: 74.2415, modes: ['speedo'] },
      { name: 'Jallo Terminal', lat: 31.5815, lng: 74.2815, modes: ['speedo'] },
    ],
    firstService: '06:30',
    lastService: '21:30',
    frequencyMin: 10,
    fare: 15,
  },
  {
    mode: 'orange-line',
    routeId: 'O1',
    name: 'Ali Town - Dera Gujran',
    stops: [
      { name: 'Ali Town Station', lat: 31.4615, lng: 74.2215, modes: ['orange-line'] },
      { name: 'Dera Gujran Station', lat: 31.5615, lng: 74.3815, modes: ['orange-line'] },
    ],
    firstService: '06:00',
    lastService: '22:00',
    frequencyMin: 5,
    fare: 40,
  },
];

const TRANSPORT_MODE_COLORS: Record<TransportMode, string> = {
  'speedo': '#2196F3',
  'metrobus': '#4CAF50',
  'orange-line': '#FF9800',
};

export default function RouteExplorerScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMode, setSelectedMode] = useState<TransportMode | null>(null);
  const [expandedRoute, setExpandedRoute] = useState<string | null>(null);

  const filteredRoutes = MOCK_ROUTES.filter(route => {
    const matchesSearch = route.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesMode = !selectedMode || route.mode === selectedMode;
    return matchesSearch && matchesMode;
  });

  const handleModeSelect = (mode: TransportMode) => {
    setSelectedMode(selectedMode === mode ? null : mode);
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.searchContainer}>
        <Searchbar
          placeholder="Search routes"
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={{ marginBottom: 16 }}
        />

        <View style={styles.filterContainer}>
          {Object.entries(TRANSPORT_MODE_COLORS).map(([mode, color]) => (
            <Chip
              key={mode}
              selected={selectedMode === mode}
              onPress={() => handleModeSelect(mode as TransportMode)}
              style={[styles.chip, { backgroundColor: selectedMode === mode ? color : '#fff' }]}
              textStyle={{ color: selectedMode === mode ? '#fff' : '#000' }}
            >
              {mode.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
            </Chip>
          ))}
        </View>

        {filteredRoutes.map((route) => (
          <Card key={route.routeId} style={styles.card}>
            <Card.Content>
              <View style={styles.routeHeader}>
                <Text style={{ fontSize: 18, fontWeight: 'bold' }}>{route.name}</Text>
                <Chip
                  style={{ backgroundColor: TRANSPORT_MODE_COLORS[route.mode] }}
                  textStyle={{ color: '#fff' }}
                >
                  {route.routeId}
                </Chip>
              </View>

              <List.Accordion
                title="Route Details"
                expanded={expandedRoute === route.routeId}
                onPress={() => setExpandedRoute(expandedRoute === route.routeId ? null : route.routeId)}
              >
                <List.Item
                  title="Service Hours"
                  description={`${route.firstService} - ${route.lastService}`}
                  left={props => <List.Icon {...props} icon="clock-outline" />}
                />
                <List.Item
                  title="Frequency"
                  description={`Every ${route.frequencyMin} minutes`}
                  left={props => <List.Icon {...props} icon="timer-outline" />}
                />
                <List.Item
                  title="Fare"
                  description={`Rs. ${route.fare}`}
                  left={props => <List.Icon {...props} icon="cash" />}
                />
                <Text style={styles.stopsList}>Stops:</Text>
                {route.stops.map((stop, index) => (
                  <List.Item
                    key={index}
                    title={stop.name}
                    left={props => <List.Icon {...props} icon="map-marker" />}
                  />
                ))}
              </List.Accordion>
            </Card.Content>
          </Card>
        ))}
      </View>
    </ScrollView>
  );
}