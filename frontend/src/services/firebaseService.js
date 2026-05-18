import { getUnsyncedMessages, markAsSynced } from './indexedDBService';

// Firebase import placeholders (will need actual firebase library)
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc } from 'firebase/firestore';

// Replace with your Firebase config
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

// Only initialize if we have an API key, otherwise it crashes the entire app
let app = null;
let db = null;

try {
  if (firebaseConfig.apiKey && firebaseConfig.apiKey !== "placeholder") {
    app = initializeApp(firebaseConfig);
    db = getFirestore(app);
  }
} catch (e) {
  console.warn("Firebase initialization skipped:", e.message);
}

const getUserId = () => {
  let userId = localStorage.getItem('vaanidoc_user_id');
  if (!userId) {
    userId = 'user_' + Math.random().toString(36).substr(2, 9);
    localStorage.setItem('vaanidoc_user_id', userId);
  }
  return userId;
};

export const saveAnonymousQuery = async (data) => {
  if (!db) return false;
  
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
