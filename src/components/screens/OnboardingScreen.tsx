import React, { useState } from 'react';
import CloudMascot from '@/components/CloudMascot';
import { useGame } from '@/context/GameContext';

const USERS_KEY = 'flexikeys_users';
const ACTIVE_USER_KEY = 'flexikeys_active_user';

type Mode = 'register' | 'login';

function loadUsers(): Record<string, { password: string; createdAt: number }> {
  try { return JSON.parse(localStorage.getItem(USERS_KEY) || '{}'); } catch { return {}; }
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
  const [busy, setBusy] = useState(false);
  // Cloudflare simulation: 'idle' before user clicks, 'checking' while spinner, 'passed' after check, 'done' to dismiss overlay
  const [cfState, setCfState] = useState<'idle' | 'checking' | 'passed' | 'done'>('idle');

  const startCheck = () => {
    if (cfState !== 'idle') return;
    setCfState('checking');
    setTimeout(() => setCfState('passed'), 1600);
    setTimeout(() => setCfState('done'), 2600);
  };

  const submit = async () => {
    setError('');
    const u = username.trim().toLowerCase();
    const p = password;
    if (u.length < 3) { setError('Username must be at least 3 characters.'); return; }
    if (!/^[a-z0-9_]+$/.test(u)) { setError('Use only letters, numbers and _'); return; }
    if (p.length < 4) { setError('Password must be at least 4 characters.'); return; }

    setBusy(true);
    await new Promise(r => setTimeout(r, 400));
    setBusy(false);

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

  // ============ Cloudflare-style full screen overlay ============
  if (cfState !== 'done') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6 bg-[#f4f4f4] dark:bg-[#1a1a1a]">
        <div className="w-full max-w-md bg-white dark:bg-[#262626] rounded-lg shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          {/* Header */}
          <div className="px-6 py-5 border-b border-gray-100 dark:border-gray-700">
            <p className="text-sm text-gray-500 dark:text-gray-400">flexikeys.app needs to review the security of your connection before proceeding.</p>
          </div>

          {/* Challenge box */}
          <div className="px-6 py-8 flex items-center justify-between bg-gray-50 dark:bg-[#1f1f1f]">
            <div className="flex items-center gap-4">
              {cfState === 'idle' && (
                <button
                  onClick={startCheck}
                  aria-label="Verify you are human"
                  className="w-7 h-7 rounded border-2 border-gray-400 bg-white hover:border-[#f6821f] transition-colors flex-shrink-0"
                />
              )}
              {cfState === 'checking' && (
                <div className="w-7 h-7 flex items-center justify-center flex-shrink-0">
                  <span className="w-6 h-6 border-[3px] border-[#f6821f] border-t-transparent rounded-full animate-spin" />
                </div>
              )}
              {cfState === 'passed' && (
                <div className="w-7 h-7 rounded bg-[#f6821f] flex items-center justify-center flex-shrink-0 animate-scale-in">
                  <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              )}
              <span className="text-base text-gray-800 dark:text-gray-100 font-medium">
                {cfState === 'idle' && 'Verify you are human'}
                {cfState === 'checking' && 'Verifying…'}
                {cfState === 'passed' && 'Success!'}
              </span>
            </div>

            {/* Cloudflare logo */}
            <div className="flex flex-col items-end text-[10px] text-gray-500 dark:text-gray-400 leading-tight">
              <div className="flex items-center gap-1">
                <span className="text-[#f6821f] text-xl leading-none">☁</span>
                <span className="font-bold text-gray-700 dark:text-gray-200 text-xs">CLOUDFLARE</span>
              </div>
              <div className="flex gap-2 mt-0.5">
                <span className="hover:underline cursor-pointer">Privacy</span>
                <span className="hover:underline cursor-pointer">Terms</span>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-3 text-[11px] text-gray-400 dark:text-gray-500 border-t border-gray-100 dark:border-gray-700">
            Ray ID: {Math.random().toString(36).slice(2, 10)}{Math.random().toString(36).slice(2, 8)}
          </div>
        </div>

        <p className="mt-6 text-xs text-gray-500 dark:text-gray-400 text-center max-w-md">
          Performance &amp; security by <span className="font-semibold text-gray-700 dark:text-gray-300">Cloudflare</span>
        </p>
      </div>
    );
  }

  // ============ Onboarding form (after CF check) ============
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 gap-5 animate-fade-in-up bg-gradient-to-b from-primary/10 via-background to-background relative overflow-hidden">
      <span className="absolute top-[10%] left-[8%] text-4xl opacity-40 animate-float">☁️</span>
      <span className="absolute top-[20%] right-[10%] text-3xl opacity-30 animate-float" style={{ animationDelay: '1s' }}>☁️</span>
      <span className="absolute bottom-[15%] left-[15%] text-3xl opacity-30 animate-float" style={{ animationDelay: '0.5s' }}>☁️</span>

      <CloudMascot mood="happy" size={180} />
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
          onKeyDown={(e) => e.key === 'Enter' && !busy && submit()}
          className="bg-card border-2 border-border rounded-2xl px-5 py-3.5 text-lg text-foreground focus:outline-none focus:border-primary"
        />

        {error && (
          <p className="text-sm text-destructive text-center font-medium">{error}</p>
        )}

        <button
          onClick={submit}
          disabled={!username.trim() || !password || busy}
          className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-lg px-8 py-4 rounded-full shadow-xl shadow-primary/30 transition-all hover:scale-105 active:scale-95 disabled:opacity-40 disabled:hover:scale-100"
        >
          {busy ? 'Checking…' : mode === 'register' ? 'Create account →' : 'Log in →'}
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
          Trusted by <span className="font-bold text-foreground">100,000+</span> learners · 🔒 Protected by Cloudflare
        </p>
      </div>
    </div>
  );
};

export default OnboardingScreen;
