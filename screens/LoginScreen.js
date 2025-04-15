import React, { useState, useEffect } from 'react'; // 👈 Added useEffect
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { Text, TextInput, Button, Surface } from 'react-native-paper';
import { useUser } from '../contexts/UserContext';

const LoginScreen = ({ navigation }) => {
  const { login, register } = useUser();
  const [isRegistering, setIsRegistering] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const handleSubmit = async () => {
    try {
      if (isRegistering) {
        if (formData.password !== formData.confirmPassword) {
          Alert.alert('Error', 'Passwords do not match');
          return;
        }
        await register(formData.username, formData.email, formData.password);
      } else {
        await login(formData.email, formData.password);
      }

      // 👇 Navigate to Home after successful login/register
      navigation.reset({
        index: 0,
        routes: [{ name: 'Home' }],
      });

    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  const handleBypass = async () => {
    try {
      await login('kairuciriaca@gmail.com', 'ciriaca');

      // 👇 Navigate to Home after bypass login
      navigation.reset({
        index: 0,
        routes: [{ name: 'Home' }],
      });

    } catch (error) {
      Alert.alert('Error', 'Failed to bypass login');
    }
  };

  // 👇 Auto-login on dev mode
  useEffect(() => {
    if (__DEV__) {
      handleBypass();
    }
  }, []);

  return (
    <ScrollView style={styles.container}>
      <Surface style={styles.formContainer}>
        <Text variant="headlineMedium" style={styles.title}>
          {isRegistering ? 'Create Account' : 'Welcome Back'}
        </Text>

        {isRegistering && (
          <TextInput
            label="Username"
            value={formData.username}
            onChangeText={(text) => setFormData({ ...formData, username: text })}
            style={styles.input}
            autoCapitalize="none"
          />
        )}

        <TextInput
          label="Email"
          value={formData.email}
          onChangeText={(text) => setFormData({ ...formData, email: text })}
          style={styles.input}
          autoCapitalize="none"
          keyboardType="email-address"
        />

        <TextInput
          label="Password"
          value={formData.password}
          onChangeText={(text) => setFormData({ ...formData, password: text })}
          style={styles.input}
          secureTextEntry
        />

        {isRegistering && (
          <TextInput
            label="Confirm Password"
            value={formData.confirmPassword}
            onChangeText={(text) => setFormData({ ...formData, confirmPassword: text })}
            style={styles.input}
            secureTextEntry
          />
        )}

        <Button
          mode="contained"
          onPress={handleSubmit}
          style={styles.submitButton}
        >
          {isRegistering ? 'Register' : 'Login'}
        </Button>

        <Button
          mode="text"
          onPress={() => setIsRegistering(!isRegistering)}
          style={styles.switchButton}
        >
          {isRegistering
            ? 'Already have an account? Login'
            : "Don't have an account? Register"}
        </Button>

        {!isRegistering && (
          <Button
            mode="outlined"
            onPress={handleBypass}
            style={styles.bypassButton}
          >
            Quick Access (Development)
          </Button>
        )}
      </Surface>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  formContainer: {
    padding: 20,
    margin: 20,
    elevation: 2,
  },
  title: {
    textAlign: 'center',
    marginBottom: 24,
  },
  input: {
    marginBottom: 16,
  },
  submitButton: {
    marginTop: 8,
  },
  switchButton: {
    marginTop: 16,
  },
  bypassButton: {
    marginTop: 8,
    borderColor: '#666',
  },
});

export default LoginScreen;
