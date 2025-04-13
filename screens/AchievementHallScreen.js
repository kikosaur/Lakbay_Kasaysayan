import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl, Alert, Image as RNImage } from 'react-native';
import { Text, Card, Button, Surface, ActivityIndicator, Avatar, ProgressBar } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { achievements } from '../services/api';
import { placeholderImages } from '../assets/images/placeholders';

const historicalEvents = [
  {
    id: 'mactan',
    title: 'The Battle of Mactan (1521)',
    description: 'The historic battle where Lapu-Lapu and his warriors defeated Ferdinand Magellan and his Spanish forces.',
    icon: 'sword-cross',
    progress: 100,
    artifacts: [
      {
        name: 'Kampilan Sword',
        image: placeholderImages.kampilan,
        description: 'The traditional sword used by Lapu-Lapu and his warriors during the battle.',
        unlocked: true
      },
      {
        name: 'Battle Map',
        image: placeholderImages.mactanMap,
        description: 'A detailed map showing the strategic positions during the Battle of Mactan.',
        unlocked: true
      }
    ],
    storyline: 'On April 27, 1521, Lapu-Lapu and his warriors successfully defended Mactan Island against the Spanish forces led by Ferdinand Magellan. This battle marked the first recorded resistance against foreign colonization in the Philippines.'
  },
  {
    id: 'pugadlawin',
    title: 'The Cry of Pugad Lawin (1896)',
    description: 'The beginning of the Philippine Revolution against Spanish colonial rule.',
    icon: 'flag',
    progress: 50,
    artifacts: [
      {
        name: 'Katipunan Flag',
        image: placeholderImages.katipunanFlag,
        description: 'The flag of the Katipunan revolutionary movement.',
        unlocked: true
      },
      {
        name: 'Cedula',
        image: placeholderImages.cedula,
        description: 'The symbolic tearing of the Spanish tax certificates.',
        unlocked: false
      }
    ],
    storyline: 'On August 23, 1896, Andres Bonifacio and members of the Katipunan tore their cedulas (tax certificates) as a symbol of their defiance against Spanish rule, marking the start of the Philippine Revolution.'
  },
  {
    id: 'independence',
    title: 'The Declaration of Independence (1898)',
    description: 'The proclamation of Philippine independence from Spanish rule.',
    icon: 'book-open-page-variant',
    progress: 0,
    artifacts: [
      {
        name: 'Declaration Document',
        image: placeholderImages.declaration,
        description: 'The original document declaring Philippine independence.',
        unlocked: false
      },
      {
        name: 'Philippine Flag',
        image: placeholderImages.phFlag,
        description: 'The first Philippine flag raised during the declaration.',
        unlocked: false
      }
    ],
    storyline: 'On June 12, 1898, General Emilio Aguinaldo proclaimed the independence of the Philippines from Spanish colonial rule in Kawit, Cavite. This marked the birth of the First Philippine Republic.'
  }
];

