import React, { useState } from 'react';
import CloudMascot from '@/components/CloudMascot';
import { useGame } from '@/context/GameContext';
import translations from '@/lib/translations';

interface StoreItem {
  id: string;
  name: string;
  description: string;
  price: number;
  icon: string;
  category: 'theme' | 'keyboard' | 'accessory' | 'sound';
}

const storeItems: StoreItem[] = [
  // Themes
  { id: 'theme-ocean', name: 'Ocean Theme 🌊', description: 'Cool blue ocean vibes', price: 50, icon: '🌊', category: 'theme' },
  { id: 'theme-forest', name: 'Forest Theme 🌿', description: 'Calming green nature', price: 50, icon: '🌿', category: 'theme' },
  { id: 'theme-sunset', name: 'Sunset Theme 🌅', description: 'Warm sunset colors', price: 75, icon: '🌅', category: 'theme' },
  { id: 'theme-space', name: 'Space Theme 🌙', description: 'Dreamy night sky', price: 80, icon: '🌙', category: 'theme' },
  { id: 'theme-lavender', name: 'Lavender Theme 💜', description: 'Soft purple dreams', price: 60, icon: '💜', category: 'theme' },
  { id: 'theme-cherry', name: 'Cherry Blossom 🌸', description: 'Pink spring petals', price: 70, icon: '🌸', category: 'theme' },
  // Keyboards
  { id: 'kb-bubble', name: 'Bubble Keys', description: 'Round bubbly buttons', price: 80, icon: '🫧', category: 'keyboard' },
  { id: 'kb-stars', name: 'Star Keys', description: 'Sparkly star buttons', price: 80, icon: '✨', category: 'keyboard' },
  { id: 'kb-rainbow', name: 'Rainbow Keys', description: 'Colorful rainbow keys', price: 100, icon: '🌈', category: 'keyboard' },
  { id: 'kb-candy', name: 'Candy Keys', description: 'Sweet candy buttons', price: 90, icon: '🍬', category: 'keyboard' },
  // Accessories
  { id: 'mascot-bow', name: 'Cloud Bow', description: 'A cute bow for mascot', price: 40, icon: '🎀', category: 'accessory' },
  { id: 'mascot-hat', name: 'Party Hat', description: 'Fun celebration hat', price: 45, icon: '🎉', category: 'accessory' },
  { id: 'mascot-crown', name: 'Golden Crown', description: 'A royal crown!', price: 120, icon: '👑', category: 'accessory' },
  { id: 'mascot-glasses', name: 'Cool Glasses', description: 'Stylish sunglasses', price: 55, icon: '😎', category: 'accessory' },
  // Sound packs
  { id: 'sound-gentle', name: 'Gentle Chimes', description: 'Soft bell sounds', price: 60, icon: '🔔', category: 'sound' },
  { id: 'sound-nature', name: 'Nature Sounds', description: 'Birds and streams', price: 65, icon: '🐦', category: 'sound' },
  { id: 'sound-magic', name: 'Magic Sparkle', description: 'Magical sound effects', price: 70, icon: '✨', category: 'sound' },
];

