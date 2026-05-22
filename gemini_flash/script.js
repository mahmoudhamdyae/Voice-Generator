/* ==========================================================================
   AURA ADVANCED AI VOICE STUDIO ENGINE - WEB SPEECH TTS EDITION
   ========================================================================== */

// --- GLOBAL NATIVE SPEECH SYNTHESIS REFERENCE ---
const synth = window.speechSynthesis;
let voicesList = [];

// --- DYNAMIC LANGUAGE LANG-CODE MAPPINGS ---
const LANGUAGE_CODES = {
    'English': 'en',
    'Arabic': 'ar',
    'French': 'fr',
    'Spanish': 'es',
    'German': 'de'
};

const DEFAULT_PRESETS = [
    {
        id: 'podcast-host',
        name: 'Podcast Host',
        description: 'Vibrant & crisp profile optimized for spoken shows.',
        language: 'English',
        gender: 'Female',
        emotion: 'Calm',
        style: 'Podcast',
        speed: 1.0,
        pitch: 1.0,
        volume: 95,
        stability: 80,
        creativity: 90,
        favorite: false
    },
    {
        id: 'motivational-speaker',
        name: 'Inspiring Orator',
        description: 'High energy tone with powerful spatial dynamics.',
        language: 'English',
        gender: 'Male',
        emotion: 'Motivational',
        style: 'Cinematic Trailer',
        speed: 1.15,
        pitch: 0.9,
        volume: 100,
        stability: 70,
        creativity: 85,
        favorite: false
    },
    {
        id: 'horror-narrator',
        name: 'Dark Narrator',
        description: 'Whispering, intense, and mysterious cinematic depth.',
        language: 'English',
        gender: 'Male',
        emotion: 'Whispering',
        style: 'Storytelling',
        speed: 0.8,
        pitch: 0.6,
        volume: 75,
        stability: 95,
        creativity: 75,
        favorite: false
    },
    {
        id: 'kids-story',
        name: 'Enchanted Story Teller',
        description: 'Friendly, warm, and hyper-expressive profile.',
        language: 'English',
        gender: 'Female',
        emotion: 'Happy',
        style: 'Storytelling',
        speed: 0.95,
        pitch: 1.3,
        volume: 90,
        stability: 65,
        creativity: 95,
        favorite: false
    },
    {
        id: 'ai-assistant',
        name: 'AURA Core Engine',
        description: 'Clean, hyper-smooth intelligence assistant response.',
        language: 'English',
        gender: 'Female',
        emotion: 'Calm',
        style: 'Professional',
        speed: 1.05,
        pitch: 1.1,
        volume: 85,
        stability: 90,
        creativity: 60,
        favorite: false
    },
    {
        id: 'luxury-ad',
        name: 'Exclusive Prestige',
        description: 'Sophisticated, premium narrative flow.',
        language: 'French',
        gender: 'Female',
        emotion: 'Romantic',
        style: 'Documentary',
        speed: 0.9,
        pitch: 0.95,
        volume: 85,
        stability: 85,
        creativity: 80,
        favorite: false
    }
];

// --- SAMPLE VOICE SCRIPTS ---
const SCRIPTS_TEMPLATES = {
    'English': "Welcome to the future of voice synthesis. Aura Studio delivers state-of-the-art Web Speech technology with immediate local responsiveness.",
    'Arabic': "مرحباً بكم في استوديو أورا الصوتي. نقوم بتحويل النصوص البرمجية إلى كلمات منطوقة بدقة متناهية عبر الذكاء الاصطناعي.",
    'French': "Bienvenue dans l'univers d'Aura. Notre studio de synthèse vocale transforme instantanément vos textes en paroles d'un réalisme saisissant.",
    'Spanish': "Bienvenido a Aura Studio. Experimenta la generación de voz neuronal con modulación emocional en tiempo real.",
    'German': "Willkommen bei Aura Voice Studio. Wir erzeugen lebendige Sprache direkt in Ihrem Webbrowser mit präziser Kontrolle."
};

