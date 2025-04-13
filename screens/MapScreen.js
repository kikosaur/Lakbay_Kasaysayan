import React, { useState, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';
import { Text, Card, Surface } from 'react-native-paper';
import { historicalEvents, runs } from '../services/api';

const MapScreen = () => {
  const [events, setEvents] = useState([]);
  const [recentRuns, setRecentRuns] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [eventsData, runsData] = await Promise.all([
          historicalEvents.getAll(),
          runs.getAll()
        ]);
        setEvents(eventsData);
        setRecentRuns(runsData.slice(0, 3));
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        initialRegion={{
          latitude: 14.5995,
          longitude: 120.9842,
          latitudeDelta: 0.1,
          longitudeDelta: 0.1,
        }}
      >
        {events.map((event, index) => (
          <Marker
            key={`event-${index}`}
            coordinate={{
              latitude: event.location.latitude,
              longitude: event.location.longitude,
            }}
            title={event.title}
            description={event.description}
          />
        ))}
        
        {recentRuns.map((run, index) => (
          <Polyline
            key={`run-${index}`}
            coordinates={run.route.map(coord => ({
              latitude: coord.latitude,
              longitude: coord.longitude,
            }))}
            strokeColor="#4CAF50"
            strokeWidth={3}
          />
        ))}
      </MapView>

      <Surface style={styles.legend}>
        <Text variant="titleMedium" style={styles.legendTitle}>Map Legend</Text>
        <View style={styles.legendItem}>
          <View style={[styles.legendMarker, { backgroundColor: 'red' }]} />
          <Text>Historical Events</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendLine, { backgroundColor: '#4CAF50' }]} />
          <Text>Your Recent Runs</Text>
        </View>
      </Surface>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  legend: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    padding: 16,
    borderRadius: 8,
    elevation: 4,
  },
  legendTitle: {
    marginBottom: 8,
    fontWeight: 'bold',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 4,
  },
  legendMarker: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginRight: 8,
  },
  legendLine: {
    width: 16,
    height: 3,
    marginRight: 8,
  },
});

export default MapScreen; 