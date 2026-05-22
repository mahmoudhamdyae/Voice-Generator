/**
 * SynthesiaX - Native Browser Text-to-Speech Application
 * Uses Web Speech API (speechSynthesis & SpeechSynthesisUtterance)
 */

// ==========================================
// 1. Data & Configuration (Simulated Data)
// ==========================================
const voiceData = {
    emotions: [
        { id: 'calm', name: 'Calm / Neutral' },
        { id: 'happy', name: 'Happy / Upbeat' },
        { id: 'sad', name: 'Sad / Somber' },
        { id: 'angry', name: 'Angry / Firm' },
        { id: 'excited', name: 'Excited / Energetic' },
        { id: 'whispering', name: 'Whispering / Soft' }
    ],
    styles: [
        { id: 'podcast', name: 'Podcast Host' },
        { id: 'storytelling', name: 'Storytelling' },
        { id: 'news', name: 'News Reporter' },
        { id: 'documentary', name: 'Documentary' },
        { id: 'professional', name: 'Professional Presentation' },
        { id: 'cinematic', name: 'Cinematic Trailer' }
    ]
};

const presets = [
    {
        id: 'p1', name: 'Podcast Host', icon: 'fa-podcast',
        settings: { langPrefix: 'en', gender: 'male', emotion: 'calm', style: 'podcast', speed: 1.0, pitch: 0, volume: 100, creativity: 30 }
    },
    {
        id: 'p2', name: 'Energetic Ad', icon: 'fa-bolt',
        settings: { langPrefix: 'en', gender: 'female', emotion: 'excited', style: 'cinematic', speed: 1.2, pitch: 2, volume: 100, creativity: 80 }
    },
    {
        id: 'p3', name: 'Storyteller', icon: 'fa-book-open',
        settings: { langPrefix: 'en', gender: 'any', emotion: 'calm', style: 'storytelling', speed: 0.9, pitch: 1, volume: 100, creativity: 70 }
    },
    {
        id: 'p4', name: 'News Anchor', icon: 'fa-tv',
        settings: { langPrefix: 'en', gender: 'any', emotion: 'serious', style: 'news', speed: 1.05, pitch: -1, volume: 100, creativity: 10 }
    }
];

// App State
let state = {
    text: '',
    language: '',
    voiceURI: '',
    gender: 'any',
    emotion: 'calm',
    style: 'podcast',
    speed: 1.0,
    pitch: 0, // -10 to 10 mapped in UI
    volume: 100, // 0 to 100
    creativity: 50
};

// ==========================================
// 2. DOM Elements Cache
// ==========================================
const DOM = {
    themeToggle: document.getElementById('theme-toggle'),
    exportBtn: document.getElementById('export-btn'),
    textInput: document.getElementById('text-input'),
    charCount: document.getElementById('char-count'),
    promptDisplay: document.getElementById('dynamic-prompt'),
    generateBtn: document.getElementById('generate-btn'),
    btnText: document.querySelector('.btn-text'),
    btnIcon: document.querySelector('.primary-btn i'),
    btnLoader: document.querySelector('.btn-loader'),

    // Selects
    langSelect: document.getElementById('language-select'),
    accentSelect: document.getElementById('accent-select'),
    genderSelect: document.getElementById('gender-select'),
    emotionSelect: document.getElementById('emotion-select'),
    styleSelect: document.getElementById('style-select'),

    // Sliders
    sliderSpeed: document.getElementById('slider-speed'),
    sliderPitch: document.getElementById('slider-pitch'),
    sliderVolume: document.getElementById('slider-stability'), // Reused UI element for volume
    sliderCreativity: document.getElementById('slider-creativity'),
    valSpeed: document.getElementById('val-speed'),
    valPitch: document.getElementById('val-pitch'),
    valVolume: document.getElementById('val-stability'), // Reused UI element
    valCreativity: document.getElementById('val-creativity'),

    // Player
    playerCard: document.getElementById('player-card'),
    playBtn: document.getElementById('play-pause-btn'),
    stopBtn: document.getElementById('stop-btn'),
    playIcon: document.querySelector('#play-pause-btn i'),
    seekSlider: document.getElementById('seek-slider'),
    waveformBars: document.getElementById('waveform-bars'),
    downloadBtn: document.getElementById('download-audio-btn'),

    // History & Presets
    historyList: document.getElementById('history-list'),
    presetsContainer: document.getElementById('presets-container'),
    toast: document.getElementById('toast')
};

