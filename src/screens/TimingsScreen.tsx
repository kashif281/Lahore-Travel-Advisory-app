import React, { useState } from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { Text, Card, Chip, Searchbar, List } from 'react-native-paper';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5'
  },
  searchContainer: {
    padding: 16,
    backgroundColor: 'white'
  },
  searchBar: {
    marginBottom: 8
  },
  filterContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8
  },
  chip: {
    marginRight: 8
  },
  card: {
    marginBottom: 16
  },
  routeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8
  },
  routeInfo: {
    flex: 1
  },
  routeTitle: {
    fontSize: 18,
    fontWeight: 'bold'
  },
  routeId: {
    color: '#666'
  }
});
import { TransportMode } from '../types/navigation';

interface ServiceTiming {
  routeId: string;
  name: string;
  mode: TransportMode;
  firstService: string;
  lastService: string;
  peakFrequency: number;
  offPeakFrequency: number;
  peakHours: string;
  status: 'On Time' | 'Delayed' | 'Suspended';
}

// Mock timing data
const MOCK_TIMINGS: ServiceTiming[] = [
  {
    routeId: 'M1',
    name: 'Gajjumata - Shahdara',
    mode: 'metrobus',
    firstService: '06:00',
    lastService: '22:00',
    peakFrequency: 5,
    offPeakFrequency: 8,
    peakHours: '07:00-10:00, 16:00-19:00',
    status: 'On Time',
  },
  {
    routeId: 'S1',
    name: 'Thokar - Jallo',
    mode: 'speedo',
    firstService: '06:30',
    lastService: '21:30',
    peakFrequency: 8,
    offPeakFrequency: 12,
    peakHours: '07:30-10:30, 16:30-19:30',
    status: 'Delayed',
  },
  {
    routeId: 'O1',
    name: 'Ali Town - Dera Gujran',
    mode: 'orange-line',
    firstService: '06:00',
    lastService: '22:00',
    peakFrequency: 4,
    offPeakFrequency: 6,
    peakHours: '07:00-10:00, 16:00-19:00',
    status: 'On Time',
  },
];

const TRANSPORT_MODE_COLORS: Record<TransportMode, string> = {
  'speedo': '#2196F3',
  'metrobus': '#4CAF50',
  'orange-line': '#FF9800',
};

const STATUS_COLORS = {
  'On Time': '#4CAF50',
  'Delayed': '#FF9800',
  'Suspended': '#F44336',
};

export default function TimingsScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMode, setSelectedMode] = useState<TransportMode | null>(null);

  const filteredTimings = MOCK_TIMINGS.filter(timing => {
    const matchesSearch = timing.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesMode = !selectedMode || timing.mode === selectedMode;
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
          style={styles.searchBar}
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

        {filteredTimings.map((timing) => (
          <Card key={timing.routeId} style={styles.card}>
            <Card.Content>
              <View style={styles.routeContainer}>
                <View style={styles.routeInfo}>
                  <Text style={styles.routeTitle}>{timing.name}</Text>
                  <Text style={styles.routeId}>{timing.routeId}</Text>
                </View>
                <Chip
                  style={{ backgroundColor: STATUS_COLORS[timing.status] }}
                  textStyle={{ color: '#fff' }}
                >
                  {timing.status}
                </Chip>
              </View>

              <List.Item
                title="Service Hours"
                description={`${timing.firstService} - ${timing.lastService}`}
                left={props => <List.Icon {...props} icon="clock-outline" />}
              />

              <List.Item
                title="Peak Hours"
                description={timing.peakHours}
                left={props => <List.Icon {...props} icon="clock-fast" />}
              />

              <List.Item
                title="Peak Frequency"
                description={`Every ${timing.peakFrequency} minutes`}
                left={props => <List.Icon {...props} icon="timer" />}
              />

              <List.Item
                title="Off-Peak Frequency"
                description={`Every ${timing.offPeakFrequency} minutes`}
                left={props => <List.Icon {...props} icon="timer-outline" />}
              />
            </Card.Content>
          </Card>
        ))}
      </View>
    </ScrollView>
  );
}