/* =====================================================
   VoiceForge AI — Text-to-Speech Application
   Web Speech API Implementation
   ===================================================== */

'use strict';

// ──────────────────────────────────────────────────────
//  BROWSER COMPATIBILITY CHECK
// ──────────────────────────────────────────────────────

const TTS_SUPPORTED = 'speechSynthesis' in window && 'SpeechSynthesisUtterance' in window;

// ──────────────────────────────────────────────────────
//  DATA CONSTANTS
// ──────────────────────────────────────────────────────

const LANGUAGES = [
  { id: 'english',  label: 'English',  flag: '🇺🇸', langCode: 'en' },
  { id: 'arabic',   label: 'Arabic',   flag: '🇸🇦', langCode: 'ar' },
  { id: 'french',   label: 'French',   flag: '🇫🇷', langCode: 'fr' },
  { id: 'spanish',  label: 'Spanish',  flag: '🇪🇸', langCode: 'es' },
  { id: 'german',   label: 'German',   flag: '🇩🇪', langCode: 'de' },
  { id: 'japanese', label: 'Japanese', flag: '🇯🇵', langCode: 'ja' },
];

const ACCENTS = {
  english: [
    { label: 'American English',      lang: 'en-US' },
    { label: 'British English',       lang: 'en-GB' },
    { label: 'Australian English',    lang: 'en-AU' },
    { label: 'Canadian English',      lang: 'en-CA' },
    { label: 'Irish English',         lang: 'en-IE' },
    { label: 'South African English', lang: 'en-ZA' },
  ],
  arabic: [
    { label: 'Egyptian Arabic',       lang: 'ar-EG' },
    { label: 'Saudi Arabic',          lang: 'ar-SA' },
    { label: 'Emirati Arabic',        lang: 'ar-AE' },
    { label: 'Moroccan Arabic',       lang: 'ar-MA' },
    { label: 'Lebanese Arabic',       lang: 'ar-LB' },
    { label: 'Jordanian Arabic',      lang: 'ar-JO' },
  ],
  french: [
    { label: 'Parisian French',       lang: 'fr-FR' },
    { label: 'Canadian French',       lang: 'fr-CA' },
    { label: 'Belgian French',        lang: 'fr-BE' },
  ],
  spanish: [
    { label: 'Castilian Spanish',     lang: 'es-ES' },
    { label: 'Mexican Spanish',       lang: 'es-MX' },
    { label: 'Argentine Spanish',     lang: 'es-AR' },
  ],
  german: [
    { label: 'Standard German',       lang: 'de-DE' },
    { label: 'Austrian German',       lang: 'de-AT' },
    { label: 'Swiss German',          lang: 'de-CH' },
  ],
  japanese: [
    { label: 'Tokyo Japanese',        lang: 'ja-JP' },
    { label: 'Osaka Japanese',        lang: 'ja-JP' },
    { label: 'Kyoto Japanese',        lang: 'ja-JP' },
  ],
};

const GENDERS = [
  { id: 'male',   label: 'Male',   icon: '♂' },
  { id: 'female', label: 'Female', icon: '♀' },
];

const EMOTIONS = [
  { id: 'happy',        label: 'Happy',        emoji: '😊' },
  { id: 'sad',          label: 'Sad',          emoji: '😢' },
  { id: 'angry',        label: 'Angry',        emoji: '😠' },
  { id: 'excited',      label: 'Excited',      emoji: '🤩' },
  { id: 'romantic',     label: 'Romantic',     emoji: '❤️'  },
  { id: 'calm',         label: 'Calm',         emoji: '😌' },
  { id: 'serious',      label: 'Serious',      emoji: '🎯' },
  { id: 'motivational', label: 'Motivational', emoji: '💪' },
  { id: 'fearful',      label: 'Fearful',      emoji: '😱' },
  { id: 'whispering',   label: 'Whispering',   emoji: '🤫' },
];

// Emotion → speech parameter modifiers
// These are applied ON TOP of the user slider values
const EMOTION_MODIFIERS = {
  happy:        { rateBoost: 0.15,  pitchBoost: 0.25,  volumeBoost: 0.05  },
  sad:          { rateBoost: -0.2,  pitchBoost: -0.25, volumeBoost: -0.1  },
  angry:        { rateBoost: 0.2,   pitchBoost: 0.1,   volumeBoost: 0.1   },
  excited:      { rateBoost: 0.3,   pitchBoost: 0.35,  volumeBoost: 0.1   },
  romantic:     { rateBoost: -0.15, pitchBoost: -0.1,  volumeBoost: -0.05 },
  calm:         { rateBoost: -0.15, pitchBoost: -0.1,  volumeBoost: -0.1  },
  serious:      { rateBoost: -0.05, pitchBoost: -0.15, volumeBoost: 0.0   },
  motivational: { rateBoost: 0.2,   pitchBoost: 0.2,   volumeBoost: 0.1   },
  fearful:      { rateBoost: 0.1,   pitchBoost: 0.3,   volumeBoost: -0.1  },
  whispering:   { rateBoost: -0.25, pitchBoost: -0.2,  volumeBoost: -0.35 },
};

const STYLES = [
  { id: 'podcast',      label: 'Podcast',          icon: '🎙️' },
  { id: 'storytelling', label: 'Storytelling',      icon: '📖' },
  { id: 'news',         label: 'News Reporter',     icon: '📰' },
  { id: 'teacher',      label: 'Teacher',           icon: '🎓' },
  { id: 'anime',        label: 'Anime',             icon: '⚡' },
  { id: 'documentary',  label: 'Documentary',       icon: '🎬' },
  { id: 'friendly',     label: 'Friendly',          icon: '😄' },
  { id: 'professional', label: 'Professional',      icon: '💼' },
  { id: 'gaming',       label: 'Gaming Streamer',   icon: '🎮' },
  { id: 'cinematic',    label: 'Cinematic Trailer', icon: '🎥' },
];

// Speaking style → rate/pitch hints
const STYLE_MODIFIERS = {
  podcast:      { rateBoost: 0.0,   pitchBoost: 0.0   },
  storytelling: { rateBoost: -0.1,  pitchBoost: 0.05  },
  news:         { rateBoost: 0.05,  pitchBoost: -0.05 },
  teacher:      { rateBoost: -0.05, pitchBoost: 0.0   },
  anime:        { rateBoost: 0.1,   pitchBoost: 0.3   },
  documentary:  { rateBoost: -0.1,  pitchBoost: -0.1  },
  friendly:     { rateBoost: 0.05,  pitchBoost: 0.1   },
  professional: { rateBoost: 0.0,   pitchBoost: -0.1  },
  gaming:       { rateBoost: 0.2,   pitchBoost: 0.2   },
  cinematic:    { rateBoost: -0.15, pitchBoost: -0.15 },
};

const SLIDERS = [
  { id: 'speed',      label: 'Speed',      min: 0,   max: 100, default: 50,  unit: '%' },
  { id: 'pitch',      label: 'Pitch',      min: 0,   max: 100, default: 50,  unit: '%' },
  { id: 'volume',     label: 'Volume',     min: 0,   max: 100, default: 80,  unit: '%' },
  { id: 'stability',  label: 'Stability',  min: 0,   max: 100, default: 75,  unit: '%' },
  { id: 'creativity', label: 'Creativity', min: 0,   max: 100, default: 60,  unit: '%' },
];

