import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';

// Import screens (will create these next)
import HomeScreen from '../screens/HomeScreen';
import JourneyPlannerScreen from '../screens/JourneyPlannerScreen';
import NearbyStopsScreen from '../screens/NearbyStopsScreen';
import RouteExplorerScreen from '../screens/RouteExplorerScreen';
import MapViewScreen from '../screens/MapViewScreen';
import TimingsScreen from '../screens/TimingsScreen';
import FareCalculatorScreen from '../screens/FareCalculatorScreen';
import SettingsScreen from '../screens/SettingsScreen';
import FavoritesScreen from '../screens/FavoritesScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootNavigator() {
  return (
    <Stack.Navigator
        initialRouteName="Home"
        screenOptions={{
          headerStyle: {
            backgroundColor: '#4A90E2',
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
      >
        <Stack.Screen 
          name="Home" 
          component={HomeScreen} 
          options={{ title: 'Lahore Transit' }} 
        />
        <Stack.Screen 
          name="JourneyPlanner" 
          component={JourneyPlannerScreen}
          options={{ title: 'Plan Journey' }} 
        />
        <Stack.Screen 
          name="NearbyStops" 
          component={NearbyStopsScreen}
          options={{ title: 'Nearby Stops' }} 
        />
        <Stack.Screen 
          name="RouteExplorer" 
          component={RouteExplorerScreen}
          options={{ title: 'Explore Routes' }} 
        />
        <Stack.Screen 
          name="MapView" 
          component={MapViewScreen}
          options={{ title: 'Transit Map' }} 
        />
        <Stack.Screen 
          name="Timings" 
          component={TimingsScreen}
          options={{ title: 'Service Timings' }} 
        />
        <Stack.Screen 
          name="FareCalculator" 
          component={FareCalculatorScreen}
          options={{ title: 'Calculate Fare' }} 
        />
        <Stack.Screen 
          name="Settings" 
          component={SettingsScreen}
          options={{ title: 'Settings' }} 
        />
        <Stack.Screen 
          name="Favorites" 
          component={FavoritesScreen}
          options={{ title: 'Saved Routes' }} 
        />
    </Stack.Navigator>
  );
}