const StoreScreen: React.FC = () => {
  const { coins, spendCoins, purchasedItems, activeItems, equipItem, setScreen, language } = useGame();
  const t = translations[language];
  const [activeTab, setActiveTab] = useState<StoreItem['category']>('theme');
  const [justBought, setJustBought] = useState<string | null>(null);
  const [buyError, setBuyError] = useState<string | null>(null);

  const filtered = storeItems.filter(item => item.category === activeTab);

  const handleBuy = (item: StoreItem) => {
    if (purchasedItems.includes(item.id)) {
      // Already owned — just equip it
      equipItem(item.category, item.id);
      return;
    }
    if (coins < item.price) {
      setBuyError('Not enough coins! Keep playing to earn more 🪙');
      setTimeout(() => setBuyError(null), 2000);
      return;
    }
    spendCoins(item.price, item.id);
    // Auto-equip on purchase
    equipItem(item.category, item.id);
    setJustBought(item.id);
    setTimeout(() => setJustBought(null), 1500);
  };

  const handleEquip = (item: StoreItem) => {
    if (purchasedItems.includes(item.id)) {
      equipItem(item.category, item.id);
    }
  };

  const tabs: { key: StoreItem['category']; label: string; icon: string }[] = [
    { key: 'theme', label: t.themes || 'Themes', icon: '🎨' },
    { key: 'keyboard', label: t.keyboards || 'Keyboards', icon: '⌨️' },
    { key: 'accessory', label: t.accessories || 'Accessories', icon: '🎀' },
    { key: 'sound', label: 'Sounds', icon: '🔔' },
  ];

  return (
    <div className="min-h-screen flex flex-col animate-fade-in-up bg-gradient-to-b from-amber-50/50 via-background to-background">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-card/60 backdrop-blur-sm border-b border-border/50">
        <button
          onClick={() => setScreen('game')}
          className="text-muted-foreground hover:text-foreground text-sm font-medium px-3 py-2 rounded-xl transition-colors"
        >
          ← {t.back}
        </button>
        <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
          <span className="text-3xl">🛍️</span> {t.store || 'Store'}
        </h2>
        <span className="bg-gradient-to-r from-amber-400 to-yellow-400 px-4 py-1.5 rounded-full text-white text-sm font-bold shadow-md shadow-amber-200/50">
          🪙 {coins}
        </span>
      </div>

      {/* Error message */}
      {buyError && (
        <div className="mx-4 mt-2 bg-red-50 border border-red-200 text-red-600 text-sm font-medium px-4 py-2 rounded-xl text-center animate-fade-in-up">
          {buyError}
        </div>
      )}

      {/* Mascot */}
      <div className="flex justify-center py-3">
        <CloudMascot mood="happy" size={120} />
      </div>

      {/* Tabs */}
      <div className="flex gap-2 px-4 mb-4 overflow-x-auto">
        {tabs.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex-1 py-3 rounded-2xl text-xs font-semibold transition-all whitespace-nowrap ${
              activeTab === tab.key
                ? 'bg-primary text-primary-foreground shadow-md shadow-primary/20'
                : 'bg-card text-muted-foreground border border-border hover:bg-primary/10'
            }`}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {/* Items grid */}
      <div className="flex-1 px-4 pb-8 overflow-y-auto">
        <div className="grid grid-cols-2 gap-3">
          {filtered.map(item => {
            const owned = purchasedItems.includes(item.id);
            const equipped = activeItems?.[item.category] === item.id;
            const canAfford = coins >= item.price;
            const wasJustBought = justBought === item.id;

            return (
              <div
                key={item.id}
                className={`bg-card/80 backdrop-blur-sm rounded-2xl border-2 p-4 flex flex-col items-center gap-2 transition-all duration-300 ${
                  wasJustBought ? 'border-green-400 scale-105 shadow-xl shadow-green-200/40' :
                  equipped ? 'border-primary shadow-lg shadow-primary/20 ring-2 ring-primary/30' :
                  owned ? 'border-green-300/50' :
                  'border-border/50 hover:border-primary/30'
                }`}
              >
                {/* Icon with glow */}
                <div className={`text-6xl p-3 rounded-2xl transition-all ${
                  owned ? 'bg-green-50/80' : 'bg-muted/30'
                } ${equipped ? 'shadow-lg shadow-primary/30 scale-110' : ''}`}>
                  {item.icon}
                </div>
                <h3 className="text-sm font-bold text-foreground text-center leading-tight">{item.name}</h3>
                <p className="text-xs text-muted-foreground text-center">{item.description}</p>

                {equipped ? (
                  <span className="text-xs font-bold text-white bg-primary px-5 py-2.5 rounded-full shadow-md shadow-primary/30">
                    ✓ Active
                  </span>
                ) : owned ? (
                  <button
                    onClick={() => handleEquip(item)}
                    className="text-xs font-bold text-white bg-green-500 hover:bg-green-600 px-5 py-2.5 rounded-full shadow-md shadow-green-300/30 transition-all hover:scale-105 active:scale-95"
                  >
                    Equip ✓
                  </button>
                ) : (
                  <button
                    onClick={() => handleBuy(item)}
                    disabled={!canAfford}
                    className={`text-xs font-bold px-5 py-2.5 rounded-full transition-all ${
                      canAfford
                        ? 'bg-gradient-to-r from-amber-400 to-yellow-400 text-white shadow-md shadow-amber-200/30 hover:scale-105 active:scale-95 hover:shadow-lg'
                        : 'bg-muted text-muted-foreground cursor-not-allowed opacity-60'
                    }`}
                  >
                    🪙 {item.price}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default StoreScreen;
