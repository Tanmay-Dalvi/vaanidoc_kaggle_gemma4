import React, { useState, useEffect, useRef } from 'react';
import useOfflineDB from '../hooks/useOfflineDB';
import useSpeechRecognition from '../hooks/useSpeechRecognition';
import useSpeechSynthesis from '../hooks/useSpeechSynthesis';
import { sendMessage } from '../services/gemmaService';

import VoiceButton from './VoiceButton';
import ImageUpload from './ImageUpload';
import MessageBubble from './MessageBubble';
import LanguageSelector from './LanguageSelector';
import TriageAlert from './TriageAlert';
import OfflineIndicator from './OfflineIndicator';

const ChatInterface = () => {
  const { isOnline, getHistory, syncPending } = useOfflineDB();
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);
  const [language, setLanguage] = useState('English');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const { isListening, transcript, startListening, stopListening, setTranscript } = useSpeechRecognition(
    language === 'Hindi' ? 'hi-IN' : language === 'Marathi' ? 'mr-IN' : 'en-IN'
  );
  
  const { speak, isSpeaking, stop: stopSpeaking } = useSpeechSynthesis();

  // Load history on mount
  useEffect(() => {
    const loadHistory = async () => {
      const history = await getHistory();
      if (history && history.length > 0) {
        // Sort by timestamp
        history.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
        setMessages(history);
      }
    };
    loadHistory();
  }, [getHistory]);

  // Update input text when speech recognition receives transcript
  useEffect(() => {
    if (transcript) {
      setInputText(transcript);
    }
  }, [transcript]);

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSend = async (e) => {
    e?.preventDefault();
    if (!inputText.trim() && !selectedImage) return;

    // Stop speaking if currently speaking
    stopSpeaking();
    
    // Stop listening if currently listening
    if (isListening) stopListening();

    const currentText = inputText;
    const currentImage = selectedImage;
    
    // Optimistically add user message
    const userMsg = {
      id: 'temp_' + Date.now(),
      query: currentText,
      language,
      timestamp: new Date().toISOString(),
      imageBase64: currentImage,
      isUser: true
    };
    
    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setSelectedImage(null);
    setTranscript('');
    setIsLoading(true);

    try {
      const result = await sendMessage({
        message: currentText,
        language: language,
        imageBase64: currentImage
      });

      const aiMsg = {
        id: 'msg_' + Date.now(),
        query: currentText, // the query that triggered this
        response: result.response,
        triage: result.triage,
        language,
        timestamp: new Date().toISOString(),
        isUser: false
      };

      setMessages(prev => [...prev, aiMsg]);
      
      // Auto-speak response
      speak(result.response, language);
      
    } catch (error) {
      console.error("Failed to send message:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleListening = () => {
    if (isListening) {
      stopListening();
    } else {
      stopSpeaking(); // Stop any ongoing speech when starting to listen
      startListening();
    }
  };

  const handleReplay = (text) => {
    speak(text, language);
  };

  // Group messages to display them correctly (we need to show user query then AI response for each pair)
  // In our DB we store them as a single record (query + response). 
  // We'll flatten them for display.
  const displayMessages = [];
  messages.forEach(msg => {
    if (msg.isUser !== undefined) {
      // It's already split (from the optimistic UI update)
      displayMessages.push(msg);
    } else {
      // It's from DB, split into two bubbles
      displayMessages.push({
        id: msg.id + '_query',
        query: msg.query,
        imageBase64: msg.imageBase64,
        timestamp: msg.timestamp,
        isUser: true
      });
      displayMessages.push({
        id: msg.id + '_response',
        response: msg.response,
        triage: msg.triage,
        timestamp: msg.timestamp,
        isUser: false
      });
    }
  });

  return (
    <div className="flex flex-col h-screen bg-gray-50 font-sans max-w-md mx-auto shadow-2xl relative">
      {/* Header */}
      <header className="bg-white px-4 py-3 shadow-sm z-10 flex items-center justify-between border-b border-gray-200">
        <div className="flex items-center space-x-2">
          <div className="bg-primary text-white p-1.5 rounded-lg">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
            </svg>
          </div>
          <h1 className="text-xl font-bold text-gray-800">VaaniDoc</h1>
        </div>
        <div className="flex flex-col items-end gap-1">
          <LanguageSelector onSelectLanguage={setLanguage} />
          <OfflineIndicator isOnline={isOnline} />
        </div>
      </header>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 pb-32">
        {displayMessages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-center opacity-60">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-primary mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <p className="text-lg font-medium text-gray-700">Ask me about your health...</p>
            <p className="text-sm text-gray-500 mt-2 max-w-[250px]">Tap the mic or type your symptoms. You can also upload a photo.</p>
          </div>
        )}
        
        {displayMessages.map((msg, idx) => (
          <React.Fragment key={msg.id || idx}>
            <MessageBubble 
              message={msg} 
              isAI={!msg.isUser} 
              onReplay={handleReplay}
              onStopReplay={stopSpeaking}
              isSpeaking={isSpeaking}
            />
            {!msg.isUser && msg.triage && (
              <TriageAlert triage={msg.triage} />
            )}
          </React.Fragment>
        ))}

        {isLoading && (
          <div className="flex justify-start mb-4">
            <div className="bg-white rounded-2xl rounded-tl-none p-4 shadow-sm border border-gray-100 flex items-center space-x-2">
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-3">
        <form onSubmit={handleSend} className="flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <ImageUpload onImageSelected={setSelectedImage} currentImage={selectedImage} />
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Ask me about your health..."
              className="flex-1 bg-gray-100 rounded-full px-4 py-3 text-[16px] focus:outline-none focus:ring-2 focus:ring-primary border-transparent focus:bg-white transition-colors"
            />
            <button
              type="submit"
              disabled={(!inputText.trim() && !selectedImage) || isLoading}
              className="bg-primary text-white p-3 rounded-full hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
              aria-label="Send message"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 transform rotate-90" viewBox="0 0 20 20" fill="currentColor">
                <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
              </svg>
            </button>
          </div>
          
          <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <VoiceButton 
              isListening={isListening} 
              onToggle={toggleListening} 
              transcript={transcript} 
            />
          </div>
        </form>
      </div>
    </div>
  );
};

export default ChatInterface;
