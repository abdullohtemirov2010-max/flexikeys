import React from 'react';
import { useGame } from '@/context/GameContext';
import translations from '@/lib/translations';

const DashboardScreen: React.FC = () => {
  const { language, childName, stage, level, stars, coins, totalCorrect, totalMistakes, sessionStart, setScreen, unlockedStages, weakLetters, activeItems, purchasedItems } = useGame();
  const t = translations[language];

  const totalAttempts = totalCorrect + totalMistakes;
  const accuracy = totalAttempts > 0 ? Math.round((totalCorrect / totalAttempts) * 100) : 0;
  const timeSpent = Math.round((Date.now() - sessionStart) / 60000);

  const stats = [
    { label: t.stage, value: `${stage} / ${unlockedStages}`, icon: '📚' },
    { label: t.level, value: level, icon: '🎯' },
    { label: t.stars, value: stars, icon: '⭐' },
    { label: t.coins, value: coins, icon: '🪙' },
    { label: t.accuracy, value: `${accuracy}%`, icon: '✅' },
    { label: t.timeSpent, value: `${timeSpent} ${t.minutes}`, icon: '⏱️' },
  ];

  // Equipped items display
  const equippedNames: Record<string, string> = {
    'theme-ocean': '🌊 Ocean',
    'theme-forest': '🌿 Forest',
    'theme-sunset': '🌅 Sunset',
    'theme-space': '🌙 Space',
    'theme-lavender': '💜 Lavender',
    'theme-cherry': '🌸 Cherry',
    'kb-bubble': '🫧 Bubble',
    'kb-stars': '✨ Star',
    'kb-rainbow': '🌈 Rainbow',
    'kb-candy': '🍬 Candy',
    'mascot-bow': '🎀 Bow',
    'mascot-hat': '🎉 Hat',
    'mascot-crown': '👑 Crown',
    'mascot-glasses': '😎 Glasses',
    'sound-gentle': '🔔 Chimes',
    'sound-nature': '🐦 Nature',
    'sound-magic': '✨ Magic',
  };

  const equippedList = Object.entries(activeItems || {})
    .filter(([, itemId]) => itemId)
    .map(([category, itemId]) => ({
      category,
      itemId,
      name: equippedNames[itemId] || itemId,
    }));

  return (
    <div className="min-h-screen px-6 py-8 animate-fade-in-up max-w-lg mx-auto">
      <button
        onClick={() => setScreen('game')}
        className="text-muted-foreground hover:text-foreground text-sm font-medium mb-6 block"
      >
        ← {t.back}
      </button>

      <h2 className="text-2xl font-bold text-foreground mb-1">{t.parentDashboard}</h2>
      <p className="text-muted-foreground mb-6">{childName}</p>

      <div className="grid grid-cols-2 gap-4">
        {stats.map(s => (
          <div key={s.label} className="bg-card rounded-2xl border border-border p-5 shadow-sm">
            <span className="text-2xl">{s.icon}</span>
            <p className="text-2xl font-bold text-foreground mt-2">{s.value}</p>
            <p className="text-sm text-muted-foreground">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Equipped items */}
      {equippedList.length > 0 && (
        <div className="mt-6 bg-card rounded-2xl border border-border p-5 shadow-sm">
          <p className="text-sm font-medium text-muted-foreground mb-3">🎁 Equipped Items</p>
          <div className="flex flex-wrap gap-2">
            {equippedList.map(item => (
              <span key={item.itemId} className="bg-primary/10 text-foreground font-semibold px-4 py-2 rounded-full text-sm border border-primary/20">
                {item.name}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Purchased items count */}
      {purchasedItems.length > 0 && (
        <div className="mt-4 bg-card rounded-2xl border border-border p-5 shadow-sm">
          <p className="text-sm font-medium text-muted-foreground mb-1">🛍️ Collection</p>
          <p className="text-2xl font-bold text-foreground">{purchasedItems.length} items</p>
        </div>
      )}

      {/* Accuracy bar */}
      <div className="mt-4 bg-card rounded-2xl border border-border p-5 shadow-sm">
        <p className="text-sm font-medium text-muted-foreground mb-3">{t.accuracy}</p>
        <div className="w-full h-4 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-success rounded-full transition-all duration-500"
            style={{ width: `${accuracy}%` }}
          />
        </div>
        <div className="flex justify-between mt-2 text-xs text-muted-foreground">
          <span>0%</span>
          <span className="font-semibold text-foreground">{accuracy}%</span>
          <span>100%</span>
        </div>
      </div>

      {/* Weak letters */}
      {weakLetters.length > 0 && (
        <div className="mt-4 bg-card rounded-2xl border border-border p-5 shadow-sm">
          <p className="text-sm font-medium text-muted-foreground mb-3">Needs practice</p>
          <div className="flex flex-wrap gap-2">
            {weakLetters.map(l => (
              <span key={l} className="bg-encouragement/30 text-foreground font-bold px-3 py-1 rounded-full text-lg">
                {l}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardScreen;