// --- INITIAL STATE MANAGEMENT ---
let state = {
    theme: localStorage.getItem('aura-theme') || 'dark',
    presets: JSON.parse(localStorage.getItem('aura-presets')) || DEFAULT_PRESETS,
    activePresetId: 'podcast-host',
    history: JSON.parse(localStorage.getItem('aura-history')) || [],
    currentUtterance: null,
    isPlaying: false,
    isPaused: false,
    textLength: 0,
    animationFrameId: null
};

// --- DOM ELEMENTS REFERENCE ---
const els = {
    themeToggle: document.getElementById('theme-toggle'),
    scriptInput: document.getElementById('script-input'),
    charCounter: document.getElementById('char-counter'),
    btnClear: document.getElementById('btn-clear'),
    presetsContainer: document.getElementById('presets-container'),
    selectLang: document.getElementById('select-lang'),
    selectAccent: document.getElementById('select-accent'), // System voice engine dropdown
    genderMale: document.getElementById('gender-male'),
    genderFemale: document.getElementById('gender-female'),
    selectEmotion: document.getElementById('select-emotion'),
    selectStyle: document.getElementById('select-style'),
    
    // Sliders & outputs
    sliderSpeed: document.getElementById('slider-speed'),
    sliderPitch: document.getElementById('slider-pitch'),
    sliderVolume: document.getElementById('slider-volume'),
    sliderStability: document.getElementById('slider-stability'),
    sliderCreativity: document.getElementById('slider-creativity'),
    valSpeed: document.getElementById('val-speed'),
    valPitch: document.getElementById('val-pitch'),
    valVolume: document.getElementById('val-volume'),
    valStability: document.getElementById('val-stability'),
    valCreativity: document.getElementById('val-creativity'),

    // Generator & Prompt Builder
    dynamicPrompt: document.getElementById('dynamic-prompt'),
    btnGenerate: document.getElementById('btn-generate'),
    btnImport: document.getElementById('btn-import'),
    btnExport: document.getElementById('btn-export'),

    // Audio Player Controls
    playerCard: document.getElementById('audio-player-card'),
    playerPlayPause: document.getElementById('player-play-pause'),
    playerTimelineContainer: document.getElementById('player-progress-container'),
    playerProgressBar: document.getElementById('player-progress-bar'),
    playerTimeCurrent: document.getElementById('player-time-current'),
    playerTimeDuration: document.getElementById('player-time-duration'),
    playerReplay: document.getElementById('player-replay'),
    playerDownload: document.getElementById('player-download'),
    waveformCanvas: document.getElementById('waveform-canvas'),

    // History Archive
    historyContainer: document.getElementById('history-container'),
    btnClearHistory: document.getElementById('btn-clear-history'),
    emptyHistoryText: document.getElementById('empty-history-text'),

    // Background System Elements
    ambientCanvas: document.getElementById('ambient-canvas'),
    toastContainer: document.getElementById('toast-container')
};

// --- INITIALIZE APPLICATION ENGINE ---
document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    setupAmbientCanvas();
    initializeVoices();
    renderPresets();
    updatePrompt();
    loadHistory();
    attachEventListeners();
    setScriptPlaceholder(els.selectLang.value);
});

// --- ENGINE THEME SYSTEM ---
function initTheme() {
    document.documentElement.setAttribute('data-theme', state.theme);
}

els.themeToggle.addEventListener('click', () => {
    state.theme = state.theme === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', state.theme);
    localStorage.setItem('aura-theme', state.theme);
    showToast(`Switched to ${state.theme} mode`);
});

