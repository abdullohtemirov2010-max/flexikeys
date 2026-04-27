import React, { useState } from 'react';
import CloudMascot from '@/components/CloudMascot';
import { useGame } from '@/context/GameContext';
import translations from '@/lib/translations';

const AccountScreen: React.FC = () => {
  const { language, childName, setChildName, childAge, setChildAge, stars, coins, stage, level, setScreen } = useGame();
  const t = translations[language];
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(childName);
  const [age, setAge] = useState(childAge);

  const handleSave = () => {
    if (name.trim()) setChildName(name.trim());
    setChildAge(age);
    setEditing(false);
  };

  return (
    <div className="min-h-screen flex flex-col animate-fade-in-up bg-gradient-to-b from-primary/10 via-background to-background">
      {/* Header */}
      <div className="flex items-center px-4 py-3 bg-card/70 backdrop-blur-md border-b border-border/50">
        <button
          onClick={() => setScreen('game')}
          className="text-muted-foreground hover:text-foreground text-sm font-medium px-3 py-2 rounded-xl transition-colors"
        >
          ← {t.back}
        </button>
        <h2 className="flex-1 text-center text-lg font-bold text-foreground">👤 {t.account}</h2>
        <div className="w-16" />
      </div>

      <div className="flex-1 px-6 py-6 max-w-md mx-auto w-full space-y-5">
        {/* Profile card */}
        <div className="bg-card rounded-3xl border border-border p-6 shadow-sm flex flex-col items-center gap-3">
          <CloudMascot mood="happy" size={140} />
          {!editing ? (
            <>
              <h3 className="text-2xl font-bold text-foreground">{childName || '—'}</h3>
              {childAge && <p className="text-muted-foreground">{t.age}: {childAge}</p>}
              <button
                onClick={() => setEditing(true)}
                className="mt-2 bg-primary/10 hover:bg-primary/20 text-foreground font-semibold px-5 py-2 rounded-full text-sm transition"
              >
                ✏️ {t.edit}
              </button>
            </>
          ) : (
            <div className="w-full space-y-3">
              <div>
                <label className="text-sm text-muted-foreground mb-1 block">{t.name}</label>
                <input
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full bg-background border-2 border-border rounded-xl px-4 py-3 text-lg focus:outline-none focus:border-primary"
                />
              </div>
              <div>
                <label className="text-sm text-muted-foreground mb-1 block">{t.age}</label>
                <input
                  value={age}
                  onChange={e => setAge(e.target.value.replace(/\D/g, '').slice(0, 2))}
                  inputMode="numeric"
                  className="w-full bg-background border-2 border-border rounded-xl px-4 py-3 text-lg focus:outline-none focus:border-primary"
                />
              </div>
              <button
                onClick={handleSave}
                className="w-full bg-primary text-primary-foreground font-semibold py-3 rounded-xl transition hover:scale-[1.02] active:scale-95"
              >
                {t.save}
              </button>
            </div>
          )}
        </div>

        {/* Quick stats */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-card rounded-2xl border border-border p-4 text-center shadow-sm">
            <div className="text-3xl">⭐</div>
            <div className="text-xl font-bold mt-1">{stars}</div>
            <div className="text-xs text-muted-foreground">{t.stars}</div>
          </div>
          <div className="bg-card rounded-2xl border border-border p-4 text-center shadow-sm">
            <div className="text-3xl">🪙</div>
            <div className="text-xl font-bold mt-1">{coins}</div>
            <div className="text-xs text-muted-foreground">{t.coins}</div>
          </div>
          <div className="bg-card rounded-2xl border border-border p-4 text-center shadow-sm">
            <div className="text-3xl">📚</div>
            <div className="text-xl font-bold mt-1">{stage}</div>
            <div className="text-xs text-muted-foreground">{t.stage}</div>
          </div>
          <div className="bg-card rounded-2xl border border-border p-4 text-center shadow-sm">
            <div className="text-3xl">🎯</div>
            <div className="text-xl font-bold mt-1">{level}</div>
            <div className="text-xs text-muted-foreground">{t.level}</div>
          </div>
        </div>

        {/* Quick links */}
        <div className="space-y-2">
          <button
            onClick={() => setScreen('dashboard')}
            className="w-full bg-card border border-border rounded-2xl p-4 flex items-center justify-between hover:bg-primary/5 transition shadow-sm"
          >
            <span className="flex items-center gap-3 font-semibold text-foreground">
              <span className="text-2xl">📊</span> {t.parentDashboard}
            </span>
            <span className="text-muted-foreground">›</span>
          </button>
          <button
            onClick={() => setScreen('leaderboard')}
            className="w-full bg-card border border-border rounded-2xl p-4 flex items-center justify-between hover:bg-primary/5 transition shadow-sm"
          >
            <span className="flex items-center gap-3 font-semibold text-foreground">
              <span className="text-2xl">🏆</span> {t.leaderboard}
            </span>
            <span className="text-muted-foreground">›</span>
          </button>
          <button
            onClick={() => setScreen('language')}
            className="w-full bg-card border border-border rounded-2xl p-4 flex items-center justify-between hover:bg-primary/5 transition shadow-sm"
          >
            <span className="flex items-center gap-3 font-semibold text-foreground">
              <span className="text-2xl">🌐</span> Language
            </span>
            <span className="text-muted-foreground">›</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default AccountScreen;
