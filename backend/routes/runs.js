const express = require('express');
const router = express.Router();
const admin = require('firebase-admin');
const { body, validationResult } = require('express-validator');

// Middleware to verify Firebase token
const verifyToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const token = authHeader.split('Bearer ')[1];
    const decodedToken = await admin.auth().verifyIdToken(token);
    req.user = decodedToken;
    next();
  } catch (error) {
    console.error('Error verifying token:', error);
    res.status(401).json({ message: 'Invalid token' });
  }
};

// Get all runs for a user
router.get('/', async (req, res) => {
  try {
    const { userId } = req.query;
    
    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    if (admin.apps.length > 0) {
      const snapshot = await admin.firestore()
        .collection('runs')
        .where('userId', '==', userId)
        .orderBy('startTime', 'desc')
        .get();

      const runs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      res.json(runs);
    } else {
      res.json([]); // Return empty array if Firebase is not initialized
    }
  } catch (error) {
    console.error('Error fetching runs:', error);
    res.status(500).json({ error: 'Failed to fetch runs' });
  }
});

// Get a specific run
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    if (admin.apps.length > 0) {
      const doc = await admin.firestore().collection('runs').doc(id).get();
      
      if (!doc.exists) {
        return res.status(404).json({ error: 'Run not found' });
      }

      res.json({ id: doc.id, ...doc.data() });
    } else {
      res.status(404).json({ error: 'Run not found' });
    }
  } catch (error) {
    console.error('Error fetching run:', error);
    res.status(500).json({ error: 'Failed to fetch run' });
  }
});

// Create a new run
router.post('/', async (req, res) => {
  try {
    const { userId, startTime, endTime, distance, route, calories } = req.body;
    
    if (!userId || !startTime || !distance || !route) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    if (admin.apps.length > 0) {
      const runData = {
        userId,
        startTime: new Date(startTime),
        endTime: endTime ? new Date(endTime) : null,
        distance: parseFloat(distance),
        route,
        calories: calories ? parseFloat(calories) : null,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      };

      const docRef = await admin.firestore().collection('runs').add(runData);
      res.status(201).json({ id: docRef.id, ...runData });
    } else {
      res.status(503).json({ error: 'Service unavailable' });
    }
  } catch (error) {
    console.error('Error creating run:', error);
    res.status(500).json({ error: 'Failed to create run' });
  }
});

// Update a run
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { endTime, distance, route, calories } = req.body;
    
    if (!endTime && !distance && !route && !calories) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    if (admin.apps.length > 0) {
      const updateData = {
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      };

      if (endTime) updateData.endTime = new Date(endTime);
      if (distance) updateData.distance = parseFloat(distance);
      if (route) updateData.route = route;
      if (calories) updateData.calories = parseFloat(calories);

      await admin.firestore().collection('runs').doc(id).update(updateData);
      res.json({ id, ...updateData });
    } else {
      res.status(503).json({ error: 'Service unavailable' });
    }
  } catch (error) {
    console.error('Error updating run:', error);
    res.status(500).json({ error: 'Failed to update run' });
  }
});

// Delete a run
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    if (admin.apps.length > 0) {
      await admin.firestore().collection('runs').doc(id).delete();
      res.status(204).send();
    } else {
      res.status(503).json({ error: 'Service unavailable' });
    }
  } catch (error) {
    console.error('Error deleting run:', error);
    res.status(500).json({ error: 'Failed to delete run' });
  }
});

module.exports = router; 