// --- AMBIENT PARTICLES SYSTEM ---
function setupAmbientCanvas() {
    const canvas = els.ambientCanvas;
    const ctx = canvas.getContext('2d');
    let particles = [];

    function resize() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    window.addEventListener('resize', resize);
    resize();

    class Particle {
        constructor() {
            this.x = Math.random() * canvas.width;
            this.y = Math.random() * canvas.height;
            this.size = Math.random() * 2 + 0.5;
            this.speedX = Math.random() * 0.4 - 0.2;
            this.speedY = Math.random() * 0.4 - 0.2;
            this.alpha = Math.random() * 0.5 + 0.1;
        }
        update() {
            this.x += this.speedX;
            this.y += this.speedY;
            if (this.x < 0 || this.x > canvas.width) this.speedX *= -1;
            if (this.y < 0 || this.y > canvas.height) this.speedY *= -1;
        }
        draw() {
            ctx.save();
            ctx.globalAlpha = this.alpha;
            ctx.fillStyle = state.theme === 'dark' ? '#8b5cf6' : '#6d28d9';
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        }
    }

    for (let i = 0; i < 45; i++) {
        particles.push(new Particle());
    }

    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        particles.forEach(p => {
            p.update();
            p.draw();
        });
        requestAnimationFrame(animate);
    }
    animate();
}

// --- VOICE PROCESSING & WEB SPEECH POPULATION ---
function initializeVoices() {
    if (typeof speechSynthesis === 'undefined') {
        showToast("Web Speech Synthesis is not supported in this browser.", "error");
        return;
    }

    // Chrome/Safari load voices asynchronously
    voicesList = speechSynthesis.getVoices();
    populateSystemVoices();

    if (speechSynthesis.onvoiceschanged !== undefined) {
        speechSynthesis.onvoiceschanged = () => {
            voicesList = speechSynthesis.getVoices();
            populateSystemVoices();
        };
    }
}

// Populate system voices based on active UI Language and Gender Toggle selections
function populateSystemVoices() {
    const selectedLangName = els.selectLang.value;
    const langCodePrefix = LANGUAGE_CODES[selectedLangName] || 'en';
    const isGenderMale = els.genderMale.checked;

    els.selectAccent.innerHTML = '';

    // Filter local system voices matching selected language prefix
    let filteredVoices = voicesList.filter(voice => {
        const voiceLang = voice.lang.toLowerCase().replace('_', '-');
        return voiceLang.startsWith(langCodePrefix);
    });

    // Fallback to all voices if none match language
    if (filteredVoices.length === 0) {
        filteredVoices = voicesList;
    }

    // Sort voices to rank matching genders first
    filteredVoices.sort((a, b) => {
        const nameA = a.name.toLowerCase();
        const nameB = b.name.toLowerCase();
        const genderKeyword = isGenderMale ? 'male' : 'female';
        
        // Try to identify gender from metadata name
        const hasA = nameA.includes(genderKeyword) || nameA.includes(isGenderMale ? 'david' : 'zira') || nameA.includes(isGenderMale ? 'george' : 'hazel');
        const hasB = nameB.includes(genderKeyword) || nameB.includes(isGenderMale ? 'david' : 'zira') || nameB.includes(isGenderMale ? 'george' : 'hazel');
        
        if (hasA && !hasB) return -1;
        if (!hasA && hasB) return 1;
        return 0;
    });

    filteredVoices.forEach(voice => {
        const option = document.createElement('option');
        option.value = voice.name;
        option.innerText = `${voice.name} (${voice.lang})`;
        els.selectAccent.appendChild(option);
    });

    if (filteredVoices.length === 0) {
        const option = document.createElement('option');
        option.value = 'default';
        option.innerText = 'Default System Engine';
        els.selectAccent.appendChild(option);
    }
}

