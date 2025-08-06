import React, { useRef, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { WebView } from 'react-native-webview';

interface Coordinate {
  latitude: number;
  longitude: number;
}

interface Marker {
  coordinate: Coordinate;
  color: string;
  title: string;
}

interface Props {
  onMapPress?: (coordinate: Coordinate) => void;
  markers?: Marker[];
  initialRegion?: {
    latitude: number;
    longitude: number;
    latitudeDelta: number;
    longitudeDelta: number;
  };
  selectionMode?: boolean;
}

const WebViewMap: React.FC<Props> = ({
  onMapPress,
  markers = [],
  initialRegion = {
    latitude: 31.5204,
    longitude: 74.3587,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  },
  selectionMode = false,
}) => {
  const webViewRef = useRef<WebView>(null);

  // Generate HTML content for the map
  const generateMapHTML = () => {
    const markersJS = markers.map(marker => ({
      lat: marker.coordinate.latitude,
      lng: marker.coordinate.longitude,
      color: marker.color,
      title: marker.title,
    }));

    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <title>Map</title>
    <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
    <style>
        body, html { 
            margin: 0; 
            padding: 0; 
            height: 100%; 
            overflow: hidden;
        }
        #map { 
            height: 100vh; 
            width: 100vw; 
            cursor: ${selectionMode ? 'crosshair' : 'grab'};
        }
        .selection-overlay {
            position: absolute;
            top: 10px;
            left: 50%;
            transform: translateX(-50%);
            background: rgba(0, 0, 0, 0.8);
            color: white;
            padding: 10px 20px;
            border-radius: 20px;
            z-index: 1000;
            font-family: Arial, sans-serif;
            font-size: 14px;
            display: ${selectionMode ? 'block' : 'none'};
        }
    </style>
</head>
<body>
    <div class="selection-overlay">
        Tap anywhere to select location
    </div>
    <div id="map"></div>
    
    <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
    <script>
        // Initialize map
        const map = L.map('map', {
            zoomControl: true,
            attributionControl: false,
            tap: true,
            tapTolerance: 15,
        }).setView([${initialRegion.latitude}, ${initialRegion.longitude}], 12);

        // Add tile layer
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 19,
        }).addTo(map);

        // Store markers
        const markers = [];

        // Add markers
        const markerData = ${JSON.stringify(markersJS)};
        markerData.forEach(markerInfo => {
            const marker = L.marker([markerInfo.lat, markerInfo.lng])
                .addTo(map)
                .bindPopup(markerInfo.title);
            
            // Color the marker (simplified - using default markers)
            markers.push(marker);
        });

        // Handle map clicks with guaranteed single-tap detection
        let clickTimeout = null;
        let clickCount = 0;

        map.on('click', function(e) {
            clickCount++;
            
            // Clear any existing timeout
            if (clickTimeout) {
                clearTimeout(clickTimeout);
            }
            
            // Set a timeout to handle the click
            clickTimeout = setTimeout(() => {
                if (clickCount === 1) {
                    // Single click detected
                    const lat = e.latlng.lat;
                    const lng = e.latlng.lng;
                    
                    console.log('🗺️ WebView Map clicked:', lat, lng);
                    
                    // Send message to React Native
                    window.ReactNativeWebView.postMessage(JSON.stringify({
                        type: 'mapPress',
                        coordinate: {
                            latitude: lat,
                            longitude: lng
                        }
                    }));
                }
                clickCount = 0;
            }, 200); // 200ms timeout to distinguish single vs double click
        });

        // Prevent context menu on long press
        map.getContainer().addEventListener('contextmenu', function(e) {
            e.preventDefault();
            return false;
        });

        // Handle touch events for better mobile experience
        let touchStartTime = 0;
        
        map.getContainer().addEventListener('touchstart', function(e) {
            touchStartTime = Date.now();
        });
        
        map.getContainer().addEventListener('touchend', function(e) {
            const touchDuration = Date.now() - touchStartTime;
            
            // Only process quick taps (not long presses)
            if (touchDuration < 500) {
                // The click event will handle the actual processing
                console.log('🖱️ Quick tap detected');
            }
        });

        // Function to update markers from React Native
        window.updateMarkers = function(newMarkers) {
            // Clear existing markers
            markers.forEach(marker => map.removeLayer(marker));
            markers.length = 0;
            
            // Add new markers
            newMarkers.forEach(markerInfo => {
                const marker = L.marker([markerInfo.lat, markerInfo.lng])
                    .addTo(map)
                    .bindPopup(markerInfo.title);
                markers.push(marker);
            });
        };

        // Function to center map on coordinate
        window.centerMap = function(lat, lng, zoom = 15) {
            map.setView([lat, lng], zoom);
        };

        console.log('🗺️ WebView Map initialized successfully');
    </script>
</body>
</html>`;
  };

  // Handle messages from WebView
  const handleMessage = (event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      
      if (data.type === 'mapPress' && onMapPress) {
        console.log('📱 Received map press from WebView:', data.coordinate);
        onMapPress(data.coordinate);
      }
    } catch (error) {
      console.error('Error parsing WebView message:', error);
    }
  };

  // Update markers when they change
  useEffect(() => {
    if (webViewRef.current && markers.length > 0) {
      const markersJS = markers.map(marker => ({
        lat: marker.coordinate.latitude,
        lng: marker.coordinate.longitude,
        color: marker.color,
        title: marker.title,
      }));

      const script = `window.updateMarkers && window.updateMarkers(${JSON.stringify(markersJS)});`;
      webViewRef.current.postMessage(script);
    }
  }, [markers]);

  return (
    <View style={styles.container}>
      <WebView
        ref={webViewRef}
        source={{ html: generateMapHTML() }}
        style={styles.webview}
        onMessage={handleMessage}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        startInLoadingState={false}
        scalesPageToFit={false}
        scrollEnabled={false}
        bounces={false}
        allowsInlineMediaPlayback={true}
        mediaPlaybackRequiresUserAction={false}
        originWhitelist={['*']}
        mixedContentMode="compatibility"
        onError={(error) => console.error('WebView error:', error)}
        onHttpError={(error) => console.error('WebView HTTP error:', error)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  webview: {
    flex: 1,
  },
});

export default WebViewMap;