// ==========================================
// 3. Web Speech API Initialization
// ==========================================
const synth = window.speechSynthesis;
let availableVoices = [];
let currentUtterance = null;

// Map language code to human-readable names roughly
const langNames = new Intl.DisplayNames(['en'], { type: 'language' });

function init() {
    initTheme();
    setupUIOptions();
    renderPresets();
    setupEventListeners();
    generateWaveformBars();
    loadHistory();
    initParticles();

    // Web Speech API Voice Loading
    populateVoices();
    if (speechSynthesis.onvoiceschanged !== undefined) {
        speechSynthesis.onvoiceschanged = populateVoices;
    }
}

function populateVoices() {
    availableVoices = synth.getVoices();
    if (availableVoices.length > 0) {
        buildLanguageSelect();
    }
}

function buildLanguageSelect() {
    const langs = new Set();
    availableVoices.forEach(voice => {
        // Handle standard formats e.g. "en-US", "fr-FR"
        const baseLang = voice.lang.split('-')[0];
        if (baseLang) langs.add(baseLang);
    });

    const langArray = Array.from(langs).sort();

    // Save current selection to restore if possible
    const currentLang = DOM.langSelect.value;

    DOM.langSelect.innerHTML = langArray.map(code => {
        try {
            return `<option value="${code}">${langNames.of(code)} (${code.toUpperCase()})</option>`;
        } catch (e) {
            return `<option value="${code}">${code.toUpperCase()}</option>`;
        }
    }).join('');

    // Try to select 'en' by default or restore previous
    if (langArray.includes('en') && !currentLang) {
        DOM.langSelect.value = 'en';
    } else if (langArray.includes(currentLang)) {
        DOM.langSelect.value = currentLang;
    }

    state.language = DOM.langSelect.value;
    updateVoiceSelect();
}

function updateVoiceSelect() {
    const selectedLang = DOM.langSelect.value;
    const filteredVoices = availableVoices.filter(v => v.lang.startsWith(selectedLang));

    DOM.accentSelect.innerHTML = filteredVoices.map(v =>
        `<option value="${v.voiceURI}">${v.name} (${v.lang})</option>`
    ).join('');

    // Attempt to match gender preference based on name hints (heuristic since API lacks gender property)
    if (state.gender !== 'any') {
        const preferred = filteredVoices.find(v => v.name.toLowerCase().includes(state.gender));
        if (preferred) {
            DOM.accentSelect.value = preferred.voiceURI;
        }
    }

    state.voiceURI = DOM.accentSelect.value;
    updateStateFromDOM();
}

function initTheme() {
    const savedTheme = localStorage.getItem('synthesiax-theme') || 'dark';
    document.documentElement.setAttribute('data-theme', savedTheme);
    updateThemeIcon(savedTheme);
}

function setupUIOptions() {
    DOM.emotionSelect.innerHTML = voiceData.emotions.map(e => `<option value="${e.id}">${e.name}</option>`).join('');
    DOM.styleSelect.innerHTML = voiceData.styles.map(s => `<option value="${s.id}">${s.name}</option>`).join('');
}

function renderPresets() {
    DOM.presetsContainer.innerHTML = presets.map(p => `
        <div class="preset-card" data-id="${p.id}">
            <i class="fa-solid ${p.icon} preset-icon"></i>
            <span class="preset-name">${p.name}</span>
        </div>
    `).join('');
}

function generateWaveformBars() {
    let barsHTML = '';
    for (let i = 0; i < 40; i++) {
        const dur = Math.random() * (1.2 - 0.4) + 0.4;
        barsHTML += `<div class="bar" style="animation-duration: ${dur}s"></div>`;
    }
    DOM.waveformBars.innerHTML = barsHTML;
}