// --- RENDERING PRESET CARDS ---
function renderPresets() {
    els.presetsContainer.innerHTML = '';
    state.presets.forEach(p => {
        const activeClass = p.id === state.activePresetId ? 'active' : '';
        const favClass = p.favorite ? 'favorited' : '';
        const card = document.createElement('div');
        card.className = `preset-card ${activeClass}`;
        card.dataset.id = p.id;
        
        card.innerHTML = `
            <button class="fav-btn ${favClass}" data-id="${p.id}" title="Favorite Preset">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>
            </button>
            <div class="preset-info">
                <h4>${p.name}</h4>
                <p>${p.description}</p>
            </div>
        `;
        
        card.querySelector('.fav-btn').addEventListener('click', (e) => {
            e.stopPropagation();
            toggleFavoritePreset(p.id);
        });

        card.addEventListener('click', () => applyPreset(p.id));
        els.presetsContainer.appendChild(card);
    });
}

// --- FAVORITES ENGINE ---
function toggleFavoritePreset(id) {
    state.presets = state.presets.map(p => {
        if (p.id === id) {
            p.favorite = !p.favorite;
            showToast(`${p.name} updated favorites`);
        }
        return p;
    });
    localStorage.setItem('aura-presets', JSON.stringify(state.presets));
    renderPresets();
}

// --- PRESET APPLICATION ---
function applyPreset(id) {
    const p = state.presets.find(item => item.id === id);
    if (!p) return;

    state.activePresetId = id;
    
    // Set direct form element values
    els.selectLang.value = p.language;
    
    if (p.gender === 'Male') {
        els.genderMale.checked = true;
    } else {
        els.genderFemale.checked = true;
    }

    populateSystemVoices();
    els.selectEmotion.value = p.emotion;
    els.selectStyle.value = p.style;
    
    // Config Sliders
    els.sliderSpeed.value = p.speed;
    els.sliderPitch.value = p.pitch;
    els.sliderVolume.value = p.volume;
    els.sliderStability.value = p.stability;
    els.sliderCreativity.value = p.creativity;

    syncSliderOutputs();
    updatePrompt();
    renderPresets();
    setScriptPlaceholder(p.language);
    
    showToast(`Preset "${p.name}" Applied`);
}

// --- DYNAMIC PROMPT BUILDER LIVE ENGINE ---
function updatePrompt() {
    const lang = els.selectLang.value;
    const accent = els.selectAccent.selectedOptions[0]?.text || 'Default system voice';
    const cleanVoiceName = accent.split(' (')[0];
    const gender = els.genderMale.checked ? 'male' : 'female';
    const emotion = els.selectEmotion.value.toLowerCase();
    const style = els.selectStyle.value;
    const speed = parseFloat(els.sliderSpeed.value);

    let speedText = 'normal speed';
    if (speed < 0.8) speedText = 'deeply slow tempo';
    else if (speed < 1.0) speedText = 'slightly slow pace';
    else if (speed > 1.3) speedText = 'highly rapid tempo';
    else if (speed > 1.0) speedText = 'brisk narrative pace';

    els.dynamicPrompt.innerHTML = `Synthesize using <span>${cleanVoiceName}</span>. Model will speak at a <span>${speedText}</span> with <span>${emotion}</span> emotion and <span>${style}</span> style.`;
}

function syncSliderOutputs() {
    els.valSpeed.innerText = `${els.sliderSpeed.value}x`;
    els.valPitch.innerText = `${els.sliderPitch.value}`;
    els.valVolume.innerText = `${els.sliderVolume.value}%`;
    els.valStability.innerText = `${els.sliderStability.value}%`;
    els.valCreativity.innerText = `${els.sliderCreativity.value}%`;
}

function setScriptPlaceholder(lang) {
    if(!els.scriptInput.value) {
        els.scriptInput.placeholder = SCRIPTS_TEMPLATES[lang] || SCRIPTS_TEMPLATES['English'];
    }
}

