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
import iconCoin from '@/assets/icon-coin.png';
import iconStar from '@/assets/icon-star.png';
import iconShop from '@/assets/icon-shop.png';
import iconTrophy from '@/assets/icon-trophy.png';
import iconParent from '@/assets/icon-parent.png';
import iconBack from '@/assets/icon-back.png';

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
      <div className="flex items-center justify-between gap-2 px-3 py-3 bg-card/60 backdrop-blur-sm border-b border-border/50">
        {/* Left: rewards chips with 3D icons */}
        <div className="flex items-center gap-2 text-sm font-bold">
          <span className="flex items-center gap-1 bg-amber-50 border border-amber-200 px-2 py-1 rounded-full text-amber-900 shadow-sm">
            <img src={iconStar} alt="" className="w-7 h-7 drop-shadow" />
            {stars}
          </span>
          <span className="flex items-center gap-1 bg-yellow-50 border border-yellow-200 px-2 py-1 rounded-full text-yellow-900 shadow-sm">
            <img src={iconCoin} alt="" className="w-7 h-7 drop-shadow" />
            {coins}
          </span>
        </div>

        {/* Center: big action buttons with 3D icons */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setScreen('store')}
            className="relative flex items-center gap-1.5 bg-white hover:bg-pink-50 border-2 border-pink-200 text-pink-700 font-bold px-3 py-1.5 rounded-2xl shadow-lg transition-all hover:scale-105 active:scale-95"
            aria-label="Shop"
          >
            <img src={iconShop} alt="" className="w-9 h-9 drop-shadow" />
            <span className="text-sm font-bold hidden sm:inline">{t.shop || 'Shop'}</span>
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-400 rounded-full animate-ping" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-400 rounded-full" />
          </button>
          <button
            onClick={() => setScreen('leaderboard')}
            className="flex items-center gap-1.5 bg-white hover:bg-amber-50 border-2 border-amber-200 text-amber-700 font-bold px-3 py-1.5 rounded-2xl shadow-lg transition-all hover:scale-105 active:scale-95"
            aria-label="Leaderboard"
          >
            <img src={iconTrophy} alt="" className="w-9 h-9 drop-shadow" />
            <span className="text-sm font-bold hidden sm:inline">{t.leaderboard || 'Top'}</span>
          </button>
        </div>

        {/* Right: Account chip with child's name */}
        <button
          onClick={() => setScreen('account')}
          className="flex items-center gap-2 bg-card border border-border hover:border-primary hover:bg-primary/5 px-2.5 py-1.5 rounded-full transition shadow-sm"
          aria-label="Account"
        >
          <span className="w-7 h-7 rounded-full bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center text-white text-sm font-bold">
            {(childName || '?').charAt(0).toUpperCase()}
          </span>
          <span className="text-sm font-semibold text-foreground max-w-[80px] truncate hidden sm:inline">
            {childName || t.account}
          </span>
        </button>
      </div>

      {/* Back + Parent Dashboard secondary row with 3D icons */}
      <div className="flex items-center justify-between px-4 pt-2">
        <button
          onClick={() => setScreen('welcomeBack')}
          className="flex items-center gap-1.5 text-foreground hover:scale-105 active:scale-95 transition-transform"
          aria-label="Back"
        >
          <img src={iconBack} alt="" className="w-8 h-8 drop-shadow" />
          <span className="text-xs font-semibold">{t.back}</span>
        </button>
        <button
          onClick={() => setScreen('dashboard')}
          className="flex items-center gap-1.5 bg-white border-2 border-blue-200 hover:bg-blue-50 text-blue-700 font-bold px-3 py-1.5 rounded-2xl shadow-md transition-all hover:scale-105 active:scale-95"
        >
          <img src={iconParent} alt="" className="w-8 h-8 drop-shadow" />
          <span className="text-xs font-bold">{t.parentDashboard}</span>
        </button>
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