const PRESETS = [
  {
    id: 'podcast_host',
    name: 'Podcast Host',
    emoji: '🎙️',
    desc: 'Warm, engaging conversational voice for long-form audio content.',
    language: 'english', accent: 'en-US', gender: 'male',
    emotion: 'calm', style: 'podcast',
    sliders: { speed: 55, pitch: 48, volume: 85, stability: 80, creativity: 50 },
    tags: ['English', 'Male', 'Calm'],
  },
  {
    id: 'motivational_speaker',
    name: 'Motivational Speaker',
    emoji: '💪',
    desc: 'High-energy, powerful voice that inspires and drives action.',
    language: 'english', accent: 'en-US', gender: 'male',
    emotion: 'motivational', style: 'professional',
    sliders: { speed: 65, pitch: 60, volume: 95, stability: 70, creativity: 65 },
    tags: ['English', 'Male', 'Energetic'],
  },
  {
    id: 'horror_narrator',
    name: 'Horror Narrator',
    emoji: '👻',
    desc: 'Dark, suspenseful voice for horror stories and thrillers.',
    language: 'english', accent: 'en-GB', gender: 'male',
    emotion: 'fearful', style: 'storytelling',
    sliders: { speed: 38, pitch: 30, volume: 75, stability: 85, creativity: 70 },
    tags: ['British', 'Dark', 'Dramatic'],
  },
  {
    id: 'kids_storyteller',
    name: 'Kids Storyteller',
    emoji: '🧸',
    desc: "Playful, warm voice perfect for children's audiobooks.",
    language: 'english', accent: 'en-US', gender: 'female',
    emotion: 'happy', style: 'storytelling',
    sliders: { speed: 48, pitch: 70, volume: 80, stability: 90, creativity: 55 },
    tags: ['English', 'Female', 'Playful'],
  },
  {
    id: 'ai_assistant',
    name: 'AI Assistant',
    emoji: '🤖',
    desc: 'Clear, neutral, and precise voice for virtual assistants.',
    language: 'english', accent: 'en-US', gender: 'female',
    emotion: 'calm', style: 'professional',
    sliders: { speed: 58, pitch: 52, volume: 80, stability: 95, creativity: 30 },
    tags: ['English', 'Neutral', 'Clear'],
  },
  {
    id: 'luxury_ad',
    name: 'Luxury Advertisement',
    emoji: '💎',
    desc: 'Smooth, sophisticated voice for premium brand advertising.',
    language: 'english', accent: 'en-GB', gender: 'female',
    emotion: 'calm', style: 'cinematic',
    sliders: { speed: 42, pitch: 45, volume: 78, stability: 88, creativity: 62 },
    tags: ['British', 'Female', 'Elegant'],
  },
  {
    id: 'arabic_storyteller',
    name: 'Arabic Storyteller',
    emoji: '🌙',
    desc: 'Evocative Arabic voice for traditional storytelling.',
    language: 'arabic', accent: 'ar-SA', gender: 'male',
    emotion: 'romantic', style: 'storytelling',
    sliders: { speed: 45, pitch: 46, volume: 82, stability: 78, creativity: 68 },
    tags: ['Arabic', 'Male', 'Poetic'],
  },
  {
    id: 'gaming_streamer',
    name: 'Gaming Streamer',
    emoji: '🎮',
    desc: 'High-energy, entertaining voice for gaming content.',
    language: 'english', accent: 'en-US', gender: 'male',
    emotion: 'excited', style: 'gaming',
    sliders: { speed: 70, pitch: 58, volume: 90, stability: 60, creativity: 80 },
    tags: ['English', 'Male', 'Hype'],
  },
];

const EXAMPLE_TEXTS = [
  "Welcome to VoiceForge AI — the most advanced voice synthesis platform on the planet. Transform any text into a lifelike, emotional voice in seconds.",
  "In a world where technology meets humanity, every word carries the power to inspire, to move, to change lives forever.",
  "مرحباً بكم في عالم الذكاء الاصطناعي، حيث تتحول الكلمات إلى أصوات حية تنبض بالمشاعر والحياة.",
  "Bienvenue dans le futur de la synthèse vocale. Notre technologie révolutionnaire transforme vos mots en voix naturelles et expressives.",
  "In the beginning, there was silence. And then, a voice broke through the darkness — warm, powerful, undeniably human.",
];

// ──────────────────────────────────────────────────────
//  APPLICATION STATE
// ──────────────────────────────────────────────────────

const state = {
  // Voice config
  language:   'english',
  accent:     'en-US',
  accentLabel:'American English',
  gender:     'male',
  emotion:    'calm',
  style:      'podcast',
  sliders:    { speed: 50, pitch: 50, volume: 80, stability: 75, creativity: 60 },

  // TTS state
  isPlaying:    false,
  isPaused:     false,
  isGenerating: false,
  isSpeaking:   false,

  // Available browser voices
  availableVoices: [],
  selectedVoice:   null,

  // History & preferences
  history:   [],
  favorites: [],
  theme:     'dark',

  // Waveform animation
  waveAnimId: null,
  wavePhase:  0,

  // Progress tracking
  progressTimer: null,
  speakStart:    0,
  estimatedDuration: 0,
};

// ──────────────────────────────────────────────────────
//  DOM HELPERS
// ──────────────────────────────────────────────────────

const $  = id  => document.getElementById(id);
const $$ = sel => document.querySelectorAll(sel);

function createElement(tag, classes = '', attrs = {}, html = '') {
  const el = document.createElement(tag);
  if (classes) el.className = classes;
  Object.entries(attrs).forEach(([k, v]) => el.setAttribute(k, v));
  if (html) el.innerHTML = html;
  return el;
}

function escapeHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// ──────────────────────────────────────────────────────
//  PARTICLE BACKGROUND
// ──────────────────────────────────────────────────────