// --- LISTENERS MATRIX ---
function attachEventListeners() {
    // Inputs
    els.scriptInput.addEventListener('input', () => {
        const len = els.scriptInput.value.length;
        els.charCounter.innerText = `${len} / 1000 characters`;
    });

    els.btnClear.addEventListener('click', () => {
        els.scriptInput.value = '';
        els.charCounter.innerText = '0 / 1000 characters';
    });

    els.selectLang.addEventListener('change', (e) => {
        populateSystemVoices();
        setScriptPlaceholder(e.target.value);
        updatePrompt();
    });

    els.selectAccent.addEventListener('change', updatePrompt);
    els.genderMale.addEventListener('change', () => {
        populateSystemVoices();
        updatePrompt();
    });
    els.genderFemale.addEventListener('change', () => {
        populateSystemVoices();
        updatePrompt();
    });
    
    els.selectEmotion.addEventListener('change', updatePrompt);
    els.selectStyle.addEventListener('change', updatePrompt);

    [els.sliderSpeed, els.sliderPitch, els.sliderVolume, els.sliderStability, els.sliderCreativity].forEach(slider => {
        slider.addEventListener('input', () => {
            syncSliderOutputs();
            updatePrompt();
        });
    });

    // Generator Synthesis Action Trigger
    els.btnGenerate.addEventListener('click', triggerSpeechGeneration);

    // Audio Controls
    els.playerPlayPause.addEventListener('click', toggleAudioPlay);
    els.playerReplay.addEventListener('click', stopSynthesis);
    els.playerDownload.addEventListener('click', copyTextToClipboard);

    els.btnClearHistory.addEventListener('click', clearHistory);
    els.btnExport.addEventListener('click', exportSettings);
    els.btnImport.addEventListener('click', importSettings);
}

// --- VOICE SYNTHESIS ENGINE (REAL TTS CONVERSION) ---
function triggerSpeechGeneration() {
    const textToSynthesize = els.scriptInput.value.trim() || els.scriptInput.placeholder;

    // Terminate existing speech instances
    if (synth.speaking) {
        synth.cancel();
    }

    // Toggle button state to Loading Animation
    els.btnGenerate.disabled = true;
    els.btnGenerate.querySelector('.btn-label').classList.add('hidden');
    els.btnGenerate.querySelector('.loading-ring-container').classList.remove('hidden');

    showToast("Processing voice configurations...");

    setTimeout(() => {
        showToast("Synthesizing neural speech wave...");
        
        setTimeout(() => {
            const selectedVoiceName = els.selectAccent.value;
            const targetVoice = voicesList.find(voice => voice.name === selectedVoiceName);

            // Construct synthesis utterance object
            const utterance = new SpeechSynthesisUtterance(textToSynthesize);
            if (targetVoice) {
                utterance.voice = targetVoice;
            }

            // --- ACOUSTIC PARAMETERS TUNING ---
            let baseRate = parseFloat(els.sliderSpeed.value);
            let basePitch = parseFloat(els.sliderPitch.value);
            let baseVolume = parseFloat(els.sliderVolume.value) / 100;

            // --- EMOTION SIMULATION SYSTEM ---
            const emotion = els.selectEmotion.value;
            switch(emotion) {
                case 'Happy':
                    baseRate += 0.15;
                    basePitch += 0.2;
                    break;
                case 'Sad':
                    baseRate -= 0.15;
                    basePitch -= 0.15;
                    break;
                case 'Angry':
                    baseRate += 0.15;
                    basePitch -= 0.1;
                    baseVolume = Math.min(baseVolume * 1.2, 1.0);
                    break;
                case 'Calm':
                    baseRate -= 0.05;
                    baseVolume *= 0.9;
                    break;
                case 'Excited':
                    baseRate += 0.25;
                    basePitch += 0.25;
                    break;
                case 'Whispering':
                    baseRate -= 0.15;
                    basePitch -= 0.1;
                    baseVolume *= 0.55;
                    break;
                case 'Serious':
                    baseRate -= 0.05;
                    basePitch -= 0.1;
                    break;
                case 'Motivational':
                    baseRate += 0.05;
                    basePitch += 0.05;
                    break;
                case 'Fearful':
                    baseRate += 0.1;
                    basePitch += 0.15;
                    break;
                case 'Romantic':
                    baseRate -= 0.1;
                    baseVolume *= 0.85;
                    break;
            }

            utterance.rate = Math.max(0.1, Math.min(baseRate, 10));
            utterance.pitch = Math.max(0, Math.min(basePitch, 2));
            utterance.volume = Math.max(0, Math.min(baseVolume, 1));

            // --- SYSTEM HOOKS AND METRIC TRACKING ---
            state.textLength = textToSynthesize.length;
            state.currentUtterance = utterance;

            utterance.onboundary = (event) => {
                if (event.name === 'word') {
                    const progress = (event.charIndex / state.textLength) * 100;
                    updateTimelineUI(progress);
                }
            };

            utterance.onstart = () => {
                state.isPlaying = true;
                state.isPaused = false;
                syncPlayerButtonUI();
                renderWaveformAnimation();
            };

            utterance.onend = () => {
                state.isPlaying = false;
                state.isPaused = false;
                syncPlayerButtonUI();
                updateTimelineUI(100);
                cancelAnimationFrame(state.animationFrameId);
                clearCanvasWave();
            };

            utterance.onerror = () => {
                state.isPlaying = false;
                state.isPaused = false;
                syncPlayerButtonUI();
                cancelAnimationFrame(state.animationFrameId);
                clearCanvasWave();
            };

            // Trigger real TTS spoken voice output
            synth.speak(utterance);

            // Complete Generation flow
            const selectedVoiceCleanName = targetVoice ? targetVoice.name : 'System Default';
            const historyItem = {
                id: 'aura-' + Date.now(),
                text: textToSynthesize,
                language: els.selectLang.value,
                accent: selectedVoiceCleanName,
                gender: els.genderMale.checked ? 'Male' : 'Female',
                style: els.selectStyle.value,
                timestamp: new Date().toLocaleDateString() + ' ' + new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
                parameters: {
                    speed: baseRate,
                    pitch: basePitch,
                    volume: baseVolume
                }
            };

            completeGeneration(historyItem);

        }, 1200);
    }, 1000);
}