// ==========================================
// 4. Event Listeners
// ==========================================
function setupEventListeners() {
    DOM.themeToggle.addEventListener('click', () => {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('synthesiax-theme', newTheme);
        updateThemeIcon(newTheme);
    });

    DOM.textInput.addEventListener('input', function () {
        this.style.height = 'auto';
        this.style.height = (this.scrollHeight) + 'px';

        let text = this.value;
        if (text.length > 1000) {
            text = text.substring(0, 1000);
            this.value = text;
        }
        DOM.charCount.textContent = text.length;
        state.text = text;
    });

    DOM.langSelect.addEventListener('change', (e) => {
        state.language = e.target.value;
        updateVoiceSelect();
    });

    DOM.accentSelect.addEventListener('change', updateStateFromDOM);
    DOM.genderSelect.addEventListener('change', (e) => {
        state.gender = e.target.value;
        updateVoiceSelect(); // Try to auto-select matching gender voice
    });
    DOM.emotionSelect.addEventListener('change', updateStateFromDOM);
    DOM.styleSelect.addEventListener('change', updateStateFromDOM);

    DOM.sliderSpeed.addEventListener('input', (e) => { state.speed = e.target.value; DOM.valSpeed.textContent = e.target.value + 'x'; updatePrompt(); });
    DOM.sliderPitch.addEventListener('input', (e) => { state.pitch = e.target.value; DOM.valPitch.textContent = e.target.value; updatePrompt(); });
    DOM.sliderVolume.addEventListener('input', (e) => { state.volume = e.target.value; DOM.valVolume.textContent = e.target.value + '%'; updatePrompt(); });
    DOM.sliderCreativity.addEventListener('input', (e) => { state.creativity = e.target.value; DOM.valCreativity.textContent = e.target.value + '%'; updatePrompt(); });

    DOM.presetsContainer.addEventListener('click', (e) => {
        const card = e.target.closest('.preset-card');
        if (!card) return;
        const preset = presets.find(p => p.id === card.dataset.id);
        if (preset) applyPreset(preset);
    });

    DOM.generateBtn.addEventListener('click', handleGenerate);

    // Audio / Speech Player Controls
    DOM.playBtn.addEventListener('click', togglePlay);
    DOM.stopBtn.addEventListener('click', stopSpeech);

    DOM.downloadBtn.addEventListener('click', () => {
        showToast("Native browser TTS audio cannot be downloaded directly via API.", "error");
    });

    DOM.exportBtn.addEventListener('click', () => {
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(state, null, 2));
        const downloadAnchorNode = document.createElement('a');
        downloadAnchorNode.setAttribute("href", dataStr);
        downloadAnchorNode.setAttribute("download", "synthesiax_tts_settings.json");
        document.body.appendChild(downloadAnchorNode);
        downloadAnchorNode.click();
        downloadAnchorNode.remove();
        showToast("Settings exported successfully!");
    });
}

// ==========================================
// 5. Core Logic
// ==========================================
function updateThemeIcon(theme) {
    DOM.themeToggle.innerHTML = theme === 'dark' ? '<i class="fa-solid fa-sun"></i>' : '<i class="fa-solid fa-moon"></i>';
}

function updateStateFromDOM() {
    state.voiceURI = DOM.accentSelect.value;
    state.emotion = DOM.emotionSelect.value;
    state.style = DOM.styleSelect.value;
    updatePrompt();
}

function applyPreset(preset) {
    // Check if we have voices for the preset language prefix
    if (Array.from(DOM.langSelect.options).some(opt => opt.value === preset.settings.langPrefix)) {
        DOM.langSelect.value = preset.settings.langPrefix;
        state.language = preset.settings.langPrefix;
        state.gender = preset.settings.gender;
        DOM.genderSelect.value = preset.settings.gender;
        updateVoiceSelect();
    }

    state.emotion = preset.settings.emotion;
    DOM.emotionSelect.value = state.emotion;

    state.style = preset.settings.style;
    DOM.styleSelect.value = state.style;

    // Sliders
    state.speed = preset.settings.speed; DOM.sliderSpeed.value = state.speed; DOM.valSpeed.textContent = state.speed + 'x';
    state.pitch = preset.settings.pitch; DOM.sliderPitch.value = state.pitch; DOM.valPitch.textContent = state.pitch;
    state.volume = preset.settings.volume; DOM.sliderVolume.value = state.volume; DOM.valVolume.textContent = state.volume + '%';
    state.creativity = preset.settings.creativity; DOM.sliderCreativity.value = state.creativity; DOM.valCreativity.textContent = state.creativity + '%';

    updatePrompt();
    showToast(`Applied preset: ${preset.name}`);
}

function updatePrompt() {
    const voiceName = DOM.accentSelect.options[DOM.accentSelect.selectedIndex]?.text || 'System Default Voice';
    const speedTxt = state.speed < 1 ? 'slowly' : state.speed > 1 ? 'quickly' : 'at natural pace';

    const prompt = `Using native profile: ${voiceName}. Modulating tone for a ${state.emotion} feeling, speaking ${speedTxt} in a ${state.style} format.`;

    DOM.promptDisplay.textContent = prompt;
}