function initParticles() {
  const canvas = $('particleCanvas');
  const ctx    = canvas.getContext('2d');
  let   particles = [];

  function resize() {
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
  }

  class Particle {
    constructor() { this.reset(); }
    reset() {
      this.x     = Math.random() * canvas.width;
      this.y     = Math.random() * canvas.height;
      this.vx    = (Math.random() - 0.5) * 0.3;
      this.vy    = (Math.random() - 0.5) * 0.3;
      this.r     = Math.random() * 2 + 0.5;
      this.alpha = Math.random() * 0.5 + 0.1;
      this.color = Math.random() > 0.5 ? '124,58,237' : '6,182,212';
    }
    update() {
      this.x += this.vx;
      this.y += this.vy;
      if (this.x < 0 || this.x > canvas.width || this.y < 0 || this.y > canvas.height) {
        this.reset();
      }
    }
    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${this.color},${this.alpha})`;
      ctx.fill();
    }
  }

  function initP() {
    particles = Array.from({ length: 80 }, () => new Particle());
  }

  function drawConnections() {
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx   = particles[i].x - particles[j].x;
        const dy   = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 120) {
          ctx.beginPath();
          ctx.strokeStyle = `rgba(124,58,237,${0.06 * (1 - dist / 120)})`;
          ctx.lineWidth = 0.5;
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.stroke();
        }
      }
    }
  }

  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach(p => { p.update(); p.draw(); });
    drawConnections();
    requestAnimationFrame(animate);
  }

  resize();
  initP();
  animate();
  window.addEventListener('resize', () => { resize(); initP(); });
}

// ──────────────────────────────────────────────────────
//  TYPING EFFECT
// ──────────────────────────────────────────────────────

function initTypingEffect() {
  const target  = document.querySelector('.typing-target');
  const phrases = [
    'Lifelike Voices',
    'Natural Speech',
    'Any Language',
    'Any Accent',
    'Human Narration',
  ];
  let phraseIdx = 0;
  let charIdx   = 0;
  let deleting  = false;

  const cursor = createElement('span', 'typing-cursor');
  target.after(cursor);

  function tick() {
    const phrase = phrases[phraseIdx];
    if (deleting) {
      charIdx--;
      target.textContent = phrase.substring(0, charIdx);
      if (charIdx === 0) {
        deleting  = false;
        phraseIdx = (phraseIdx + 1) % phrases.length;
        setTimeout(tick, 400);
        return;
      }
      setTimeout(tick, 50);
    } else {
      charIdx++;
      target.textContent = phrase.substring(0, charIdx);
      if (charIdx === phrase.length) {
        deleting = true;
        setTimeout(tick, 2200);
        return;
      }
      setTimeout(tick, 80);
    }
  }
  setTimeout(tick, 800);
}

// ──────────────────────────────────────────────────────
//  THEME
// ──────────────────────────────────────────────────────

function initTheme() {
  const saved  = localStorage.getItem('vf_theme') || 'dark';
  const toggle = $('themeToggle');
  state.theme  = saved;
  document.documentElement.setAttribute('data-theme', saved);
  toggle.checked = saved === 'light';

  toggle.addEventListener('change', () => {
    const theme = toggle.checked ? 'light' : 'dark';
    state.theme = theme;
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('vf_theme', theme);
    showToast(theme === 'light' ? '☀️ Light mode activated' : '🌙 Dark mode activated', 'info');
  });
}

// ──────────────────────────────────────────────────────
//  TOAST NOTIFICATIONS
// ──────────────────────────────────────────────────────

function showToast(message, type = 'info', duration = 3000) {
  const container = $('toastContainer');
  const icons     = { success: '✅', error: '❌', info: 'ℹ️', warning: '⚠️' };
  const toast     = createElement('div', `toast toast-${type}`);
  toast.innerHTML = `<span class="toast-icon">${icons[type] || icons.info}</span><span>${message}</span>`;
  container.appendChild(toast);
  setTimeout(() => {
    toast.classList.add('toast-out');
    setTimeout(() => toast.remove(), 350);
  }, duration);
}

// ──────────────────────────────────────────────────────
//  WEB SPEECH API — VOICE LOADER
// ──────────────────────────────────────────────────────

function loadVoices() {
  return new Promise(resolve => {
    const voices = speechSynthesis.getVoices();
    if (voices.length > 0) {
      state.availableVoices = voices;
      resolve(voices);
      return;
    }
    // Chrome loads voices asynchronously
    speechSynthesis.addEventListener('voiceschanged', () => {
      state.availableVoices = speechSynthesis.getVoices();
      resolve(state.availableVoices);
    }, { once: true });
  });
}

/**
 * Find the best matching voice for current state settings.
 * Priority: exact lang-region > lang prefix > gender keyword > first available
 */
function findBestVoice(langCode, gender) {
  const voices = state.availableVoices;
  if (!voices.length) return null;

  // Normalise gender hints — browsers use 'Male'/'Female' in voice names
  const genderHint = gender === 'male' ? 'male' : 'female';

  // 1. Exact locale match + gender name hint
  let match = voices.find(v =>
    v.lang.toLowerCase() === langCode.toLowerCase() &&
    v.name.toLowerCase().includes(genderHint)
  );
  if (match) return match;

  // 2. Exact locale match (ignore gender)
  match = voices.find(v => v.lang.toLowerCase() === langCode.toLowerCase());
  if (match) return match;

  // 3. Language prefix match (e.g. 'en' from 'en-US') + gender
  const prefix = langCode.split('-')[0].toLowerCase();
  match = voices.find(v =>
    v.lang.toLowerCase().startsWith(prefix) &&
    v.name.toLowerCase().includes(genderHint)
  );
  if (match) return match;

  // 4. Language prefix match only
  match = voices.find(v => v.lang.toLowerCase().startsWith(prefix));
  if (match) return match;

  // 5. Fallback: first voice
  return voices[0];
}

// ──────────────────────────────────────────────────────
//  SPEECH PARAMETER CALCULATOR
// ──────────────────────────────────────────────────────

/**
 * Convert 0-100 slider values → Web Speech API ranges
 *   rate:   0.1 – 3.0  (normal = 1.0)
 *   pitch:  0.0 – 2.0  (normal = 1.0)
 *   volume: 0.0 – 1.0  (normal = 1.0)
 */
function calcSpeechParams() {
  const { speed, pitch, volume } = state.sliders;

  // Map speed 0-100 → rate 0.4-2.2
  let rate   = 0.4 + (speed / 100) * 1.8;
  // Map pitch 0-100 → pitch 0.4-2.0
  let pitchV = 0.4 + (pitch / 100) * 1.6;
  // Map volume 0-100 → volume 0.0-1.0
  let vol    = volume / 100;

  // Apply emotion modifiers
  const eMod = EMOTION_MODIFIERS[state.emotion] || {};
  rate   = clamp(rate   + (eMod.rateBoost   || 0), 0.1, 3.0);
  pitchV = clamp(pitchV + (eMod.pitchBoost  || 0), 0.0, 2.0);
  vol    = clamp(vol    + (eMod.volumeBoost || 0), 0.0, 1.0);

  // Apply style modifiers
  const sMod = STYLE_MODIFIERS[state.style] || {};
  rate   = clamp(rate   + (sMod.rateBoost  || 0), 0.1, 3.0);
  pitchV = clamp(pitchV + (sMod.pitchBoost || 0), 0.0, 2.0);

  return { rate, pitch: pitchV, volume: vol };
}

function clamp(val, min, max) {
  return Math.min(max, Math.max(min, val));
}

// ──────────────────────────────────────────────────────
//  TTS ENGINE
// ──────────────────────────────────────────────────────

const TTS = {

  utterance: null,

  /**
   * Speak the given text with current settings.
   * Calls onStart, onEnd, onError callbacks.
   */
  speak(text, { onStart, onEnd, onError, onPause, onResume } = {}) {
    if (!TTS_SUPPORTED) {
      showToast('❌ Speech Synthesis not supported in this browser. Try Chrome or Edge.', 'error', 5000);
      return;
    }

    // Cancel any ongoing speech
    this.stop();

    const params  = calcSpeechParams();
    const voice   = findBestVoice(state.accent, state.gender);
    const utterance = new SpeechSynthesisUtterance(text);

    utterance.rate   = params.rate;
    utterance.pitch  = params.pitch;
    utterance.volume = params.volume;
    if (voice) utterance.voice = voice;

    // Always set lang for proper phoneme rendering
    utterance.lang = state.accent || 'en-US';

    utterance.onstart = () => {
      state.isPlaying  = true;
      state.isPaused   = false;
      state.isSpeaking = true;
      if (onStart) onStart();
    };

    utterance.onend = () => {
      state.isPlaying  = false;
      state.isPaused   = false;
      state.isSpeaking = false;
      if (onEnd) onEnd();
    };

    utterance.onerror = e => {
      // 'interrupted' fires when we cancel deliberately — ignore
      if (e.error === 'interrupted' || e.error === 'canceled') return;
      state.isPlaying  = false;
      state.isPaused   = false;
      state.isSpeaking = false;
      if (onError) onError(e);
    };

    utterance.onpause  = () => { state.isPaused = true;  if (onPause)  onPause();  };
    utterance.onresume = () => { state.isPaused = false; if (onResume) onResume(); };

    this.utterance = utterance;
    speechSynthesis.speak(utterance);
  },

  pause() {
    if (TTS_SUPPORTED && state.isPlaying && !state.isPaused) {
      speechSynthesis.pause();
    }
  },

  resume() {
    if (TTS_SUPPORTED && state.isPaused) {
      speechSynthesis.resume();
    }
  },

  stop() {
    if (TTS_SUPPORTED) {
      speechSynthesis.cancel();
      state.isPlaying  = false;
      state.isPaused   = false;
      state.isSpeaking = false;
    }
  },

  isBusy() {
    return speechSynthesis.speaking || speechSynthesis.pending;
  },
};

// ──────────────────────────────────────────────────────
//  LANGUAGE GRID
// ──────────────────────────────────────────────────────

function renderLanguages() {
  const grid = $('languageGrid');
  grid.innerHTML = '';

  LANGUAGES.forEach(lang => {
    const chip = createElement(
      'button',
      `select-chip${state.language === lang.id ? ' selected' : ''}`,
      { type: 'button', role: 'radio', 'aria-checked': state.language === lang.id ? 'true' : 'false' },
      `<span>${lang.flag} ${lang.label}</span>`
    );
    chip.addEventListener('click', () => {
      state.language = lang.id;
      // Default to first accent of this language
      const firstAccent = ACCENTS[lang.id]?.[0];
      state.accent      = firstAccent?.lang  || lang.langCode;
      state.accentLabel = firstAccent?.label || lang.label;
      renderLanguages();
      renderAccents();
      updatePrompt();
    });
    grid.appendChild(chip);
  });
}

// ──────────────────────────────────────────────────────
//  ACCENTS
// ──────────────────────────────────────────────────────

function renderAccents() {
  const sel     = $('accentSelect');
  const options = ACCENTS[state.language] || [];
  sel.innerHTML = '<option value="">— Choose accent —</option>';

  options.forEach(acc => {
    const opt = createElement('option', '', { value: acc.lang }, acc.label);
    if (acc.lang === state.accent) opt.selected = true;
    sel.appendChild(opt);
  });

  sel.onchange = () => {
    const found = options.find(a => a.lang === sel.value);
    state.accent      = sel.value;
    state.accentLabel = found?.label || sel.value;
    updatePrompt();
  };
}

// ──────────────────────────────────────────────────────
//  GENDER
// ──────────────────────────────────────────────────────

function renderGenders() {
  const grid = $('genderGrid');
  grid.innerHTML = '';

  GENDERS.forEach(g => {
    const btn = createElement(
      'button',
      `gender-btn${state.gender === g.id ? ' selected' : ''}`,
      { type: 'button', role: 'radio', 'aria-checked': state.gender === g.id ? 'true' : 'false' },
      `<span>${g.icon}</span><span>${g.label}</span>`
    );
    btn.addEventListener('click', () => {
      state.gender = g.id;
      renderGenders();
      updatePrompt();
    });
    grid.appendChild(btn);
  });
}

// ──────────────────────────────────────────────────────
//  EMOTIONS
// ──────────────────────────────────────────────────────

function renderEmotions() {
  const grid = $('emotionGrid');
  grid.innerHTML = '';

  EMOTIONS.forEach(e => {
    const btn = createElement(
      'button',
      `emotion-btn${state.emotion === e.id ? ' selected' : ''}`,
      { type: 'button', role: 'radio', 'aria-checked': state.emotion === e.id ? 'true' : 'false' },
      `<span>${e.emoji}</span><span>${e.label}</span>`
    );
    btn.addEventListener('click', () => {
      state.emotion = e.id;
      renderEmotions();
      updatePrompt();
    });
    grid.appendChild(btn);
  });
}

// ──────────────────────────────────────────────────────
//  STYLES
// ──────────────────────────────────────────────────────

function renderStyles() {
  const grid = $('styleGrid');
  grid.innerHTML = '';

  STYLES.forEach(s => {
    const btn = createElement(
      'button',
      `style-btn${state.style === s.id ? ' selected' : ''}`,
      { type: 'button', role: 'radio', 'aria-checked': state.style === s.id ? 'true' : 'false' },
      `<span>${s.icon}</span><span>${s.label}</span>`
    );
    btn.addEventListener('click', () => {
      state.style = s.id;
      renderStyles();
      updatePrompt();
    });
    grid.appendChild(btn);
  });
}

// ──────────────────────────────────────────────────────
//  SLIDERS
// ──────────────────────────────────────────────────────

function renderSliders() {
  const container = $('slidersGrid');
  container.innerHTML = '';

  SLIDERS.forEach(cfg => {
    const val = state.sliders[cfg.id];
    const pct = ((val - cfg.min) / (cfg.max - cfg.min)) * 100;

    const item = createElement('div', 'slider-item');
    item.innerHTML = `
      <div class="slider-header">
        <span class="slider-label">${cfg.label}</span>
        <span class="slider-value" id="sliderVal_${cfg.id}">${val}${cfg.unit}</span>
      </div>
      <div class="slider-track" id="sliderTrack_${cfg.id}" role="slider"
           aria-label="${cfg.label}" aria-valuenow="${val}"
           aria-valuemin="${cfg.min}" aria-valuemax="${cfg.max}" tabindex="0">
        <div class="slider-fill"  id="sliderFill_${cfg.id}"  style="width:${pct}%"></div>
        <div class="slider-thumb-el" id="sliderThumb_${cfg.id}" style="left:${pct}%"></div>
      </div>
    `;
    container.appendChild(item);
    setTimeout(() => attachSlider(cfg), 0);
  });
}

function attachSlider(cfg) {
  const track = $(`sliderTrack_${cfg.id}`);
  const fill  = $(`sliderFill_${cfg.id}`);
  const thumb = $(`sliderThumb_${cfg.id}`);
  const label = $(`sliderVal_${cfg.id}`);
  if (!track) return;

  let dragging = false;

  function setFromX(clientX) {
    const rect = track.getBoundingClientRect();
    const pct  = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    const val  = Math.round(cfg.min + pct * (cfg.max - cfg.min));
    state.sliders[cfg.id] = val;
    const dp = pct * 100;
    fill.style.width  = `${dp}%`;
    thumb.style.left  = `${dp}%`;
    label.textContent = `${val}${cfg.unit}`;
    track.setAttribute('aria-valuenow', val);
    updatePrompt();
  }

  track.addEventListener('mousedown',  e => { dragging = true; setFromX(e.clientX); });
  track.addEventListener('touchstart', e => { dragging = true; setFromX(e.touches[0].clientX); }, { passive: true });

  document.addEventListener('mousemove',  e => { if (dragging) setFromX(e.clientX); });
  document.addEventListener('touchmove',  e => { if (dragging) setFromX(e.touches[0].clientX); }, { passive: true });
  document.addEventListener('mouseup',    () => { dragging = false; });
  document.addEventListener('touchend',   () => { dragging = false; });

  track.addEventListener('keydown', e => {
    let val = state.sliders[cfg.id];
    if (e.key === 'ArrowRight' || e.key === 'ArrowUp')  val = Math.min(cfg.max, val + 1);
    if (e.key === 'ArrowLeft'  || e.key === 'ArrowDown') val = Math.max(cfg.min, val - 1);
    state.sliders[cfg.id] = val;
    const pct = ((val - cfg.min) / (cfg.max - cfg.min)) * 100;
    fill.style.width  = `${pct}%`;
    thumb.style.left  = `${pct}%`;
    label.textContent = `${val}${cfg.unit}`;
    updatePrompt();
  });
}

function updateSliderUI(id, val) {
  const cfg = SLIDERS.find(s => s.id === id);
  if (!cfg) return;
  const fill  = $(`sliderFill_${id}`);
  const thumb = $(`sliderThumb_${id}`);
  const label = $(`sliderVal_${id}`);
  if (!fill) return;
  const pct = ((val - cfg.min) / (cfg.max - cfg.min)) * 100;
  fill.style.width  = `${pct}%`;
  thumb.style.left  = `${pct}%`;
  label.textContent = `${val}${cfg.unit}`;
}

// ──────────────────────────────────────────────────────
//  AI PROMPT BUILDER
// ──────────────────────────────────────────────────────

function updatePrompt() {
  const lang      = LANGUAGES.find(l => l.id === state.language)?.label || state.language;
  const emotion   = EMOTIONS.find(e => e.id === state.emotion)?.label   || state.emotion;
  const style     = STYLES.find(s => s.id === state.style)?.label       || state.style;
  const gender    = state.gender;
  const accent    = state.accentLabel || state.accent || lang;
  const params    = calcSpeechParams();
  const speedDesc = params.rate < 0.8  ? 'slowly'
                  : params.rate > 1.4  ? 'quickly'
                  : 'at a natural pace';
  const pitchDesc = params.pitch < 0.7 ? 'with a deep tone'
                  : params.pitch > 1.4 ? 'with a high tone'
                  : '';
  const volDesc   = params.volume < 0.4 ? 'softly (near-whisper)'
                  : params.volume > 0.9 ? 'at full volume'
                  : '';

  const parts = [
    `Generate a ${emotion.toLowerCase()} ${accent} ${gender} voice`,
    `speaking ${speedDesc}`,
    pitchDesc ? pitchDesc : null,
    volDesc   ? volDesc   : null,
    `using a ${style.toLowerCase()} style`,
    `(rate: ${params.rate.toFixed(2)}, pitch: ${params.pitch.toFixed(2)}, vol: ${params.volume.toFixed(2)})`,
  ].filter(Boolean);

  $('promptText').textContent = parts.join(', ') + '.';

  const tags = [lang, accent, gender, emotion, style,
    `Rate:${params.rate.toFixed(1)}`,
    `Pitch:${params.pitch.toFixed(1)}`,
  ];
  $('promptTags').innerHTML = tags.map(t => `<span class="prompt-tag">${t}</span>`).join('');
}

// ──────────────────────────────────────────────────────
//  TEXT INPUT
// ──────────────────────────────────────────────────────

function initTextInput() {
  const ta     = $('voiceText');
  const count  = $('charCount');
  const words  = $('wordCount');
  const prog   = $('charProgress');
  const maxLen = 5000;

  function update() {
    const len = ta.value.length;
    const wc  = ta.value.trim() ? ta.value.trim().split(/\s+/).length : 0;
    count.textContent = len;
    words.textContent = wc;
    prog.style.width  = `${(len / maxLen) * 100}%`;
    prog.style.background = len > 4000
      ? 'linear-gradient(90deg, #ef4444, #f97316)'
      : 'var(--gradient-primary)';
    ta.style.height = 'auto';
    ta.style.height = Math.min(ta.scrollHeight, 360) + 'px';
  }

  ta.addEventListener('input', update);
  ta.addEventListener('paste', () => setTimeout(update, 10));

  $('clearTextBtn').addEventListener('click', () => {
    TTS.stop();
    resetPlayerUI();
    ta.value = '';
    update();
    showToast('✨ Text cleared', 'info', 2000);
  });

  $('pasteExampleBtn').addEventListener('click', () => {
    const example = EXAMPLE_TEXTS[Math.floor(Math.random() * EXAMPLE_TEXTS.length)];
    ta.value = example;
    update();
    showToast('📝 Example text loaded', 'success', 2000);
  });

  initDragDrop(ta);
}

function initDragDrop(textarea) {
  const wrap = textarea.closest('.textarea-wrap');
  const zone = createElement('div', 'drag-drop-zone', {},
    `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="24" height="24">
       <polyline points="16 16 12 12 8 16"/><line x1="12" y1="12" x2="12" y2="21"/>
       <path d="M20.39 18.39A5 5 0 0018 9h-1.26A8 8 0 103 16.3"/>
     </svg>
     <div>Drop a .txt file here to load text</div>`
  );
  wrap.appendChild(zone);

  zone.addEventListener('dragover',  e => { e.preventDefault(); zone.classList.add('drag-over'); });
  zone.addEventListener('dragleave', () => zone.classList.remove('drag-over'));
  zone.addEventListener('drop', e => {
    e.preventDefault();
    zone.classList.remove('drag-over');
    const file = e.dataTransfer.files[0];
    if (!file) return;
    if (file.type === 'text/plain' || file.name.endsWith('.txt')) {
      const reader = new FileReader();
      reader.onload = ev => {
        textarea.value = ev.target.result.substring(0, 5000);
        textarea.dispatchEvent(new Event('input'));
        showToast('📄 Text file imported!', 'success');
      };
      reader.readAsText(file);
    } else {
      showToast('⚠️ Please drop a plain .txt file.', 'warning');
    }
  });
}

// ──────────────────────────────────────────────────────
//  WAVEFORM CANVAS  (visual only — synced to speech state)
// ──────────────────────────────────────────────────────

function drawStaticWaveform() {
  const canvas = $('waveformCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  canvas.width = canvas.offsetWidth;

  const bars = 80;
  const w    = canvas.width / bars;
  const h    = canvas.height;

  // Deterministic seed so it looks consistent
  ctx.clearRect(0, 0, canvas.width, h);
  for (let i = 0; i < bars; i++) {
    const amp  = 0.15 + Math.abs(Math.sin(i * 0.4)) * 0.6;
    const barH = amp * h * 0.82;
    const x    = i * w + w * 0.2;
    const y    = (h - barH) / 2;
    const alpha = 0.2 + amp * 0.35;

    const grad = ctx.createLinearGradient(0, y, 0, y + barH);
    grad.addColorStop(0, `rgba(124,58,237,${alpha})`);
    grad.addColorStop(1, `rgba(6,182,212,${alpha * 0.6})`);
    ctx.fillStyle = grad;
    ctx.beginPath();
    if (ctx.roundRect) ctx.roundRect(x, y, w * 0.6, barH, 3);
    else ctx.rect(x, y, w * 0.6, barH);
    ctx.fill();
  }
}

function startWaveformAnimation() {
  const canvas = $('waveformCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  cancelAnimationFrame(state.waveAnimId);

  function draw() {
    canvas.width = canvas.offsetWidth;
    const bars = 80;
    const w    = canvas.width / bars;
    const h    = canvas.height;
    state.wavePhase += 0.05;
    ctx.clearRect(0, 0, canvas.width, h);

    for (let i = 0; i < bars; i++) {
      const amp  = 0.25 + Math.sin(state.wavePhase * 2 + i * 0.3) * 0.22
                        + Math.sin(state.wavePhase     + i * 0.15) * 0.18;
      const barH = Math.max(4, amp * h * 0.85);
      const x    = i * w + w * 0.2;
      const y    = (h - barH) / 2;

      const grad = ctx.createLinearGradient(0, y, 0, y + barH);
      grad.addColorStop(0, 'rgba(124,58,237,0.95)');
      grad.addColorStop(1, 'rgba(6,182,212,0.55)');
      ctx.fillStyle = grad;
      ctx.beginPath();
      if (ctx.roundRect) ctx.roundRect(x, y, w * 0.6, barH, 3);
      else ctx.rect(x, y, w * 0.6, barH);
      ctx.fill();
    }
    state.waveAnimId = requestAnimationFrame(draw);
  }
  draw();
}

function stopWaveformAnimation() {
  cancelAnimationFrame(state.waveAnimId);
  drawStaticWaveform();
}

// ──────────────────────────────────────────────────────
//  PROGRESS SIMULATION
//  (SpeechSynthesis doesn't expose real playback position,
//   so we estimate duration from char count + rate)
// ──────────────────────────────────────────────────────

function estimateDuration(text, rate) {
  // Average speaking rate ~150 words/min at rate=1.0
  const wordCount = text.trim().split(/\s+/).length;
  const minutes   = wordCount / (150 * rate);
  return Math.max(1, minutes * 60); // seconds
}

function startProgressTimer(durationSec) {
  clearInterval(state.progressTimer);
  state.speakStart = Date.now();
  state.estimatedDuration = durationSec * 1000;

  state.progressTimer = setInterval(() => {
    if (!state.isPlaying || state.isPaused) return;
    const elapsed = Date.now() - state.speakStart;
    const pct     = Math.min(100, (elapsed / state.estimatedDuration) * 100);
    updateSeekUI(pct);
    updateTimeUI(elapsed / 1000, durationSec);
  }, 200);
}

function stopProgressTimer() {
  clearInterval(state.progressTimer);
}

function updateSeekUI(pct) {
  const seekProg  = $('seekProgress');
  const seekThumb = $('seekThumb');
  const wfOverlay = $('waveformOverlay');
  if (!seekProg) return;
  seekProg.style.width = `${pct}%`;
  seekThumb.style.left = `${pct}%`;
  if (wfOverlay) wfOverlay.style.setProperty('--progress', `${pct}%`);
}

function updateTimeUI(currentSec, totalSec) {
  const curr = $('currentTime');
  const tot  = $('totalTime');
  if (curr) curr.textContent = formatTime(currentSec);
  if (tot)  tot.textContent  = formatTime(totalSec);
}

function formatTime(sec) {
  const s = Math.floor(sec);
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
}

function resetPlayerUI() {
  updateSeekUI(0);
  updateTimeUI(0, 0);
  setPlayIcon(false);
}

function setPlayIcon(playing) {
  const playIcon  = $('playIcon');
  const pauseIcon = $('pauseIcon');
  if (!playIcon) return;
  playIcon.style.display  = playing ? 'none' : '';
  pauseIcon.style.display = playing ? ''     : 'none';
}

// ──────────────────────────────────────────────────────
//  PLAYER PANEL  — Play / Pause / Resume / Stop controls
// ──────────────────────────────────────────────────────

function initPlayerControls() {
  const playBtn = $('playPauseBtn');
  const replayB = $('replayBtn');
  const downBtn = $('downloadBtn');

  if (!playBtn) return;

  // Play / Pause / Resume
  playBtn.addEventListener('click', () => {
    if (!state.audioReady) {
      showToast('⚠️ Generate a voice first!', 'warning');
      return;
    }

    if (state.isPlaying && !state.isPaused) {
      // Currently speaking → pause
      TTS.pause();
      setPlayIcon(false);
      stopWaveformAnimation();
      drawStaticWaveform();
      stopProgressTimer();
      showToast('⏸ Paused', 'info', 1500);
    } else if (state.isPaused) {
      // Paused → resume
      TTS.resume();
      setPlayIcon(true);
      startWaveformAnimation();
      // Adjust timer start to account for paused gap
      const elapsed = (state.estimatedDuration * ($('seekProgress')
        ? parseFloat($('seekProgress').style.width) / 100 : 0));
      state.speakStart = Date.now() - elapsed;
      startProgressTimer(state.estimatedDuration / 1000);
      showToast('▶ Resumed', 'info', 1500);
    } else {
      // Idle → start speaking the last text
      speakCurrentText();
    }
  });

  // Replay (re-read from beginning)
  replayB.addEventListener('click', () => {
    if (!state.audioReady) return;
    TTS.stop();
    updateSeekUI(0);
    setTimeout(() => speakCurrentText(), 150);
  });

  // Download — offer text as file (audio recording not possible via Web Speech API)
  downBtn.addEventListener('click', () => {
    const text = $('voiceText').value.trim();
    if (!text) { showToast('No text to export.', 'warning'); return; }
    const blob = new Blob([text], { type: 'text/plain' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href     = url;
    a.download = 'voiceforge-script.txt';
    a.click();
    URL.revokeObjectURL(url);
    showToast('📄 Script downloaded as .txt', 'success');
  });

  // Seek bar click — jump to position (restarts speech from given point via re-synthesis)
  const seekBar = $('seekBar');
  if (seekBar) {
    seekBar.addEventListener('click', e => {
      if (!state.audioReady) return;
      const rect = seekBar.getBoundingClientRect();
      const pct  = (e.clientX - rect.left) / rect.width;
      const text = $('voiceText').value.trim();
      if (!text) return;
      // Seek by skipping proportional characters then speaking remainder
      const startChar = Math.floor(pct * text.length);
      const remainder = text.substring(startChar);
      TTS.stop();
      updateSeekUI(pct * 100);
      setTimeout(() => {
        if (remainder) speakText(remainder, pct);
      }, 100);
    });
  }

  // Waveform canvas click → seek
  const wfCanvas = $('waveformCanvas');
  if (wfCanvas) {
    wfCanvas.addEventListener('click', e => {
      if (!state.audioReady) return;
      const rect = wfCanvas.getBoundingClientRect();
      const pct  = (e.clientX - rect.left) / rect.width;
      const text = $('voiceText').value.trim();
      if (!text) return;
      const startChar = Math.floor(pct * text.length);
      const remainder = text.substring(startChar);
      TTS.stop();
      updateSeekUI(pct * 100);
      setTimeout(() => { if (remainder) speakText(remainder, pct); }, 100);
    });
  }
}

// ──────────────────────────────────────────────────────
//  CORE SPEAK FUNCTIONS
// ──────────────────────────────────────────────────────

// Speaks the current textarea content from the beginning
function speakCurrentText() {
  const text = $('voiceText').value.trim();
  if (!text) {
    showToast('✏️ Please enter some text first!', 'warning');
    return;
  }
  speakText(text, 0);
}

// Speaks given text, offsetProgress = 0–1 for seek start visual
function speakText(text, offsetProgress = 0) {
  const params   = calcSpeechParams();
  const totalSec = estimateDuration(text, params.rate);

  // Adjust timer for seek offset
  const startAtSec = offsetProgress * totalSec;

  TTS.speak(text, {
    onStart: () => {
      setPlayIcon(true);
      startWaveformAnimation();
      // Offset the start time to reflect seek position
      state.speakStart        = Date.now() - startAtSec * 1000;
      state.estimatedDuration = totalSec * 1000;
      startProgressTimer(totalSec);
      updateTimeUI(startAtSec, totalSec);
    },
    onEnd: () => {
      setPlayIcon(false);
      stopWaveformAnimation();
      stopProgressTimer();
      updateSeekUI(100);
      updateTimeUI(totalSec, totalSec);
      showToast('✅ Speech completed!', 'success', 2500);
    },
    onError: err => {
      setPlayIcon(false);
      stopWaveformAnimation();
      stopProgressTimer();
      console.error('TTS error:', err);
      showToast(`❌ Speech error: ${err.error || 'unknown'}`, 'error');
    },
    onPause: () => {
      setPlayIcon(false);
      stopWaveformAnimation();
      stopProgressTimer();
    },
    onResume: () => {
      setPlayIcon(true);
      startWaveformAnimation();
      startProgressTimer(
        (state.estimatedDuration - (Date.now() - state.speakStart)) / 1000
      );
    },
  });
}

// ──────────────────────────────────────────────────────
//  GENERATE BUTTON
// ──────────────────────────────────────────────────────

function initGenerateButton() {
  const btn      = $('generateBtn');
  const genInner = btn.querySelector('.generate-inner');
  const loadDots = $('loadingDots');
  const ripple   = btn.querySelector('.generate-ripple');

  btn.addEventListener('click', async e => {
    if (state.isGenerating) return;

    const text = $('voiceText').value.trim();
    if (!text) {
      showToast('✏️ Please enter some text first!', 'warning');
      $('voiceText').focus();
      return;
    }

    if (!TTS_SUPPORTED) {
      showToast('❌ Web Speech API not supported. Please use Chrome or Edge.', 'error', 5000);
      return;
    }

    // Stop any previous speech
    TTS.stop();
    resetPlayerUI();

    // Ripple effect
    const rect = btn.getBoundingClientRect();
    ripple.style.left = `${e.clientX - rect.left}px`;
    ripple.style.top  = `${e.clientY - rect.top}px`;
    ripple.classList.remove('animate');
    void ripple.offsetWidth;
    ripple.classList.add('animate');

    // Loading UI
    state.isGenerating     = true;
    btn.disabled           = true;
    genInner.style.display = 'none';
    loadDots.style.display = 'flex';

    // Progress bar
    let progressBar = btn.querySelector('.gen-progress-bar');
    if (!progressBar) {
      progressBar = createElement('div', 'gen-progress-bar');
      progressBar.innerHTML = '<div class="gen-progress-fill"></div>';
      btn.appendChild(progressBar);
    }
    const fill = progressBar.querySelector('.gen-progress-fill');
    let   prog = 0;
    const iv   = setInterval(() => {
      prog += Math.random() * 12 + 4;
      if (prog > 90) prog = 90;
      fill.style.width = `${prog}%`;
    }, 120);

    // Simulate brief "AI processing" delay for UX, then speak
    await new Promise(r => setTimeout(r, 900 + Math.random() * 600));

    clearInterval(iv);
    fill.style.width = '100%';
    await new Promise(r => setTimeout(r, 200));

    // Restore button
    state.isGenerating     = false;
    btn.disabled           = false;
    genInner.style.display = 'flex';
    loadDots.style.display = 'none';
    progressBar.remove();

    // Mark audio as ready and show player
    state.audioReady = true;
    showPlayerPanel();

    // Add to history before speaking
    addToHistory(text);

    // Set estimated duration display
    const params   = calcSpeechParams();
    const totalSec = estimateDuration(text, params.rate);
    updateTimeUI(0, totalSec);

    showToast('🎙️ Starting speech synthesis…', 'success');

    // Start speaking
    speakCurrentText();
  });
}

function showPlayerPanel() {
  const panel = $('playerPanel');
  panel.style.display = '';
  panel.classList.remove('slide-up');
  void panel.offsetWidth;
  panel.classList.add('slide-up');
  setTimeout(drawStaticWaveform, 120);
  panel.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

// ──────────────────────────────────────────────────────
//  PRESETS
// ──────────────────────────────────────────────────────

function renderPresets() {
  const grid = $('presetsGrid');
  grid.innerHTML = '';

  PRESETS.forEach((preset, idx) => {
    const isFav = state.favorites.includes(preset.id);
    const card  = createElement('div', 'preset-card slide-up');
    card.style.animationDelay = `${idx * 0.05}s`;
    card.setAttribute('data-preset', preset.id);
    card.innerHTML = `
      <div class="preset-card-top">
        <span class="preset-emoji">${preset.emoji}</span>
        <button class="preset-fav${isFav ? ' favorited' : ''}" title="Favorite" data-id="${preset.id}">★</button>
      </div>
      <div class="preset-name">${preset.name}</div>
      <div class="preset-desc">${preset.desc}</div>
      <div class="preset-tags">${preset.tags.map(t => `<span class="preset-tag">${t}</span>`).join('')}</div>
    `;

    card.addEventListener('click', e => {
      if (e.target.closest('.preset-fav')) return;
      applyPreset(preset);
    });

    card.querySelector('.preset-fav').addEventListener('click', e => {
      e.stopPropagation();
      toggleFavorite(preset.id, card);
    });

    grid.appendChild(card);
  });
}

function applyPreset(preset) {
  // Stop current speech first
  TTS.stop();
  resetPlayerUI();
  state.audioReady = false;

  state.language    = preset.language;
  state.accent      = preset.accent;
  const accentObj   = Object.values(ACCENTS).flat().find(a => a.lang === preset.accent);
  state.accentLabel = accentObj?.label || preset.accent;
  state.gender      = preset.gender;
  state.emotion     = preset.emotion;
  state.style       = preset.style;
  Object.assign(state.sliders, preset.sliders);

  renderLanguages();
  renderAccents();
  renderGenders();
  renderEmotions();
  renderStyles();
  SLIDERS.forEach(s => updateSliderUI(s.id, state.sliders[s.id]));
  updatePrompt();

  document.getElementById('studio').scrollIntoView({ behavior: 'smooth', block: 'start' });
  showToast(`🎙️ "${preset.name}" preset applied!`, 'success');
}

function toggleFavorite(id, card) {
  const idx = state.favorites.indexOf(id);
  if (idx === -1) {
    state.favorites.push(id);
    card.querySelector('.preset-fav').classList.add('favorited');
    showToast('⭐ Added to favorites!', 'success', 2000);
  } else {
    state.favorites.splice(idx, 1);
    card.querySelector('.preset-fav').classList.remove('favorited');
    showToast('Removed from favorites', 'info', 2000);
  }
  localStorage.setItem('vf_favorites', JSON.stringify(state.favorites));
}

// ──────────────────────────────────────────────────────
//  HISTORY
// ──────────────────────────────────────────────────────

function loadHistory() {
  try { state.history = JSON.parse(localStorage.getItem('vf_history') || '[]'); }
  catch { state.history = []; }
  renderHistory();
}

function addToHistory(text) {
  const params = calcSpeechParams();
  const entry  = {
    id:       Date.now(),
    text:     text.substring(0, 120),
    language: LANGUAGES.find(l => l.id === state.language)?.label || state.language,
    accent:   state.accentLabel || state.accent,
    gender:   state.gender,
    emotion:  EMOTIONS.find(e => e.id === state.emotion)?.label || state.emotion,
    style:    STYLES.find(s => s.id === state.style)?.label     || state.style,
    rate:     params.rate.toFixed(2),
    pitch:    params.pitch.toFixed(2),
    date:     new Date().toLocaleString(),
    fullText: text,
  };
  state.history.unshift(entry);
  if (state.history.length > 30) state.history.pop();
  localStorage.setItem('vf_history', JSON.stringify(state.history));
  renderHistory();
}

function renderHistory() {
  const list  = $('historyList');
  const empty = $('historyEmpty');
  list.innerHTML = '';

  if (!state.history.length) {
    list.appendChild(empty);
    return;
  }

  state.history.forEach(entry => {
    const item = createElement('div', 'history-item');
    item.innerHTML = `
      <div class="history-icon">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
          <path d="M19.07 4.93a10 10 0 010 14.14M15.54 8.46a5 5 0 010 7.07"/>
        </svg>
      </div>
      <div class="history-info">
        <div class="history-text">${escapeHtml(entry.text)}${entry.text.length >= 120 ? '…' : ''}</div>
        <div class="history-meta">
          <span class="history-meta-chip">${entry.language}</span>
          <span class="history-meta-chip">${entry.accent || ''}</span>
          <span class="history-meta-chip">${entry.gender}</span>
          <span class="history-meta-chip">${entry.emotion}</span>
          <span class="history-meta-chip">Rate ${entry.rate}</span>
          <span>${entry.date}</span>
        </div>
      </div>
      <div class="history-actions">
        <button class="btn-ghost btn-xs" data-replay="${entry.id}">▶ Replay</button>
        <button class="btn-ghost btn-xs" data-delete="${entry.id}">✕</button>
      </div>
    `;

    // Replay from history — re-speaks the saved text with current settings
    item.querySelector(`[data-replay="${entry.id}"]`).addEventListener('click', () => {
      const fullText = entry.fullText || entry.text;
      TTS.stop();
      // Load settings from history entry into textarea
      $('voiceText').value = fullText;
      $('voiceText').dispatchEvent(new Event('input'));
      state.audioReady = true;
      showPlayerPanel();
      setTimeout(() => {
        speakCurrentText();
        showToast('▶ Replaying from history', 'info', 2000);
      }, 200);
    });

    item.querySelector(`[data-delete="${entry.id}"]`).addEventListener('click', () => {
      state.history = state.history.filter(h => h.id !== entry.id);
      localStorage.setItem('vf_history', JSON.stringify(state.history));
      renderHistory();
      showToast('Deleted from history', 'info', 2000);
    });

    list.appendChild(item);
  });
}

$('clearHistoryBtn').addEventListener('click', () => {
  if (!state.history.length) return;
  state.history = [];
  localStorage.setItem('vf_history', '[]');
  renderHistory();
  showToast('🗑️ History cleared', 'info');
});

// ──────────────────────────────────────────────────────
//  COPY PROMPT
// ──────────────────────────────────────────────────────

$('copyPromptBtn').addEventListener('click', () => {
  const text = $('promptText').textContent;
  navigator.clipboard.writeText(text)
    .then(() => showToast('📋 Prompt copied!', 'success', 2000))
    .catch(() => showToast('Copy failed. Please copy manually.', 'error'));
});

// ──────────────────────────────────────────────────────
//  EXPORT / IMPORT SETTINGS
// ──────────────────────────────────────────────────────

function initExportImport() {
  $('exportSettingsBtn').addEventListener('click', () => {
    const settings = {
      language:    state.language,
      accent:      state.accent,
      accentLabel: state.accentLabel,
      gender:      state.gender,
      emotion:     state.emotion,
      style:       state.style,
      sliders:     { ...state.sliders },
      exportedAt:  new Date().toISOString(),
      app:         'VoiceForge AI',
      version:     '2.0',
    };
    const blob = new Blob([JSON.stringify(settings, null, 2)], { type: 'application/json' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href     = url;
    a.download = `voiceforge-settings-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('⬇️ Settings exported!', 'success');
  });

  $('importSettingsBtn').addEventListener('click', () => $('importFileInput').click());

  $('importFileInput').addEventListener('change', e => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      try {
        const data = JSON.parse(ev.target.result);
        if (data.language)    state.language    = data.language;
        if (data.accent)      state.accent      = data.accent;
        if (data.accentLabel) state.accentLabel = data.accentLabel;
        if (data.gender)      state.gender      = data.gender;
        if (data.emotion)     state.emotion     = data.emotion;
        if (data.style)       state.style       = data.style;
        if (data.sliders)     Object.assign(state.sliders, data.sliders);

        renderLanguages();
        renderAccents();
        renderGenders();
        renderEmotions();
        renderStyles();
        SLIDERS.forEach(s => updateSliderUI(s.id, state.sliders[s.id]));
        updatePrompt();

        showToast('⬆️ Settings imported!', 'success');
      } catch {
        showToast('❌ Invalid settings file!', 'error');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  });
}

