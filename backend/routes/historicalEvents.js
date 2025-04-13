const express = require('express');
const router = express.Router();
const admin = require('firebase-admin');
const { body, validationResult } = require('express-validator');
const verifyToken = require('../middleware/auth');

// Sample historical events data
const sampleEvents = [
  {
    id: '1',
    title: 'The First Philippine Republic',
    description: 'The establishment of the First Philippine Republic on January 23, 1899, marked the first constitutional republic in Asia.',
    date: '1899-01-23',
    location: {
      latitude: 14.5995,
      longitude: 120.9842,
      name: 'Malolos, Bulacan'
    },
    artifacts: [
      {
        id: '1',
        name: 'Malolos Constitution',
        description: 'The first constitution of the Philippines',
        modelUrl: 'https://example.com/models/constitution.glb'
      }
    ]
  },
  {
    id: '2',
    title: 'The Cry of Pugad Lawin',
    description: 'The beginning of the Philippine Revolution against Spanish colonial rule.',
    date: '1896-08-23',
    location: {
      latitude: 14.6576,
      longitude: 121.0310,
      name: 'Quezon City'
    },
    artifacts: [
      {
        id: '2',
        name: 'Katipunan Flag',
        description: 'The flag of the revolutionary society',
        modelUrl: 'https://example.com/models/flag.glb'
      }
    ]
  }
];

// Get all historical events
router.get('/', async (req, res) => {
  try {
    if (admin.apps.length > 0) {
      const snapshot = await admin.firestore().collection('historicalEvents').get();
      const events = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      res.json(events);
    } else {
      res.json(sampleEvents);
    }
  } catch (error) {
    console.error('Error fetching historical events:', error);
    res.status(500).json({ error: 'Failed to fetch historical events' });
  }
});

// Get historical events near a location
router.get('/nearby', async (req, res) => {
  try {
    const { latitude, longitude, radius = 10 } = req.query;
    
    if (!latitude || !longitude) {
      return res.status(400).json({ error: 'Latitude and longitude are required' });
    }

    if (admin.apps.length > 0) {
      const snapshot = await admin.firestore()
        .collection('historicalEvents')
        .where('location.latitude', '>=', parseFloat(latitude) - radius)
        .where('location.latitude', '<=', parseFloat(latitude) + radius)
        .where('location.longitude', '>=', parseFloat(longitude) - radius)
        .where('location.longitude', '<=', parseFloat(longitude) + radius)
        .get();

      const events = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      res.json(events);
    } else {
      // Filter sample data based on location
      const events = sampleEvents.filter(event => {
        const distance = Math.sqrt(
          Math.pow(event.location.latitude - parseFloat(latitude), 2) +
          Math.pow(event.location.longitude - parseFloat(longitude), 2)
        );
        return distance <= radius;
      });
      res.json(events);
    }
  } catch (error) {
    console.error('Error fetching nearby historical events:', error);
    res.status(500).json({ error: 'Failed to fetch nearby historical events' });
  }
});

// Get a specific historical event
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    if (admin.apps.length > 0) {
      const doc = await admin.firestore().collection('historicalEvents').doc(id).get();
      
      if (!doc.exists) {
        return res.status(404).json({ error: 'Historical event not found' });
      }

      res.json({ id: doc.id, ...doc.data() });
    } else {
      const event = sampleEvents.find(e => e.id === id);
      
      if (!event) {
        return res.status(404).json({ error: 'Historical event not found' });
      }

      res.json(event);
    }
  } catch (error) {
    console.error('Error fetching historical event:', error);
    res.status(500).json({ error: 'Failed to fetch historical event' });
  }
});

