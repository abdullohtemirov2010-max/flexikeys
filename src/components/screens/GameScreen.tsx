import React, { useState, useCallback, useEffect } from 'react';
import CloudMascot from '@/components/CloudMascot';
import SpeechBubble from '@/components/SpeechBubble';
import AdaptiveKeyboard from '@/components/AdaptiveKeyboard';
import StarReward from '@/components/StarReward';
import { useGame } from '@/context/GameContext';
import translations from '@/lib/translations';
import { speakCorrect, speakEncourage, speakLetter, speakLetterAuto, speakLetsTry, speakExamStart, unlockSpeech } from '@/lib/voiceFeedback';
import { TASKS_PER_LEVEL } from '@/lib/gameData';
import { getLevelEnvironment } from '@/lib/levelEnvironments';

const GameScreen: React.FC = () => {
  const {
    language, currentTask, stage, level, stars, coins,
    submitAnswer, nextTaskInLevel, setScreen,
    taskIndexInLevel, mistakesInTask, childName, levelTasks,
    activeItems,
  } = useGame();
  const t = translations[language];

  const [mascotMood, setMascotMood] = useState<'happy' | 'neutral' | 'encouraging'>('neutral');
  const [message, setMessage] = useState(t.letsTry);
  const [correctKey, setCorrectKey] = useState<string | null>(null);
  const [wrongKey, setWrongKey] = useState<string | null>(null);
  const [showStars, setShowStars] = useState(false);
  const [disabled, setDisabled] = useState(false);
  const [showIntroduce, setShowIntroduce] = useState(false);

  const env = getLevelEnvironment(level);
  const isExam = level === 10;

  // Get equipped accessory for mascot display
  const equippedAccessory = activeItems?.accessory;
  const accessoryEmoji: Record<string, string> = {
    'mascot-bow': '🎀',
    'mascot-hat': '🎉',
    'mascot-crown': '👑',
    'mascot-glasses': '😎',
  };

  // Unlock speech on first touch/click (Android fix)
  useEffect(() => {
    const handler = () => unlockSpeech();
    document.addEventListener('touchstart', handler, { once: true });
    document.addEventListener('click', handler, { once: true });
    return () => {
      document.removeEventListener('touchstart', handler);
      document.removeEventListener('click', handler);
    };
  }, []);

  useEffect(() => {
    if (!currentTask) return;

    setCorrectKey(null);
    setWrongKey(null);
    setShowStars(false);
    setDisabled(false);

    if (currentTask.type === 'introduce') {
      setShowIntroduce(true);
      setMascotMood('happy');
      setMessage(`${t.newLetter} ${t.thisIs} ${currentTask.target}`);
      setTimeout(() => speakLetterAuto(currentTask.target), 500);
      setDisabled(true);
    } else if (currentTask.type === 'exam') {
      setShowIntroduce(false);
      setMascotMood('neutral');
      setMessage(t.findLetter);
      // For exam, still pronounce the letter
      setTimeout(() => speakLetterAuto(currentTask.target), 400);
    } else {
      setShowIntroduce(false);
      setMascotMood('neutral');
      setMessage(t.findLetter);
      setTimeout(() => speakLetterAuto(currentTask.target), 400);
    }
  }, [currentTask, t]);

  // Speak exam intro on level 10 start
  useEffect(() => {
    if (isExam && taskIndexInLevel === 0) {
      setTimeout(() => speakExamStart(), 300);
    }
  }, [isExam]);

  const handleHearLetter = useCallback(() => {
    if (currentTask) {
      speakLetter(currentTask.target);
    }
  }, [currentTask]);

  const handleContinueFromIntroduce = useCallback(() => {
    setShowIntroduce(false);
    nextTaskInLevel();
  }, [nextTaskInLevel]);

  const handleKeyPress = useCallback((key: string) => {
    if (disabled || !currentTask) return;

    const result = submitAnswer(key);

    if (result === 'correct') {
      setCorrectKey(key);
      setMascotMood('happy');
      const msgs = [t.greatJob, t.youreLearning];
      setMessage(msgs[Math.floor(Math.random() * msgs.length)]);
      setDisabled(true);
      speakCorrect();

      setTimeout(() => setShowStars(true), 500);

      // Auto-advance
      setTimeout(() => {
        nextTaskInLevel();
      }, 2500);
    } else {
      setWrongKey(key);
      setMascotMood('encouraging');
      const msgs = [t.tryAgain, t.almostThere];
      setMessage(msgs[Math.floor(Math.random() * msgs.length)]);
      speakEncourage();
      setTimeout(() => setWrongKey(null), 500);
    }
  }, [disabled, currentTask, submitAnswer, t, nextTaskInLevel]);

  if (!currentTask) return null;

  const taskProgress = `${Math.min(taskIndexInLevel + 1, TASKS_PER_LEVEL)} ${t.taskOf} ${TASKS_PER_LEVEL}`;

  return (
    <div className={`min-h-screen flex flex-col animate-fade-in-up bg-gradient-to-b ${env.gradient} transition-all duration-1000`}>
      {/* Floating environment particles */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden opacity-20">
        {[...Array(5)].map((_, i) => (
          <span
            key={i}
            className="absolute text-3xl animate-float"
            style={{
              left: `${15 + i * 18}%`,
              top: `${10 + (i * 17) % 60}%`,
              animationDelay: `${i * 0.7}s`,
              animationDuration: `${3 + i * 0.5}s`,
            }}
          >
            {env.particleEmoji}
          </span>
        ))}
      </div>

      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-card/60 backdrop-blur-sm border-b border-border/50">
        <button
          onClick={() => setScreen('welcomeBack')}
          className="text-muted-foreground hover:text-foreground text-sm font-medium px-3 py-2 rounded-xl transition-colors"
        >
          ← {t.back}
        </button>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setScreen('store')}
            className="relative flex items-center gap-1.5 bg-gradient-to-r from-amber-400 via-yellow-400 to-orange-400 hover:from-amber-500 hover:via-yellow-500 hover:to-orange-500 text-white font-bold text-base px-5 py-2.5 rounded-2xl shadow-lg shadow-amber-300/40 transition-all hover:scale-110 active:scale-95 animate-pulse-slow"
            aria-label="Store"
          >
            <span className="text-2xl">🛍️</span>
            <span className="text-sm font-bold drop-shadow-sm">Shop</span>
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-400 rounded-full animate-ping" />
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-400 rounded-full" />
          </button>
          <button
            onClick={() => setScreen('dashboard')}
            className="text-muted-foreground hover:text-foreground text-xs font-medium px-3 py-2 rounded-xl transition-colors"
          >
            📊
          </button>
        </div>
        <div className="flex items-center gap-4 text-sm font-semibold">
          <span className="bg-accent/30 px-3 py-1 rounded-full text-accent-foreground">
            ⭐ {stars}
          </span>
          <span className="bg-reward-gold/30 px-3 py-1 rounded-full text-accent-foreground">
            🪙 {coins}
          </span>
        </div>
      </div>

      {/* Environment label */}
      <div className="text-center pt-1">
        <span className="text-xs text-muted-foreground/60">{env.icon} {env.name}</span>
      </div>

      {/* Stage + Level + Progress */}
      <div className="text-center py-2 space-y-1">
        <span className="text-xs font-medium text-muted-foreground">
          {isExam ? '📝 Alphabet Test' : `${t.stage} ${stage} · ${t.level} ${level}`}
        </span>
        <div className="flex items-center justify-center gap-2">
          <div className="w-32 h-2 bg-muted/50 rounded-full overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all duration-500"
              style={{ width: `${((taskIndexInLevel) / TASKS_PER_LEVEL) * 100}%` }}
            />
          </div>
          <span className="text-xs text-muted-foreground">{taskProgress}</span>
        </div>
      </div>

      {/* Equipped accessory display */}
      {equippedAccessory && accessoryEmoji[equippedAccessory] && (
        <div className="absolute top-20 right-4 text-3xl animate-float z-10">
          {accessoryEmoji[equippedAccessory]}
        </div>
      )}

      {/* Mascot + Speech */}
      <div className="flex flex-col items-center py-3 gap-2 relative">
        <SpeechBubble text={message} />
        <div className="relative">
          <CloudMascot mood={mascotMood} size={200} />
          {/* Show equipped accessory on mascot */}
          {equippedAccessory && accessoryEmoji[equippedAccessory] && (
            <span className="absolute -top-2 -right-2 text-2xl">{accessoryEmoji[equippedAccessory]}</span>
          )}
        </div>
      </div>

      {/* Target display */}
      <div className="flex-1 flex flex-col items-center justify-center gap-4 px-6">
        {showIntroduce ? (
          <div className="flex flex-col items-center gap-6">
            <div className="flex items-center gap-4">
              <span className="text-8xl md:text-9xl font-bold text-foreground">{currentTask.target}</span>
              <button
                onClick={handleHearLetter}
                className="text-4xl bg-primary/20 hover:bg-primary/30 p-4 rounded-full transition-all hover:scale-110 active:scale-95 shadow-lg shadow-primary/20"
                aria-label={t.tapToHear}
              >
                🔊
              </button>
            </div>
            <p className="text-lg text-muted-foreground">{t.tapToHear}</p>
            <button
              onClick={handleContinueFromIntroduce}
              className="mt-4 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-xl px-10 py-4 rounded-2xl shadow-lg transition-all hover:scale-105 active:scale-95"
            >
              {t.continue}
            </button>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-3">
              <span className="text-7xl md:text-8xl font-bold text-foreground">{currentTask.target}</span>
              <button
                onClick={handleHearLetter}
                className="text-3xl bg-primary/20 hover:bg-primary/30 p-3 rounded-full transition-all hover:scale-110 active:scale-95 shadow-md shadow-primary/20"
                aria-label={t.tapToHear}
              >
                🔊
              </button>
            </div>
            {isExam && (
              <span className="text-xs bg-amber-100 text-amber-700 px-3 py-1 rounded-full font-medium">
                📝 Test Question {taskIndexInLevel + 1}
              </span>
            )}
            <StarReward count={mistakesInTask === 0 ? 3 : mistakesInTask <= 2 ? 2 : 1} show={showStars} />
          </>
        )}
      </div>

      {/* Adaptive Keyboard */}
      {!showIntroduce && (
        <div className="pb-8 pt-4">
          <AdaptiveKeyboard
            keys={currentTask.options}
            onKeyPress={handleKeyPress}
            disabled={disabled}
            correctKey={correctKey}
            wrongKey={wrongKey}
          />
        </div>
      )}
    </div>
  );
};

export default GameScreen;
