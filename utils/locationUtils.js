import * as Location from 'expo-location';

// Calculate distance between two points in meters using Haversine formula
export const calculateDistance = (point1, point2) => {
  try {
    if (!point1 || !point2) return 0;
    
    return Location.distanceBetween(
      point1.latitude,
      point1.longitude,
      point2.latitude,
      point2.longitude
    );
  } catch (error) {
    console.error('Error calculating distance:', error);
    return 0;
  }
};

// Calculate total distance for a route
export const calculateTotalDistance = (coords) => {
  try {
    if (!coords || coords.length < 2) return 0;
    
    let totalDistance = 0;
    for (let i = 1; i < coords.length; i++) {
      totalDistance += calculateDistance(coords[i-1], coords[i]);
    }
    return totalDistance;
  } catch (error) {
    console.error('Error calculating total distance:', error);
    return 0;
  }
};

// Calculate average pace in minutes per kilometer
export const calculatePace = (distance, duration) => {
  try {
    if (!distance || !duration || distance === 0 || duration === 0) return 0;
    return (duration / 60) / (distance / 1000); // minutes per kilometer
  } catch (error) {
    console.error('Error calculating pace:', error);
    return 0;
  }
};

// Format distance in meters to readable string
export const formatDistance = (distance) => {
  try {
    if (!distance) return '0m';
    if (distance < 1000) {
      return `${Math.round(distance)}m`;
    }
    return `${(distance / 1000).toFixed(2)}km`;
  } catch (error) {
    console.error('Error formatting distance:', error);
    return '0m';
  }
};

// Calculate calories burned (rough estimate)
export const calculateCalories = (distance, duration, weight = 70) => {
  try {
    if (!distance || !duration || distance === 0 || duration === 0) return 0;
    
    // MET (Metabolic Equivalent of Task) values for running
    const speed = distance / duration; // meters per second
    const MET = speed > 2.5 ? 9.8 : 6.0; // Higher MET for faster speeds
    
    // Calories = MET * weight (kg) * time (hours)
    return Math.round((MET * weight * duration) / 3600);
  } catch (error) {
    console.error('Error calculating calories:', error);
    return 0;
  }
};

// Format duration in seconds to HH:MM:SS
export const formatDuration = (seconds) => {
  try {
    if (!seconds) return '00:00:00';
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  } catch (error) {
    console.error('Error formatting duration:', error);
    return '00:00:00';
  }
};

// Format pace in minutes per kilometer
export const formatPace = (pace) => {
  try {
    if (!pace || pace === 0) return '0:00';
    const minutes = Math.floor(pace);
    const seconds = Math.round((pace - minutes) * 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  } catch (error) {
    console.error('Error formatting pace:', error);
    return '0:00';
  }
};

export const findNearbyEvents = (events, currentLocation, maxDistance = 5000) => {
  return events.filter(event => {
    if (!event.location || !event.location.coordinates) return false;
    
    const distance = Location.distanceBetween(
      currentLocation.latitude,
      currentLocation.longitude,
      event.location.coordinates[1],
      event.location.coordinates[0]
    );
    
    return distance <= maxDistance;
  });
}; 