// Get all historical events with pagination and filtering
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 10, category, verified, search } = req.query;
    let query = admin.firestore().collection('historicalEvents');

    // Apply filters
    if (category) query = query.where('category', '==', category);
    if (verified) query = query.where('verified', '==', verified === 'true');
    
    // Apply search if provided
    if (search) {
      const eventsSnapshot = await query.get();
      const events = [];
      eventsSnapshot.forEach(doc => {
        const data = doc.data();
        if (data.title.toLowerCase().includes(search.toLowerCase()) || 
            data.description.toLowerCase().includes(search.toLowerCase())) {
          events.push({
            id: doc.id,
            ...data
          });
        }
      });
      
      const startIndex = (page - 1) * limit;
      const paginatedEvents = events.slice(startIndex, startIndex + limit);
      
      return res.json({
        events: paginatedEvents,
        totalPages: Math.ceil(events.length / limit),
        currentPage: page
      });
    }

    // Get total count
    const snapshot = await query.get();
    const totalCount = snapshot.size;

    // Apply pagination
    query = query
      .orderBy('date', 'desc')
      .limit(limit)
      .offset((page - 1) * limit);

    const eventsSnapshot = await query.get();
    const events = [];
    eventsSnapshot.forEach(doc => {
      events.push({
        id: doc.id,
        ...doc.data()
      });
    });

    res.json({
      events,
      totalPages: Math.ceil(totalCount / limit),
      currentPage: page
    });
  } catch (error) {
    console.error('Error fetching historical events:', error);
    res.status(500).json({ error: 'Failed to fetch historical events' });
  }
});

// Create a new historical event
router.post('/', verifyToken, [
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('description').trim().notEmpty().withMessage('Description is required'),
  body('date').isISO8601().withMessage('Valid date is required'),
  body('location.coordinates').isArray().withMessage('Valid coordinates are required'),
  body('category').isIn(['battle', 'monument', 'museum', 'historical_site', 'cultural_event', 'other'])
    .withMessage('Invalid category')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const eventData = {
      ...req.body,
      createdBy: req.user.uid,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    };

    const docRef = await admin.firestore()
      .collection('historicalEvents')
      .add(eventData);

    res.status(201).json({
      message: 'Historical event created successfully',
      eventId: docRef.id
    });
  } catch (error) {
    console.error('Error creating historical event:', error);
    res.status(500).json({ message: 'Error creating historical event' });
  }
});

// Update a historical event
router.put('/:id', verifyToken, [
  body('title').optional().trim().notEmpty(),
  body('description').optional().trim().notEmpty(),
  body('date').optional().isISO8601(),
  body('category').optional().isIn(['battle', 'monument', 'museum', 'historical_site', 'cultural_event', 'other'])
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const eventRef = admin.firestore()
      .collection('historicalEvents')
      .doc(req.params.id);

    const eventDoc = await eventRef.get();
    if (!eventDoc.exists) {
      return res.status(404).json({ message: 'Historical event not found' });
    }

    const eventData = eventDoc.data();
    if (eventData.createdBy !== req.user.uid && !req.user.isAdmin) {
      return res.status(403).json({ message: 'Not authorized to update this event' });
    }

    await eventRef.update({
      ...req.body,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });

    const updatedDoc = await eventRef.get();
    res.json({
      message: 'Historical event updated successfully',
      event: {
        id: updatedDoc.id,
        ...updatedDoc.data()
      }
    });
  } catch (error) {
    console.error('Error updating historical event:', error);
    res.status(500).json({ message: 'Error updating historical event' });
  }
});

// Delete a historical event
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    const eventRef = admin.firestore()
      .collection('historicalEvents')
      .doc(req.params.id);

    const eventDoc = await eventRef.get();
    if (!eventDoc.exists) {
      return res.status(404).json({ message: 'Historical event not found' });
    }

    const eventData = eventDoc.data();
    if (eventData.createdBy !== req.user.uid && !req.user.isAdmin) {
      return res.status(403).json({ message: 'Not authorized to delete this event' });
    }

    await eventRef.delete();
    res.json({ message: 'Historical event deleted successfully' });
  } catch (error) {
    console.error('Error deleting historical event:', error);
    res.status(500).json({ message: 'Error deleting historical event' });
  }
});

// Verify a historical event (admin only)
router.patch('/:id/verify', verifyToken, async (req, res) => {
  try {
    if (!req.user.isAdmin) {
      return res.status(403).json({ message: 'Not authorized to verify events' });
    }

    const eventRef = admin.firestore()
      .collection('historicalEvents')
      .doc(req.params.id);

    const eventDoc = await eventRef.get();
    if (!eventDoc.exists) {
      return res.status(404).json({ message: 'Historical event not found' });
    }

    await eventRef.update({
      verified: true,
      verificationNotes: req.body.notes,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });

    const updatedDoc = await eventRef.get();
    res.json({
      message: 'Historical event verified successfully',
      event: {
        id: updatedDoc.id,
        ...updatedDoc.data()
      }
    });
  } catch (error) {
    console.error('Error verifying historical event:', error);
    res.status(500).json({ message: 'Error verifying historical event' });
  }
});

module.exports = router; 