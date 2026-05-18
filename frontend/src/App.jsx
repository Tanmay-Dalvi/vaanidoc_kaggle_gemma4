import React from 'react';
import ChatInterface from './components/ChatInterface';

function App() {
  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex justify-center w-full">
      <div className="w-full max-w-md bg-white dark:bg-gray-800 shadow-xl overflow-hidden relative">
        <ChatInterface />
      </div>
    </div>
  );
}

export default App;
