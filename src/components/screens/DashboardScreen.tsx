import React, { useState } from 'react';
import { useGame } from '@/context/GameContext';
import translations from '@/lib/translations';

/**
 * Parent Dashboard — designed around evidence-based recommendations for parents
 * of children with autism / Down syndrome / learning differences:
 *  - Visible structured progress (predictability)
 *  - Identification of "needs practice" areas
 *  - Daily session length & screen-time guidance (AAP)
 *  - Sensory / accessibility controls (sound volume, motion, voice speed)
 *  - Reinforcement strategy notes
 *  - Quick weekly summary
 *  - Resource links (CDC, Autism Speaks, NDSS)
 */

type Tab = 'overview' | 'practice' | 'settings' | 'tips' | 'resources';

const DashboardScreen: React.FC = () => {
  const {
    language, childName, childAge, stage, level, stars, coins,
    totalCorrect, totalMistakes, sessionStart, setScreen,
    unlockedStages, weakLetters, letterAccuracy,
  } = useGame();
  const t = translations[language];

  const [tab, setTab] = useState<Tab>('overview');

  // ---- accessibility settings (persisted) ----
  const [voiceSpeed, setVoiceSpeed] = useState<number>(() => {
    const v = parseFloat(localStorage.getItem('fk_voice_speed') || '0.78');
    return isNaN(v) ? 0.78 : v;
  });
  const [reduceMotion, setReduceMotion] = useState<boolean>(() => localStorage.getItem('fk_reduce_motion') === '1');
  const [soundVolume, setSoundVolume] = useState<number>(() => {
    const v = parseFloat(localStorage.getItem('fk_volume') || '1');
    return isNaN(v) ? 1 : v;
  });
  const [dailyLimit, setDailyLimit] = useState<number>(() => {
    const v = parseInt(localStorage.getItem('fk_daily_limit') || '20', 10);
    return isNaN(v) ? 20 : v;
  });

  const updateVoiceSpeed = (n: number) => { setVoiceSpeed(n); localStorage.setItem('fk_voice_speed', String(n)); };
  const updateMotion = (b: boolean) => { setReduceMotion(b); localStorage.setItem('fk_reduce_motion', b ? '1' : '0'); };
  const updateVolume = (n: number) => { setSoundVolume(n); localStorage.setItem('fk_volume', String(n)); };
  const updateDaily = (n: number) => { setDailyLimit(n); localStorage.setItem('fk_daily_limit', String(n)); };

  const totalAttempts = totalCorrect + totalMistakes;
  const accuracy = totalAttempts > 0 ? Math.round((totalCorrect / totalAttempts) * 100) : 0;
  const timeSpent = Math.round((Date.now() - sessionStart) / 60000);

  // Sorted letter performance
  const letterStats = Object.entries(letterAccuracy)
    .map(([l, v]) => ({
      letter: l,
      total: v.correct + v.wrong,
      accuracy: v.correct + v.wrong > 0 ? Math.round((v.correct / (v.correct + v.wrong)) * 100) : 0,
    }))
    .sort((a, b) => a.accuracy - b.accuracy);

  const tabs: { key: Tab; label: string; icon: string }[] = [
    { key: 'overview',  label: 'Overview',  icon: '📊' },
    { key: 'practice',  label: 'Practice',  icon: '🎯' },
    { key: 'settings',  label: 'Settings',  icon: '⚙️' },
    { key: 'tips',      label: 'Tips',      icon: '💡' },
    { key: 'resources', label: 'Help',      icon: '📚' },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-primary/5 via-background to-background animate-fade-in-up">
      {/* Header */}
      <div className="flex items-center px-4 py-3 bg-card/70 backdrop-blur-md border-b border-border/50">
        <button
          onClick={() => setScreen('game')}
          className="text-muted-foreground hover:text-foreground text-sm font-medium px-3 py-2 rounded-xl transition-colors"
        >
          ← {t.back}
        </button>
        <h2 className="flex-1 text-center text-lg font-bold text-foreground">📊 {t.parentDashboard}</h2>
        <div className="w-16" />
      </div>

      {/* Child summary */}
      <div className="px-4 pt-4 max-w-lg mx-auto w-full">
        <div className="bg-gradient-to-br from-primary/15 to-primary/5 rounded-2xl border border-primary/20 p-4 flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center text-2xl">☁️</div>
          <div className="flex-1">
            <p className="font-bold text-foreground">{childName}</p>
            <p className="text-xs text-muted-foreground">
              {childAge ? `${childAge} years · ` : ''}Stage {stage}/{unlockedStages} · Level {level}
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs text-muted-foreground">Today</p>
            <p className="text-sm font-bold text-foreground">{timeSpent} min</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="px-4 mt-4 max-w-lg mx-auto w-full overflow-x-auto">
        <div className="flex gap-2 pb-1">
          {tabs.map(tb => (
            <button
              key={tb.key}
              onClick={() => setTab(tb.key)}
              className={`px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
                tab === tb.key
                  ? 'bg-primary text-primary-foreground shadow'
                  : 'bg-card border border-border text-muted-foreground hover:bg-primary/10'
              }`}
            >
              {tb.icon} {tb.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 px-4 py-4 max-w-lg mx-auto w-full space-y-4">
        {tab === 'overview' && (
          <>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'Stars', value: stars, icon: '⭐' },
                { label: 'Coins', value: coins, icon: '🪙' },
                { label: 'Accuracy', value: `${accuracy}%`, icon: '✅' },
                { label: 'Time today', value: `${timeSpent}m`, icon: '⏱️' },
                { label: 'Correct taps', value: totalCorrect, icon: '👍' },
                { label: 'Mistakes', value: totalMistakes, icon: '🔄' },
              ].map(s => (
                <div key={s.label} className="bg-card rounded-2xl border border-border p-4 shadow-sm">
                  <div className="text-2xl">{s.icon}</div>
                  <p className="text-xl font-bold mt-1">{s.value}</p>
                  <p className="text-xs text-muted-foreground">{s.label}</p>
                </div>
              ))}
            </div>

            {/* Daily-limit progress */}
            <div className="bg-card rounded-2xl border border-border p-4 shadow-sm">
              <div className="flex justify-between text-sm mb-2">
                <span className="font-medium">Daily session limit</span>
                <span className="text-muted-foreground">{Math.min(timeSpent, dailyLimit)} / {dailyLimit} min</span>
              </div>
              <div className="w-full h-3 bg-muted rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${timeSpent >= dailyLimit ? 'bg-orange-400' : 'bg-success'}`}
                  style={{ width: `${Math.min(100, (timeSpent / dailyLimit) * 100)}%` }}
                />
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                AAP recommends short, structured sessions (15–30 min) for young learners.
              </p>
            </div>
          </>
        )}

        {tab === 'practice' && (
          <>
            <div className="bg-card rounded-2xl border border-border p-4 shadow-sm">
              <p className="font-semibold mb-2">Letters needing practice</p>
              {weakLetters.length === 0 ? (
                <p className="text-sm text-muted-foreground">No weak letters yet — keep playing! 🌱</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {weakLetters.map(l => (
                    <span key={l} className="bg-encouragement/30 text-foreground font-bold px-3 py-1.5 rounded-xl text-lg">{l}</span>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-card rounded-2xl border border-border p-4 shadow-sm">
              <p className="font-semibold mb-3">Per-letter accuracy</p>
              {letterStats.length === 0 ? (
                <p className="text-sm text-muted-foreground">Stats will appear after a few rounds.</p>
              ) : (
                <div className="space-y-2">
                  {letterStats.slice(0, 10).map(s => (
                    <div key={s.letter} className="flex items-center gap-3">
                      <span className="w-6 font-bold text-foreground">{s.letter}</span>
                      <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${s.accuracy < 60 ? 'bg-orange-400' : s.accuracy < 80 ? 'bg-yellow-400' : 'bg-success'}`}
                          style={{ width: `${s.accuracy}%` }}
                        />
                      </div>
                      <span className="text-xs text-muted-foreground w-16 text-right">{s.accuracy}% · {s.total}x</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}

        {tab === 'settings' && (
          <>
            <div className="bg-card rounded-2xl border border-border p-4 shadow-sm space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-medium">Voice speed</span>
                  <span className="text-muted-foreground">{voiceSpeed.toFixed(2)}x</span>
                </div>
                <input
                  type="range" min={0.5} max={1.1} step={0.02}
                  value={voiceSpeed}
                  onChange={e => updateVoiceSpeed(parseFloat(e.target.value))}
                  className="w-full accent-primary"
                />
                <p className="text-xs text-muted-foreground mt-1">Slower speeds help children process language more easily.</p>
              </div>

              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-medium">Sound volume</span>
                  <span className="text-muted-foreground">{Math.round(soundVolume * 100)}%</span>
                </div>
                <input
                  type="range" min={0} max={1} step={0.05}
                  value={soundVolume}
                  onChange={e => updateVolume(parseFloat(e.target.value))}
                  className="w-full accent-primary"
                />
              </div>

              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-medium">Daily session limit</span>
                  <span className="text-muted-foreground">{dailyLimit} min</span>
                </div>
                <input
                  type="range" min={5} max={60} step={5}
                  value={dailyLimit}
                  onChange={e => updateDaily(parseInt(e.target.value, 10))}
                  className="w-full accent-primary"
                />
              </div>

              <label className="flex items-center justify-between cursor-pointer">
                <div>
                  <p className="font-medium text-sm">Reduce motion</p>
                  <p className="text-xs text-muted-foreground">Calmer animations for sensory comfort</p>
                </div>
                <input
                  type="checkbox"
                  checked={reduceMotion}
                  onChange={e => updateMotion(e.target.checked)}
                  className="w-5 h-5 accent-primary"
                />
              </label>
            </div>
          </>
        )}

        {tab === 'tips' && (
          <div className="space-y-3">
            {[
              { t: 'Use short, structured sessions', d: 'Children with autism benefit from predictable, 10–20 minute sessions with clear start and end cues.' },
              { t: 'Praise effort, not just success', d: 'Comment on persistence ("You kept trying!") — research shows this builds resilience.' },
              { t: 'Celebrate small wins', d: 'Each completed level is meaningful. Use the star and sticker rewards as conversation starters.' },
              { t: 'Pair learning with movement', d: 'Take a 2-minute movement break between levels to support regulation.' },
              { t: 'Repeat is good', d: 'Repetition is core to learning for children with Down syndrome — replaying levels is encouraged.' },
              { t: 'Reduce sensory load', d: 'If your child is overwhelmed, lower the volume, enable Reduce Motion, and play in a quiet room.' },
              { t: 'Use visuals + voice together', d: 'Saying the letter while it appears on screen reinforces multi-sensory learning.' },
            ].map((tip, i) => (
              <div key={i} className="bg-card rounded-2xl border border-border p-4 shadow-sm">
                <p className="font-semibold text-foreground flex items-center gap-2">💡 {tip.t}</p>
                <p className="text-sm text-muted-foreground mt-1">{tip.d}</p>
              </div>
            ))}
          </div>
        )}

        {tab === 'resources' && (
          <div className="space-y-3">
            {[
              { name: 'CDC — Autism Spectrum Disorder', url: 'https://www.cdc.gov/ncbddd/autism/index.html', desc: 'Screening, diagnosis, and parent resources.' },
              { name: 'Autism Speaks — Tool Kits', url: 'https://www.autismspeaks.org/tool-kit', desc: 'Free guides for newly diagnosed families and learning support.' },
              { name: 'National Down Syndrome Society (NDSS)', url: 'https://ndss.org/resources', desc: 'Education and developmental resources.' },
              { name: 'Understood.org', url: 'https://www.understood.org/', desc: 'Learning differences, attention, and behavior support.' },
              { name: 'AAP — Media Use Guidelines', url: 'https://www.aap.org/en/patient-care/media-and-children/', desc: 'Healthy screen-time recommendations by age.' },
            ].map((r, i) => (
              <a
                key={i} href={r.url} target="_blank" rel="noreferrer"
                className="block bg-card rounded-2xl border border-border p-4 shadow-sm hover:bg-primary/5 transition"
              >
                <p className="font-semibold text-foreground">📚 {r.name}</p>
                <p className="text-sm text-muted-foreground mt-1">{r.desc}</p>
                <p className="text-xs text-primary mt-1 truncate">{r.url}</p>
              </a>
            ))}
            <p className="text-xs text-muted-foreground text-center mt-4">
              Educational only — not medical advice. Consult your child's pediatrician or therapist.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardScreen;
