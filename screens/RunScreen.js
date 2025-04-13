import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, View, ScrollView, Alert, Platform } from 'react-native';
import { Text, Card, Button, ProgressBar, Surface, Portal, Modal, Appbar } from 'react-native-paper';
import MapView, { Marker, Polyline } from 'react-native-maps';
import * as Location from 'expo-location';
import { format } from 'date-fns';
import { calculateDistance, calculatePace, calculateCalories, formatDistance, formatDuration, formatPace } from '../utils/locationUtils';
import { runs, historicalEvents } from '../services/api';
import { useNavigation, useRoute } from '@react-navigation/native';

const formatTime = (seconds) => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;
  
  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  }
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
};

const RunScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { initialLocation } = route.params || {};
  
  const [location, setLocation] = useState(initialLocation);
  const [errorMsg, setErrorMsg] = useState(null);
  const [distance, setDistance] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [startTime, setStartTime] = useState(null);
  const [lastLocation, setLastLocation] = useState(null);
  const [routeCoordinates, setRouteCoordinates] = useState([]);
  const [timer, setTimer] = useState(0);
  const [currentStats, setCurrentStats] = useState({
    distance: 0,
    duration: 0,
    pace: 0,
    calories: 0
  });
  const [showEventModal, setShowEventModal] = useState(false);
  const [currentEvent, setCurrentEvent] = useState(null);
  const [nextMilestone, setNextMilestone] = useState(1);

  const timerRef = useRef(null);
  const statsInterval = useRef(null);
  const locationSubscription = useRef(null);
  const mapRef = useRef(null);

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Permission to access location was denied');
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      setLocation(location);
    })();
  }, []);

  const calculateDistance = (loc1, loc2) => {
    if (!loc1 || !loc2) return 0;
    
    const R = 6371; // Earth's radius in km
    const dLat = (loc2.coords.latitude - loc1.coords.latitude) * Math.PI / 180;
    const dLon = (loc2.coords.longitude - loc1.coords.longitude) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(loc1.coords.latitude * Math.PI / 180) * Math.cos(loc2.coords.latitude * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  const calculatePace = (distance, duration) => {
    if (distance === 0 || duration === 0) return 0;
    return duration / (distance / 1000) / 60; // minutes per kilometer
  };

  const calculateCalories = (distance) => {
    return distance * 0.06; // Rough estimate: 60 calories per km
  };

  const startRun = async () => {
    try {
      const location = await Location.getCurrentPositionAsync({});
      setLocation(location);
      setLastLocation(location);
      setStartTime(Date.now());
      setIsRunning(true);
      setDistance(0);
      setTimer(0);
      setRouteCoordinates([{
        latitude: location.coords.latitude,
        longitude: location.coords.longitude
      }]);

      // Start timer
      timerRef.current = setInterval(() => {
        setTimer(prev => prev + 1);
      }, 1000);

      // Start stats update
      statsInterval.current = setInterval(async () => {
        try {
          const newLocation = await Location.getCurrentPositionAsync({});
          if (lastLocation) {
            const newDistance = calculateDistance(lastLocation, newLocation);
            setDistance(prev => prev + newDistance);
            setRouteCoordinates(prev => [...prev, {
              latitude: newLocation.coords.latitude,
              longitude: newLocation.coords.longitude
            }]);
          }
          setLastLocation(newLocation);
          setCurrentStats({
            distance: distance,
            duration: timer,
            pace: calculatePace(distance, timer),
            calories: calculateCalories(distance)
          });
        } catch (error) {
          console.error('Error updating location:', error);
        }
      }, 1000);
    } catch (error) {
      Alert.alert('Error', 'Failed to start run. Please try again.');
    }
  };

  const stopRun = async () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    if (statsInterval.current) {
      clearInterval(statsInterval.current);
    }
    
    setIsRunning(false);
    try {
      const endTime = Date.now();
      const totalDuration = (endTime - startTime) / 1000; // in seconds
      
      const runData = {
        distance,
        duration: totalDuration,
        pace: calculatePace(distance, totalDuration),
        calories: calculateCalories(distance),
        route: routeCoordinates,
        date: new Date().toISOString()
      };

      await runs.create(runData);
      navigation.navigate('MainTabs', { screen: 'HomeTab' });
    } catch (error) {
      Alert.alert('Error', 'Failed to save run. Please try again.');
    }
  };

  const handleMilestoneReached = async (totalDistance) => {
    try {
      // Get a random historical event
      const events = await historicalEvents.getAll();
      const randomEvent = events[Math.floor(Math.random() * events.length)];
      
      setCurrentEvent({
        ...randomEvent,
        milestone: nextMilestone
      });
      setShowEventModal(true);
      
      // Set next milestone
      setNextMilestone(current => current + 1);
    } catch (error) {
      console.error('Error fetching historical event:', error);
    }
  };

  const handleEventModalClose = () => {
    setShowEventModal(false);
    // Navigate to AR screen with the current event's artifact
    if (currentEvent && currentEvent.artifacts && currentEvent.artifacts.length > 0) {
      navigation.navigate('AR', {
        artifact: currentEvent.artifacts[0]
      });
    }
  };

  return (
    <View style={styles.container}>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
        <Appbar.Content title="Run Tracker" />
      </Appbar.Header>

      <MapView
        ref={mapRef}
        style={styles.map}
        initialRegion={{
          latitude: location?.coords?.latitude || 0,
          longitude: location?.coords?.longitude || 0,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        }}
      >
        {location && (
          <Marker
            coordinate={{
              latitude: location.coords.latitude,
              longitude: location.coords.longitude,
            }}
            title="Current Location"
            pinColor="blue"
          />
        )}
        {routeCoordinates.length > 0 && (
          <Polyline
            coordinates={routeCoordinates.map(coord => ({
              latitude: coord.latitude,
              longitude: coord.longitude,
            }))}
            strokeColor="#0000FF"
            strokeWidth={3}
          />
        )}
      </MapView>

      <Surface style={styles.statsContainer}>
        <Text variant="headlineLarge" style={styles.statsValue}>
          {distance.toFixed(2)} km
        </Text>
        <Text variant="bodyLarge" style={styles.statsLabel}>
          Distance
        </Text>
      </Surface>

      <Surface style={styles.statsContainer}>
        <Text variant="headlineLarge" style={styles.statsValue}>
          {Math.floor(timer / 60)}:{(timer % 60).toString().padStart(2, '0')}
        </Text>
        <Text variant="bodyLarge" style={styles.statsLabel}>
          Time
        </Text>
      </Surface>

      <Surface style={styles.statsContainer}>
        <Text variant="headlineLarge" style={styles.statsValue}>
          {currentStats.pace.toFixed(2)} min/km
        </Text>
        <Text variant="bodyLarge" style={styles.statsLabel}>
          Pace
        </Text>
      </Surface>

      <Surface style={styles.statsContainer}>
        <Text variant="headlineLarge" style={styles.statsValue}>
          {Math.round(currentStats.calories)} cal
        </Text>
        <Text variant="bodyLarge" style={styles.statsLabel}>
          Calories
        </Text>
      </Surface>

      {!isRunning ? (
        <Button
          mode="contained"
          onPress={startRun}
          style={styles.button}
        >
          Start Run
        </Button>
      ) : (
        <Button
          mode="contained"
          onPress={stopRun}
          style={[styles.button, styles.stopButton]}
        >
          Stop Run
        </Button>
      )}

      <Portal>
        <Modal
          visible={showEventModal}
          onDismiss={handleEventModalClose}
          contentContainerStyle={styles.modalContainer}
        >
          {currentEvent && (
            <Card style={styles.eventCard}>
              <Card.Content>
                <Text style={styles.eventTitle}>{currentEvent.title}</Text>
                <Text style={styles.eventDate}>{currentEvent.date}</Text>
                <Text style={styles.eventDescription}>{currentEvent.description}</Text>
                <Button
                  mode="contained"
                  onPress={handleEventModalClose}
                  style={styles.viewARButton}
                >
                  View in AR
                </Button>
              </Card.Content>
            </Card>
          )}
        </Modal>
      </Portal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  map: {
    flex: 1,
  },
  statsContainer: {
    padding: 20,
    marginBottom: 10,
    elevation: 2,
    alignItems: 'center',
  },
  statsValue: {
    marginBottom: 8,
  },
  statsLabel: {
    color: '#666',
  },
  button: {
    marginTop: 20,
  },
  stopButton: {
    backgroundColor: '#f44336',
  },
  modalContainer: {
    padding: 20,
  },
  eventCard: {
    margin: 20,
  },
  eventTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  eventDate: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  eventDescription: {
    fontSize: 16,
    marginBottom: 16,
  },
  viewARButton: {
    marginTop: 8,
  },
});

export default RunScreen; 