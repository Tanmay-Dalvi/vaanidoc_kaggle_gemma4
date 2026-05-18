import React, { useEffect, useState } from 'react';

const LANGUAGES = [
  { id: 'Hindi', label: 'हिंदी' },
  { id: 'Marathi', label: 'मराठी' },
  { id: 'English', label: 'English' }
];

const LanguageSelector = ({ onSelectLanguage }) => {
  const [selected, setSelected] = useState('English');

  useEffect(() => {
    const saved = localStorage.getItem('vaanidoc_lang');
    if (saved) {
      setSelected(saved);
      onSelectLanguage(saved);
    }
  }, [onSelectLanguage]);

  const handleChange = (e) => {
    const val = e.target.value;
    setSelected(val);
    localStorage.setItem('vaanidoc_lang', val);
    onSelectLanguage(val);
  };

  return (
    <select 
      value={selected} 
      onChange={handleChange}
      className="bg-transparent border border-gray-300 text-gray-700 text-sm rounded-lg focus:ring-primary focus:border-primary block p-1.5 outline-none cursor-pointer font-medium"
      aria-label="Select Language"
    >
      {LANGUAGES.map(lang => (
        <option key={lang.id} value={lang.id}>{lang.label}</option>
      ))}
    </select>
  );
};

export default LanguageSelector;
