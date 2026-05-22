# 🎙️ AI Voice Generator Studio: Models Playground

Welcome to the **AI Voice Generator Studio: Models Playground**—a premium, fully client-side suite of interactive text-to-speech dashboard interfaces. This repository serves as a showcase launcher and comparison playground featuring four distinct AI-generated interpretations of a Voice Synthesis Studio, each built by a different leading Large Language Model (**Gemini Pro**, **Gemini Flash**, **GPT**, and **Claude**).

Every studio in this suite is a fully realized, responsive, and visually stunning web application that interfaces directly with the browser's native **Web Speech API** (`speechSynthesis` and `SpeechSynthesisUtterance`) to deliver live, real-time audio playback, simulated emotional tone modulations, and highly dynamic user controls.

---

## 🧭 Live Playground Architecture

The project is structured as a hub-and-spoke model. The root directory contains an **AI Models Playground Launcher** that acts as the entry point, allowing users to effortlessly launch and compare the design aesthetics, layouts, and feature capabilities of the individual studios.

```
📁 Voice-Generator/
├── 📄 index.html             # Main Playground Launcher page
├── 📄 style.css              # Glassmorphic, modern launcher styles
├── 📄 script.js              # Animated particle background & launcher logic
│
├── 📁 claude/                # Studio 1: "VoiceForge AI" by Anthropic Claude
│   ├── 📄 index.html
│   ├── 📄 style.css
│   └── 📄 script.js
│
├── 📁 gemini_flash/          # Studio 2: "AURA Voice Studio" by Google Gemini Flash
│   ├── 📄 index.html
│   ├── 📄 style.css
│   └── 📄 script.js
│
├── 📁 gemini_pro/            # Studio 3: "SynthesiaX AI Voice Studio" by Google Gemini Pro
│   ├── 📄 index.html
│   ├── 📄 style.css
│   └── 📄 script.js
│
└── 📁 gpt/                   # Studio 4: "AI Voice Studio" by OpenAI GPT
    ├── 📄 index.html
    ├── 📄 style.css
    └── 📄 script.js
```

---

## 🛠️ Unified Technology Stack

The entire suite is engineered to be **100% serverless, zero-dependency, and fully client-side**, rendering instantly on any web browser:

1. **Voice Synthesis Core**: Uses the browser's built-in **Web Speech API** (`window.speechSynthesis`). It queries the active operating system for installed neural and system voices, making the runtime voice roster fully customizable based on the user's OS (e.g., macOS, Windows, iOS, or Android).
2. **Modern Styling**: Designed using raw CSS3, showcasing:
   - **Glassmorphism**: Translucent panels with background-blur filters (`backdrop-filter: blur()`).
   - **Fluid Layouts**: Responsive CSS Grid and Flexbox layouts built to scale seamlessly from 4K screens to mobile viewports.
   - **Dynamic Color Systems**: HSL and CSS Custom Properties for smooth dark/light theme switching.
3. **Interactive Visualizations**: Embedded HTML5 `<canvas>` rendering systems for mathematical particle backgrounds and speech-synced visualizer waveforms.
4. **Rich Typography & Icons**: Integrated Google Fonts (Inter, Space Grotesk, Plus Jakarta Sans, JetBrains Mono) and Font Awesome 6 icons.

---

## 🎛️ Detailed Studio Breakdown

Each sub-application brings a unique user interface paradigm, feature set, and acoustic tuning design:

### 1. 🟪 VoiceForge AI (Claude Studio)
* **Design Philosophy**: High-fidelity creative dark studio featuring vibrant violet-to-cyan gradients.
* **Key Visuals**:
  - Soft ambient background particles.
  - Interactive HTML5 canvas audio waveform generator.
* **Advanced Features**:
  - Live character & word counters with dynamic progress rings.
  - Highly detailed voice controls (Speed, Pitch, Volume, Stability, Creativity).
  - Quick-preset persona cards.
  - Full local-storage narrative history.
  - **JSON Configuration Sync**: Export current speech presets to a JSON file or import a saved session instantly.

### 2. 🟨 AURA Voice Studio (Gemini Flash Studio)
* **Design Philosophy**: Deep space atmospheric interface featuring yellow/gold glow highlights and futuristic typography (Space Grotesk).
* **Key Visuals**:
  - Dynamic orbital background orb with rotating ring animations.
  - Ambient particle canvas background.
