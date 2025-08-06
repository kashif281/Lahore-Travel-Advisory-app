import React, { useState } from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { Text, Card, Button, Chip, Divider } from 'react-native-paper';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f5f5'
  },
  contentContainer: {
    padding: 16
  },
  card: {
    marginBottom: 16,
    elevation: 2
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8
  },
  description: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 16,
    gap: 8
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8
  },
  segmentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  divider: {
    marginVertical: 8
  },
  totalSection: {
    marginTop: 16,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0'
  },
  totalText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000'
  },
  grayText: {
    fontSize: 12,
    color: '#666',
    marginTop: 8,
    fontStyle: 'italic'
  }
});
import { TransportMode } from '../types/navigation';

interface FareSegment {
  mode: TransportMode;
  fare: number;
}

const TRANSPORT_MODE_COLORS: Record<TransportMode, string> = {
  'speedo': '#2196F3',
  'metrobus': '#4CAF50',
  'orange-line': '#FF9800',
};

const BASE_FARES: Record<TransportMode, number> = {
  'speedo': 15,
  'metrobus': 30,
  'orange-line': 40,
};

export default function FareCalculatorScreen() {
  const [segments, setSegments] = useState<FareSegment[]>([]);
  const [totalFare, setTotalFare] = useState(0);

  const addSegment = (mode: TransportMode) => {
    const fare = BASE_FARES[mode];
    setSegments([...segments, { mode, fare }]);
    setTotalFare(prevFare => prevFare + fare);
  };

  const removeSegment = (index: number) => {
    const removedSegment = segments[index];
    setSegments(segments.filter((_, i) => i !== index));
    setTotalFare(prevFare => prevFare - removedSegment.fare);
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.contentContainer}>
        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.sectionTitle}>Add Transport Segments</Text>
            <Text style={styles.description}>
              Select the modes of transport you plan to use in your journey
            </Text>

            <View style={styles.buttonContainer}>
              {Object.entries(TRANSPORT_MODE_COLORS).map(([mode, color]) => (
                <Button
                  key={mode}
                  mode="contained"
                  onPress={() => addSegment(mode as TransportMode)}
                  style={{ backgroundColor: color }}
                >
                  {mode.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                </Button>
              ))}
            </View>
          </Card.Content>
        </Card>

        {segments.length > 0 && (
          <Card style={styles.card}>
            <Card.Content>
              <Text style={styles.sectionTitle}>Your Journey</Text>

              {segments.map((segment, index) => (
                <React.Fragment key={index}>
                  <View style={styles.row}>
                    <View style={styles.segmentRow}>
                      <Chip
                        style={{ backgroundColor: TRANSPORT_MODE_COLORS[segment.mode] }}
                        textStyle={{ color: '#fff' }}
                      >
                        {segment.mode.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                      </Chip>
                      <Text>Rs. {segment.fare}</Text>
                    </View>
                    <Button
                      mode="outlined"
                      onPress={() => removeSegment(index)}
                      textColor="#F44336"
                    >
                      Remove
                    </Button>
                  </View>
                  {index < segments.length - 1 && <Divider style={styles.divider} />}
                </React.Fragment>
              ))}

              <View style={styles.totalSection}>
                <View style={styles.row}>
                  <Text style={styles.totalText}>Total Fare</Text>
                  <Text style={styles.totalText}>Rs. {totalFare}</Text>
                </View>
                <Text style={styles.grayText}>
                  Note: Actual fares may vary. This is an estimate based on standard fares.
                </Text>
              </View>
            </Card.Content>
          </Card>
        )}

        <Card>
          <Card.Content>
            <Text style={styles.sectionTitle}>Fare Information</Text>
          {(Object.entries(BASE_FARES) as [TransportMode, number][]).map(([mode, fare]) => (
            <View key={mode} style={styles.row}>
              <Text>{mode.split('-').map((word: string) => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}</Text>
              <Text>Rs. {fare}</Text>
            </View>
          ))}
          </Card.Content>
        </Card>
      </View>
    </ScrollView>
  );
}