function completeGeneration(data) {
    // Reset generation button states
    els.btnGenerate.disabled = false;
    els.btnGenerate.querySelector('.btn-label').classList.remove('hidden');
    els.btnGenerate.querySelector('.loading-ring-container').classList.add('hidden');

    showToast("Voice synthesized successfully!", "success");

    // Add generated record into local storage and UI history
    state.history.unshift(data);
    localStorage.setItem('aura-history', JSON.stringify(state.history));
    
    // Enable and load custom player state
    els.playerCard.classList.remove('disabled');
    initWaveCanvas();
    loadHistory();
}

// --- PLAYBACK CONTROLS REDIRECTS (WEB SPEECH API MAPS) ---
function toggleAudioPlay() {
    if (!state.currentUtterance) return;

    if (state.isPlaying) {
        if (state.isPaused) {
            synth.resume();
            state.isPaused = false;
            renderWaveformAnimation();
        } else {
            synth.pause();
            state.isPaused = true;
            cancelAnimationFrame(state.animationFrameId);
        }
    } else {
        // Restart speech from the input if totally stopped
        triggerSpeechGeneration();
    }
    syncPlayerButtonUI();
}

function stopSynthesis() {
    if (synth.speaking) {
        synth.cancel();
    }
    state.isPlaying = false;
    state.isPaused = false;
    syncPlayerButtonUI();
    updateTimelineUI(0);
    cancelAnimationFrame(state.animationFrameId);
    clearCanvasWave();
    showToast("Synthesis reset");
}

