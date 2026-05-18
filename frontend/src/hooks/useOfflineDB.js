import { useState, useEffect, useCallback } from 'react';
import { saveMessage, getAllMessages, getUnsyncedMessages } from '../services/indexedDBService';
import { syncOfflineMessages } from '../services/firebaseService';

const useOfflineDB = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const saveQuery = useCallback(async (msgData) => {
    return await saveMessage(msgData);
  }, []);

  const getHistory = useCallback(async () => {
    return await getAllMessages();
  }, []);

  const syncPending = useCallback(async () => {
    if (isOnline) {
      await syncOfflineMessages();
    }
  }, [isOnline]);

  return { isOnline, saveQuery, getHistory, syncPending };
};

export default useOfflineDB;