// ──────────────────────────────────────────────────────
//  NAV SCROLL ACTIVE STATE
// ──────────────────────────────────────────────────────

function initNavScroll() {
  const sections = {
    studio:  $('studio'),
    presets: $('presets'),
    history: $('history'),
  };
  const links = $$('.nav-link');

  window.addEventListener('scroll', () => {
    const scrollY = window.scrollY + 120;
    let active = 'studio';
    Object.entries(sections).forEach(([id, el]) => {
      if (el && el.offsetTop <= scrollY) active = id;
    });
    links.forEach(link => {
      link.classList.toggle('active', link.getAttribute('href').replace('#', '') === active);
    });
  }, { passive: true });
}

// ──────────────────────────────────────────────────────
//  BROWSER SUPPORT BANNER
// ──────────────────────────────────────────────────────

function showCompatibilityWarning() {
  if (TTS_SUPPORTED) return;
  showToast(
    '⚠️ Your browser does not support Speech Synthesis. Please use Chrome, Edge, or Safari.',
    'error',
    8000
  );
}

// ──────────────────────────────────────────────────────
//  FAKE API STRUCTURE  (ready for real backend integration)
// ──────────────────────────────────────────────────────

const VoiceForgeAPI = {
  baseURL: 'https://api.voiceforge.ai/v1',

  /**
   * Real API integration point.
   * Replace body below with actual fetch call to a TTS service
   * such as ElevenLabs, Google Cloud TTS, Azure Cognitive Services, etc.
   */
  async generateSpeech({ text, language, accent, gender, emotion, style, rate, pitch, volume }) {
    // Example ElevenLabs integration (requires API key):
    // const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
    //   method: 'POST',
    //   headers: {
    //     'xi-api-key': YOUR_API_KEY,
    //     'Content-Type': 'application/json',
    //   },
    //   body: JSON.stringify({ text, voice_settings: { stability: 0.75, similarity_boost: 0.75 } }),
    // });
    // const audioBuffer = await response.arrayBuffer();
    // return URL.createObjectURL(new Blob([audioBuffer], { type: 'audio/mpeg' }));

    // Currently using Web Speech API (browser-native, free, no backend needed)
    return null;
  },

  async listVoices() {
    // Returns browser-native voices
    return speechSynthesis.getVoices();
  },
};

