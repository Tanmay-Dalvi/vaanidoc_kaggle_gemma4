import React from 'react';

const VoiceButton = ({ isListening, onToggle, transcript }) => {
  return (
    <div className="flex flex-col items-center">
      <button
        onClick={onToggle}
        className={`w-16 h-16 rounded-full flex items-center justify-center transition-all ${
          isListening 
            ? 'bg-red-500 animate-pulse scale-110 shadow-lg shadow-red-500/50' 
            : 'bg-primary hover:bg-blue-700 shadow-md'
        }`}
        aria-label={isListening ? "Stop listening" : "Start listening"}
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
        </svg>
      </button>
      {isListening && <span className="text-sm text-red-500 mt-2 font-medium">Listening...</span>}
    </div>
  );
};

export default VoiceButton;
