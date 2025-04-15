import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Provider as PaperProvider } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StatusBar } from 'expo-status-bar';
import { UserProvider } from './contexts/UserContext';[]
import * as THREE from 'three';
import * as ExpoThree from 'expo-three';


// Import screens
import LoginScreen from './screens/LoginScreen';
import HomeTab from './screens/HomeTab';
import ARScreen from './screens/ARScreen';
import AchievementHallScreen from './screens/AchievementHallScreen';
import RunTracking from './screens/RunScreen';
import ProfileScreen from './screens/Profile';

const Stack = createNativeStackNavigator();

export default function App() {

  console.log('THREE version:', THREE.REVISION);
  console.log('expo-three version:', ExpoThree.version || 'unknown');

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <UserProvider>  {/* Add UserProvider here */}
          <PaperProvider>
            <NavigationContainer>
              <StatusBar style="auto" />
              <Stack.Navigator initialRouteName="Login">
                <Stack.Screen 
                  name="Login" 
                  component={LoginScreen} 
                  options={{ headerShown: false }}
                />
                <Stack.Screen 
                  name="Home" 
                  component={HomeTab} 
                  options={{ headerShown: false }}
                />
                <Stack.Screen 
                  name="AR" 
                  component={ARScreen} 
                  options={{ headerShown: false }}
                />
                <Stack.Screen 
                  name="AchievementHallScreen" 
                  component={AchievementHallScreen} 
                  options={{ headerShown: false }}
                />
                <Stack.Screen 
                  name="RunTracking" 
                  component={RunTracking} 
                  options={{ headerShown: false }}
                />
                <Stack.Screen 
                  name="Profile" 
                  component={ProfileScreen} 
                  options={{ headerShown: false }}
                />
              </Stack.Navigator>
            </NavigationContainer>
          </PaperProvider>
        </UserProvider>  {/* Close UserProvider here */}
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}