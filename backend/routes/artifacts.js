const express = require('express');
const router = express.Router();
const admin = require('firebase-admin');

// Get all artifacts
router.get('/', async (req, res) => {
  try {
    const artifactsSnapshot = await admin.firestore()
      .collection('artifacts')
      .get();

    const artifacts = [];
    artifactsSnapshot.forEach(doc => {
      artifacts.push({
        id: doc.id,
        ...doc.data()
      });
    });

    res.json(artifacts);
  } catch (error) {
    console.error('Error fetching artifacts:', error);
    res.status(500).json({ error: 'Failed to fetch artifacts' });
  }
});

// Get artifact by ID
router.get('/:id', async (req, res) => {
  try {
    const artifactDoc = await admin.firestore()
      .collection('artifacts')
      .doc(req.params.id)
      .get();

    if (!artifactDoc.exists) {
      return res.status(404).json({ error: 'Artifact not found' });
    }

    res.json({
      id: artifactDoc.id,
      ...artifactDoc.data()
    });
  } catch (error) {
    console.error('Error fetching artifact:', error);
    res.status(500).json({ error: 'Failed to fetch artifact' });
  }
});

// Create new artifact
router.post('/', async (req, res) => {
  try {
    const artifactData = req.body;
    const docRef = await admin.firestore()
      .collection('artifacts')
      .add({
        ...artifactData,
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      });

    res.status(201).json({
      id: docRef.id,
      ...artifactData
    });
  } catch (error) {
    console.error('Error creating artifact:', error);
    res.status(500).json({ error: 'Failed to create artifact' });
  }
});

// Update artifact
router.put('/:id', async (req, res) => {
  try {
    const artifactData = req.body;
    await admin.firestore()
      .collection('artifacts')
      .doc(req.params.id)
      .update({
        ...artifactData,
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });

    res.json({
      id: req.params.id,
      ...artifactData
    });
  } catch (error) {
    console.error('Error updating artifact:', error);
    res.status(500).json({ error: 'Failed to update artifact' });
  }
});

// Delete artifact
router.delete('/:id', async (req, res) => {
  try {
    await admin.firestore()
      .collection('artifacts')
      .doc(req.params.id)
      .delete();

    res.json({ message: 'Artifact deleted successfully' });
  } catch (error) {
    console.error('Error deleting artifact:', error);
    res.status(500).json({ error: 'Failed to delete artifact' });
  }
});

module.exports = router; 