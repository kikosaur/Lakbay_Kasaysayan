import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Dimensions, Alert } from 'react-native';
import { Text, Button, Surface, ProgressBar } from 'react-native-paper';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Camera } from 'expo-camera';
import { GLView } from 'expo-gl';
import { THREE } from 'expo-three';
import { Renderer } from 'expo-three';
import { Asset } from 'expo-asset';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { achievements } from '../services/api';

const ARScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { artifact } = route.params || {};
  
  if (!artifact) {
    return (
      <View style={styles.container}>
        <Text variant="headlineMedium" style={styles.errorText}>
          No artifact selected
        </Text>
        <Button mode="contained" onPress={() => navigation.goBack()}>
          Go Back
        </Button>
      </View>
    );
  }

  const [hasPermission, setHasPermission] = useState(null);
  const [model, setModel] = useState(null);
  const [scene, setScene] = useState(null);
  const [camera, setCamera] = useState(null);
  const [renderer, setRenderer] = useState(null);
  const [isModelLoaded, setIsModelLoaded] = useState(false);
  const [collectionProgress, setCollectionProgress] = useState(0);
  const [isCollecting, setIsCollecting] = useState(false);
  const [isCollected, setIsCollected] = useState(false);

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
      checkIfCollected();
    })();
  }, []);

  const checkIfCollected = async () => {
    try {
      const collectedArtifacts = await AsyncStorage.getItem('collectedArtifacts');
      if (collectedArtifacts) {
        const artifacts = JSON.parse(collectedArtifacts);
        setIsCollected(artifacts.includes(artifact.id));
      }
    } catch (error) {
      console.error('Error checking collection:', error);
    }
  };

  const onContextCreate = async (gl) => {
    try {
      // Create scene
      const newScene = new THREE.Scene();
      setScene(newScene);

      // Create camera
      const newCamera = new THREE.PerspectiveCamera(
        75,
        Dimensions.get('window').width / Dimensions.get('window').height,
        0.1,
        1000
      );
      newCamera.position.z = 5;
      setCamera(newCamera);

      // Create renderer
      const newRenderer = new Renderer({ gl });
      newRenderer.setSize(
        Dimensions.get('window').width,
        Dimensions.get('window').height
      );
      newRenderer.setClearColor(0x000000, 0);
      setRenderer(newRenderer);

      // Add lights
      const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
      newScene.add(ambientLight);

      const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
      directionalLight.position.set(0, 1, 0);
      newScene.add(directionalLight);

      // Create cube
      const geometry = new THREE.BoxGeometry(1, 1, 1);
      const material = new THREE.MeshPhongMaterial({ 
        color: 0x00ff00,
        transparent: true,
        opacity: 0.8
      });
      const cube = new THREE.Mesh(geometry, material);
      newScene.add(cube);
      setModel(cube);
      setIsModelLoaded(true);

      // Animation loop
      const animate = () => {
        requestAnimationFrame(animate);
        if (cube) {
          cube.rotation.x += 0.01;
          cube.rotation.y += 0.01;
        }
        newRenderer.render(newScene, newCamera);
        gl.endFrameEXP();
      };
      animate();
    } catch (error) {
      console.error('Error setting up AR:', error);
      Alert.alert('Error', 'Failed to set up AR experience. Please try again later.');
    }
  };

  const handleCollect = async () => {
    if (isCollected) return;

    setIsCollecting(true);
    let progress = 0;
    const interval = setInterval(() => {
      progress += 0.1;
      setCollectionProgress(progress);
      if (progress >= 1) {
        clearInterval(interval);
        saveArtifact();
      }
    }, 100);
  };

  const saveArtifact = async () => {
    try {
      const collectedArtifacts = await AsyncStorage.getItem('collectedArtifacts');
      let artifacts = [];
      if (collectedArtifacts) {
        artifacts = JSON.parse(collectedArtifacts);
      }
      
      if (!artifacts.includes(artifact.id)) {
        artifacts.push(artifact.id);
        await AsyncStorage.setItem('collectedArtifacts', JSON.stringify(artifacts));
        setIsCollected(true);
        
        try {
          const response = await achievements.check({
            artifactId: artifact.id,
            collectionCount: artifacts.length
          });

          if (response.newAchievements?.length > 0) {
            Alert.alert(
              'New Achievement!',
              `You've earned: ${response.newAchievements.map(a => a.name).join(', ')}`,
              [
                {
                  text: 'View Achievements',
                  onPress: () => navigation.navigate('AchievementHall'),
                },
                {
                  text: 'Continue',
                  style: 'cancel',
                },
              ]
            );
          }
        } catch (error) {
          console.error('Error checking achievements:', error);
        }
      }
    } catch (error) {
      console.error('Error saving artifact:', error);
      Alert.alert('Error', 'Failed to save artifact');
    } finally {
      setIsCollecting(false);
    }
  };

  if (hasPermission === null) {
    return <View />;
  }
  if (hasPermission === false) {
    return <Text>No access to camera</Text>;
  }

  return (
    <View style={styles.container}>
      <Camera style={styles.camera} type={Camera.Constants.Type.back}>
        <GLView
          style={styles.glView}
          onContextCreate={onContextCreate}
        />
      </Camera>

      <Surface style={styles.overlay}>
        <Text style={styles.artifactName}>{artifact.name}</Text>
        <Text style={styles.artifactDescription}>{artifact.description}</Text>
        {!isModelLoaded && (
          <Text style={styles.loadingText}>Loading artifact...</Text>
        )}
        
        {!isCollected && (
          <>
            <Button
              mode="contained"
              onPress={handleCollect}
              style={styles.collectButton}
              disabled={isCollecting}
            >
              {isCollecting ? 'Collecting...' : 'Collect Artifact'}
            </Button>
            {isCollecting && (
              <ProgressBar
                progress={collectionProgress}
                color="#4CAF50"
                style={styles.progressBar}
              />
            )}
          </>
        )}
        
        <Button
          mode="outlined"
          onPress={() => navigation.goBack()}
          style={styles.closeButton}
        >
          Close
        </Button>
      </Surface>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  camera: {
    flex: 1,
  },
  glView: {
    flex: 1,
  },
  overlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  artifactName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  artifactDescription: {
    fontSize: 16,
    color: '#fff',
    marginBottom: 16,
  },
  loadingText: {
    fontSize: 16,
    color: '#fff',
    textAlign: 'center',
    marginBottom: 16,
  },
  collectButton: {
    marginBottom: 16,
    backgroundColor: '#4CAF50',
  },
  progressBar: {
    height: 10,
    borderRadius: 5,
    marginBottom: 16,
  },
  closeButton: {
    marginTop: 8,
  },
  errorText: {
    color: '#fff',
    textAlign: 'center',
    marginBottom: 16,
  },
});

export default ARScreen; 