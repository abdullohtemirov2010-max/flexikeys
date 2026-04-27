import { Language } from './translations';

export interface GameTask {
  type: 'letter' | 'introduce' | 'exam';
  target: string;
  options: string[];
  image?: string;
  hint?: string;
  isNew?: boolean;
}

export interface LevelConfig {
  level: number;
  newLetters: string[];
  oldLetters: string[];
  isExam?: boolean;
}

// Stage 1: Alphabet A-Z across 10 levels — SEQUENTIAL ORDER
const stage1Levels: LevelConfig[] = [
  { level: 1, newLetters: ['A', 'B', 'C'], oldLetters: [] },
  { level: 2, newLetters: ['D', 'E', 'F'], oldLetters: ['A', 'B', 'C'] },
  { level: 3, newLetters: ['G', 'H', 'I'], oldLetters: ['A', 'B', 'C', 'D', 'E', 'F'] },
  { level: 4, newLetters: ['J', 'K', 'L'], oldLetters: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I'] },
  { level: 5, newLetters: ['M', 'N', 'O'], oldLetters: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L'] },
  { level: 6, newLetters: ['P', 'Q', 'R'], oldLetters: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O'] },
  { level: 7, newLetters: ['S', 'T', 'U'], oldLetters: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R'] },
  { level: 8, newLetters: ['V', 'W', 'X'], oldLetters: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U'] },
  { level: 9, newLetters: ['Y', 'Z'], oldLetters: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X'] },
  { level: 10, newLetters: [], oldLetters: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split(''), isExam: true },
];

export function getLevelConfig(stage: number, level: number): LevelConfig {
  if (stage === 1) {
    return stage1Levels[Math.min(level - 1, 9)];
  }
  return { level, newLetters: [], oldLetters: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('') };
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export const TASKS_PER_LEVEL = 10;
export const TOTAL_LEVELS = 10;
export const TOTAL_STAGES = 10;

/**
 * Generate all 10 tasks for a level.
 * Level 10 = MCQ Exam (random letters from full alphabet)
 * Levels 1-9 = sequential letter learning (30% new, 70% old)
 */
export function generateLevelTasks(stage: number, level: number, adaptiveKeyCount: number, weakLetters: string[] = []): GameTask[] {
  const config = getLevelConfig(stage, level);
  const { newLetters, oldLetters, isExam } = config;
  const allLetters = [...newLetters, ...oldLetters];
  const tasks: GameTask[] = [];

  // LEVEL 10: MCQ Exam — all random, no introductions
  if (isExam) {
    const examLetters = shuffle('ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split(''));
    // Pick 10 random letters for the exam, prioritize weak letters
    const examTargets: string[] = [];
    
    // Add weak letters first
    const validWeak = weakLetters.filter(l => examLetters.includes(l));
    for (const w of validWeak) {
      if (examTargets.length < TASKS_PER_LEVEL) examTargets.push(w);
    }
    // Fill remaining with random shuffled letters
    for (const l of examLetters) {
      if (examTargets.length >= TASKS_PER_LEVEL) break;
      if (!examTargets.includes(l)) examTargets.push(l);
    }

    for (const target of examTargets) {
      const keyCount = Math.min(Math.max(adaptiveKeyCount, 4), 6); // Exam uses 4-6 keys
      const distractors = shuffle(examLetters.filter(l => l !== target)).slice(0, keyCount - 1);
      const options = shuffle([target, ...distractors]);
      tasks.push({ type: 'exam', target, options });
    }
    return tasks;
  }

  // LEVELS 1-9: Sequential alphabet learning
  // First: introduce new letters in order (1 task each)
  for (const letter of newLetters) {
    tasks.push({
      type: 'introduce',
      target: letter,
      options: [],
      isNew: true,
    });
  }

  // Fill remaining tasks with sequential practice
  const remaining = TASKS_PER_LEVEL - tasks.length;
  
  // Build a deterministic task order: cycle through new letters first, then old
  // This ensures consistent ordering, not random
  const practiceOrder: string[] = [];
  
  // Add new letters for practice (they need reinforcement right after intro)
  for (const l of newLetters) {
    practiceOrder.push(l);
  }
  
  // Add old letters in sequential order for review
  for (const l of oldLetters) {
    practiceOrder.push(l);
  }
  
  // Add weak letters for extra practice
  for (const l of weakLetters) {
    if (allLetters.includes(l) && !practiceOrder.includes(l)) {
      practiceOrder.push(l);
    }
  }

  for (let i = 0; i < remaining; i++) {
    // Cycle through practice order deterministically
    const target = practiceOrder[i % practiceOrder.length];

    // Generate distractors from available letters
    const keyCount = Math.min(adaptiveKeyCount, allLetters.length);
    const distractors = shuffle(allLetters.filter(l => l !== target)).slice(0, keyCount - 1);
    const options = shuffle([target, ...distractors]);

    tasks.push({
      type: 'letter',
      target,
      options,
    });
  }

  return tasks;
}

function pickTarget(newLetters: string[], oldLetters: string[]): string {
  if (newLetters.length === 0 && oldLetters.length > 0) {
    return oldLetters[Math.floor(Math.random() * oldLetters.length)];
  }
  if (oldLetters.length === 0 && newLetters.length > 0) {
    return newLetters[Math.floor(Math.random() * newLetters.length)];
  }
  if (Math.random() < 0.3 && newLetters.length > 0) {
    return newLetters[Math.floor(Math.random() * newLetters.length)];
  }
  if (oldLetters.length > 0) {
    return oldLetters[Math.floor(Math.random() * oldLetters.length)];
  }
  return newLetters[Math.floor(Math.random() * newLetters.length)];
}
