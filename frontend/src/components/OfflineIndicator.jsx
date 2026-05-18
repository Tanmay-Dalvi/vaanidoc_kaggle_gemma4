import React from 'react';

const OfflineIndicator = ({ isOnline }) => {
  return (
    <div className={`flex items-center px-2 py-1 rounded-full text-xs font-medium border ${
      isOnline 
        ? 'bg-green-50 text-green-700 border-green-200' 
        : 'bg-red-50 text-red-700 border-red-200'
    }`}>
      <span className={`w-2 h-2 rounded-full mr-1.5 ${isOnline ? 'bg-green-500' : 'bg-red-500'}`}></span>
      {isOnline ? 'Online' : 'Offline — AI still available'}
    </div>
  );
};

export default OfflineIndicator;
