import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react';
import { Language } from '@/lib/translations';
import { GameTask, generateLevelTasks, TASKS_PER_LEVEL, TOTAL_LEVELS, TOTAL_STAGES } from '@/lib/gameData';

export type AppScreen = 'onboarding' | 'language' | 'registration' | 'game' | 'dashboard' | 'store' | 'stages' | 'welcomeBack' | 'levelComplete' | 'stageComplete' | 'account' | 'leaderboard';

const SAVE_KEY = 'flexikeys_save';

interface SaveData {
  childName: string;
  childAge: string;
  language: Language;
  stage: number;
  level: number;
  taskIndexInLevel: number;
  stars: number;
  coins: number;
  totalCorrect: number;
  totalMistakes: number;
  unlockedStages: number;
  weakLetters: string[];
  letterAccuracy: Record<string, { correct: number; wrong: number }>;
  purchasedItems: string[];
  activeItems: Record<string, string>;
  levelStartTime: number;
}

interface GameState {
  screen: AppScreen;
  language: Language;
  childName: string;
  childAge: string;
  stage: number;
  level: number;
  stars: number;
  coins: number;
  currentTask: GameTask | null;
  levelTasks: GameTask[];
  taskIndexInLevel: number;
  mistakesInTask: number;
  mistakesInLevel: number;
  totalMistakes: number;
  totalCorrect: number;
  sessionStart: number;
  adaptiveKeyCount: number;
  purchasedItems: string[];
  activeItems: Record<string, string>;
  unlockedStages: number;
  weakLetters: string[];
  letterAccuracy: Record<string, { correct: number; wrong: number }>;
  isReturningUser: boolean;
  levelStartTime: number;
}

interface GameContextType extends GameState {
  setScreen: (s: AppScreen) => void;
  setLanguage: (l: Language) => void;
  setChildName: (n: string) => void;
  setChildAge: (a: string) => void;
  startGame: () => void;
  startLevel: (stage: number, level: number) => void;
  submitAnswer: (answer: string) => 'correct' | 'incorrect';
  nextTaskInLevel: () => void;
  advanceToNextLevel: () => void;
  repeatLevel: () => void;
  getStarsForLevel: () => number;
  spendCoins: (amount: number, itemId: string) => void;
  equipItem: (category: string, itemId: string) => void;
  resumeGame: () => void;
  getLevelTimeSpent: () => number;
}

const GameContext = createContext<GameContextType | null>(null);

function loadSave(): SaveData | null {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return null;
}

function saveToDisk(data: Partial<SaveData>) {
  try {
    const existing = loadSave() || {};
    localStorage.setItem(SAVE_KEY, JSON.stringify({ ...existing, ...data }));
  } catch {}
}