function syncPlayerButtonUI() {
    if (state.isPlaying && !state.isPaused) {
        els.playerPlayPause.querySelector('.play-icon').classList.add('hidden');
        els.playerPlayPause.querySelector('.pause-icon').classList.remove('hidden');
    } else {
        els.playerPlayPause.querySelector('.play-icon').classList.remove('hidden');
        els.playerPlayPause.querySelector('.pause-icon').classList.add('hidden');
    }
}

function updateTimelineUI(percent) {
    const fixedPercent = Math.min(100, Math.max(0, Math.round(percent)));
    els.playerProgressBar.style.width = `${fixedPercent}%`;
    els.playerTimeCurrent.innerText = `${fixedPercent}%`;
}

function copyTextToClipboard() {
    const textToCopy = els.scriptInput.value.trim() || els.scriptInput.placeholder;
    navigator.clipboard.writeText(textToCopy).then(() => {
        showToast("Script text copied to clipboard!", "success");
    }).catch(() => {
        showToast("Failed to copy script to clipboard.", "error");
    });
}

// --- DYNAMIC AUDIO WAVEFORM VISUALIZATION ---
function initWaveCanvas() {
    const dpr = window.devicePixelRatio || 1;
    els.waveformCanvas.width = els.waveformCanvas.offsetWidth * dpr;
    els.waveformCanvas.height = els.waveformCanvas.offsetHeight * dpr;
    const ctx = els.waveformCanvas.getContext('2d');
    ctx.scale(dpr, dpr);
    clearCanvasWave();
}

function clearCanvasWave() {
    const ctx = els.waveformCanvas.getContext('2d');
    const w = els.waveformCanvas.width / (window.devicePixelRatio || 1);
    const h = els.waveformCanvas.height / (window.devicePixelRatio || 1);
    ctx.clearRect(0, 0, w, h);
    ctx.strokeStyle = state.theme === 'dark' ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.1)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(0, h/2);
    ctx.lineTo(w, h/2);
    ctx.stroke();
}

function renderWaveformAnimation() {
    if (!state.isPlaying || state.isPaused) return;

    const ctx = els.waveformCanvas.getContext('2d');
    const w = els.waveformCanvas.width / (window.devicePixelRatio || 1);
    const h = els.waveformCanvas.height / (window.devicePixelRatio || 1);
    
    ctx.clearRect(0, 0, w, h);

    // Render continuous dynamic frequency wave
    ctx.beginPath();
    ctx.lineWidth = 2.5;
    
    const gradient = ctx.createLinearGradient(0, 0, w, 0);
    gradient.addColorStop(0, '#8b5cf6');
    gradient.addColorStop(0.5, '#06b6d4');
    gradient.addColorStop(1, '#8b5cf6');
    ctx.strokeStyle = gradient;

    const segments = 45;
    const sliceWidth = w / segments;
    ctx.moveTo(0, h / 2);

    for (let i = 0; i <= segments; i++) {
        const x = i * sliceWidth;
        const noise = Math.sin(i * 0.35 + Date.now() * 0.015) * Math.cos(i * 0.15 - Date.now() * 0.008);
        const amplitude = Math.abs(noise) * (h * 0.35);
        const y = h / 2 + (noise * amplitude);
        
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
    }
    ctx.stroke();

    state.animationFrameId = requestAnimationFrame(renderWaveformAnimation);
}