// ==========================================
// 6. Text-to-Speech Generation
// ==========================================
function handleGenerate() {
    if (!state.text.trim()) {
        showToast("Please enter a script to narrate.", "error");
        DOM.textInput.focus();
        return;
    }

    // Cancel any ongoing speech
    synth.cancel();

    // UI Loading state to simulate initialization
    DOM.btnText.classList.add('hidden');
    DOM.btnIcon.classList.add('hidden');
    DOM.btnLoader.classList.remove('hidden');
    DOM.generateBtn.disabled = true;

    // Simulate small processing delay
    setTimeout(() => {
        DOM.btnText.classList.remove('hidden');
        DOM.btnIcon.classList.remove('hidden');
        DOM.btnLoader.classList.add('hidden');
        DOM.generateBtn.disabled = false;
        DOM.playerCard.classList.remove('hidden');

        speakText();

        // Save to History
        saveToHistory({
            text: state.text,
            config: `${DOM.accentSelect.options[DOM.accentSelect.selectedIndex]?.text.split('(')[0].trim() || 'Default'}, ${state.emotion}`,
            date: new Date().toLocaleString(),
            stateObj: { ...state }
        });
    }, 600);
}

function speakText(customState = null) {
    const activeState = customState || state;

    synth.cancel();
    currentUtterance = new SpeechSynthesisUtterance(activeState.text);

    // Assign specific voice
    const selectedVoice = availableVoices.find(v => v.voiceURI === activeState.voiceURI);
    if (selectedVoice) {
        currentUtterance.voice = selectedVoice;
    }

    // Base properties calculation
    // Speed directly maps 0.5 to 2.0
    let finalRate = parseFloat(activeState.speed);

    // Pitch mapped from UI (-10 to 10) to API (0 to 2, where 1 is normal)
    let finalPitch = 1 + (parseFloat(activeState.pitch) / 10);

    // Volume mapped from UI (0 to 100) to API (0 to 1)
    let finalVolume = parseFloat(activeState.volume) / 100;

    // Artificial Emotion & Style Simulators (Modifying rate and pitch dynamically)
    // We adjust the baseline based on selected emotion
    switch (activeState.emotion) {
        case 'happy': finalPitch += 0.2; finalRate += 0.1; break;
        case 'sad': finalPitch -= 0.3; finalRate -= 0.2; break;
        case 'angry': finalPitch -= 0.1; finalRate += 0.3; finalVolume = 1; break;
        case 'excited': finalPitch += 0.4; finalRate += 0.25; break;
        case 'whispering': finalVolume = Math.min(finalVolume, 0.3); finalPitch -= 0.5; finalRate -= 0.1; break;
        case 'calm': finalPitch -= 0.1; finalRate -= 0.1; break;
    }

    // Apply Style modifications
    if (activeState.style === 'news') finalRate += 0.1;
    if (activeState.style === 'storytelling') finalRate -= 0.1;

    // Ensure within API limits
    currentUtterance.rate = Math.max(0.1, Math.min(2, finalRate));
    currentUtterance.pitch = Math.max(0, Math.min(2, finalPitch));
    currentUtterance.volume = Math.max(0, Math.min(1, finalVolume));

    // UI Events mapping
    currentUtterance.onstart = () => {
        DOM.waveformBars.classList.add('playing');
        DOM.playIcon.className = 'fa-solid fa-pause';
        DOM.seekSlider.value = 0;
    };

    currentUtterance.onend = () => {
        DOM.waveformBars.classList.remove('playing');
        DOM.playIcon.className = 'fa-solid fa-play';
        DOM.seekSlider.value = 100;
        currentUtterance = null;
    };

    currentUtterance.onpause = () => {
        DOM.waveformBars.classList.remove('playing');
        DOM.playIcon.className = 'fa-solid fa-play';
    };

    currentUtterance.onresume = () => {
        DOM.waveformBars.classList.add('playing');
        DOM.playIcon.className = 'fa-solid fa-pause';
    };

    // Simulate progress bar based on word boundaries
    currentUtterance.onboundary = (event) => {
        if (event.name === 'word') {
            const progress = (event.charIndex / activeState.text.length) * 100;
            DOM.seekSlider.value = progress;
        }
    };

    currentUtterance.onerror = (e) => {
        if (e.error !== 'canceled') {
            showToast("Error generating speech.", "error");
            DOM.waveformBars.classList.remove('playing');
            DOM.playIcon.className = 'fa-solid fa-play';
        }
    };

    synth.speak(currentUtterance);
}

