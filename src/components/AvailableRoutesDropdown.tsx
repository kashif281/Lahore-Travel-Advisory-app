import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Card, Chip, ActivityIndicator } from 'react-native-paper';
import { TransportMode } from '../types/navigation';

export interface AvailableRoute {
  id: string;
  name: string;
  mode: TransportMode;
  from: string;
  to: string;
  distance: number; // in km
  color: string;
}

interface Props {
  routes: AvailableRoute[];
  loading: boolean;
  onRouteSelect: (route: AvailableRoute) => void;
  selectedRouteId?: string;
}

const TRANSPORT_MODE_COLORS: Record<TransportMode, string> = {
  'speedo': '#2196F3',
  'metrobus': '#4CAF50',
  'orange-line': '#FF9800',
};

const TRANSPORT_MODE_ICONS: Record<TransportMode, string> = {
  'speedo': '🚌',
  'metrobus': '🚌',
  'orange-line': '🚇',
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
  },
  header: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  loadingContainer: {
    padding: 20,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 8,
    color: '#666',
  },
  routeCard: {
    marginBottom: 8,
    elevation: 2,
  },
  selectedRouteCard: {
    borderWidth: 2,
    borderColor: '#2196F3',
  },
  routeContent: {
    paddingVertical: 12,
  },
  routeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  routeIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  routeName: {
    fontSize: 16,
    fontWeight: 'bold',
    flex: 1,
    color: '#333',
  },
  routeDistance: {
    fontSize: 12,
    color: '#666',
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  routeDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  modeChip: {
    alignSelf: 'flex-start',
  },
  emptyState: {
    padding: 20,
    alignItems: 'center',
  },
  emptyStateText: {
    color: '#666',
    textAlign: 'center',
    fontSize: 14,
  },
});

export const AvailableRoutesDropdown: React.FC<Props> = ({
  routes,
  loading,
  onRouteSelect,
  selectedRouteId,
}) => {
  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.header}>Finding Available Routes...</Text>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color="#2196F3" />
          <Text style={styles.loadingText}>Searching for nearby routes</Text>
        </View>
      </View>
    );
  }

  if (routes.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.header}>Available Routes</Text>
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateText}>
            No routes found near the selected location.{'\n'}
            Try selecting a different area on the map.
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>
        Available Routes ({routes.length} found)
      </Text>
      
      {routes.map((route) => (
        <Card
          key={route.id}
          style={[
            styles.routeCard,
            selectedRouteId === route.id && styles.selectedRouteCard,
          ]}
          onPress={() => onRouteSelect(route)}
        >
          <Card.Content style={styles.routeContent}>
            <View style={styles.routeHeader}>
              <Text style={styles.routeIcon}>
                {TRANSPORT_MODE_ICONS[route.mode]}
              </Text>
              <Text style={styles.routeName}>{route.name}</Text>
              <Text style={styles.routeDistance}>
                {route.distance.toFixed(1)}km away
              </Text>
            </View>
            
            <Text style={styles.routeDescription}>
              {route.from} → {route.to}
            </Text>
            
            <Chip
              style={[
                styles.modeChip,
                { backgroundColor: TRANSPORT_MODE_COLORS[route.mode] }
              ]}
              textStyle={{ color: '#fff', fontSize: 12 }}
            >
              {route.mode.split('-').map(word => 
                word.charAt(0).toUpperCase() + word.slice(1)
              ).join(' ')}
            </Chip>
          </Card.Content>
        </Card>
      ))}
    </View>
  );
};