export default function AchievementHallScreen() {
  const navigation = useNavigation();
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const getProgressColor = (progress) => {
    if (progress >= 100) return '#4CAF50';
    if (progress >= 50) return '#FFC107';
    return '#F44336';
  };

  const handleARExperience = (event) => {
    if (event.progress < 100) {
      Alert.alert(
        'Achievement Required',
        'Complete this historical event to unlock the AR experience!'
      );
      return;
    }
    // Pass the first unlocked artifact to the AR screen
    const unlockedArtifact = event.artifacts.find(artifact => artifact.unlocked);
    if (unlockedArtifact) {
      navigation.navigate('AR', { 
        artifact: {
          ...unlockedArtifact,
          id: `${event.id}-${unlockedArtifact.name.toLowerCase().replace(/\s+/g, '-')}`,
          modelUrl: `../assets/models/${event.id}/${unlockedArtifact.name.toLowerCase().replace(/\s+/g, '-')}.glb`
        }
      });
    } else {
      Alert.alert(
        'No Artifacts Available',
        'No artifacts are currently unlocked for this event.'
      );
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    // Simulate refresh
    setTimeout(() => setRefreshing(false), 1000);
  };

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <Surface style={styles.header}>
        <Text variant="headlineMedium" style={styles.title}>
          Achievement Hall
        </Text>
        <Text variant="bodyLarge" style={styles.subtitle}>
          Explore historical events and their artifacts
        </Text>
      </Surface>

      <View style={styles.content}>
        {historicalEvents.map((event, index) => (
          <Card key={index} style={styles.card}>
            <Card.Content>
              <View style={styles.eventHeader}>
                <Avatar.Icon
                  size={40}
                  icon={event.icon}
                  style={{
                    backgroundColor: event.progress >= 100 ? '#4CAF50' : '#6200ee',
                  }}
                />
                <View style={styles.eventInfo}>
                  <Text variant="titleMedium" style={styles.eventTitle}>
                    {event.title}
                  </Text>
                  <Text variant="bodySmall" style={styles.eventDesc}>
                    {event.description}
                  </Text>
                </View>
              </View>

              <View style={styles.progressContainer}>
                <Text variant="bodySmall" style={styles.progressText}>
                  Progress: {Math.round(event.progress)}%
                </Text>
                <ProgressBar
                  progress={event.progress / 100}
                  color={getProgressColor(event.progress)}
                  style={styles.progressBar}
                />
              </View>

              <Text variant="bodyMedium" style={styles.storyline}>
                {event.storyline}
              </Text>

              <View style={styles.artifactsContainer}>
                <Text variant="titleSmall" style={styles.artifactsTitle}>
                  Artifacts
                </Text>
                {event.artifacts.map((artifact, artifactIndex) => (
                  <Card key={artifactIndex} style={styles.artifactCard}>
                    <Card.Content>
                      <View style={styles.artifactHeader}>
                        <View style={styles.artifactImageContainer}>
                          <RNImage
                            source={{ uri: `data:image/png;base64,${artifact.image}` }}
                            style={styles.artifactImage}
                            resizeMode="cover"
                          />
                        </View>
                        <View style={styles.artifactInfo}>
                          <Text variant="titleSmall">{artifact.name}</Text>
                          <Text variant="bodySmall" style={styles.artifactDesc}>
                            {artifact.description}
                          </Text>
                          <Text
                            variant="bodySmall"
                            style={[
                              styles.artifactStatus,
                              { color: artifact.unlocked ? '#4CAF50' : '#F44336' },
                            ]}
                          >
                            {artifact.unlocked ? 'Unlocked' : 'Locked'}
                          </Text>
                        </View>
                      </View>
                    </Card.Content>
                  </Card>
                ))}
              </View>

              <Button
                mode="outlined"
                onPress={() => handleARExperience(event)}
                style={styles.arButton}
                icon="augmented-reality"
              >
                AR Experience
              </Button>
            </Card.Content>
          </Card>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
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
  eventHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  eventInfo: {
    flex: 1,
    marginLeft: 16,
  },
  eventTitle: {
    marginBottom: 4,
  },
  eventDesc: {
    color: '#666',
  },
  progressContainer: {
    marginBottom: 16,
  },
  progressText: {
    marginBottom: 4,
    color: '#666',
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
  },
  storyline: {
    marginBottom: 16,
    color: '#333',
    lineHeight: 20,
  },
  artifactsContainer: {
    marginBottom: 16,
  },
  artifactsTitle: {
    marginBottom: 8,
  },
  artifactCard: {
    marginBottom: 8,
  },
  artifactHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  artifactImageContainer: {
    width: 60,
    height: 60,
    borderRadius: 8,
    overflow: 'hidden',
    marginRight: 12,
    backgroundColor: '#e0e0e0',
  },
  artifactImage: {
    width: '100%',
    height: '100%',
  },
  artifactInfo: {
    flex: 1,
  },
  artifactDesc: {
    color: '#666',
    marginTop: 4,
  },
  artifactStatus: {
    marginTop: 4,
    fontWeight: 'bold',
  },
  arButton: {
    marginTop: 8,
  },
}); 