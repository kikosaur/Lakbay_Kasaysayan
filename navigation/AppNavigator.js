import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { IconButton } from 'react-native-paper';
import HomeScreen from '../screens/HomeScreen';
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import MapScreen from '../screens/MapScreen';
import RunScreen from '../screens/RunScreen';
import AchievementHallScreen from '../screens/AchievementHallScreen';
import ARScreen from '../screens/ARScreen';
import EventDetailsScreen from '../screens/EventDetailsScreen';
import DevelopmentScreen from '../screens/DevelopmentScreen';
import HistoryScreen from '../screens/HistoryScreen';
import CollectionScreen from '../screens/CollectionScreen';
import TutorialScreen from '../screens/TutorialScreen';
import AsyncStorage from '@react-native-async-storage/async-storage';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

const MainTabs = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Map') {
            iconName = focused ? 'map' : 'map-outline';
          } else if (route.name === 'Collection') {
            iconName = focused ? 'book' : 'book-outline';
          } else if (route.name === 'Achievements') {
            iconName = focused ? 'trophy' : 'trophy-outline';
          }

          return <IconButton icon={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#6200ee',
        tabBarInactiveTintColor: 'gray',
        headerShown: false,
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Map" component={MapScreen} />
      <Tab.Screen name="Collection" component={CollectionScreen} />
      <Tab.Screen name="Achievements" component={AchievementHallScreen} />
    </Tab.Navigator>
  );
};

export default function AppNavigator() {
  const [showTutorial, setShowTutorial] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    checkTutorialStatus();
    checkAuthStatus();
  }, []);

  const checkTutorialStatus = async () => {
    try {
      const tutorialShown = await AsyncStorage.getItem('tutorialShown');
      setShowTutorial(!tutorialShown);
    } catch (error) {
      console.error('Error checking tutorial status:', error);
    }
  };

  const checkAuthStatus = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      setIsAuthenticated(!!token);
    } catch (error) {
      console.error('Error checking auth status:', error);
    }
  };

  const handleTutorialComplete = async () => {
    try {
      await AsyncStorage.setItem('tutorialShown', 'true');
      setShowTutorial(false);
    } catch (error) {
      console.error('Error saving tutorial status:', error);
    }
  };

  const handleLogin = () => {
    setIsAuthenticated(true);
  };

  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem('token');
      setIsAuthenticated(false);
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  return (
    <NavigationContainer>
      <Stack.Navigator>
        {showTutorial ? (
          <Stack.Screen 
            name="Tutorial" 
            component={TutorialScreen}
            options={{ headerShown: false }}
            initialParams={{ onComplete: handleTutorialComplete }}
          />
        ) : !isAuthenticated ? (
          <>
            <Stack.Screen 
              name="Login" 
              component={LoginScreen}
              options={{ headerShown: false }}
              initialParams={{ onLogin: handleLogin }}
            />
            <Stack.Screen 
              name="Register" 
              component={RegisterScreen}
              options={{ headerShown: false }}
            />
          </>
        ) : (
          <>
            <Stack.Screen 
              name="MainTabs" 
              component={MainTabs}
              options={{ headerShown: false }}
            />
            <Stack.Screen 
              name="Run" 
              component={RunScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen 
              name="AR" 
              component={ARScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen 
              name="EventDetails" 
              component={EventDetailsScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen 
              name="History" 
              component={HistoryScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen 
              name="Development" 
              component={DevelopmentScreen}
              options={{ headerShown: false }}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
} 