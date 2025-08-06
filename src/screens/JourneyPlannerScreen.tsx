import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { View, ScrollView, Alert, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import { Text, Button, TextInput, Card, ActivityIndicator as PaperActivityIndicator } from 'react-native-paper';
import WebViewMap from '../components/WebViewMap';
import { StopsDropdown } from '../components/StopsDropdown';
import { AvailableRoutesDropdown } from '../components/AvailableRoutesDropdown';
import { planJourney } from '../services/routeService';
import { getAllStops, RouteStop } from '../services/routeDataService';
import { offlineReverseGeocode, LocationInfo as OfflineLocationInfo } from '../services/offlineGeocoding';
import type { TransportMode } from '../types/navigation';

// Define types locally since they're not exported from routes.ts
interface Stop {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  modes: TransportMode[];
}

interface AvailableRoute {
  id: string;
  name: string;
  mode: TransportMode;
  color: string;
  distance: number;
  from: string;
  to: string;
}

interface PlannedJourney {
  id: string;
  fromAddress: string;
  toAddress: string;
  totalTime: number;
  totalFare: number;
  routes: Array<{
    route: AvailableRoute;
    estimatedTime: number;
    fare: number;
    walkingDistanceFrom: number;
    walkingDistanceTo: number;
  }>;
  polylineCoordinates: Array<{ latitude: number; longitude: number }>;
}

interface LocationInfo {
  coordinate: { latitude: number; longitude: number };
  address: string;
  name: string;
}

// Define colors locally like other files
const TRANSPORT_MODE_COLORS: Record<TransportMode, string> = {
  'metrobus': '#4CAF50',
  'speedo': '#2196F3',
  'orange-line': '#FF9800'
};

const styles = {
  container: {
    flex: 1,
  },
  keyboardContainer: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  bottomPanel: {
    position: 'absolute' as const,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '60%' as const,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  panelContent: {
    padding: 20,
    paddingBottom: 40, // Add extra bottom padding for button visibility
  },
  statusText: {
    fontSize: 16,
    fontWeight: 'bold' as const,
    marginBottom: 16,
    textAlign: 'center' as const,
  },
  buttonRow: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    marginBottom: 16,
  },
  mapButton: {
    flex: 1,
    marginHorizontal: 4,
  },
  inputContainer: {
    marginBottom: 12,
  },
  input: {
    backgroundColor: 'white',
  },
  journeyCard: {
    marginTop: 16,
  },
  journeyHeader: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
    marginBottom: 12,
  },
  journeyTitle: {
    fontSize: 18,
    fontWeight: 'bold' as const,
  },
  journeyTime: {
    fontSize: 16,
    fontWeight: 'bold' as const,
    color: '#4CAF50',
  },
  routeStep: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    marginBottom: 8,
  },
  routeIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    marginRight: 8,
  },
  routeText: {
    flex: 1,
    fontSize: 14,
  },
  fareText: {
    fontSize: 14,
    fontWeight: 'bold' as const,
    color: '#4CAF50',
  },
  mapOverlay: {
    position: 'absolute' as const,
    top: 50,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    padding: 16,
    borderRadius: 8,
    zIndex: 1000,
    pointerEvents: 'none' as const,
  },
  mapOverlayText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold' as const,
    textAlign: 'center' as const,
  },
};

const LAHORE_REGION = {
  latitude: 31.5204,
  longitude: 74.3587,
  latitudeDelta: 0.0922,
  longitudeDelta: 0.0421,
};

// Debounce utility
const useDebounce = (callback: Function, delay: number) => {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  return useCallback((...args: any[]) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(() => callback(...args), delay);
  }, [callback, delay]);
};

