import React, { useState } from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { Text, Card, IconButton, Button, Menu, Divider, Chip } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
import commonStyles, { colors, spacing } from '../styles/common';
import routeData from '../../assets/routes.json';

type FavoritesScreenNavigationProp = NativeStackNavigationProp<RootStackParamList>;

type TransportMode = 'Speedo' | 'Metrobus' | 'OrangeLine';

const styles = StyleSheet.create({
  ...commonStyles,
  routeInfo: {
    marginTop: spacing.sm,
  },
  routeTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  routeText: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  modeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.xs,
  },
  modeChip: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 16,
    marginRight: spacing.xs,
    color: colors.surface,
  },
  modeText: {
    color: colors.surface,
    fontSize: 14,
  },
  lastUsed: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: spacing.sm,
  },
  actionButton: {
    marginTop: spacing.sm,
  },
  emptyText: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    padding: spacing.md,
  },
});

interface FavoriteRoute {
  id: string;
  title: string;
  startLocation: string;
  endLocation: string;
  mode: TransportMode;
  lastUsed: string;
  stops?: {
    name: string;
    lat: number;
    lng: number;
  }[];
}

// Convert route data to favorite routes format
const initialFavorites: FavoriteRoute[] = (routeData as { routes: Array<{ 
  id: string; 
  name: string; 
  origin: string; 
  destination: string; 
  mode: string; 
  stops: string[];
  frequency: string;
  fare: number;
  operatingHours: {
    weekday: { start: string; end: string };
    weekend: { start: string; end: string };
  }
}> }).routes.map(route => ({
  id: route.id,
  title: route.name,
  startLocation: route.origin,
  endLocation: route.destination,
  mode: route.mode as TransportMode,
  lastUsed: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toLocaleDateString(), // Random date within last week
  stops: route.stops.map(stop => ({
    name: stop,
    lat: 0, // These would come from actual coordinates in a real app
    lng: 0,
  })),
}));

const FavoritesScreen = ({ navigation }: { navigation: FavoritesScreenNavigationProp }) => {
  const [menuVisible, setMenuVisible] = useState<string | null>(null);
  const [favoriteRoutes, setFavoriteRoutes] = useState<FavoriteRoute[]>(initialFavorites);

  const handleDeleteRoute = (id: string) => {
    setFavoriteRoutes(routes => routes.filter(route => route.id !== id));
    setMenuVisible(null);
  };

  const handleRenameRoute = (id: string) => {
    // TODO: Implement rename functionality
    setMenuVisible(null);
  };

  const handleUseRoute = (route: FavoriteRoute) => {
    navigation.navigate('JourneyPlanner');
    // TODO: Pre-fill the journey planner with route details
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.contentContainer}>
        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.title}>Recent Searches</Text>
            <Text style={styles.subtitle}>
              Your recent route searches will appear here
            </Text>
          </Card.Content>
        </Card>

        <Text style={styles.title}>Saved Routes</Text>

        {favoriteRoutes.map((route) => (
          <Card key={route.id} style={styles.card}>
            <Card.Content>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.routeTitle}>{route.title}</Text>
                  <Text style={styles.routeText}>
                    From: {route.startLocation}
                  </Text>
                  <Text style={styles.routeText}>
                    To: {route.endLocation}
                  </Text>
                  <View style={styles.modeContainer}>
                    <Text style={styles.modeChip}>
                      {route.mode}
                    </Text>
                  </View>
                  <Text style={styles.lastUsed}>
                    Last used: {route.lastUsed}
                  </Text>
                </View>

                <Menu
                  visible={menuVisible === route.id}
                  onDismiss={() => setMenuVisible(null)}
                  anchor={
                    <IconButton
                      icon="dots-vertical"
                      onPress={() => setMenuVisible(route.id)}
                    />
                  }
                >
                  <Menu.Item
                    onPress={() => handleRenameRoute(route.id)}
                    title="Rename"
                    leadingIcon="pencil"
                  />
                  <Menu.Item
                    onPress={() => handleDeleteRoute(route.id)}
                    title="Delete"
                    leadingIcon="delete"
                  />
                </Menu>
              </View>

              <Button
                mode="contained"
                onPress={() => handleUseRoute(route)}
                style={styles.actionButton}
              >
                Use This Route
              </Button>
            </Card.Content>
          </Card>
        ))}

        {favoriteRoutes.length === 0 && (
          <Card>
            <Card.Content>
              <Text style={styles.emptyText}>
                You haven't saved any routes yet.
                Plan a journey and save it for quick access!
              </Text>
            </Card.Content>
          </Card>
        )}
      </View>
    </ScrollView>
  );
};

export default FavoritesScreen;
