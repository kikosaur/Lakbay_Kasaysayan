import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import { Text, Card, Title, Paragraph, Button } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function CollectionScreen({ navigation }) {
  const [collectedArtifacts, setCollectedArtifacts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCollectedArtifacts();
  }, []);

  const loadCollectedArtifacts = async () => {
    try {
      const artifacts = await AsyncStorage.getItem('collectedArtifacts');
      if (artifacts) {
        const artifactIds = JSON.parse(artifacts);
        // Fetch artifact details from backend
        const response = await fetch('http://localhost:5000/api/artifacts', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ ids: artifactIds }),
        });
        
        if (response.ok) {
          const artifactDetails = await response.json();
          setCollectedArtifacts(artifactDetails);
        }
      }
      setLoading(false);
    } catch (error) {
      console.error('Error loading artifacts:', error);
      setLoading(false);
    }
  };

  const renderArtifact = ({ item }) => (
    <Card style={styles.artifactCard}>
      <Card.Content>
        <Title>{item.name}</Title>
        <Paragraph>{item.description}</Paragraph>
        <View style={styles.artifactDetails}>
          <Text style={styles.detailText}>Era: {item.era}</Text>
          <Text style={styles.detailText}>Location: {item.location}</Text>
        </View>
      </Card.Content>
      <Card.Actions>
        <Button 
          mode="contained" 
          onPress={() => navigation.navigate('AR', { artifact: item })}
        >
          View in AR
        </Button>
      </Card.Actions>
    </Card>
  );

  if (loading) {
    return (
      <View style={styles.container}>
        <Text>Loading your collection...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Your Collection</Text>
      <Text style={styles.subtitle}>
        {collectedArtifacts.length} artifacts collected
      </Text>
      
      <FlatList
        data={collectedArtifacts}
        renderItem={renderArtifact}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContainer}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
  },
  listContainer: {
    paddingBottom: 20,
  },
  artifactCard: {
    marginBottom: 15,
    elevation: 4,
  },
  artifactDetails: {
    marginTop: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  detailText: {
    color: '#666',
    fontSize: 12,
  },
}); 