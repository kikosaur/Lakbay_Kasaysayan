const admin = require('firebase-admin');
const serviceAccount = require('../serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: `${serviceAccount.project_id}.appspot.com`
});

const bucket = admin.storage().bucket();

const setupStorage = async () => {
  try {
    // Create a minimal folder structure to save storage space
    const folders = [
      'artifacts/',    // Only for essential 3D models
      'thumbnails/'    // For compressed preview images
    ];

    for (const folder of folders) {
      await bucket.file(folder).save('', {
        metadata: {
          contentType: 'application/x-www-form-urlencoded;charset=UTF-8'
        }
      });
      console.log(`Created folder: ${folder}`);
    }

    // Set storage rules optimized for free tier
    const rules = `rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Basic security rules with size limits
    match /artifacts/{file} {
      allow read: if true;
      allow write: if false; // Only allow admin uploads through backend
    }
    match /thumbnails/{file} {
      allow read: if true;
      allow write: if request.auth != null 
                  && request.resource.size < 1 * 1024 * 1024 // 1MB limit
                  && request.resource.contentType.matches('image/.*');
    }
  }
}`;

    console.log('Storage setup complete!');
    console.log('Please set these rules in Firebase Console > Storage > Rules:');
    console.log(rules);
    console.log('\nFree Tier Limits:');
    console.log('- 5GB storage');
    console.log('- 1GB downloads/day');
    console.log('- 20K upload operations/day');

    process.exit(0);
  } catch (error) {
    console.error('Error setting up storage:', error);
    process.exit(1);
  }
};

setupStorage(); 