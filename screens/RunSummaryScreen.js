import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, Button, Card, Title, Paragraph } from 'react-native-paper';
import { formatDistance, calculatePace, calculateCalories } from '../utils/locationUtils';

const RunSummaryScreen = ({ route, navigation }) => {
  const { runData } = route.params;
  const pace = calculatePace(runData.distance, runData.duration);
  const calories = calculateCalories(runData.distance);

  return (
    <ScrollView style={styles.container}>
      <Card style={styles.card}>
        <Card.Content>
          <Title style={styles.title}>Run Summary</Title>
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{formatDistance(runData.distance)}</Text>
              <Text style={styles.statLabel}>Distance</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{pace.toFixed(2)} min/km</Text>
              <Text style={styles.statLabel}>Pace</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{calories} kcal</Text>
              <Text style={styles.statLabel}>Calories</Text>
            </View>
          </View>
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Content>
          <Title>Historical Events Unlocked</Title>
          <Paragraph>
            You've unlocked new historical events during your run! Check them out in the History section.
          </Paragraph>
        </Card.Content>
      </Card>

      <View style={styles.buttonContainer}>
        <Button
          mode="contained"
          onPress={() => navigation.navigate('Home')}
          style={styles.button}
        >
          Back to Home
        </Button>
        <Button
          mode="outlined"
          onPress={() => navigation.navigate('History')}
          style={styles.button}
        >
          View History
        </Button>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  card: {
    margin: 16,
    elevation: 4,
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
    textAlign: 'center',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: 20,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#6200ee',
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
  },
  buttonContainer: {
    padding: 16,
  },
  button: {
    marginVertical: 8,
  },
});

export default RunSummaryScreen; 