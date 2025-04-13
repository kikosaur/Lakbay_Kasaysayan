import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { Text, Avatar, Button, TextInput, Surface, Divider } from 'react-native-paper';
import { useUser } from '../contexts/UserContext';

const ProfileScreen = () => {
  const { user, updateProfile, logout } = useUser();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.profile?.name || '',
    bio: user?.profile?.bio || ''
  });

  const handleUpdateProfile = async () => {
    try {
      await updateProfile({
        profile: {
          ...user.profile,
          ...formData
        }
      });
      setIsEditing(false);
      Alert.alert('Success', 'Profile updated successfully');
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      Alert.alert('Error', 'Failed to logout');
    }
  };

  if (!user) {
    return (
      <View style={styles.container}>
        <Text>Please login to view your profile</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Surface style={styles.header}>
        <Avatar.Image
          size={100}
          source={{ uri: user.profile.avatar }}
          style={styles.avatar}
        />
        {!isEditing ? (
          <>
            <Text variant="headlineMedium" style={styles.name}>
              {user.profile.name}
            </Text>
            <Text variant="bodyLarge" style={styles.bio}>
              {user.profile.bio || 'No bio yet'}
            </Text>
            <Button
              mode="outlined"
              onPress={() => setIsEditing(true)}
              style={styles.editButton}
            >
              Edit Profile
            </Button>
          </>
        ) : (
          <>
            <TextInput
              label="Name"
              value={formData.name}
              onChangeText={(text) => setFormData({ ...formData, name: text })}
              style={styles.input}
            />
            <TextInput
              label="Bio"
              value={formData.bio}
              onChangeText={(text) => setFormData({ ...formData, bio: text })}
              multiline
              style={styles.input}
            />
            <View style={styles.buttonRow}>
              <Button
                mode="outlined"
                onPress={() => setIsEditing(false)}
                style={styles.cancelButton}
              >
                Cancel
              </Button>
              <Button
                mode="contained"
                onPress={handleUpdateProfile}
                style={styles.saveButton}
              >
                Save
              </Button>
            </View>
          </>
        )}
      </Surface>

      <Surface style={styles.statsContainer}>
        <Text variant="titleLarge" style={styles.sectionTitle}>
          Running Stats
        </Text>
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text variant="headlineMedium">{user.profile.totalDistance.toFixed(1)}</Text>
            <Text variant="bodyMedium">Total Distance (km)</Text>
          </View>
          <View style={styles.statItem}>
            <Text variant="headlineMedium">{user.profile.totalRuns}</Text>
            <Text variant="bodyMedium">Total Runs</Text>
          </View>
        </View>
      </Surface>

      <Surface style={styles.achievementsContainer}>
        <Text variant="titleLarge" style={styles.sectionTitle}>
          Achievements
        </Text>
        <View style={styles.achievementsList}>
          {user.profile.achievements?.length > 0 ? (
            user.profile.achievements.map((achievement) => (
              <View key={achievement._id} style={styles.achievementItem}>
                <Text variant="bodyLarge">{achievement.title}</Text>
                <Text variant="bodyMedium" style={styles.achievementDescription}>
                  {achievement.description}
                </Text>
              </View>
            ))
          ) : (
            <Text variant="bodyMedium" style={styles.emptyText}>
              No achievements yet
            </Text>
          )}
        </View>
      </Surface>

      <Button
        mode="outlined"
        onPress={handleLogout}
        style={styles.logoutButton}
      >
        Logout
      </Button>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 20,
    alignItems: 'center',
    marginBottom: 20,
  },
  avatar: {
    marginBottom: 16,
  },
  name: {
    marginBottom: 8,
  },
  bio: {
    textAlign: 'center',
    marginBottom: 16,
    color: '#666',
  },
  editButton: {
    marginTop: 8,
  },
  input: {
    marginBottom: 16,
    width: '100%',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  cancelButton: {
    flex: 1,
    marginRight: 8,
  },
  saveButton: {
    flex: 1,
    marginLeft: 8,
  },
  statsContainer: {
    padding: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    marginBottom: 16,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  achievementsContainer: {
    padding: 20,
    marginBottom: 20,
  },
  achievementsList: {
    marginTop: 8,
  },
  achievementItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  achievementDescription: {
    color: '#666',
    marginTop: 4,
  },
  emptyText: {
    textAlign: 'center',
    color: '#666',
    marginTop: 8,
  },
  logoutButton: {
    margin: 20,
  },
});

export default ProfileScreen; 