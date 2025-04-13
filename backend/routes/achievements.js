const express = require('express');
const router = express.Router();
const admin = require('firebase-admin');

// Sample achievement definitions
const achievementDefinitions = {
  'first_run': {
    title: 'First Steps',
    description: 'Complete your first run',
    icon: '🏃',
    points: 100
  },
  'distance_5k': {
    title: '5K Runner',
    description: 'Run a total of 5 kilometers',
    icon: '🏅',
    points: 200
  },
  'distance_10k': {
    title: '10K Runner',
    description: 'Run a total of 10 kilometers',
    icon: '🏆',
    points: 500
  },
  'artifact_collector': {
    title: 'Artifact Collector',
    description: 'Collect your first historical artifact',
    icon: '🏺',
    points: 150
  },
  'history_buff': {
    title: 'History Buff',
    description: 'Visit 5 different historical locations',
    icon: '📚',
    points: 300
  }
};

// Get all achievements for a user
router.get('/', async (req, res) => {
  try {
    const { userId } = req.query;
    
    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    if (admin.apps.length > 0) {
      const snapshot = await admin.firestore()
        .collection('achievements')
        .where('userId', '==', userId)
        .get();

      const achievements = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      res.json(achievements);
    } else {
      res.json([]); // Return empty array if Firebase is not initialized
    }
  } catch (error) {
    console.error('Error fetching achievements:', error);
    res.status(500).json({ error: 'Failed to fetch achievements' });
  }
});

// Get a specific achievement
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    if (admin.apps.length > 0) {
      const doc = await admin.firestore().collection('achievements').doc(id).get();
      
      if (!doc.exists) {
        return res.status(404).json({ error: 'Achievement not found' });
      }

      res.json({ id: doc.id, ...doc.data() });
    } else {
      res.status(404).json({ error: 'Achievement not found' });
    }
  } catch (error) {
    console.error('Error fetching achievement:', error);
    res.status(500).json({ error: 'Failed to fetch achievement' });
  }
});

// Check and award achievements
router.post('/check', async (req, res) => {
  try {
    const { userId, type, data } = req.body;
    
    if (!userId || !type || !data) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    if (admin.apps.length === 0) {
      return res.status(503).json({ error: 'Service unavailable' });
    }

    const newAchievements = [];
    const userRef = admin.firestore().collection('users').doc(userId);
    const achievementsRef = admin.firestore().collection('achievements');

    // Get user's current achievements
    const achievementsSnapshot = await achievementsRef
      .where('userId', '==', userId)
      .get();
    
    const currentAchievements = new Set(
      achievementsSnapshot.docs.map(doc => doc.data().type)
    );

    // Check for new achievements based on type
    switch (type) {
      case 'run':
        const totalDistance = data.distance || 0;
        if (totalDistance >= 5000 && !currentAchievements.has('distance_5k')) {
          newAchievements.push('distance_5k');
        }
        if (totalDistance >= 10000 && !currentAchievements.has('distance_10k')) {
          newAchievements.push('distance_10k');
        }
        break;

      case 'artifact':
        if (!currentAchievements.has('artifact_collector')) {
          newAchievements.push('artifact_collector');
        }
        break;

      case 'location':
        const locationCount = data.count || 0;
        if (locationCount >= 5 && !currentAchievements.has('history_buff')) {
          newAchievements.push('history_buff');
        }
        break;
    }

    // Award new achievements
    const batch = admin.firestore().batch();
    let totalPoints = 0;

    for (const achievementType of newAchievements) {
      const achievementData = {
        userId,
        type: achievementType,
        ...achievementDefinitions[achievementType],
        earnedAt: admin.firestore.FieldValue.serverTimestamp()
      };

      const newAchievementRef = achievementsRef.doc();
      batch.set(newAchievementRef, achievementData);
      totalPoints += achievementData.points;
    }

    // Update user's total points
    if (totalPoints > 0) {
      batch.update(userRef, {
        totalPoints: admin.firestore.FieldValue.increment(totalPoints)
      });
    }

    await batch.commit();

    res.json({
      newAchievements,
      totalPoints
    });
  } catch (error) {
    console.error('Error checking achievements:', error);
    res.status(500).json({ error: 'Failed to check achievements' });
  }
});

module.exports = router; 