import React from 'react';
import CloudMascot from '@/components/CloudMascot';
import { useGame } from '@/context/GameContext';
import translations from '@/lib/translations';

const OnboardingScreen: React.FC = () => {
  const { setScreen, language } = useGame();
  const t = translations[language];

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 gap-8 animate-fade-in-up bg-gradient-to-b from-primary/10 via-background to-background relative overflow-hidden">
      {/* soft floating clouds */}
      <span className="absolute top-[10%] left-[8%] text-4xl opacity-40 animate-float">☁️</span>
      <span className="absolute top-[20%] right-[10%] text-3xl opacity-30 animate-float" style={{ animationDelay: '1s' }}>☁️</span>
      <span className="absolute bottom-[15%] left-[15%] text-3xl opacity-30 animate-float" style={{ animationDelay: '0.5s' }}>☁️</span>

      <CloudMascot mood="happy" size={420} />
      <div className="text-center space-y-3 -mt-4">
        <h1 className="text-4xl md:text-5xl font-black text-foreground tracking-tight">FlexiKeys</h1>
        <p className="text-lg text-muted-foreground font-medium">{t.tagline}</p>
      </div>
      <button
        onClick={() => setScreen('language')}
        className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-xl px-14 py-5 rounded-full shadow-xl shadow-primary/30 transition-all hover:scale-105 active:scale-95"
      >
        {t.start} →
      </button>
    </div>
  );
};

export default OnboardingScreen;
