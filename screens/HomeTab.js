import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl, Alert } from 'react-native';
import { Text, Card, Button, Surface, ActivityIndicator, Divider } from 'react-native-paper';
import * as Location from 'expo-location';
import { useNavigation } from '@react-navigation/native';
import { runs } from '../services/api';
import { formatDistance, formatDuration, formatPace } from '../utils/locationUtils';

export default function HomeScreen() {
  const navigation = useNavigation();
  const [location, setLocation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [recentRuns, setRecentRuns] = useState([]);

  useEffect(() => {
    requestLocationPermission();
    fetchRecentRuns();
  }, []);

  const fetchRecentRuns = async () => {
    try {
      const data = await runs.getAll();
      setRecentRuns(data.slice(0, 3)); // Get the 3 most recent runs
    } catch (error) {
      console.error('Error fetching recent runs:', error);
      Alert.alert('Error', 'Failed to load recent runs');
    }
  };

  const requestLocationPermission = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Location permission is required to track your runs.');
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      setLocation(location);
    } catch (error) {
      console.error('Error getting location:', error);
      Alert.alert('Error', 'Failed to get your location. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleStartRun = () => {
    if (!location) {
      Alert.alert('Location Required', 'Please enable location services to start a run.');
      return;
    }
    navigation.navigate('Run', { initialLocation: location });
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([requestLocationPermission(), fetchRecentRuns()]);
    setRefreshing(false);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6200ee" />
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <Surface style={styles.header}>
        <Text variant="headlineMedium" style={styles.title}>
          Lakbay Kasaysayan
        </Text>
        <Text variant="bodyLarge" style={styles.subtitle}>
          Explore history through running
        </Text>
      </Surface>

      <View style={styles.content}>
        {recentRuns.length > 0 && (
          <Card style={styles.card}>
            <Card.Content>
              <Text variant="titleLarge" style={styles.cardTitle}>
                Recent Records
              </Text>
              {recentRuns.map((run, index) => (
                <View key={index}>
                  <View style={styles.runItem}>
                    <Text variant="titleMedium">{new Date(run.date).toLocaleDateString()}</Text>
                    <View style={styles.runStats}>
                      <Text variant="bodyMedium">Distance: {formatDistance(run.distance)}</Text>
                      <Text variant="bodyMedium">Duration: {formatDuration(run.duration)}</Text>
                      <Text variant="bodyMedium">Pace: {formatPace(run.pace)}</Text>
                    </View>
                  </View>
                  {index < recentRuns.length - 1 && <Divider style={styles.divider} />}
                </View>
              ))}
            </Card.Content>
          </Card>
        )}

        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleLarge" style={styles.cardTitle}>
              Start a Run
            </Text>
            <Text variant="bodyMedium" style={styles.cardText}>
              Begin your historical journey and discover events along your route.
            </Text>
            <Button
              mode="contained"
              onPress={handleStartRun}
              style={styles.button}
              icon="run"
            >
              Start Running
            </Button>
          </Card.Content>
        </Card>

        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleLarge" style={styles.cardTitle}>
              Historical Events
            </Text>
            <Text variant="bodyMedium" style={styles.cardText}>
              Browse through historical events and learn about their significance.
            </Text>
            <Button
              mode="outlined"
              onPress={() => navigation.navigate('HistoricalEvents')}
              style={styles.button}
              icon="history"
            >
              View Events
            </Button>
          </Card.Content>
        </Card>

        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleLarge" style={styles.cardTitle}>
              AR Explorer
            </Text>
            <Text variant="bodyMedium" style={styles.cardText}>
              Experience historical events in augmented reality.
            </Text>
            <Button
              mode="outlined"
              onPress={() => navigation.navigate('AR')}
              style={styles.button}
              icon="augmented-reality"
            >
              Start AR Experience
            </Button>
          </Card.Content>
        </Card>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    padding: 20,
    elevation: 4,
  },
  title: {
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    textAlign: 'center',
    color: '#666',
  },
  content: {
    padding: 16,
  },
  card: {
    marginBottom: 16,
    elevation: 2,
  },
  cardTitle: {
    marginBottom: 8,
  },
  cardText: {
    marginBottom: 16,
    color: '#666',
  },
  button: {
    marginTop: 8,
  },
  runItem: {
    marginVertical: 8,
  },
  runStats: {
    marginTop: 4,
  },
  divider: {
    marginVertical: 8,
  },
}); 