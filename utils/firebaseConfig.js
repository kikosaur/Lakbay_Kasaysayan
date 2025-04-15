// utils/firebaseConfig.js
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyDmzoHJJKVasEZANLihvK_qsBIczs94m3k",
  authDomain: "lakbay-kasaysayan.firebaseapp.com",
  projectId: "lakbay-kasaysayan",
  storageBucket: "lakbay-kasaysayan.appspot.com",
  messagingSenderId: "848089650873",
  appId: "1:848089650873:android:6933988b2738aa7c2b6d68"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db };
