/* eslint-disable no-unused-vars */
import React from 'react';
import ReactMarkdown from 'react-markdown';

const MessageBubble = ({ message, isAI, onReplay, onStopReplay, isSpeaking }) => {
  const timeString = new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    <div className={`flex w-full mb-4 ${isAI ? 'justify-start' : 'justify-end'}`}>
      <div 
        className={`max-w-[80%] rounded-2xl p-4 shadow-sm relative ${
          isAI 
            ? 'bg-white text-gray-800 rounded-tl-none border border-gray-100' 
            : 'bg-primary text-white rounded-tr-none'
        }`}
      >
        {message.imageBase64 && !isAI && (
          <img 
            src={message.imageBase64} 
            alt="Uploaded attachment" 
            className="w-full h-auto max-h-48 object-cover rounded-md mb-2"
          />
        )}
        
        <div className="text-[16px] leading-relaxed break-words">
          {isAI ? (
            <ReactMarkdown
              components={{
                p: ({node, ...props}) => <p className="mb-2 last:mb-0" {...props} />,
                ul: ({node, ...props}) => <ul className="list-disc ml-4 mb-2" {...props} />,
                ol: ({node, ...props}) => <ol className="list-decimal ml-4 mb-2" {...props} />,
                li: ({node, ...props}) => <li className="mb-1" {...props} />,
                strong: ({node, ...props}) => <strong className="font-semibold" {...props} />,
                em: ({node, ...props}) => <em className="italic" {...props} />,
              }}
            >
              {message.response}
            </ReactMarkdown>
          ) : (
            <div className="whitespace-pre-wrap">{message.query}</div>
          )}
        </div>
        
        <div className={`flex items-center mt-2 text-xs opacity-70 ${isAI ? 'justify-between' : 'justify-end'}`}>
          {isAI && (
            <button 
              onClick={isSpeaking ? onStopReplay : () => onReplay(message.response)}
              className={`p-1.5 rounded-full hover:bg-gray-100 transition-colors ${isSpeaking ? 'text-red-500' : 'text-gray-500'}`}
              aria-label={isSpeaking ? "Stop reading" : "Read aloud"}
            >
              {isSpeaking ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M6 6h12v12H6z" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                </svg>
              )}
            </button>
          )}
          <span>{timeString}</span>
        </div>
      </div>
    </div>
  );
};

export default MessageBubble;
