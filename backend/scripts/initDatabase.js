const admin = require('firebase-admin');
const path = require('path');

// Initialize Firebase Admin with service account
const serviceAccount = require('../serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId: serviceAccount.project_id
});

const db = admin.firestore();

const initializeDatabase = async () => {
  try {
    // Create collections with minimal initial data
    const collections = ['users', 'historicalEvents', 'runs', 'achievements'];
    for (const collectionName of collections) {
      const collRef = db.collection(collectionName);
      console.log(`Created ${collectionName} collection`);
    }

    // Add essential historical events (reduced sample data)
    const sampleEvents = [
      {
        title: 'Battle of Manila',
        description: 'A major battle during the Philippine-American War',
        date: '1899-02-04',
        location: {
          latitude: 14.5995,
          longitude: 120.9842
        },
        artifactId: 'american_rifle',
        thumbnailUrl: 'thumbnails/american_rifle.jpg'
      }
    ];

    const eventsRef = db.collection('historicalEvents');
    for (const event of sampleEvents) {
      await eventsRef.add(event);
    }
    console.log('Added sample historical event');

    // Add essential achievements (reduced set)
    const sampleAchievements = [
      {
        name: 'First Discovery',
        description: 'Visit your first historical location',
        icon: 'map-marker',
        points: 100
      }
    ];

    const achievementsRef = db.collection('achievements');
    for (const achievement of sampleAchievements) {
      await achievementsRef.add(achievement);
    }
    console.log('Added sample achievement');

    console.log('\nDatabase initialization complete!');
    console.log('\nFree Tier Limits:');
    console.log('- 1GB storage');
    console.log('- 50K reads/day');
    console.log('- 20K writes/day');

    process.exit(0);
  } catch (error) {
    console.error('Error initializing database:', error);
    process.exit(1);
  }
};

initializeDatabase(); 