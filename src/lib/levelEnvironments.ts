// Soft background environments per level for visual progression

export interface LevelEnvironment {
  name: string;
  icon: string;
  gradient: string;
  particleEmoji?: string;
}

const levelEnvironments: LevelEnvironment[] = [
  { name: 'Soft Sky', icon: '☁️', gradient: 'from-sky-100 via-blue-50 to-cyan-50', particleEmoji: '☁️' },
  { name: 'Light Forest', icon: '🌿', gradient: 'from-green-50 via-emerald-50 to-lime-50', particleEmoji: '🌿' },
  { name: 'Beach', icon: '🌊', gradient: 'from-cyan-50 via-sky-50 to-blue-50', particleEmoji: '🐚' },
  { name: 'Sunset', icon: '🌅', gradient: 'from-orange-50 via-amber-50 to-yellow-50', particleEmoji: '🌅' },
  { name: 'Stars', icon: '✨', gradient: 'from-indigo-50 via-purple-50 to-violet-50', particleEmoji: '✨' },
  { name: 'Garden', icon: '🌸', gradient: 'from-pink-50 via-rose-50 to-fuchsia-50', particleEmoji: '🌸' },
  { name: 'Aurora', icon: '🌌', gradient: 'from-teal-50 via-cyan-50 to-emerald-50', particleEmoji: '💫' },
  { name: 'Rainbow', icon: '🌈', gradient: 'from-violet-50 via-pink-50 to-orange-50', particleEmoji: '🌈' },
  { name: 'Snow', icon: '❄️', gradient: 'from-slate-50 via-blue-50 to-gray-50', particleEmoji: '❄️' },
  { name: 'Sunshine', icon: '☀️', gradient: 'from-yellow-50 via-amber-50 to-orange-50', particleEmoji: '☀️' },
];

export function getLevelEnvironment(level: number): LevelEnvironment {
  return levelEnvironments[(level - 1) % levelEnvironments.length];
}