export default function JourneyPlannerScreen() {
  const mapRef = useRef<any>(null);
  
  // Optimized state management
  const [mapSelectionMode, setMapSelectionMode] = useState<'from' | 'to' | null>(null);
  const [fromLocation, setFromLocation] = useState<LocationInfo | null>(null);
  const [toLocation, setToLocation] = useState<LocationInfo | null>(null);
  const [fromInputText, setFromInputText] = useState<string>('');
  const [toInputText, setToInputText] = useState<string>('');
  const [stopsModalVisible, setStopsModalVisible] = useState(false);
  const [modalSelectionMode, setModalSelectionMode] = useState<'from' | 'to' | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [availableRoutes, setAvailableRoutes] = useState<AvailableRoute[]>([]);
  const [isLoadingRoutes, setIsLoadingRoutes] = useState(false);
  const [selectedRoute, setSelectedRoute] = useState<AvailableRoute | null>(null);
  const [plannedJourney, setPlannedJourney] = useState<PlannedJourney | null>(null);
  const [planningJourney, setPlanningJourney] = useState(false);
  const [isReverseGeocoding, setIsReverseGeocoding] = useState(false);

  // Memoized stops data to prevent unnecessary re-renders
  const allStops = useMemo(() => {
    try {
      return getAllStops();
    } catch (error) {
      console.error('Failed to load stops:', error);
      return [];
    }
  }, []);

  // Reliable offline reverse geocoding - no external dependencies
  const reverseGeocode = useCallback((coordinate: { latitude: number; longitude: number }): LocationInfo => {
    setIsReverseGeocoding(true);
    
    try {
      // Use offline geocoding service
      const result = offlineReverseGeocode(coordinate);
      console.log('✅ Offline geocoding successful:', result.name);
      return result;
    } catch (error) {
      console.error('Offline geocoding failed:', error);
      // Even this shouldn't fail, but just in case
      return {
        coordinate,
        address: `Location (${coordinate.latitude.toFixed(4)}, ${coordinate.longitude.toFixed(4)})`,
        name: "Selected Location",
      };
    } finally {
      setIsReverseGeocoding(false);
    }
  }, []);

  // Reliable map press handler with offline geocoding for WebView
  const handleMapPress = useCallback((coordinate: { latitude: number; longitude: number }) => {
    console.log('🗺️ WebView Map pressed:', coordinate);
    console.log('🎯 Selection mode:', mapSelectionMode);
    
    if (!mapSelectionMode) {
      console.log('❌ No selection mode active');
      return;
    }
    
    try {
      // Use synchronous offline geocoding
      const locationInfo = reverseGeocode(coordinate);
      console.log('✅ Location resolved:', locationInfo.name);
      
      if (mapSelectionMode === 'from') {
        setFromLocation(locationInfo);
        setFromInputText(locationInfo.name);
        console.log('📍 From location set:', locationInfo.name);
      } else {
        setToLocation(locationInfo);
        setToInputText(locationInfo.name);
        console.log('📍 To location set:', locationInfo.name);
      }
      
      // Clear selection mode
      setMapSelectionMode(null);
      console.log('🔄 Selection mode cleared');
      
    } catch (error) {
      console.error('❌ Error handling map tap:', error);
      Alert.alert('Error', 'Failed to set location. Please try again.');
    }
  }, [mapSelectionMode, reverseGeocode]);

  // Debounced map region change handler
  const debouncedRegionChange = useDebounce(() => {
    // Only log if needed for debugging
    // console.log('Map region changed');
  }, 300);

  // Streamlined map selection
  const startMapSelection = useCallback((field: 'from' | 'to') => {
    setMapSelectionMode(field);
    setModalSelectionMode(null);
    setStopsModalVisible(false);
  }, []);

  // Optimized stop selection
  const handleSelectStop = useCallback((stop: Stop | RouteStop) => {
    const locationInfo: LocationInfo = { 
      coordinate: { latitude: stop.latitude, longitude: stop.longitude }, 
      address: stop.address,
      name: stop.name
    };
    
    if (modalSelectionMode === 'from') {
      setFromLocation(locationInfo);
      setFromInputText(stop.name);
    } else if (modalSelectionMode === 'to') {
      setToLocation(locationInfo);
      setToInputText(stop.name);
    }

    setStopsModalVisible(false);
    setSearchQuery('');
    setModalSelectionMode(null);
  }, [modalSelectionMode]);

  // Optimized modal handlers with debugging
  const openStopsModal = useCallback((field: 'from' | 'to') => {
    console.log('🔍 Opening stops modal for:', field);
    console.log('🔍 Available stops count:', allStops.length);
    setModalSelectionMode(field);
    setMapSelectionMode(null);
    setStopsModalVisible(true);
    setSearchQuery('');
    console.log('🔍 Modal state set - visible:', true, 'mode:', field);
  }, [allStops.length]);

  const closeStopsModal = useCallback(() => {
    console.log('🔍 Closing stops modal');
    setStopsModalVisible(false);
    setModalSelectionMode(null);
  }, []);

  // Optimized location clearing
  const clearLocation = useCallback((field: 'from' | 'to') => {
    if (field === 'from') {
      setFromLocation(null);
      setFromInputText('');
      setPlannedJourney(null);
    } else {
      setToLocation(null);
      setToInputText('');
      setPlannedJourney(null);
    }
  }, []);

  // Optimized text input handlers
  const handleFromTextChange = useCallback((text: string) => {
    setFromInputText(text);
    if (text.trim()) {
      setFromLocation({
        coordinate: { latitude: 31.5204, longitude: 74.3587 },
        address: text,
        name: text
      });
    } else {
      setFromLocation(null);
      setPlannedJourney(null);
    }
  }, []);

  const handleToTextChange = useCallback((text: string) => {
    setToInputText(text);
    if (text.trim()) {
      setToLocation({
        coordinate: { latitude: 31.5204, longitude: 74.3587 },
        address: text,
        name: text
      });
    } else {
      setToLocation(null);
      setPlannedJourney(null);
    }
  }, []);

  // Journey planning
  const initiateJourneyPlan = useCallback(async () => {
    if (!fromLocation || !toLocation) {
      Alert.alert('Input Required', 'Please select both starting point and destination.');
      return;
    }

    setPlanningJourney(true);
    
    try {
      const journey = await planJourney(
        fromLocation.coordinate,
        toLocation.coordinate,
        fromLocation.address,
        toLocation.address
      );

      if (!journey) {
        Alert.alert('No Route Found', 'No routes available between the selected locations.');
        return;
      }
      
      setPlannedJourney(journey);
    } catch (error) {
      console.error('Journey planning failed:', error);
      Alert.alert('Planning Failed', 'Unable to plan journey. Please try again.');
    } finally {
      setPlanningJourney(false);
    }
  }, [fromLocation, toLocation]);

  // Memoized journey rendering
  const renderPlannedJourney = useMemo(() => {
    if (!plannedJourney) return null;

    return (
      <Card style={styles.journeyCard}>
        <Card.Content>
          <View style={styles.journeyHeader}>
            <Text style={styles.journeyTitle}>Planned Journey</Text>
            <Text style={styles.journeyTime}>{plannedJourney.totalTime} mins</Text>
          </View>
          
          {plannedJourney.routes.map((step: any, index: number) => (
            <View key={index} style={styles.routeStep}>
              <View style={[styles.routeIcon, { backgroundColor: step.route.color }]}>
                <Text style={{ color: '#fff', fontSize: 10, fontWeight: 'bold' }}>
                  {step.route.mode[0].toUpperCase()}
                </Text>
              </View>
              <Text style={styles.routeText}>
                {step.route.name} - {step.estimatedTime} mins
              </Text>
              <Text style={styles.fareText}>Rs. {step.fare}</Text>
            </View>
          ))}
        </Card.Content>
      </Card>
    );
  }, [plannedJourney]);

  // Memoized status text
  const statusText = useMemo(() => {
    if (mapSelectionMode) {
      return `Tap the map to select ${mapSelectionMode === 'from' ? 'starting point' : 'destination'}`;
    }
    return 'Select your journey details below';
  }, [mapSelectionMode]);

  return (
    <KeyboardAvoidingView
      style={styles.keyboardContainer}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
    >
      <View style={styles.container}>
        {/* Loader overlay when planning journey */}
        {planningJourney && (
          <View style={{
            position: 'absolute',
            top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(255,255,255,0.7)',
            zIndex: 9999,
            justifyContent: 'center',
            alignItems: 'center',
          }}>
            <PaperActivityIndicator size="large" />
            <Text style={{ marginTop: 16, fontSize: 16 }}>Planning your journey...</Text>
          </View>
        )}
        <WebViewMap
          onMapPress={handleMapPress}
          selectionMode={!!mapSelectionMode}
          initialRegion={LAHORE_REGION}
          markers={[
            ...(fromLocation ? [{
              coordinate: fromLocation.coordinate,
              color: 'green',
              title: `From: ${fromLocation.name}`,
            }] : []),
            ...(toLocation ? [{
              coordinate: toLocation.coordinate,
              color: 'red',
              title: `To: ${toLocation.name}`,
            }] : []),
          ]}
        />

        <View style={styles.bottomPanel}>
          <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ flexGrow: 1, paddingBottom: 40 }}>
            <View style={styles.panelContent}>
              <Text style={styles.statusText}>{statusText}</Text>
              
              {/* Streamlined Selection Buttons */}
              <View style={styles.buttonRow}>
                <Button
                  mode={mapSelectionMode === 'from' ? 'contained' : 'outlined'}
                  onPress={() => startMapSelection('from')}
                  style={styles.mapButton}
                  icon="map-marker"
                >
                  Select From
                </Button>
                <Button
                  mode={mapSelectionMode === 'to' ? 'contained' : 'outlined'}
                  onPress={() => startMapSelection('to')}
                  style={styles.mapButton}
                  icon="map-marker"
                >
                  Select To
                </Button>
              </View>

              {/* Optimized Input Fields */}
              <View style={styles.inputContainer}>
                <TextInput
                  label="From"
                  value={fromInputText}
                  placeholder="Type address or tap to select"
                  mode="outlined"
                  style={styles.input}
                  onChangeText={handleFromTextChange}
                  right={<>
                    {fromLocation && (
                      <TextInput.Icon 
                        icon="close" 
                        onPress={() => clearLocation('from')}
                      />
                    )}
                    <TextInput.Icon 
                      icon="magnify" 
                      onPress={() => openStopsModal('from')} 
                    />
                  </>}
                />
              </View>

              <View style={styles.inputContainer}>
                <TextInput
                  label="To"
                  value={toInputText}
                  placeholder="Type address or tap to select"
                  mode="outlined"
                  style={styles.input}
                  onChangeText={handleToTextChange}
                  right={<>
                    {toLocation && (
                      <TextInput.Icon 
                        icon="close" 
                        onPress={() => clearLocation('to')}
                      />
                    )}
                    <TextInput.Icon 
                      icon="magnify" 
                      onPress={() => openStopsModal('to')} 
                    />
                  </>}
                />
              </View>

              {isLoadingRoutes && (
                <PaperActivityIndicator style={{ marginTop: 16 }} />
              )}

              {availableRoutes.length > 0 && (
                <AvailableRoutesDropdown
                  routes={availableRoutes}
                  loading={isLoadingRoutes}
                  onRouteSelect={setSelectedRoute}
                  selectedRouteId={selectedRoute?.id}
                />
              )}
              
              <Button
                mode="contained"
                onPress={initiateJourneyPlan}
                loading={planningJourney}
                disabled={!fromLocation || !toLocation}
                style={{ marginTop: 12, marginBottom: 16 }}
              >
                Plan Journey
              </Button>

              {renderPlannedJourney}
            </View>
          </ScrollView>
        </View>

        <StopsDropdown
          visible={stopsModalVisible}
          onDismiss={closeStopsModal}
          onSelectStop={handleSelectStop}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          stops={allStops}
          placeholder="Search stops and routes..."
        />
      </View>
    </KeyboardAvoidingView>
  );
}