// ──────────────────────────────────────────────────────
//  INIT
// ──────────────────────────────────────────────────────

async function init() {
  // Load saved state
  try { state.favorites = JSON.parse(localStorage.getItem('vf_favorites') || '[]'); }
  catch { state.favorites = []; }

  // UI init
  initTheme();
  initParticles();
  initTypingEffect();

  // Load browser voices (async in Chrome)
  await loadVoices();

  // Render all config panels
  renderLanguages();
  renderAccents();
  renderGenders();
  renderEmotions();
  renderStyles();
  renderSliders();
  updatePrompt();

  // Features
  initTextInput();
  renderPresets();
  loadHistory();
  initPlayerControls();
  initGenerateButton();
  initExportImport();
  initNavScroll();

  // Stagger slide-up animations
  $$('.slide-up').forEach((el, i) => {
    el.style.animationDelay = `${0.05 + i * 0.08}s`;
  });

  // Compatibility check
  showCompatibilityWarning();

  // Remove the old <audio> element — no longer needed (Web Speech API used instead)
  const oldAudio = $('audioPlayer');
  if (oldAudio) oldAudio.remove();

  console.log(
    '%c🎙️ VoiceForge AI v2.0 — TTS Mode Active',
    'color:#7c3aed;font-size:14px;font-weight:bold;'
  );
  console.log(
    `%c${state.availableVoices.length} browser voices loaded`,
    'color:#06b6d4;font-size:12px;'
  );
}

// Boot
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}