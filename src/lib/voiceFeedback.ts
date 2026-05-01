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
function userRate(fallback: number): number {
  if (typeof window === 'undefined') return fallback;
  const v = parseFloat(localStorage.getItem('fk_voice_speed') || '');
  return isNaN(v) ? fallback : v;
}
function userVolume(): number {
  if (typeof window === 'undefined') return 1;
  const v = parseFloat(localStorage.getItem('fk_volume') || '');
  return isNaN(v) ? 1 : v;
}
const DEFAULT_RATE = 0.78;
const DEFAULT_PITCH = 1.0;

function speak(text: string, opts: { rate?: number; pitch?: number; immediate?: boolean } = {}) {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
  try {
    if (opts.immediate !== false) speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.rate = opts.rate ?? userRate(DEFAULT_RATE);
    u.pitch = opts.pitch ?? DEFAULT_PITCH;
    u.volume = userVolume();
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
// Carrier-phrase strategy: "The letter X, as in WORD." prevents TTS engines
// from collapsing isolated letters into wrong words (e.g. A → "eye", E → "I").
// Anchor words use a strong, unambiguous initial sound for each letter.
const letterAnchor: Record<string, string> = {
  A: 'apple',    B: 'ball',     C: 'cat',      D: 'dog',      E: 'egg',
  F: 'fish',     G: 'goat',     H: 'hat',      I: 'igloo',    J: 'jam',
  K: 'kite',     L: 'lion',     M: 'moon',     N: 'nest',     O: 'orange',
  P: 'pig',      Q: 'queen',    R: 'rain',     S: 'sun',      T: 'tree',
  U: 'umbrella', V: 'van',      W: 'water',    X: 'box',      Y: 'yellow',
  Z: 'zebra',
};

export function speakLetter(letter: string) {
  const L = letter.toUpperCase();
  const anchor = letterAnchor[L];
  // Pronounce the actual letter name first (with a comma so the voice pauses
  // and articulates clearly), then anchor it with a familiar word so the
  // listener — and the TTS engine — both lock onto the right sound.
  const phrase = anchor
    ? `The letter ${L}, as in ${anchor}.`
    : `The letter ${L}.`;
  speak(phrase, { rate: 0.72, pitch: 1.0 });
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
