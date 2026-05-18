import { getUnsyncedMessages, markAsSynced } from './indexedDBService';

// Firebase import placeholders (will need actual firebase library)
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc } from 'firebase/firestore';

// Replace with your Firebase config
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "placeholder",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "placeholder",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "placeholder",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "placeholder",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "placeholder",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "placeholder"
};

// Mock initialization for now since firebase isn't installed
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const getUserId = () => {
  let userId = localStorage.getItem('vaanidoc_user_id');
  if (!userId) {
    userId = 'user_' + Math.random().toString(36).substr(2, 9);
    localStorage.setItem('vaanidoc_user_id', userId);
  }
  return userId;
};

export const saveAnonymousQuery = async (data) => {
  try {
    const userId = getUserId();
    const docData = { ...data, userId, createdAt: new Date() };
    
    // Uncomment when firebase is set up
    await addDoc(collection(db, 'health_queries'), docData);
    // console.log('[Firebase Sync] Saved to firestore:', docData);
    return true;
  } catch (error) {
    console.error('Error saving to Firebase:', error);
    return false;
  }
};

export const syncOfflineMessages = async () => {
  try {
    const unsynced = await getUnsyncedMessages();
    console.log(`[Firebase Sync] Found ${unsynced.length} unsynced messages.`);
    
    for (const msg of unsynced) {
      const success = await saveAnonymousQuery({
        query: msg.query,
        response: msg.response,
        language: msg.language,
        timestamp: msg.timestamp,
        hasImage: !!msg.imageBase64
      });
      
      if (success) {
        await markAsSynced(msg.id);
      }
    }
  } catch (error) {
    console.error('Error syncing offline messages:', error);
  }
};

// Listen for online events to trigger sync
window.addEventListener('online', () => {
  console.log('[Network] App is online. Triggering sync...');
  syncOfflineMessages();
});
