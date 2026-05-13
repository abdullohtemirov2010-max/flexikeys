import React, { useEffect, useRef, useState } from 'react';
import CloudMascot from '@/components/CloudMascot';
import { useGame } from '@/context/GameContext';
import translations from '@/lib/translations';

// TODO: replace with your real Google OAuth Client ID from
// https://console.cloud.google.com/apis/credentials  (Web app type)
// Add your Lovable preview + published URLs to "Authorized JavaScript origins".
const GOOGLE_CLIENT_ID = 'YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com';

type Step = 'welcome' | 'name' | 'age' | 'referral';

const REFERRAL_OPTIONS = [
  { id: 'friend', label: 'Friend', emoji: '👫' },
  { id: 'instagram', label: 'Instagram', emoji: '📸' },
  { id: 'tiktok', label: 'TikTok', emoji: '🎵' },
  { id: 'youtube', label: 'YouTube', emoji: '▶️' },
  { id: 'google', label: 'Google Search', emoji: '🔎' },
  { id: 'other', label: 'Other', emoji: '✨' },
];

declare global {
  interface Window {
    google?: any;
  }
}

function decodeJwt(token: string): any {
  try {
    const payload = token.split('.')[1];
    return JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')));
  } catch {
    return {};
  }
}

const TrustBar: React.FC = () => (
  <div className="flex flex-col items-center gap-2 text-center">
    <div className="flex items-center gap-1 text-amber-400 text-xl">
      {'★★★★★'.split('').map((s, i) => (
        <span key={i} className="drop-shadow-[0_0_6px_rgba(251,191,36,0.6)]">{s}</span>
      ))}
      <span className="ml-2 text-sm font-semibold text-foreground">5.0</span>
    </div>
    <p className="text-sm text-muted-foreground">
      Trusted by <span className="font-bold text-foreground">100,000+</span> happy learners worldwide
    </p>
    <div className="flex gap-3 mt-1 text-xs text-muted-foreground">
      <span>🔒 Safe for kids</span>
      <span>🏆 Award-winning</span>
      <span>🌍 9 languages</span>
    </div>
  </div>
);

