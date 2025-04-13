import React, { useEffect, useState } from 'react';
import { View, StyleSheet, FlatList, RefreshControl } from 'react-native';
import { Text, Surface, Card, Avatar, Chip, ActivityIndicator, Snackbar } from 'react-native-paper';
import { historicalEvents } from '../services/api';

const HistoryScreen = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const fetchEvents = async () => {
    try {
      const data = await historicalEvents.getAll();
      setEvents(data);
      setError(null);
    } catch (err) {
      setError('Failed to load historical events. Please try again.');
      console.error('Error fetching events:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchEvents();
  };

  const renderEvent = ({ item }) => (
    <Card style={styles.eventCard}>
      <Card.Content>
        <View style={styles.eventHeader}>
          <Avatar.Text 
            size={40} 
            label={item.title.charAt(0)} 
            style={[styles.avatar, !item.unlocked && styles.lockedAvatar]}
          />
          <View style={styles.eventTitleContainer}>
            <Text style={styles.eventTitle}>{item.title}</Text>
            <Text style={styles.eventDate}>{item.date}</Text>
          </View>
        </View>
        
        <Text style={styles.eventDescription}>{item.description}</Text>
        
        <View style={styles.eventFooter}>
          <Chip icon="map-marker" style={styles.locationChip}>
            {item.location}
          </Chip>
          <Chip icon="run" style={styles.distanceChip}>
            {item.distance} km
          </Chip>
          {item.unlocked ? (
            <Chip icon="check-circle" style={styles.unlockedChip}>
              Unlocked
            </Chip>
          ) : (
            <Chip icon="lock" style={styles.lockedChip}>
              Locked
            </Chip>
          )}
        </View>
      </Card.Content>
    </Card>
  );

  const renderHeader = () => (
    <Surface style={styles.header}>
      <Text style={styles.title}>Historical Events</Text>
      <Text style={styles.subtitle}>Run to unlock these historical events</Text>
    </Surface>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6200ee" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={events}
        renderItem={renderEvent}
        keyExtractor={item => item.id}
        ListHeaderComponent={renderHeader}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        removeClippedSubviews={true}
        maxToRenderPerBatch={5}
        windowSize={5}
      />
      <Snackbar
        visible={!!error}
        onDismiss={() => setError(null)}
        action={{
          label: 'Retry',
          onPress: () => {
            setLoading(true);
            fetchEvents();
          },
        }}>
        {error}
      </Snackbar>
    </View>
  );
};

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
    backgroundColor: '#6200ee',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: '#fff',
    opacity: 0.8,
  },
  listContainer: {
    padding: 16,
  },
  eventCard: {
    marginBottom: 16,
    elevation: 4,
  },
  eventHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatar: {
    backgroundColor: '#6200ee',
  },
  lockedAvatar: {
    backgroundColor: '#666',
  },
  eventTitleContainer: {
    marginLeft: 12,
    flex: 1,
  },
  eventTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  eventDate: {
    fontSize: 12,
    color: '#666',
  },
  eventDescription: {
    fontSize: 14,
    color: '#333',
    marginBottom: 12,
  },
  eventFooter: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  locationChip: {
    backgroundColor: '#e3f2fd',
  },
  distanceChip: {
    backgroundColor: '#e8f5e9',
  },
  unlockedChip: {
    backgroundColor: '#e8f5e9',
  },
  lockedChip: {
    backgroundColor: '#ffebee',
  },
});

export default HistoryScreen; 