import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity, Modal } from 'react-native';
import { Text, TextInput, Portal, Surface, Chip } from 'react-native-paper';
import { TransportMode } from '../types/navigation';
import { RouteStop } from '../services/routeDataService';

export interface Stop {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  modes: TransportMode[];
}

interface Props {
  visible: boolean;
  onDismiss: () => void;
  onSelectStop: (stop: Stop | RouteStop) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  stops: (Stop | RouteStop)[];
  placeholder?: string;
}

const TRANSPORT_MODE_COLORS: Record<TransportMode, string> = {
  'speedo': '#2196F3',
  'metrobus': '#4CAF50',
  'orange-line': '#FF9800',
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: 'white',
    maxHeight: '70%',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
  },
  searchInput: {
    marginBottom: 8,
  },
  listContainer: {
    maxHeight: 400,
  },
  stopItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  stopName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  stopAddress: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  modesContainer: {
    flexDirection: 'row',
    gap: 4,
  },
  modeIndicator: {
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modeText: {
    fontSize: 10,
    color: 'white',
    fontWeight: 'bold',
  },
  emptyState: {
    padding: 32,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  routeIndicator: {
    backgroundColor: '#e3f2fd',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    marginBottom: 4,
  },
  routeIndicatorText: {
    fontSize: 10,
    color: '#1976d2',
    fontWeight: 'bold',
  },
  stopHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
});

export const StopsDropdown: React.FC<Props> = ({
  visible,
  onDismiss,
  onSelectStop,
  searchQuery,
  onSearchChange,
  stops,
  placeholder = "Search for stops...",
}) => {
  const [filteredStops, setFilteredStops] = useState<(Stop | RouteStop)[]>(stops);

  useEffect(() => {
    console.log('StopsDropdown: stops changed, count:', stops.length);
    if (searchQuery.trim() === '') {
      setFilteredStops(stops);
    } else {
      const filtered = stops.filter(stop =>
        stop.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        stop.address.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredStops(filtered);
    }
  }, [searchQuery, stops]);

  const renderStopItem = ({ item }: { item: Stop | RouteStop }) => {
    const isRouteStop = 'isRoute' in item && item.isRoute;
    
    return (
      <TouchableOpacity
        style={styles.stopItem}
        onPress={() => {
          console.log('Stop item pressed:', item.name);
          onSelectStop(item);
          onDismiss();
        }}
      >
        <View style={styles.stopHeader}>
          <Text style={styles.stopName}>{item.name}</Text>
          {isRouteStop && (
            <View style={styles.routeIndicator}>
              <Text style={styles.routeIndicatorText}>ROUTE</Text>
            </View>
          )}
        </View>
        <Text style={styles.stopAddress}>{item.address}</Text>
        <View style={styles.modesContainer}>
          {item.modes.map((mode) => (
            <View
              key={mode}
              style={[
                styles.modeIndicator,
                { backgroundColor: TRANSPORT_MODE_COLORS[mode] }
              ]}
            >
              <Text style={styles.modeText}>
                {mode === 'orange-line' ? 'O' : mode[0].toUpperCase()}
              </Text>
            </View>
          ))}
        </View>
      </TouchableOpacity>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyText}>
        {searchQuery.trim() === '' 
          ? `No stops available (${stops.length} total)`
          : `No stops found for "${searchQuery}"`
        }
      </Text>
    </View>
  );

  console.log('StopsDropdown render:', {
    visible,
    stopsCount: stops.length,
    filteredCount: filteredStops.length,
    searchQuery
  });

  if (!visible) return null;

  return (
    <Portal>
      <Modal
        visible={visible}
        animationType="slide"
        transparent
        onRequestClose={onDismiss}
      >
        <TouchableOpacity 
          style={styles.overlay} 
          activeOpacity={1} 
          onPress={onDismiss}
        >
          <TouchableOpacity activeOpacity={1}>
            <Surface style={styles.container}>
              <View style={styles.header}>
                <Text style={styles.title}>Select Location ({stops.length} available)</Text>
                <TextInput
                  mode="outlined"
                  placeholder={placeholder}
                  value={searchQuery}
                  onChangeText={onSearchChange}
                  style={styles.searchInput}
                  left={<TextInput.Icon icon="magnify" />}
                  autoFocus
                />
              </View>
              
              <View style={styles.listContainer}>
                <FlatList
                  data={filteredStops}
                  renderItem={renderStopItem}
                  keyExtractor={(item) => item.id}
                  ListEmptyComponent={renderEmptyState}
                  showsVerticalScrollIndicator={false}
                />
              </View>
            </Surface>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </Portal>
  );
};
