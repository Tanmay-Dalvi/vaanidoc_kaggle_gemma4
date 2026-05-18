import React from 'react';

const TriageAlert = ({ triage }) => {
  if (!triage) return null;

  let bgClass = '';
  let textClass = '';
  let icon = null;
  let message = '';

  switch (triage.severity) {
    case 'emergency':
      bgClass = 'bg-red-100 border-red-500';
      textClass = 'text-red-800';
      message = '⚠️ Emergency — Please go to nearest hospital immediately';
      break;
    case 'medium':
      bgClass = 'bg-yellow-100 border-yellow-500';
      textClass = 'text-yellow-800';
      message = 'Please consult a doctor soon';
      break;
    case 'low':
    default:
      bgClass = 'bg-green-50 border-green-500';
      textClass = 'text-green-800';
      message = 'Home care suggested';
      break;
  }

  return (
    <div className={`w-full p-3 border-l-4 my-2 rounded-r-md flex items-center justify-center text-sm font-medium ${bgClass} ${textClass}`}>
      {message}
    </div>
  );
};

export default TriageAlert;