* **Advanced Features**:
  - "Voice Matrix" layout for simplified configurations.
  - Real-time natural text prompt builder (describing the active voice configuration dynamically).
  - Highly robust speed, pitch, stability, volume, and clarity slider inputs.
  - Dedicated preset library and session history archive.
  - High-performance settings import and export routines.

### 3. 🟦 SynthesiaX Studio (Gemini Pro Studio)
* **Design Philosophy**: Clean, professional, developer-focused studio showcasing deep sapphire hues.
* **Key Visuals**:
  - Dynamic equal-distribution speech waveform columns that animate smoothly during active narration.
* **Advanced Features**:
  - **True OS Voice Matching**: Dynamically queries the native speech engine, parses localized languages, and registers every voice profile installed on the client's host system.
  - **Gender Preference Matching**: Features a clever heuristic parser that attempts to filter and bind male/female voice engines based on OS metadata.
  - **Simulated Acoustic Emotions**: Artificially modulates baseline rate, volume, and pitch curves depending on chosen emotions (e.g., *Excited* triggers higher pitch and rate, *Whispering* clamps volume to 30% and shifts pitch down).
  - **Word-Level Progress Seekbar**: Maps `SpeechSynthesisUtterance.onboundary` events to trace word boundaries in real-time, providing an extremely realistic synchronized progress timeline.

### 4. 🟩 AI Voice Studio (GPT Studio)
* **Design Philosophy**: Minimalist dark-mode dashboard showcasing elegant emerald highlights.
* **Key Visuals**:
  - Flowing, lightweight floating particles background.
  - Responsive retro audio playback bar.
* **Advanced Features**:
  - Streamlined dropdown matrices for quick voice selections (Language, Accent, Gender, Emotion, Speaking Style).
  - Precise numeric tuning for Speed, Pitch, Volume, Stability, and Creativity.
  - Live preview block showing the generated engine input prompt.
  - Active list-based history tracking.

---

## 📊 Feature Comparison Matrix

| Core Features | 🟪 VoiceForge (Claude) | 🟨 AURA Studio (Gemini Flash) | 🟦 SynthesiaX (Gemini Pro) | 🟩 AI Studio (GPT) |
| :--- | :---: | :---: | :---: | :---: |
| **Active Theme Mode** | Dark / Light | Dark / Light | Dark / Light | Dark / Light |
| **Accent Glow Palette** | Violet ➔ Cyan | Gold ➔ Orange | Cobalt ➔ Indigo | Emerald ➔ Teal |
| **OS System Voice Engine Loader** | Simulated Dropdown | Simulated Dropdown | **True Dynamic System Sync** | Simulated Dropdown |
| **Emotional Tuning Paradigm** | Config State | Prompt Preview | **Active Rate/Pitch Curve Shifting** | Config State |
| **Waveform Visualizer** | Canvas-based | Canvas-based | **Animated Audio Bars Grid** | Static Indicator |
| **Word-Boundary Sync** | Static Playback | Time Percentages | **Real-Time Word Boundary Timeline** | Time Percentages |
| **Data Persistence (LocalStorage)** | Yes | Yes | Yes | Yes |
| **Settings Export / Import (JSON)** | **Yes (Fully Working)** | **Yes (Fully Working)** | **Yes (Fully Working)** | **Yes (Fully Working)** |

---

## 🚀 Running the Playground Locally

Since this entire playground is built entirely on native web standards, it requires no compilers, package managers, or local server setups.

### Quick Start
1. **Clone this repository** to your local machine:
   ```bash
   git clone https://github.com/mahmoudhamdyae/Voice-Generator.git
   ```
2. Navigate into the directory and **open `index.html`** in any modern web browser:
   * Double-click `index.html` to load it via `file:///` protocol, OR
   * Use an extension like *Live Server* in VS Code, OR
   * Run a simple local HTTP server in your terminal:
     ```bash
     python -m http.server 8000
     ```
3. Visit `http://localhost:8000` in your browser.
4. Click on any model's card to launch that specific Voice Studio variant!

---

## 💡 Engine Optimization & Heuristics (Pro-Tips)

* **Browser Compatibility**: The Web Speech API is supported across all major modern desktop and mobile browsers (Chrome, Safari, Edge, Firefox).
* **OS-Specific Neural Voices**: For the most lifelike narration experience (especially in **SynthesiaX**), use operating systems with built-in neural TTS voice packages.
  * **macOS**: Siri voices and enhanced-quality speech packages provide outstanding clarity.
  * **Windows**: Microsoft's modern speech voices offer beautiful articulation.
  * **Mobile Devices**: Android and iOS feature highly polished neural engines that will register automatically in the drop-down selectors.
