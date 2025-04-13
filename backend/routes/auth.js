const express = require('express');
const router = express.Router();
const admin = require('firebase-admin');

// Register new user
router.post('/register', async (req, res) => {
  try {
    const { email, password, username } = req.body;

    // Create user in Firebase Auth
    const userRecord = await admin.auth().createUser({
      email,
      password,
      displayName: username
    });

    // Create user document in Firestore
    await admin.firestore().collection('users').doc(userRecord.uid).set({
      email,
      username,
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });

    // Generate custom token for the user
    const token = await admin.auth().createCustomToken(userRecord.uid);

    res.status(201).json({
      message: 'User created successfully',
      user: {
        id: userRecord.uid,
        email: userRecord.email,
        username: userRecord.displayName
      },
      token
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(400).json({ error: error.message });
  }
});

// Login user
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Sign in with email and password using Firebase Auth
    const userRecord = await admin.auth().getUserByEmail(email);
    
    // Generate custom token for the user
    const token = await admin.auth().createCustomToken(userRecord.uid);

    // Get user data from Firestore
    const userDoc = await admin.firestore()
      .collection('users')
      .doc(userRecord.uid)
      .get();

    res.json({
      message: 'Login successful',
      user: {
        id: userRecord.uid,
        email: userRecord.email,
        username: userRecord.displayName,
        ...userDoc.data()
      },
      token
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(401).json({ error: 'Invalid credentials' });
  }
});

// Get current user
router.get('/me', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const token = authHeader.split(' ')[1];
    const decodedToken = await admin.auth().verifyIdToken(token);
    
    const userDoc = await admin.firestore()
      .collection('users')
      .doc(decodedToken.uid)
      .get();

    if (!userDoc.exists) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      id: decodedToken.uid,
      email: decodedToken.email,
      ...userDoc.data()
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(401).json({ error: 'Invalid token' });
  }
});

module.exports = router; 