const OnboardingScreen: React.FC = () => {
  const { setScreen, language, childName, setChildName, childAge, setChildAge } = useGame();
  const t = translations[language];
  const [step, setStep] = useState<Step>('welcome');
  const [referral, setReferral] = useState<string>('');
  const [googleUser, setGoogleUser] = useState<{ name?: string; email?: string; picture?: string } | null>(null);
  const btnRef = useRef<HTMLDivElement>(null);

  // Load Google Identity Services
  useEffect(() => {
    if (step !== 'welcome') return;
    const id = 'google-identity-script';
    const init = () => {
      if (!window.google || !btnRef.current) return;
      try {
        window.google.accounts.id.initialize({
          client_id: GOOGLE_CLIENT_ID,
          callback: (response: { credential: string }) => {
            const profile = decodeJwt(response.credential);
            setGoogleUser({ name: profile.name, email: profile.email, picture: profile.picture });
            if (profile.given_name) setChildName(profile.given_name);
            try { localStorage.setItem('flexikeys_google', JSON.stringify(profile)); } catch {}
            setStep('name');
          },
        });
        window.google.accounts.id.renderButton(btnRef.current, {
          theme: 'filled_blue',
          size: 'large',
          shape: 'pill',
          text: 'signup_with',
          width: 280,
        });
      } catch (e) {
        console.warn('Google Sign-In init failed:', e);
      }
    };

    if (document.getElementById(id)) {
      init();
      return;
    }
    const s = document.createElement('script');
    s.id = id;
    s.src = 'https://accounts.google.com/gsi/client';
    s.async = true;
    s.defer = true;
    s.onload = init;
    document.head.appendChild(s);
  }, [step, setChildName]);

  const skipGoogle = () => setStep('name');

  const finish = (chosenReferral: string) => {
    try {
      localStorage.setItem('flexikeys_referral', chosenReferral);
    } catch {}
    setScreen('language');
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 gap-6 animate-fade-in-up bg-gradient-to-b from-primary/10 via-background to-background relative overflow-hidden">
      <span className="absolute top-[10%] left-[8%] text-4xl opacity-40 animate-float">☁️</span>
      <span className="absolute top-[20%] right-[10%] text-3xl opacity-30 animate-float" style={{ animationDelay: '1s' }}>☁️</span>
      <span className="absolute bottom-[15%] left-[15%] text-3xl opacity-30 animate-float" style={{ animationDelay: '0.5s' }}>☁️</span>

      {step === 'welcome' && (
        <>
          <CloudMascot mood="happy" size={260} />
          <div className="text-center space-y-2">
            <h1 className="text-4xl md:text-5xl font-black text-foreground tracking-tight">FlexiKeys</h1>
            <p className="text-base text-muted-foreground font-medium">{t.tagline}</p>
          </div>

          <div className="flex flex-col items-center gap-3">
            <div ref={btnRef} className="min-h-[44px]" />
            <button
              onClick={skipGoogle}
              className="text-sm text-muted-foreground hover:text-foreground underline underline-offset-2"
            >
              Continue without signing in
            </button>
          </div>

          <TrustBar />
        </>
      )}

      {step === 'name' && (
        <>
          <CloudMascot mood="happy" size={200} />
          <div className="text-center space-y-1">
            <h2 className="text-2xl font-bold text-foreground">Nice to meet you! 👋</h2>
            <p className="text-muted-foreground">{t.enterName}</p>
          </div>
          <input
            value={childName}
            onChange={(e) => setChildName(e.target.value)}
            autoFocus
            maxLength={30}
            placeholder="Your name"
            className="w-full max-w-xs bg-card border-2 border-border rounded-2xl px-5 py-4 text-xl text-foreground focus:outline-none focus:border-primary"
          />
          <button
            disabled={!childName.trim()}
            onClick={() => setStep('age')}
            className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-lg px-12 py-4 rounded-full shadow-xl shadow-primary/30 transition-all hover:scale-105 active:scale-95 disabled:opacity-40"
          >
            Next →
          </button>
          <TrustBar />
        </>
      )}

      {step === 'age' && (
        <>
          <CloudMascot mood="happy" size={200} />
          <div className="text-center space-y-1">
            <h2 className="text-2xl font-bold text-foreground">How old are you?</h2>
            <p className="text-muted-foreground">So we can pick the perfect levels</p>
          </div>
          <input
            value={childAge}
            onChange={(e) => setChildAge(e.target.value.replace(/\D/g, '').slice(0, 2))}
            inputMode="numeric"
            autoFocus
            maxLength={2}
            placeholder="Age"
            className="w-full max-w-xs bg-card border-2 border-border rounded-2xl px-5 py-4 text-xl text-center text-foreground focus:outline-none focus:border-primary"
          />
          <button
            onClick={() => setStep('referral')}
            className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-lg px-12 py-4 rounded-full shadow-xl shadow-primary/30 transition-all hover:scale-105 active:scale-95"
          >
            Next →
          </button>
          <TrustBar />
        </>
      )}

      {step === 'referral' && (
        <>
          <div className="text-center space-y-1">
            <h2 className="text-2xl font-bold text-foreground">How did you hear about FlexiKeys?</h2>
            <p className="text-muted-foreground text-sm">One last question 🌟</p>
          </div>
          <div className="grid grid-cols-2 gap-3 w-full max-w-md">
            {REFERRAL_OPTIONS.map((opt) => (
              <button
                key={opt.id}
                onClick={() => setReferral(opt.id)}
                className={`flex items-center gap-3 px-4 py-4 rounded-2xl border-2 transition-all hover:scale-[1.02] active:scale-95 ${
                  referral === opt.id
                    ? 'bg-primary/15 border-primary shadow-lg shadow-primary/20'
                    : 'bg-card border-border hover:border-primary/50'
                }`}
              >
                <span className="text-2xl">{opt.emoji}</span>
                <span className="font-medium text-foreground">{opt.label}</span>
              </button>
            ))}
          </div>
          <button
            disabled={!referral}
            onClick={() => finish(referral)}
            className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-lg px-12 py-4 rounded-full shadow-xl shadow-primary/30 transition-all hover:scale-105 active:scale-95 disabled:opacity-40"
          >
            Start learning →
          </button>
          <TrustBar />
        </>
      )}
    </div>
  );
};

export default OnboardingScreen;
