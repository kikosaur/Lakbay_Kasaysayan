import React from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Button, Text, Card, Title, Paragraph } from 'react-native-paper';

export default function DevelopmentScreen({ navigation }) {
  const testArtifacts = [
    {
      id: 1,
      name: 'Test Artifact 1',
      description: 'This is a test artifact for AR development',
      model: null,
      location: {
        latitude: 14.5995,
        longitude: 120.9842,
      },
    },
    {
      id: 2,
      name: 'Test Artifact 2',
      description: 'Another test artifact for AR development',
      model: null,
      location: {
        latitude: 14.6000,
        longitude: 120.9850,
      },
    },
  ];

  const defaultLocation = {
    coords: {
      latitude: 14.5995,
      longitude: 120.9842,
      altitude: 0,
      accuracy: 5,
      altitudeAccuracy: 5,
      heading: 0,
      speed: 0,
    },
    timestamp: Date.now(),
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Development Mode</Text>
      
      <Card style={styles.section}>
        <Card.Content>
          <Title>AR Testing</Title>
          <Paragraph>Test AR functionality with sample artifacts</Paragraph>
          {testArtifacts.map((artifact) => (
            <Button
              key={artifact.id}
              mode="contained"
              style={styles.button}
              onPress={() => navigation.navigate('AR', { artifact })}
            >
              Test AR: {artifact.name}
            </Button>
          ))}
        </Card.Content>
      </Card>

      <Card style={styles.section}>
        <Card.Content>
          <Title>Map Testing</Title>
          <Paragraph>Test map functionality with sample locations</Paragraph>
          <Button
            mode="contained"
            style={styles.button}
            onPress={() => navigation.navigate('Map', { testMode: true })}
          >
            Test Map
          </Button>
        </Card.Content>
      </Card>

      <Card style={styles.section}>
        <Card.Content>
          <Title>Navigation Testing</Title>
          <Paragraph>Test navigation between screens</Paragraph>
          <Button
            mode="contained"
            style={styles.button}
            onPress={() => navigation.navigate('Run', { 
              testMode: true,
              initialLocation: defaultLocation,
              subscription: {
                remove: () => {},
              },
              onStop: () => {},
            })}
          >
            Test Run Screen
          </Button>
          <Button
            mode="contained"
            style={styles.button}
            onPress={() => navigation.navigate('History', { testMode: true })}
          >
            Test History Screen
          </Button>
        </Card.Content>
      </Card>

      <Card style={styles.section}>
        <Card.Content>
          <Title>AR Screen</Title>
          <Paragraph>Test AR functionality</Paragraph>
          <Button
            mode="contained"
            style={styles.button}
            onPress={() => navigation.navigate('AR')}
          >
            Test AR Screen
          </Button>
        </Card.Content>
      </Card>

      <Card style={styles.section}>
        <Card.Content>
          <Title>Achievement Hall</Title>
          <Paragraph>Test Achievement Hall</Paragraph>
          <Button
            mode="contained"
            style={styles.button}
            onPress={() => navigation.navigate('AchievementHall')}
          >
            Test Achievement Hall
          </Button>
        </Card.Content>
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  section: {
    marginBottom: 20,
  },
  button: {
    marginTop: 10,
  },
}); 