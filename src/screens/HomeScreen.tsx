import React from 'react';
import { View, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Text } from 'react-native-paper';
import { RootStackParamList } from '../types/navigation';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 16
  },
  header: {
    marginBottom: 24,
    alignItems: 'center'
  },
  menuItem: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2D3436',
    marginBottom: 4,
  },
  description: {
    fontSize: 14,
    color: '#636E72',
    lineHeight: 20,
  }
});

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

interface MenuItemProps {
  title: string;
  description: string;
  screen: keyof RootStackParamList;
  icon?: string;
}

const MenuItem: React.FC<MenuItemProps> = ({ title, description, screen }) => {
  const navigation = useNavigation<NavigationProp>();

  return (
    <TouchableOpacity
      style={styles.menuItem}
      onPress={() => navigation.navigate(screen)}
    >
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.description}>{description}</Text>
    </TouchableOpacity>
  );
};

export default function HomeScreen() {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text variant="headlineMedium">Lahore Transit</Text>
        <Text variant="bodyLarge">Your Smart Travel Assistant</Text>
      </View>

      <MenuItem
        title="Plan Journey"
        description="Find the best route from A to B using public transport"
        screen="JourneyPlanner"
      />

      <MenuItem
        title="Nearby Stops"
        description="Discover bus and train stops around you"
        screen="NearbyStops"
      />

      <MenuItem
        title="Transit Map"
        description="View interactive map of all routes and stops"
        screen="MapView"
      />

      <MenuItem
        title="Route Explorer"
        description="Browse all Speedo, Metro and Orange Line routes"
        screen="RouteExplorer"
      />

      <MenuItem
        title="Service Timings"
        description="Check first/last service times and frequencies"
        screen="Timings"
      />

      <MenuItem
        title="Fare Calculator"
        description="Estimate your journey cost"
        screen="FareCalculator"
      />

      <MenuItem
        title="Saved Routes"
        description="Access your favorite and recent journeys"
        screen="Favorites"
      />

      <MenuItem
        title="Settings"
        description="Language, notifications and preferences"
        screen="Settings"
      />
    </ScrollView>
  );
}