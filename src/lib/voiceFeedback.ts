// Voice feedback using Web Speech API
// Picks the highest-quality natural voice available (prefers Google/neural female voices)

let selectedVoice: SpeechSynthesisVoice | null = null;

function pickBestVoice(): SpeechSynthesisVoice | null {
  if (selectedVoice) return selectedVoice;
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return null;
  const voices = speechSynthesis.getVoices();
  if (!voices.length) return null;

  const en = voices.filter(v => v.lang.toLowerCase().startsWith('en'));

  // Highest priority: Google's natural-sounding voices
  const googleFemale = en.find(v => /Google.*US English/i.test(v.name)) ||
                       en.find(v => /Google.*English/i.test(v.name) && !/Male/i.test(v.name));
  if (googleFemale) { selectedVoice = googleFemale; return googleFemale; }

  // Apple / Microsoft natural voices
  const appleNatural = en.find(v => /(Samantha|Ava|Allison|Karen|Moira|Tessa|Serena|Joanna)/i.test(v.name));
  if (appleNatural) { selectedVoice = appleNatural; return appleNatural; }

  const msNatural = en.find(v => /(Aria|Jenny|Zira|Hazel|Libby|Sonia)/i.test(v.name));
  if (msNatural) { selectedVoice = msNatural; return msNatural; }

  // Fallback: any non-male English voice
  const notMale = en.find(v => !/(Male|David|Daniel|James|Mark|Alex|Fred|George|Tom)/i.test(v.name));
  selectedVoice = notMale || en[0] || voices[0];
  return selectedVoice;
}

if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
  speechSynthesis.onvoiceschanged = () => { selectedVoice = null; pickBestVoice(); };
  setTimeout(() => { speechSynthesis.getVoices(); pickBestVoice(); }, 100);
}

// Natural phrases — short, no stretched letters
const correctPhrases = [
  "Great job!",
  "Well done!",
  "Excellent!",
  "You got it!",
  "Wonderful!",
  "Fantastic!",
  "Amazing!",
  "Perfect!",
];

const encouragePhrases = [
  "Almost! Try again.",
  "You can do it.",
  "Keep trying.",
  "Try one more time.",
  "Nearly there.",
];

const levelCompletePhrases = [
  "Great job! You finished this level.",
  "Amazing work! Level complete.",
  "Wonderful! You did it.",
];

const stageCompletePhrases = [
  "You finished the whole stage. Incredible!",
  "Stage complete! You're a star.",
];

function speak(text: string, opts: { rate?: number; pitch?: number } = {}) {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
  try {
    speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.rate = opts.rate ?? 1.0;        // natural speed
    u.pitch = opts.pitch ?? 1.05;     // slightly warm but not childish
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
  speak(correctPhrases[Math.floor(Math.random() * correctPhrases.length)]);
}
export function speakEncourage() {
  speak(encouragePhrases[Math.floor(Math.random() * encouragePhrases.length)]);
}
export function speakLevelComplete() {
  speak(levelCompletePhrases[Math.floor(Math.random() * levelCompletePhrases.length)], { rate: 0.95 });
}
export function speakStageComplete() {
  speak(stageCompletePhrases[Math.floor(Math.random() * stageCompletePhrases.length)], { rate: 0.95 });
}
export function speakWelcomeBack(name: string) {
  speak(`Welcome back, ${name}. Ready to continue?`);
}

// Letters: speak the actual phonetic name correctly.
// SpeechSynthesis pronounces single uppercase letters as letter names already,
// but we add the sound word for learning context.
const letterSound: Record<string, string> = {
  A: 'ay', B: 'bee', C: 'see', D: 'dee', E: 'ee', F: 'eff', G: 'jee',
  H: 'aitch', I: 'eye', J: 'jay', K: 'kay', L: 'el', M: 'em', N: 'en',
  O: 'oh', P: 'pee', Q: 'cue', R: 'ar', S: 'ess', T: 'tee', U: 'you',
  V: 'vee', W: 'double-you', X: 'ex', Y: 'why', Z: 'zee',
};

export function speakLetter(letter: string) {
  const L = letter.toUpperCase();
  const sound = letterSound[L] || L;
  // Use the letter name twice — natural cadence, no stretched vowels
  speak(`${sound}. This is ${sound}.`, { rate: 0.9 });
}
export function speakLetterAuto(letter: string) {
  speakLetter(letter);
}
export function speakLetsTry() {
  speak("Let's try together.");
}
export function speakLevelUnlocked() {
  speak('A new level is ready!');
}
export function speakExamStart() {
  speak("Let's see how much you've learned. You can do this!", { rate: 0.95 });
}
export function speakExamComplete() {
  speak('You passed the test! Amazing!', { rate: 0.95 });
}

// Rank announcement for stage complete
export function speakRank(rank: string) {
  speak(`${rank}! ${correctPhrases[Math.floor(Math.random() * correctPhrases.length)]}`, { rate: 0.9, pitch: 1.1 });
}