// ==========================================
// 7. Audio Player / Synth Controls
// ==========================================
function togglePlay() {
    if (synth.speaking) {
        if (synth.paused) {
            synth.resume();
        } else {
            synth.pause();
        }
    } else if (state.text.trim()) {
        speakText();
    }
}

function stopSpeech() {
    synth.cancel();
    DOM.waveformBars.classList.remove('playing');
    DOM.playIcon.className = 'fa-solid fa-play';
    DOM.seekSlider.value = 0;
}

// ==========================================
// 8. History Management
// ==========================================
function saveToHistory(item) {
    let history = JSON.parse(localStorage.getItem('synthesiax-tts-history') || '[]');
    history.unshift(item);
    if (history.length > 10) history.pop(); // Keep last 10
    localStorage.setItem('synthesiax-tts-history', JSON.stringify(history));
    loadHistory();
}

function loadHistory() {
    const history = JSON.parse(localStorage.getItem('synthesiax-tts-history') || '[]');

    if (history.length === 0) {
        DOM.historyList.innerHTML = '<div class="empty-state">No narrations saved yet.</div>';
        return;
    }

    DOM.historyList.innerHTML = history.map((item, index) => `
        <div class="history-item">
            <div class="history-info">
                <div class="history-text" title="${item.text}">"${item.text}"</div>
                <div class="history-meta">
                    <span><i class="fa-solid fa-microphone-lines"></i> ${item.config}</span>
                    <span>• ${item.date}</span>
                </div>
            </div>
            <button class="history-play" data-index="${index}" title="Replay Narrator">
                <i class="fa-solid fa-rotate-right"></i>
            </button>
        </div>
    `).join('');

    // Attach replay events
    document.querySelectorAll('.history-play').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const idx = e.currentTarget.getAttribute('data-index');
            replayHistoryItem(history[idx]);
        });
    });
}

function replayHistoryItem(itemData) {
    DOM.playerCard.classList.remove('hidden');
    speakText(itemData.stateObj);
    showToast("Replaying saved narration settings.");
}

// ==========================================
// 9. Utilities & Effects
// ==========================================
function showToast(msg, type = 'success') {
    DOM.toast.textContent = msg;
    if (type === 'error') DOM.toast.style.borderLeft = '4px solid var(--danger)';
    else DOM.toast.style.borderLeft = '4px solid var(--success)';

    DOM.toast.classList.add('show');
    setTimeout(() => {
        DOM.toast.classList.remove('show');
    }, 3000);
}

// Canvas Particles Background
function initParticles() {
    const canvas = document.getElementById('particles-bg');
    const ctx = canvas.getContext('2d');
    let width, height;
    let particles = [];

    function resize() {
        width = window.innerWidth;
        height = window.innerHeight;
        canvas.width = width;
        canvas.height = height;
    }
    window.addEventListener('resize', resize);
    resize();

    class Particle {
        constructor() {
            this.x = Math.random() * width;
            this.y = Math.random() * height;
            this.vx = (Math.random() - 0.5) * 0.5;
            this.vy = (Math.random() - 0.5) * 0.5;
            this.size = Math.random() * 2;
        }
        update() {
            this.x += this.vx;
            this.y += this.vy;
            if (this.x < 0 || this.x > width) this.vx *= -1;
            if (this.y < 0 || this.y > height) this.vy *= -1;
        }
        draw() {
            const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
            ctx.fillStyle = isDark ? 'rgba(99, 102, 241, 0.15)' : 'rgba(99, 102, 241, 0.3)';
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    for (let i = 0; i < 50; i++) particles.push(new Particle());

    function animate() {
        ctx.clearRect(0, 0, width, height);
        particles.forEach(p => {
            p.update();
            p.draw();
        });
        requestAnimationFrame(animate);
    }
    animate();
}

// Guarantee API cancellation on page unload/refresh to prevent ghost speech
window.addEventListener('beforeunload', () => {
    window.speechSynthesis.cancel();
});

// Run App
document.addEventListener('DOMContentLoaded', init);