import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList, RefreshControl } from 'react-native';
import { Text, Surface, Card, Avatar, Chip, ActivityIndicator, Button } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { historicalEvents, achievements } from '../services/api';

const AchievementHall = () => {
  const [collectedArtifacts, setCollectedArtifacts] = useState([]);
  const [artifactDetails, setArtifactDetails] = useState([]);
  const [userAchievements, setUserAchievements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Load collected artifacts
      const artifacts = await AsyncStorage.getItem('collectedArtifacts');
      const artifactIds = artifacts ? JSON.parse(artifacts) : [];
      setCollectedArtifacts(artifactIds);

      // Load artifact details
      const events = await historicalEvents.getAll();
      const details = events
        .filter(event => artifactIds.includes(event.id))
        .map(event => ({
          ...event,
          artifacts: event.artifacts.filter(artifact => artifactIds.includes(artifact.id))
        }));
      setArtifactDetails(details);

      // Load achievements
      const userAchievements = await achievements.getAll();
      setUserAchievements(userAchievements);

      setLoading(false);
    } catch (error) {
      console.error('Error loading data:', error);
      setLoading(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadData().then(() => setRefreshing(false));
  };

  const renderArtifact = ({ item }) => (
    <Card style={styles.artifactCard}>
      <Card.Content>
        <View style={styles.artifactHeader}>
          <Avatar.Text 
            size={40} 
            label={item.title.charAt(0)} 
            style={styles.avatar}
          />
          <View style={styles.artifactTitleContainer}>
            <Text style={styles.artifactTitle}>{item.title}</Text>
            <Text style={styles.artifactDate}>{item.date}</Text>
          </View>
        </View>
        
        <Text style={styles.artifactDescription}>{item.description}</Text>
        
        <View style={styles.artifactFooter}>
          <Chip icon="map-marker" style={styles.locationChip}>
            {item.location.name}
          </Chip>
          <Chip icon="check-circle" style={styles.collectedChip}>
            Collected
          </Chip>
        </View>

        {item.artifacts && item.artifacts.length > 0 && (
          <Button
            mode="contained"
            onPress={() => navigation.navigate('AR', { artifact: item.artifacts[0] })}
            style={styles.viewButton}
          >
            View in AR
          </Button>
        )}
      </Card.Content>
    </Card>
  );

  const renderAchievement = ({ item }) => (
    <Card style={styles.achievementCard}>
      <Card.Content>
        <View style={styles.achievementHeader}>
          <Avatar.Icon 
            size={40} 
            icon={item.icon || 'trophy'} 
            style={styles.achievementIcon}
          />
          <View style={styles.achievementTitleContainer}>
            <Text style={styles.achievementTitle}>{item.name}</Text>
            <Text style={styles.achievementDate}>
              Earned on {new Date(item.earnedAt).toLocaleDateString()}
            </Text>
          </View>
        </View>
        
        <Text style={styles.achievementDescription}>{item.description}</Text>
      </Card.Content>
    </Card>
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
      <Surface style={styles.header}>
        <Text style={styles.title}>Achievement Hall</Text>
        <Text style={styles.subtitle}>
          {collectedArtifacts.length} artifacts collected
        </Text>
      </Surface>

      <FlatList
        data={artifactDetails}
        renderItem={renderArtifact}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListHeaderComponent={
          <Surface style={styles.achievementsHeader}>
            <Text style={styles.sectionTitle}>Your Achievements</Text>
            <FlatList
              data={userAchievements}
              renderItem={renderAchievement}
              keyExtractor={item => item.id}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.achievementsList}
            />
          </Surface>
        }
      />
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
    elevation: 4,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
  listContainer: {
    padding: 16,
  },
  artifactCard: {
    marginBottom: 16,
  },
  artifactHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatar: {
    marginRight: 12,
  },
  artifactTitleContainer: {
    flex: 1,
  },
  artifactTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  artifactDate: {
    fontSize: 14,
    color: '#666',
  },
  artifactDescription: {
    fontSize: 16,
    marginBottom: 12,
  },
  artifactFooter: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  locationChip: {
    marginRight: 8,
  },
  collectedChip: {
    backgroundColor: '#4CAF50',
  },
  viewButton: {
    marginTop: 8,
  },
  achievementsHeader: {
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  achievementsList: {
    paddingRight: 16,
  },
  achievementCard: {
    width: 280,
    marginRight: 16,
  },
  achievementHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  achievementIcon: {
    marginRight: 12,
  },
  achievementTitleContainer: {
    flex: 1,
  },
  achievementTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  achievementDate: {
    fontSize: 12,
    color: '#666',
  },
  achievementDescription: {
    fontSize: 14,
  },
});

export default AchievementHall; 