/* =====================================================
   AI Voice Studio - REAL Text To Speech Engine
   Using Web Speech API (speechSynthesis)
===================================================== */

const textInput = document.getElementById("textInput");
const charCount = document.getElementById("charCount");
const promptOutput = document.getElementById("promptOutput");
const generateBtn = document.getElementById("generateBtn");
const loader = document.getElementById("loader");
const audioSection = document.getElementById("audioSection");
const playPause = document.getElementById("playPause");
const progress = document.getElementById("progress");
const progressContainer = document.querySelector(".progress-container");
const historyList = document.getElementById("historyList");
const themeToggle = document.getElementById("themeToggle");

const controls = ["language", "accent", "gender", "emotion", "style", "speed", "pitch", "volume", "stability", "creativity"];

/* =====================================================
   WEB SPEECH ENGINE
===================================================== */

let voices = [];
let currentUtterance = null;
let isPaused = false;

/* Load voices */
function loadVoices() {
  voices = speechSynthesis.getVoices();
}
loadVoices();
speechSynthesis.onvoiceschanged = loadVoices;

/* =====================================================
   TEXT INPUT
===================================================== */

function updateCharCount() {
  charCount.textContent = `${textInput.value.length} characters`;
}

textInput.addEventListener("input", () => {
  updateCharCount();
  textInput.style.height = "auto";
  textInput.style.height = textInput.scrollHeight + "px";
  buildPrompt();
});

/* =====================================================
   PROMPT BUILDER (UI Only)
===================================================== */

function buildPrompt() {
  const values = {};
  controls.forEach(id => {
    values[id] = document.getElementById(id).value;
  });

  const prompt = `Generate a ${values.emotion} ${values.accent} ${values.gender} voice speaking in ${values.style} style.`;
  promptOutput.textContent = prompt;
}

controls.forEach(id => {
  document.getElementById(id).addEventListener("input", buildPrompt);
});

/* =====================================================
   VOICE MATCHING LOGIC
===================================================== */

function getMatchingVoice(language, gender) {
  const langMap = {
    English: "en",
    Arabic: "ar",
    French: "fr",
    Spanish: "es",
    German: "de"
  };

  const langCode = langMap[language] || "en";

  let filtered = voices.filter(v => v.lang.toLowerCase().startsWith(langCode));

  if (filtered.length === 0) return voices[0];

  // crude gender detection by name
  if (gender === "Female") {
    const female = filtered.find(v => /female|woman|zira|susan|emma|aria/i.test(v.name));
    if (female) return female;
  }

  if (gender === "Male") {
    const male = filtered.find(v => /male|man|david|mark|john/i.test(v.name));
    if (male) return male;
  }

  return filtered[0];
}

/* =====================================================
   EMOTION SIMULATION
===================================================== */

function applyEmotionSettings(utterance, emotion) {

  switch (emotion) {
    case "Happy":
      utterance.rate += 0.2;
      utterance.pitch += 0.3;
      break;

    case "Sad":
      utterance.rate -= 0.2;
      utterance.pitch -= 0.3;
      break;

    case "Angry":
      utterance.rate += 0.3;
      utterance.pitch += 0.1;
      break;

    case "Excited":
      utterance.rate += 0.4;
      utterance.pitch += 0.4;
      break;

    case "Calm":
      utterance.rate -= 0.2;
      utterance.volume = Math.max(0.4, utterance.volume - 0.2);
      break;

    case "Fearful":
      utterance.rate -= 0.1;
      utterance.pitch += 0.2;
      break;

    case "Whispering":
      utterance.volume = 0.3;
      utterance.rate -= 0.2;
      break;

    case "Motivational":
      utterance.rate += 0.2;
      utterance.pitch += 0.2;
      break;
  }
}

/* =====================================================
   GENERATE VOICE (REAL TTS)
===================================================== */