// --- SESSION HISTORY LOG ENGINE ---
function loadHistory() {
    els.historyContainer.innerHTML = '';
    
    if (state.history.length === 0) {
        els.emptyHistoryText.classList.remove('hidden');
        return;
    }
    els.emptyHistoryText.classList.add('hidden');

    state.history.forEach((item) => {
        const histCard = document.createElement('div');
        histCard.className = 'history-item';
        
        histCard.innerHTML = `
            <div class="history-info">
                <div class="history-text">${item.text}</div>
                <div class="history-meta">${item.accent.split(' (')[0]} • ${item.gender} • ${item.style} • ${item.timestamp}</div>
            </div>
            <button class="player-btn-small" title="Replay Spoken Voice Segment">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>
            </button>
        `;

        histCard.querySelector('.player-btn-small').addEventListener('click', () => {
            els.scriptInput.value = item.text;
            const textLen = item.text.length;
            els.charCounter.innerText = `${textLen} / 1000 characters`;
            
            // Re-apply configurations of history item
            els.selectLang.value = item.language;
            populateSystemVoices();
            els.selectAccent.value = item.accent;
            
            if (item.gender === 'Male') {
                els.genderMale.checked = true;
            } else {
                els.genderFemale.checked = true;
            }

            els.sliderSpeed.value = item.parameters.speed;
            els.sliderPitch.value = item.parameters.pitch;
            els.sliderVolume.value = Math.round(item.parameters.volume * 100);

            syncSliderOutputs();
            updatePrompt();
            triggerSpeechGeneration();
        });

        els.historyContainer.appendChild(histCard);
    });
}

function clearHistory() {
    state.history = [];
    localStorage.removeItem('aura-history');
    loadHistory();
    showToast("History log cleared");
}

// --- CONFIGURATION PROFILE PORTABILITY SYSTEM ---
function exportSettings() {
    const currentConfig = {
        language: els.selectLang.value,
        accent: els.selectAccent.value,
        gender: els.genderMale.checked ? 'Male' : 'Female',
        emotion: els.selectEmotion.value,
        style: els.selectStyle.value,
        speed: parseFloat(els.sliderSpeed.value),
        pitch: parseFloat(els.sliderPitch.value),
        volume: parseFloat(els.sliderVolume.value),
        stability: parseFloat(els.sliderStability.value),
        creativity: parseFloat(els.sliderCreativity.value)
    };

    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(currentConfig, null, 2));
    const dlAnchor = document.createElement('a');
    dlAnchor.setAttribute("href", dataStr);
    dlAnchor.setAttribute("download", "aura-voice-profile.json");
    document.body.appendChild(dlAnchor);
    dlAnchor.click();
    dlAnchor.remove();
    showToast("Voice Profile Exported");
}

function importSettings() {
    const fileSelector = document.createElement('input');
    fileSelector.type = 'file';
    fileSelector.accept = '.json';
    fileSelector.onchange = (e) => {
        const file = e.target.files[0];
        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const parsed = JSON.parse(event.target.result);
                
                els.selectLang.value = parsed.language || 'English';
                populateSystemVoices();
                els.selectAccent.value = parsed.accent || '';
                
                if (parsed.gender === 'Male') {
                    els.genderMale.checked = true;
                } else {
                    els.genderFemale.checked = true;
                }
                
                els.selectEmotion.value = parsed.emotion || 'Calm';
                els.selectStyle.value = parsed.style || 'Podcast';
                els.sliderSpeed.value = parsed.speed || 1.0;
                els.sliderPitch.value = parsed.pitch || 1.0;
                els.sliderVolume.value = parsed.volume || 90;
                els.sliderStability.value = parsed.stability || 75;
                els.sliderCreativity.value = parsed.creativity || 85;

                syncSliderOutputs();
                updatePrompt();
                setScriptPlaceholder(parsed.language);
                showToast("Configuration profiles applied", "success");
            } catch (err) {
                showToast("Error processing profile configuration structure", "error");
            }
        };
        reader.readAsText(file);
    };
    fileSelector.click();
}

// --- TOAST NOTIFICATION UTILITY ---
function showToast(message, type = "info") {
    const toast = document.createElement('div');
    toast.className = 'toast';
    
    let icon = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>';
    if (type === 'success') {
        icon = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#22c55e" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>';
    }

    toast.innerHTML = `
        ${icon}
        <span>${message}</span>
    `;

    els.toastContainer.appendChild(toast);

    setTimeout(() => {
        toast.classList.add('removing');
        toast.addEventListener('animationend', () => toast.remove());
    }, 4000);
}