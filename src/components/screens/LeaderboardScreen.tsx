import React from 'react';
import { useGame } from '@/context/GameContext';
import translations from '@/lib/translations';

// Local-only friendly leaderboard. The user is always inserted.
const friends = [
  { name: 'Mia',     stars: 320, emoji: '🦄' },
  { name: 'Leo',     stars: 285, emoji: '🦊' },
  { name: 'Aiden',   stars: 240, emoji: '🐯' },
  { name: 'Zoe',     stars: 210, emoji: '🐰' },
  { name: 'Noah',    stars: 180, emoji: '🐵' },
  { name: 'Lily',    stars: 150, emoji: '🐼' },
  { name: 'Ethan',   stars: 120, emoji: '🐨' },
  { name: 'Ava',     stars:  95, emoji: '🦁' },
  { name: 'Liam',    stars:  60, emoji: '🐶' },
];

const LeaderboardScreen: React.FC = () => {
  const { language, childName, stars, setScreen } = useGame();
  const t = translations[language];

  const all = [...friends, { name: childName || 'You', stars, emoji: '☁️', isYou: true as const }]
    .sort((a, b) => b.stars - a.stars);
  const myRank = all.findIndex(p => (p as any).isYou) + 1;

  const medal = (i: number) => i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i + 1}`;

  return (
    <div className="min-h-screen flex flex-col animate-fade-in-up bg-gradient-to-b from-amber-50 via-background to-background">
      {/* Header */}
      <div className="flex items-center px-4 py-3 bg-card/70 backdrop-blur-md border-b border-border/50">
        <button
          onClick={() => setScreen('game')}
          className="text-muted-foreground hover:text-foreground text-sm font-medium px-3 py-2 rounded-xl transition-colors"
        >
          ← {t.back}
        </button>
        <h2 className="flex-1 text-center text-lg font-bold text-foreground">🏆 {t.leaderboard}</h2>
        <div className="w-16" />
      </div>

      <div className="flex-1 px-4 py-6 max-w-md mx-auto w-full space-y-5">
        {/* Your rank highlight */}
        <div className="bg-gradient-to-br from-amber-300 via-yellow-400 to-orange-400 rounded-3xl p-5 text-white shadow-lg shadow-amber-200/50 text-center">
          <p className="text-sm font-medium opacity-90">{t.yourRank}</p>
          <p className="text-5xl font-black drop-shadow mt-1">#{myRank}</p>
          <p className="text-sm opacity-90 mt-1">⭐ {stars} {t.stars.toLowerCase()}</p>
        </div>

        {/* Top 3 podium */}
        <div className="flex items-end justify-center gap-3 py-3">
          {[1, 0, 2].map(idx => {
            const p = all[idx];
            if (!p) return null;
            const heights = [80, 100, 70];
            const isYou = (p as any).isYou;
            return (
              <div key={p.name + idx} className="flex flex-col items-center">
                <div className={`text-4xl mb-1 ${idx === 0 ? 'animate-pulse-slow' : ''}`}>{p.emoji}</div>
                <div className="text-xs font-bold mb-1 max-w-[70px] truncate">{p.name}{isYou && ' (You)'}</div>
                <div
                  className={`w-20 rounded-t-2xl flex items-start justify-center pt-2 font-black text-2xl shadow-md ${
                    idx === 0 ? 'bg-gradient-to-b from-yellow-300 to-yellow-500 text-white' :
                    idx === 1 ? 'bg-gradient-to-b from-slate-200 to-slate-400 text-white' :
                    'bg-gradient-to-b from-orange-300 to-orange-500 text-white'
                  }`}
                  style={{ height: heights[[1,0,2].indexOf(idx)] }}
                >
                  {medal(idx)}
                </div>
              </div>
            );
          })}
        </div>

        {/* Full list */}
        <div className="bg-card rounded-2xl border border-border shadow-sm divide-y divide-border/60">
          <div className="px-4 py-2 text-xs font-semibold text-muted-foreground">{t.topLearners}</div>
          {all.map((p, i) => {
            const isYou = (p as any).isYou;
            return (
              <div
                key={p.name + i}
                className={`flex items-center gap-3 px-4 py-3 ${isYou ? 'bg-primary/10' : ''}`}
              >
                <span className="w-8 text-center font-bold text-foreground">{medal(i)}</span>
                <span className="text-2xl">{p.emoji}</span>
                <span className={`flex-1 font-semibold ${isYou ? 'text-primary' : 'text-foreground'}`}>
                  {p.name}{isYou && ' (You)'}
                </span>
                <span className="text-amber-500 font-bold">⭐ {p.stars}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default LeaderboardScreen;
