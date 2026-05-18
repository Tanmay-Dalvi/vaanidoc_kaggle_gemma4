import { saveMessage, getAllMessages } from './indexedDBService';
import { syncOfflineMessages } from './firebaseService';

const BACKEND_URL = import.meta.env.DEV ? 'http://localhost:8000/api/chat' : '/api/chat';

export const sendMessage = async ({ message, language, imageBase64 }) => {
  const timestamp = new Date().toISOString();
  const msgId = 'msg_' + Date.now();
  
  try {
    const response = await fetch(BACKEND_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ message, language, image_base64: imageBase64 })
    });
    
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    
    const data = await response.json();
    
    // Save to IndexedDB
    await saveMessage({
      id: msgId,
      query: message,
      response: data.response,
      triage: data.triage,
      language: language,
      timestamp: timestamp,
      synced: navigator.onLine ? 1 : 0,
      imageBase64: imageBase64
    });
    
    if (navigator.onLine) {
      syncOfflineMessages();
    }
    
    return data;
  } catch (error) {
    console.warn('Fetch failed, handling offline mode:', error);
    
    const offlineResponse = "You are offline. Your question has been saved and will be answered when connected.";
    
    // Check if we have a similar cached query (simple matching for demo purposes)
    const messages = await getAllMessages();
    const cachedMsg = messages.find(m => 
      m.query.toLowerCase().trim() === message.toLowerCase().trim() && 
      m.language === language &&
      m.response !== offlineResponse
    );
    
    const finalResponse = cachedMsg ? cachedMsg.response : offlineResponse;
    const fallbackTriage = cachedMsg ? cachedMsg.triage : { severity: 'low', category: 'Offline', refer_to_doctor: false, color: 'green' };
    
    await saveMessage({
      id: msgId,
      query: message,
      response: finalResponse,
      triage: fallbackTriage,
      language: language,
      timestamp: timestamp,
      synced: 0, // 0 = false
      imageBase64: imageBase64
    });
    
    return {
      response: finalResponse,
      triage: fallbackTriage
    };
  }
};
