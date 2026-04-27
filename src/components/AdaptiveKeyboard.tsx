import React from 'react';
import { useGame } from '@/context/GameContext';

interface AdaptiveKeyboardProps {
  keys: string[];
  onKeyPress: (key: string) => void;
  disabled?: boolean;
  correctKey?: string | null;
  wrongKey?: string | null;
}

// Keyboard theme styles based on equipped keyboard item
const keyboardThemes: Record<string, { base: string; hover: string; border: string }> = {
  'kb-bubble': {
    base: 'bg-sky-100 text-sky-800',
    hover: 'hover:bg-sky-200 hover:border-sky-400',
    border: 'border-2 border-sky-300 rounded-full',
  },
  'kb-stars': {
    base: 'bg-amber-50 text-amber-800',
    hover: 'hover:bg-amber-100 hover:border-amber-400',
    border: 'border-2 border-amber-300',
  },
  'kb-rainbow': {
    base: 'bg-gradient-to-br from-pink-100 via-purple-50 to-cyan-100 text-purple-800',
    hover: 'hover:from-pink-200 hover:via-purple-100 hover:to-cyan-200',
    border: 'border-2 border-purple-300',
  },
  'kb-candy': {
    base: 'bg-pink-50 text-pink-800',
    hover: 'hover:bg-pink-100 hover:border-pink-400',
    border: 'border-2 border-pink-300',
  },
};

const defaultTheme = {
  base: 'bg-card text-foreground',
  hover: 'hover:bg-primary/20 hover:border-primary/50',
  border: 'border-2 border-border',
};

const AdaptiveKeyboard: React.FC<AdaptiveKeyboardProps> = ({
  keys,
  onKeyPress,
  disabled,
  correctKey,
  wrongKey,
}) => {
  const { activeItems } = useGame();
  const equippedKeyboard = activeItems?.keyboard;
  const theme = (equippedKeyboard && keyboardThemes[equippedKeyboard]) || defaultTheme;

  const cols = keys.length <= 3 ? keys.length : keys.length <= 6 ? 3 : keys.length <= 9 ? 3 : 4;

  return (
    <div
      className="grid gap-3 md:gap-4 w-full max-w-md mx-auto px-4"
      style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}
    >
      {keys.map((key, i) => {
        const isCorrect = correctKey === key;
        const isWrong = wrongKey === key;

        return (
          <button
            key={`${key}-${i}`}
            onClick={() => !disabled && onKeyPress(key)}
            disabled={disabled}
            className={`
              relative text-2xl md:text-3xl font-bold rounded-2xl py-5 md:py-6
              transition-all duration-200
              active:scale-95
              shadow-md
              min-h-[64px] min-w-[64px]
              ${isCorrect
                ? 'bg-success text-success-foreground animate-glow-green scale-105'
                : isWrong
                ? 'animate-gentle-shake bg-encouragement text-foreground'
                : `${theme.base} ${theme.hover} ${theme.border} hover:scale-105`
              }
              ${disabled ? 'pointer-events-none' : 'cursor-pointer'}
            `}
          >
            {key}
          </button>
        );
      })}
    </div>
  );
};

export default AdaptiveKeyboard;