generateBtn.addEventListener("click", () => {

  if (!textInput.value.trim()) {
    alert("Please enter text");
    return;
  }

  loader.classList.remove("hidden");
  audioSection.classList.add("hidden");

  setTimeout(() => {

    loader.classList.add("hidden");
    audioSection.classList.remove("hidden");

    speechSynthesis.cancel();

    const language = document.getElementById("language").value;
    const gender = document.getElementById("gender").value;
    const emotion = document.getElementById("emotion").value;

    const rate = parseFloat(document.getElementById("speed").value);
    const pitch = parseFloat(document.getElementById("pitch").value);
    const volume = parseFloat(document.getElementById("volume").value);

    currentUtterance = new SpeechSynthesisUtterance(textInput.value);

    currentUtterance.voice = getMatchingVoice(language, gender);
    currentUtterance.rate = rate;
    currentUtterance.pitch = pitch;
    currentUtterance.volume = volume;

    applyEmotionSettings(currentUtterance, emotion);

    speechSynthesis.speak(currentUtterance);

    saveHistory();

  }, 800);
});

/* =====================================================
   AUDIO CONTROLS
===================================================== */

playPause.addEventListener("click", () => {

  if (!currentUtterance) return;

  if (speechSynthesis.speaking && !speechSynthesis.paused) {
    speechSynthesis.pause();
    isPaused = true;
    playPause.textContent = "▶";
  }
  else if (speechSynthesis.paused) {
    speechSynthesis.resume();
    isPaused = false;
    playPause.textContent = "⏸";
  }
  else {
    speechSynthesis.speak(currentUtterance);
    playPause.textContent = "⏸";
  }
});

document.getElementById("replay").onclick = () => {
  if (!currentUtterance) return;
  speechSynthesis.cancel();
  speechSynthesis.speak(currentUtterance);
};

document.getElementById("download").onclick = () => {
  alert("Download not supported with browser-native TTS.");
};

/* =====================================================
   HISTORY (TEXT + SETTINGS)
===================================================== */

function saveHistory() {
  const history = JSON.parse(localStorage.getItem("voiceHistory") || "[]");

  history.unshift({
    text: textInput.value,
    prompt: promptOutput.textContent,
    date: new Date().toLocaleString()
  });

  localStorage.setItem("voiceHistory", JSON.stringify(history.slice(0, 10)));
  renderHistory();
}

function renderHistory() {
  const history = JSON.parse(localStorage.getItem("voiceHistory") || "[]");
  historyList.innerHTML = "";

  history.forEach(item => {
    const div = document.createElement("div");
    div.className = "history-item";
    div.innerHTML = `
      <strong>${item.date}</strong><br>
      ${item.text.substring(0, 60)}...<br>
      <em>${item.prompt}</em>
    `;
    historyList.appendChild(div);
  });
}

/* =====================================================
   THEME
===================================================== */

themeToggle.addEventListener("change", () => {
  document.body.classList.toggle("light");
  localStorage.setItem("theme", themeToggle.checked ? "light" : "dark");
});

if (localStorage.getItem("theme") === "light") {
  document.body.classList.add("light");
  themeToggle.checked = true;
}

/* =====================================================
   PRESETS
===================================================== */

const presetsData = [
  { name: "Podcast Host", emotion: "Calm", style: "Podcast" },
  { name: "Motivational Speaker", emotion: "Motivational", style: "Professional" },
  { name: "Horror Narrator", emotion: "Fearful", style: "Storytelling" },
  { name: "Kids Story Teller", emotion: "Happy", style: "Teacher" },
  { name: "AI Assistant", emotion: "Serious", style: "Professional" },
  { name: "Luxury Advertisement", emotion: "Romantic", style: "Cinematic Trailer" }
];

const presetsContainer = document.getElementById("presets");

presetsData.forEach(p => {
  const card = document.createElement("div");
  card.className = "preset-card";
  card.textContent = p.name;
  card.onclick = () => {
    document.getElementById("emotion").value = p.emotion;
    document.getElementById("style").value = p.style;
    buildPrompt();
  }
  presetsContainer.appendChild(card);
});

/* =====================================================
   INIT
===================================================== */

buildPrompt();
renderHistory();
updateCharCount();