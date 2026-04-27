import React from 'react';
import CloudMascot from '@/components/CloudMascot';
import { useGame } from '@/context/GameContext';
import translations from '@/lib/translations';

const RegistrationScreen: React.FC = () => {
  const { setScreen, language, childName, setChildName, childAge, setChildAge, startGame } = useGame();
  const t = translations[language];

  const handleStart = () => {
    if (childName.trim()) {
      startGame();
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 gap-6 animate-fade-in-up">
      <CloudMascot mood="happy" size={240} />
      <div className="w-full max-w-xs space-y-4">
        <div>
          <label className="block text-lg font-medium text-foreground mb-2">{t.enterName}</label>
          <input
            value={childName}
            onChange={e => setChildName(e.target.value)}
            className="w-full bg-card border-2 border-border rounded-2xl px-5 py-4 text-xl text-foreground focus:outline-none focus:border-primary transition-colors"
            maxLength={30}
            autoFocus
          />
        </div>
        <div>
          <label className="block text-lg font-medium text-foreground mb-2">{t.enterAge}</label>
          <input
            value={childAge}
            onChange={e => setChildAge(e.target.value.replace(/\D/g, '').slice(0, 2))}
            className="w-full bg-card border-2 border-border rounded-2xl px-5 py-4 text-xl text-foreground focus:outline-none focus:border-primary transition-colors"
            inputMode="numeric"
            maxLength={2}
          />
        </div>
        <button
          onClick={handleStart}
          disabled={!childName.trim()}
          className="w-full bg-secondary hover:bg-secondary/90 text-secondary-foreground font-semibold text-xl px-8 py-5 rounded-2xl shadow-lg transition-all hover:scale-105 active:scale-95 disabled:opacity-40 disabled:hover:scale-100 mt-4"
        >
          {t.letsGo}
        </button>
      </div>
    </div>
  );
};

export default RegistrationScreen;
