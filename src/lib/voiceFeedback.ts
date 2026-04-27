// Voice feedback using Web Speech API
// Uses a slow, warm female voice for encouraging feedback
// Android-compatible: creates utterance in gesture context

let selectedVoice: SpeechSynthesisVoice | null = null;
let voicesLoaded = false;

function getFemaleVoice(): SpeechSynthesisVoice | null {
  if (selectedVoice) return selectedVoice;
  const voices = speechSynthesis.getVoices();
  if (voices.length === 0) return null;
  voicesLoaded = true;

  // STRICTLY prefer female voices — never pick male
  const femaleNames = [
    'Samantha', 'Victoria', 'Karen', 'Moira', 'Fiona', 'Tessa',
    'Zira', 'Hazel', 'Susan', 'Linda', 'Catherine', 'Allison',
    'Google US English', 'Microsoft Zira', 'Female',
    'Joana', 'Paulina', 'Monica', 'Amelie', 'Anna',
  ];

  // Explicitly reject male voices
  const maleNames = [
    'Daniel', 'David', 'James', 'Alex', 'Tom', 'Fred', 'Ralph',
    'Albert', 'Bruce', 'Junior', 'Aaron', 'Google UK English Male',
    'Microsoft David', 'Male', 'Mark', 'Richard',
  ];

  const enVoices = voices.filter(v => v.lang.startsWith('en'));

  // First pass: find known female voice
  const knownFemale = enVoices.find(v =>
    femaleNames.some(name => v.name.includes(name))
  );
  if (knownFemale) { selectedVoice = knownFemale; return knownFemale; }

  // Second pass: any English voice that is NOT a known male
  const notMale = enVoices.find(v =>
    !maleNames.some(name => v.name.includes(name))
  );
  if (notMale) { selectedVoice = notMale; return notMale; }

  // Fallback: first English voice or first voice
  selectedVoice = enVoices[0] || voices[0] || null;
  return selectedVoice;
}

// Preload voices
if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
  speechSynthesis.onvoiceschanged = () => { selectedVoice = null; getFemaleVoice(); };
  setTimeout(() => speechSynthesis.getVoices(), 100);
}

// Better letter pronunciation map
const letterPronunciation: Record<string, string> = {
  'A': 'Ayyy',
  'B': 'Bee',
  'C': 'See',
  'D': 'Dee',
  'E': 'Eee',
  'F': 'Eff',
  'G': 'Jee',
  'H': 'Aych',
  'I': 'Eye',
  'J': 'Jay',
  'K': 'Kay',
  'L': 'Ell',
  'M': 'Emm',
  'N': 'Enn',
  'O': 'Ohh',
  'P': 'Pee',
  'Q': 'Cue',
  'R': 'Are',
  'S': 'Ess',
  'T': 'Tee',
  'U': 'You',
  'V': 'Vee',
  'W': 'Double you',
  'X': 'Ex',
  'Y': 'Why',
  'Z': 'Zed',
};

const correctPhrases = [
  "Wooow... well done!",
  "Greaat job!",
  "Keeeep going!",
  "You're amaazing!",
  "Wonderful!",
  "Fantaaastic!",
  "You did it!",
  "I'm so proud of you!",
];

const encouragePhrases = [
  "Hmmm... let's try again",
  "Almooost there!",
  "You can do it!",
  "Keeeep trying!",
  "Let's try one more time",
];

const levelCompletePhrases = [
  "Wooow... greaat job! I'm so proud of you!",
  "Amaazing... you completed this level!",
  "Wonderful work! You're a star!",
];

const stageCompletePhrases = [
  "Wooow... you finished this stage!",
  "Incredible! You completed the whole stage!",
];

const welcomeBackText = (name: string) => `Welcome back... ${name}... ready to continue?`;

// Android fix: Pre-create utterance synchronously, speak immediately
function speak(text: string, rate = 0.65) {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

  try {
    speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = rate;
    utterance.pitch = 1.15;
    utterance.volume = 0.85;
    utterance.lang = 'en-US';

    const voice = getFemaleVoice();
    if (voice) utterance.voice = voice;

    speechSynthesis.speak(utterance);

    // Android workaround: resume periodically
    const resumeInterval = setInterval(() => {
      if (!speechSynthesis.speaking) {
        clearInterval(resumeInterval);
        return;
      }
      speechSynthesis.pause();
      speechSynthesis.resume();
    }, 5000);

    utterance.onend = () => clearInterval(resumeInterval);
    utterance.onerror = () => clearInterval(resumeInterval);
  } catch (e) {
    console.warn('Speech synthesis error:', e);
  }
}

// For auto-play (not from user gesture)
function speakAutoPlay(text: string, rate = 0.65) {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

  try {
    speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = rate;
    utterance.pitch = 1.15;
    utterance.volume = 0.85;
    utterance.lang = 'en-US';

    const voice = getFemaleVoice();
    if (voice) utterance.voice = voice;

    speechSynthesis.speak(utterance);
  } catch (e) {
    console.warn('Auto speech error:', e);
  }
}

// Unlock speech on first user interaction (Android requirement)
let speechUnlocked = false;
export function unlockSpeech() {
  if (speechUnlocked) return;
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

  try {
    const utterance = new SpeechSynthesisUtterance('');
    utterance.volume = 0;
    speechSynthesis.speak(utterance);
    speechUnlocked = true;
  } catch {}
}

export function speakCorrect() {
  const phrase = correctPhrases[Math.floor(Math.random() * correctPhrases.length)];
  speak(phrase, 0.65);
}

export function speakEncourage() {
  const phrase = encouragePhrases[Math.floor(Math.random() * encouragePhrases.length)];
  speak(phrase, 0.65);
}

export function speakLevelComplete() {
  const phrase = levelCompletePhrases[Math.floor(Math.random() * levelCompletePhrases.length)];
  speak(phrase, 0.6);
}

export function speakStageComplete() {
  const phrase = stageCompletePhrases[Math.floor(Math.random() * stageCompletePhrases.length)];
  speak(phrase, 0.6);
}

export function speakWelcomeBack(name: string) {
  speak(welcomeBackText(name), 0.65);
}

export function speakLetter(letter: string) {
  const pronunciation = letterPronunciation[letter.toUpperCase()] || letter;
  const text = `${pronunciation}... this is... ${letter}`;
  speak(text, 0.6);
}

export function speakLetterAuto(letter: string) {
  const pronunciation = letterPronunciation[letter.toUpperCase()] || letter;
  const text = `${pronunciation}... this is... ${letter}`;
  speakAutoPlay(text, 0.6);
}

export function speakLetsTry() {
  speak("Let's try together", 0.65);
}

export function speakLevelUnlocked() {
  speak("Yaaay... a new level is ready!", 0.65);
}

export function speakExamStart() {
  speak("Let's see how much you've learned!... You can do this!", 0.6);
}

export function speakExamComplete() {
  speak("Wooow... you passed the test!... Amazing!", 0.6);
}