export function GameProvider({ children }: { children: React.ReactNode }) {
  const save = loadSave();
  const isReturning = !!save?.childName;

  const [screen, setScreenState] = useState<AppScreen>(isReturning ? 'welcomeBack' : 'onboarding');
  const [language, setLanguageState] = useState<Language>(save?.language || 'en');
  const [childName, setChildNameState] = useState(save?.childName || '');
  const [childAge, setChildAgeState] = useState(save?.childAge || '');
  const [stage, setStage] = useState(save?.stage || 1);
  const [level, setLevel] = useState(save?.level || 1);
  const [stars, setStars] = useState(save?.stars || 0);
  const [coins, setCoins] = useState(save?.coins || 0);
  const [levelTasks, setLevelTasks] = useState<GameTask[]>([]);
  const [currentTask, setCurrentTask] = useState<GameTask | null>(null);
  const [taskIndexInLevel, setTaskIndexInLevel] = useState(save?.taskIndexInLevel || 0);
  const [mistakesInTask, setMistakesInTask] = useState(0);
  const [mistakesInLevel, setMistakesInLevel] = useState(0);
  const [totalMistakes, setTotalMistakes] = useState(save?.totalMistakes || 0);
  const [totalCorrect, setTotalCorrect] = useState(save?.totalCorrect || 0);
  const [sessionStart] = useState(Date.now());
  const [adaptiveKeyCount, setAdaptiveKeyCount] = useState(3);
  const [purchasedItems, setPurchasedItems] = useState<string[]>(save?.purchasedItems || []);
  const [activeItems, setActiveItems] = useState<Record<string, string>>(save?.activeItems || {});
  const [unlockedStages, setUnlockedStages] = useState(save?.unlockedStages || 1);
  const [weakLetters, setWeakLetters] = useState<string[]>(save?.weakLetters || []);
  const [letterAccuracy, setLetterAccuracy] = useState<Record<string, { correct: number; wrong: number }>>(save?.letterAccuracy || {});
  const [levelStartTime, setLevelStartTime] = useState(save?.levelStartTime || Date.now());

  const consecutiveCorrect = useRef(0);
  const consecutiveMistakes = useRef(0);

  const setScreen = useCallback((s: AppScreen) => setScreenState(s), []);
  const setLanguage = useCallback((l: Language) => {
    setLanguageState(l);
    saveToDisk({ language: l });
  }, []);
  const setChildName = useCallback((n: string) => {
    setChildNameState(n);
    saveToDisk({ childName: n });
  }, []);
  const setChildAge = useCallback((a: string) => {
    setChildAgeState(a);
    saveToDisk({ childAge: a });
  }, []);

  // Persist state on changes
  useEffect(() => {
    saveToDisk({
      stage, level, taskIndexInLevel, stars, coins,
      totalCorrect, totalMistakes, unlockedStages,
      weakLetters, letterAccuracy, purchasedItems, activeItems, levelStartTime,
    });
  }, [stage, level, taskIndexInLevel, stars, coins, totalCorrect, totalMistakes, unlockedStages, weakLetters, letterAccuracy, purchasedItems, activeItems, levelStartTime]);

  const startLevel = useCallback((s: number, l: number) => {
    setStage(s);
    setLevel(l);
    setMistakesInLevel(0);
    setMistakesInTask(0);
    setTaskIndexInLevel(0);
    setLevelStartTime(Date.now());
    consecutiveCorrect.current = 0;
    consecutiveMistakes.current = 0;

    const tasks = generateLevelTasks(s, l, adaptiveKeyCount, weakLetters);
    setLevelTasks(tasks);
    setCurrentTask(tasks[0]);
    setScreen('game');
  }, [adaptiveKeyCount, weakLetters, setScreen]);

  const startGame = useCallback(() => {
    startLevel(stage, level);
  }, [stage, level, startLevel]);

  const resumeGame = useCallback(() => {
    startLevel(stage, level);
  }, [stage, level, startLevel]);

  const updateLetterAccuracy = useCallback((letter: string, correct: boolean) => {
    setLetterAccuracy(prev => {
      const entry = prev[letter] || { correct: 0, wrong: 0 };
      const updated = {
        ...prev,
        [letter]: {
          correct: entry.correct + (correct ? 1 : 0),
          wrong: entry.wrong + (correct ? 0 : 1),
        },
      };

      const weak = Object.entries(updated)
        .filter(([, v]) => {
          const total = v.correct + v.wrong;
          return total >= 3 && (v.correct / total) < 0.6;
        })
        .map(([k]) => k);
      setWeakLetters(weak);

      return updated;
    });
  }, []);

  const submitAnswer = useCallback((answer: string): 'correct' | 'incorrect' => {
    if (!currentTask) return 'incorrect';

    if (answer === currentTask.target) {
      consecutiveCorrect.current++;
      consecutiveMistakes.current = 0;
      setTotalCorrect(c => c + 1);
      setCoins(c => c + 5 + (consecutiveCorrect.current >= 3 ? 3 : 0));
      updateLetterAccuracy(currentTask.target, true);

      if (consecutiveCorrect.current >= 5) {
        setAdaptiveKeyCount(k => Math.min(k + 1, 8));
      }
      return 'correct';
    }

    consecutiveMistakes.current++;
    consecutiveCorrect.current = 0;
    setMistakesInTask(m => m + 1);
    setMistakesInLevel(m => m + 1);
    setTotalMistakes(m => m + 1);
    updateLetterAccuracy(currentTask.target, false);

    if (consecutiveMistakes.current >= 3) {
      setAdaptiveKeyCount(k => Math.max(k - 1, 2));
    }

    return 'incorrect';
  }, [currentTask, updateLetterAccuracy]);

  const getStarsForLevel = useCallback((): number => {
    if (mistakesInLevel === 0) return 3;
    if (mistakesInLevel <= 3) return 2;
    return 1;
  }, [mistakesInLevel]);

  const nextTaskInLevel = useCallback(() => {
    setMistakesInTask(0);
    const nextIdx = taskIndexInLevel + 1;
    setTaskIndexInLevel(nextIdx);

    if (nextIdx >= levelTasks.length) {
      const earnedStars = getStarsForLevel();
      setStars(s => s + earnedStars);

      if (level >= TOTAL_LEVELS) {
        setUnlockedStages(u => Math.min(u + 1, TOTAL_STAGES));
        setScreen('stageComplete');
      } else {
        setScreen('levelComplete');
      }
      return;
    }

    setCurrentTask(levelTasks[nextIdx]);
  }, [taskIndexInLevel, levelTasks, level, getStarsForLevel, setScreen]);

  const advanceToNextLevel = useCallback(() => {
    if (level >= TOTAL_LEVELS) {
      const nextStage = Math.min(stage + 1, TOTAL_STAGES);
      startLevel(nextStage, 1);
    } else {
      startLevel(stage, level + 1);
    }
  }, [stage, level, startLevel]);

  const repeatLevel = useCallback(() => {
    startLevel(stage, level);
  }, [stage, level, startLevel]);

  const spendCoins = useCallback((amount: number, itemId: string) => {
    setCoins(c => c - amount);
    setPurchasedItems(items => [...items, itemId]);
  }, []);

  const equipItem = useCallback((category: string, itemId: string) => {
    setActiveItems(prev => ({ ...prev, [category]: itemId }));
  }, []);

  const getLevelTimeSpent = useCallback(() => {
    return Math.round((Date.now() - levelStartTime) / 60000);
  }, [levelStartTime]);

  return (
    <GameContext.Provider value={{
      screen, language, childName, childAge, stage, level, stars, coins,
      currentTask, levelTasks, taskIndexInLevel, mistakesInTask, mistakesInLevel,
      totalMistakes, totalCorrect, sessionStart, adaptiveKeyCount, purchasedItems,
      activeItems, unlockedStages, weakLetters, letterAccuracy, isReturningUser: isReturning,
      levelStartTime,
      setScreen, setLanguage, setChildName, setChildAge,
      startGame, startLevel, submitAnswer, nextTaskInLevel,
      advanceToNextLevel, repeatLevel, getStarsForLevel, spendCoins,
      equipItem, resumeGame, getLevelTimeSpent,
    }}>
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error('useGame must be used within GameProvider');
  return ctx;
}
