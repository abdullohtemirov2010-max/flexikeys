import React, { useState } from 'react';
import CloudMascot from '@/components/CloudMascot';
import { useGame } from '@/context/GameContext';

const USERS_KEY = 'flexikeys_users'; // { [username]: { password, createdAt } }
const ACTIVE_USER_KEY = 'flexikeys_active_user';

type Mode = 'register' | 'login';

function loadUsers(): Record<string, { password: string; createdAt: number }> {
  try {
    return JSON.parse(localStorage.getItem(USERS_KEY) || '{}');
  } catch {
    return {};
  }
}

function saveUsers(users: Record<string, { password: string; createdAt: number }>) {
  try { localStorage.setItem(USERS_KEY, JSON.stringify(users)); } catch {}
}

const OnboardingScreen: React.FC = () => {
  const { setScreen, setChildName } = useGame();
  const [mode, setMode] = useState<Mode>('register');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const submit = () => {
    setError('');
    const u = username.trim().toLowerCase();
    const p = password;
    if (u.length < 3) { setError('Username must be at least 3 characters.'); return; }
    if (!/^[a-z0-9_]+$/.test(u)) { setError('Use only letters, numbers and _'); return; }
    if (p.length < 4) { setError('Password must be at least 4 characters.'); return; }

    const users = loadUsers();

    if (mode === 'register') {
      if (users[u]) { setError('That username is already taken. Try another.'); return; }
      users[u] = { password: p, createdAt: Date.now() };
      saveUsers(users);
    } else {
      if (!users[u]) { setError('No account found with that username.'); return; }
      if (users[u].password !== p) { setError('Wrong password.'); return; }
    }

    try { localStorage.setItem(ACTIVE_USER_KEY, u); } catch {}
    setChildName(u);
    setScreen('language');
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 gap-5 animate-fade-in-up bg-gradient-to-b from-primary/10 via-background to-background relative overflow-hidden">
      <span className="absolute top-[10%] left-[8%] text-4xl opacity-40 animate-float">☁️</span>
      <span className="absolute top-[20%] right-[10%] text-3xl opacity-30 animate-float" style={{ animationDelay: '1s' }}>☁️</span>
      <span className="absolute bottom-[15%] left-[15%] text-3xl opacity-30 animate-float" style={{ animationDelay: '0.5s' }}>☁️</span>

      <CloudMascot mood="happy" size={200} />
      <div className="text-center space-y-1">
        <h1 className="text-3xl md:text-4xl font-black text-foreground">FlexiKeys</h1>
        <p className="text-sm text-muted-foreground">
          {mode === 'register' ? 'Create your account' : 'Welcome back'}
        </p>
      </div>

      <div className="w-full max-w-xs flex flex-col gap-3">
        <input
          value={username}
          onChange={(e) => setUsername(e.target.value.replace(/\s/g, ''))}
          placeholder="Username"
          autoFocus
          maxLength={20}
          className="bg-card border-2 border-border rounded-2xl px-5 py-3.5 text-lg text-foreground focus:outline-none focus:border-primary"
        />
        <input
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          type="password"
          maxLength={40}
          onKeyDown={(e) => e.key === 'Enter' && submit()}
          className="bg-card border-2 border-border rounded-2xl px-5 py-3.5 text-lg text-foreground focus:outline-none focus:border-primary"
        />

        {error && (
          <p className="text-sm text-destructive text-center font-medium">{error}</p>
        )}

        <button
          onClick={submit}
          disabled={!username.trim() || !password}
          className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-lg px-8 py-4 rounded-full shadow-xl shadow-primary/30 transition-all hover:scale-105 active:scale-95 disabled:opacity-40"
        >
          {mode === 'register' ? 'Create account →' : 'Log in →'}
        </button>

        <button
          onClick={() => { setMode(mode === 'register' ? 'login' : 'register'); setError(''); }}
          className="text-sm text-muted-foreground hover:text-foreground underline underline-offset-2 mt-1"
        >
          {mode === 'register' ? 'I already have an account' : 'Create a new account instead'}
        </button>
      </div>

      <div className="flex flex-col items-center gap-1 text-center mt-2">
        <div className="flex items-center gap-1 text-amber-400 text-base">
          {'★★★★★'.split('').map((s, i) => <span key={i}>{s}</span>)}
          <span className="ml-2 text-xs font-semibold text-foreground">5.0</span>
        </div>
        <p className="text-xs text-muted-foreground">
          Trusted by <span className="font-bold text-foreground">100,000+</span> learners · 🔒 Stays on this device
        </p>
      </div>
    </div>
  );
};

export default OnboardingScreen;
