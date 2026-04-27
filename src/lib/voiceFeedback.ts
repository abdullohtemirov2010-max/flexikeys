// Voice feedback using Web Speech API
// Tuned for children with autism / Down syndrome:
//  - slower rate
//  - calm, warm, neutral pitch
//  - no overlapping speech
//  - correct phonetic pronunciation of each alphabet letter

let selectedVoice: SpeechSynthesisVoice | null = null;

function pickBestVoice(): SpeechSynthesisVoice | null {
  if (selectedVoice) return selectedVoice;
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return null;
  const voices = speechSynthesis.getVoices();
  if (!voices.length) return null;

  const en = voices.filter(v => v.lang.toLowerCase().startsWith('en'));

  // Prefer high-quality natural female voices
  const preferred =
    en.find(v => /Google US English/i.test(v.name)) ||
    en.find(v => /Google.*English/i.test(v.name) && !/Male/i.test(v.name)) ||
    en.find(v => /(Samantha|Ava|Allison|Karen|Moira|Tessa|Serena|Joanna|Nicky)/i.test(v.name)) ||
    en.find(v => /(Aria|Jenny|Zira|Hazel|Libby|Sonia|Michelle)/i.test(v.name)) ||
    en.find(v => !/(Male|David|Daniel|James|Mark|Alex|Fred|George|Tom)/i.test(v.name)) ||
    en[0] || voices[0];

  selectedVoice = preferred;
  return preferred;
}

if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
  speechSynthesis.onvoiceschanged = () => { selectedVoice = null; pickBestVoice(); };
  setTimeout(() => { speechSynthesis.getVoices(); pickBestVoice(); }, 100);
}

// ---- Phrases ----
const correctPhrases = [
  "Great job!",
  "Well done!",
  "Excellent!",
  "You did it!",
  "Wonderful!",
  "Fantastic!",
];

const encouragePhrases = [
  "Try again.",
  "You can do it.",
  "Almost there.",
  "Take your time.",
];

const levelCompletePhrases = [
  "You finished this level. Great work.",
  "Level complete. Well done.",
];

const stageCompletePhrases = [
  "You finished the whole stage. Amazing work.",
  "Stage complete. You are doing wonderfully.",
];

// Default speech settings — slower, calm, clear
const DEFAULT_RATE = 0.78;   // noticeably slower for cognitive accessibility
const DEFAULT_PITCH = 1.0;   // neutral, not childish

function speak(text: string, opts: { rate?: number; pitch?: number; immediate?: boolean } = {}) {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
  try {
    if (opts.immediate !== false) speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.rate = opts.rate ?? DEFAULT_RATE;
    u.pitch = opts.pitch ?? DEFAULT_PITCH;
    u.volume = 1.0;
    u.lang = 'en-US';
    const v = pickBestVoice();
    if (v) u.voice = v;
    speechSynthesis.speak(u);
  } catch (e) {
    console.warn('Speech error:', e);
  }
}

let unlocked = false;
export function unlockSpeech() {
  if (unlocked) return;
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
  try {
    const u = new SpeechSynthesisUtterance(' ');
    u.volume = 0;
    speechSynthesis.speak(u);
    unlocked = true;
  } catch {}
}

export function speakCorrect() {
  speak(correctPhrases[Math.floor(Math.random() * correctPhrases.length)], { rate: 0.85 });
}
export function speakEncourage() {
  speak(encouragePhrases[Math.floor(Math.random() * encouragePhrases.length)], { rate: 0.8 });
}
export function speakLevelComplete() {
  speak(levelCompletePhrases[Math.floor(Math.random() * levelCompletePhrases.length)], { rate: 0.78 });
}
export function speakStageComplete() {
  speak(stageCompletePhrases[Math.floor(Math.random() * stageCompletePhrases.length)], { rate: 0.78 });
}
export function speakWelcomeBack(name: string) {
  speak(`Welcome back, ${name}. Ready to continue?`, { rate: 0.78 });
}

// ---- Letter pronunciation ----
// Use ONLY the proper letter name (no "this is" suffix that triggered odd cadence).
// Spelling chosen so common TTS engines (Google, Apple, Microsoft) say the
// correct alphabet letter name rather than a word.
const letterPhonetic: Record<string, string> = {
  A: 'ay',     B: 'bee',    C: 'see',    D: 'dee',     E: 'eee',
  F: 'eff',    G: 'jee',    H: 'aitch',  I: 'eye',     J: 'jay',
  K: 'kay',    L: 'ell',    M: 'em',     N: 'en',      O: 'oh',
  P: 'pee',    Q: 'kyoo',   R: 'arr',    S: 'ess',     T: 'tee',
  U: 'yoo',    V: 'vee',    W: 'double yoo', X: 'eks', Y: 'why',
  Z: 'zee',
};

function pronounceLetter(letter: string): string {
  const L = letter.toUpperCase();
  return letterPhonetic[L] || L;
}

export function speakLetter(letter: string) {
  // Speak the letter slowly, with a short calm pause then repeat for clarity.
  const sound = pronounceLetter(letter);
  speak(sound, { rate: 0.7, pitch: 1.0 });
}

export function speakLetterAuto(letter: string) {
  speakLetter(letter);
}
export function speakLetsTry() {
  speak("Let's try together.", { rate: 0.78 });
}
export function speakLevelUnlocked() {
  speak('A new level is ready.', { rate: 0.78 });
}
export function speakExamStart() {
  speak("Let's see what you've learned. You can do this.", { rate: 0.78 });
}
export function speakExamComplete() {
  speak('You passed the test. Amazing.', { rate: 0.78 });
}

export function speakRank(rank: string) {
  speak(`${rank}. ${correctPhrases[Math.floor(Math.random() * correctPhrases.length)]}`, { rate: 0.75, pitch: 1.0 });
}
