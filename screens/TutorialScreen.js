import React, { useState } from 'react';
import { View, StyleSheet, Dimensions, ScrollView } from 'react-native';
import { Text, Button } from 'react-native-paper';

const { width } = Dimensions.get('window');

const slides = [
  {
    title: 'Welcome to Lakbay Kasaysayan',
    description: 'Explore Philippine history through running and augmented reality!',
    image: '🏃‍♂️',
  },
  {
    title: 'Go for a Run',
    description: 'Start running to unlock historical events and artifacts.',
    image: '🎯',
  },
  {
    title: 'Collect Artifacts',
    description: 'Use AR to find and collect historical artifacts after your runs.',
    image: '📱',
  },
  {
    title: 'Build Your Collection',
    description: 'View your collected artifacts and learn about their history.',
    image: '🏛️',
  },
  {
    title: 'Earn Achievements',
    description: 'Complete challenges and earn achievements as you explore.',
    image: '🏆',
  },
];

export default function TutorialScreen({ navigation, route }) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const { onComplete } = route.params;

  const handleNext = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    } else {
      onComplete();
    }
  };

  const handleSkip = () => {
    onComplete();
  };

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={({ nativeEvent }) => {
          const slide = Math.round(nativeEvent.contentOffset.x / width);
          setCurrentSlide(slide);
        }}
        scrollEventThrottle={16}
      >
        {slides.map((slide, index) => (
          <View key={index} style={styles.slide}>
            <Text style={styles.image}>{slide.image}</Text>
            <Text style={styles.title}>{slide.title}</Text>
            <Text style={styles.description}>{slide.description}</Text>
          </View>
        ))}
      </ScrollView>

      <View style={styles.pagination}>
        {slides.map((_, index) => (
          <View
            key={index}
            style={[
              styles.paginationDot,
              index === currentSlide && styles.paginationDotActive,
            ]}
          />
        ))}
      </View>

      <View style={styles.buttonContainer}>
        {currentSlide < slides.length - 1 ? (
          <Button
            mode="text"
            onPress={handleSkip}
            style={styles.skipButton}
          >
            Skip
          </Button>
        ) : null}
        <Button
          mode="contained"
          onPress={handleNext}
          style={styles.nextButton}
        >
          {currentSlide === slides.length - 1 ? 'Get Started' : 'Next'}
        </Button>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  slide: {
    width,
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  image: {
    fontSize: 100,
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
  },
  description: {
    fontSize: 16,
    textAlign: 'center',
    color: '#666',
    paddingHorizontal: 20,
  },
  pagination: {
    flexDirection: 'row',
    position: 'absolute',
    top: 20,
    left: 0,
    right: 0,
    justifyContent: 'center',
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ccc',
    marginHorizontal: 5,
  },
  paginationDotActive: {
    backgroundColor: '#000',
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 20,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
  },
  skipButton: {
    marginRight: 10,
  },
  nextButton: {
    flex: 1,
  },
}); 