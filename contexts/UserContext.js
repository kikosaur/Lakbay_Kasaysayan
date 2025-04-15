import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  updateProfile as firebaseUpdateProfile,
  onAuthStateChanged,
  signOut
} from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from '../utils/firebaseConfig';

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          // Get additional user data from Firestore
          const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
          if (userDoc.exists()) {
            setUser({
              uid: firebaseUser.uid,
              email: firebaseUser.email,
              displayName: firebaseUser.displayName,
              ...userDoc.data()
            });
          } else {
            setUser({
              uid: firebaseUser.uid,
              email: firebaseUser.email,
              displayName: firebaseUser.displayName
            });
          }
        } catch (error) {
          console.error('Error loading user data:', error);
          setUser({
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            displayName: firebaseUser.displayName
          });
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (email, password) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      // Store user token for compatibility with your existing code
      const token = await userCredential.user.getIdToken();
      await AsyncStorage.setItem('token', token);
      setError(null);
      return userCredential.user;
    } catch (error) {
      setError(error.message);
      throw error;
    }
  };

  const register = async (username, email, password) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      // Update profile with username
      await firebaseUpdateProfile(userCredential.user, {
        displayName: username
      });
      
      // Create user document in Firestore
      await setDoc(doc(db, 'users', userCredential.user.uid), {
        username,
        email,
        createdAt: new Date()
      });
      
      // Store user token for compatibility with your existing code
      const token = await userCredential.user.getIdToken();
      await AsyncStorage.setItem('token', token);
      setError(null);
      return userCredential.user;
    } catch (error) {
      setError(error.message);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      await AsyncStorage.removeItem('token');
      setError(null);
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const updateProfile = async (updates) => {
    try {
      if (!user) throw new Error('User not authenticated');
      
      // Update in Firestore
      await updateDoc(doc(db, 'users', user.uid), updates);
      
      // If updating displayName, also update in Firebase Auth
      if (updates.username) {
        await firebaseUpdateProfile(auth.currentUser, {
          displayName: updates.username
        });
      }
      
      // Refresh user data
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      const updatedUser = {
        ...user,
        ...userDoc.data(),
        displayName: updates.username || user.displayName
      };
      
      setUser(updatedUser);
      setError(null);
      return updatedUser;
    } catch (error) {
      setError(error.message);
      throw error;
    }
  };

  return (
    <UserContext.Provider
      value={{
        user,
        loading,
        error,
        login,
        register,
        logout,
        updateProfile
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};