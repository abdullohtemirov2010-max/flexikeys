import React from 'react';
import CloudMascot from '@/components/CloudMascot';
import { useGame } from '@/context/GameContext';
import { Language } from '@/lib/translations';
import translations from '@/lib/translations';

const languages: { code: Language; label: string; flag: string }[] = [
  { code: 'en', label: 'English', flag: '🇬🇧' },
  { code: 'ru', label: 'Русский', flag: '🇷🇺' },
  { code: 'uz', label: "O'zbek", flag: '🇺🇿' },
];

const LanguageScreen: React.FC = () => {
  const { setScreen, setLanguage, language } = useGame();
  const t = translations[language];

  const handleSelect = (lang: Language) => {
    setLanguage(lang);
    setScreen('registration');
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 gap-8 animate-fade-in-up">
      <CloudMascot mood="neutral" size={260} />
      <h2 className="text-2xl font-bold text-foreground">{t.chooseLang}</h2>
      <div className="flex flex-col gap-4 w-full max-w-xs">
        {languages.map(l => (
          <button
            key={l.code}
            onClick={() => handleSelect(l.code)}
            className="flex items-center gap-4 bg-card hover:bg-primary/10 border border-border rounded-2xl px-6 py-5 text-xl font-semibold text-foreground transition-all hover:scale-105 active:scale-95 shadow-sm"
          >
            <span className="text-3xl">{l.flag}</span>
            <span>{l.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default LanguageScreen;
