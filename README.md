# 🎵 TerminalVibes

> Real-time music generated from your coding activity.

TerminalVibes is a Chrome extension with a Python-based music engine that turns your coding activity into a dynamic soundtrack.

It analyzes **typing speed, programming language, coding state, and pauses** to dynamically control the genre, BPM, mood, and intensity of the music while you code.

---

## 📸 Preview

<p align="center">
  <img src="Screenshot 2026-09-17 153910.png" alt="Front Page" width="900"/>
</p>


The live overlay displays:

- 🎵 Current genre
- ⏱️ BPM
- 🌙 Mood
- 🔥 Intensity
- 🔊 Volume
- 🎼 Current music segment

---

## ✨ Features

- 🎹 Real-time procedural music generation
- ⌨️ Coding activity detection
- ⚡ Typing-speed based BPM and intensity
- 🧠 Coding state detection
- 💻 Programming-language based genre selection
- 🔄 Continuous music generation
- 🌐 Real-time WebSocket communication
- 🎛️ Live coding overlay
- 🔊 Adjustable volume
- ▶️ Start / Stop controls
- 🎼 Melody continuity between generated segments

---

## 🎧 How It Works

```text
        Coding Activity
              │
              ▼
      ┌─────────────────┐
      │ Activity Tracker │
      └────────┬────────┘
               │
       WPM / Language /
       State / Pause
               │
               ▼
      ┌─────────────────┐
      │ Activity Mapper │
      └────────┬────────┘
               │
        Genre / BPM /
        Mood / Intensity
               │
               ▼
      ┌─────────────────┐
      │ Music Generator │
      └────────┬────────┘
               │
        MIDI + Audio
               │
               ▼
      ┌─────────────────┐
      │  FastAPI Server │
      └────────┬────────┘
               │
          WebSocket
               │
               ▼
      ┌─────────────────┐
      │ Chrome Extension│
      └────────┬────────┘
               │
               ▼
              🎵
```

---

## 🎼 Activity → Music

TerminalVibes maps coding activity to different musical parameters.

### Programming Language

| Language | Genre |
|----------|-------|
| Python | Lo-Fi |
| Java | Synthwave |
| JavaScript | EDM |
| TypeScript | EDM |
| C / C++ | Synthwave |

### Typing Speed

Typing speed influences the BPM and intensity of the generated music.

| WPM | BPM |
|-----|-----|
| < 30 | 70 |
| 30–49 | 85 |
| 50–69 | 100 |
| 70–89 | 115 |
| 90+ | 130 |

### Coding State

The system detects different activity states:

- **Active** — actively typing
- **Thinking** — longer pauses while coding
- **Idle** — no coding activity

These states influence the mood and intensity of the generated music.

---

## 🛠️ Tech Stack

### Chrome Extension

- React
- TypeScript
- Vite
- Chrome Extension Manifest V3
- Web Audio API

### Music Engine

- Python
- FastAPI
- WebSockets
- music21
- NumPy

### Deployment

- GitHub
- Render

---

## 📁 Project Structure

```text
TerminalVibes/
│
├── extension/
│   ├── src/
│   │   ├── content/
│   │   │   ├── ActivityTracker.ts
│   │   │   ├── ActivityStateDetector.ts
│   │   │   ├── LanguageDetector.ts
│   │   │   ├── CodingDetector.ts
│   │   │   ├── TerminalVibesOverlay.ts
│   │   │   └── ...
│   │   │
│   │   ├── App.tsx
│   │   └── musicSocket.ts
│   │
│   ├── public/
│   │   ├── manifest.json
│   │   └── ...
│   │
│   ├── package.json
│   └── ...
│
├── music-engine/
│   ├── generator/
│   │   ├── midi_generator.py
│   │   ├── music_generator.py
│   │   ├── melody_generator.py
│   │   ├── rhythm_generator.py
│   │   └── bass_generator.py
│   │
│   ├── mapping/
│   │   └── activity_mapper.py
│   │
│   ├── session/
│   │   └── music_session.py
│   │
│   ├── app.py
│   └── requirements.txt
│
├── docs/
│   └── terminalvibes-overlay.png
│
├── README.md
└── .gitignore
```

---

# 🚀 Getting Started

## 1. Clone the Repository

```bash
git clone https://github.com/Avnish666/TerminalVibes.git
cd TerminalVibes
```

---

# 🐍 Running the Music Engine Locally

Navigate to the music engine:

```bash
cd music-engine
```

### Create a Virtual Environment

```bash
python -m venv venv
```

### Activate the Virtual Environment

#### Windows

```bash
venv\Scripts\activate
```

#### macOS / Linux

```bash
source venv/bin/activate
```

### Install Dependencies

```bash
pip install -r requirements.txt
```

### Start the FastAPI Server

```bash
uvicorn app:app --reload
```

The music engine will run locally at:

```text
http://127.0.0.1:8000
```

You can verify that the server is running by opening:

```text
http://127.0.0.1:8000/
```

You should receive:

```json
{
  "service": "TerminalVibes Music Engine",
  "status": "running"
}
```

---

# 🧩 Building the Chrome Extension

Open a **new terminal** while keeping the music engine running.

Navigate to the extension:

```bash
cd extension
```

### Install Dependencies

```bash
npm install
```

### Build the Extension

```bash
npm run build
```

This creates the production build inside:

```text
extension/dist
```

---

# 🌐 Load the Extension in Chrome

Open Chrome and navigate to:

```text
chrome://extensions
```

### Steps

1. Enable **Developer mode**.
2. Click **Load unpacked**.
3. Select the following folder:

```text
extension/dist
```

4. The **TerminalVibes** extension should now appear in your extensions list.
5. Open a supported coding website.
6. Start coding.

The TerminalVibes overlay will appear on the page and connect to the music engine.

---

# 🎵 Using TerminalVibes

Once the extension is loaded:

```text
Open supported coding website
          ↓
      Start coding
          ↓
Activity is detected
          ↓
Music parameters are generated
          ↓
Music engine generates audio
          ↓
Audio is streamed to browser
          ↓
        🎵 Music
```

The overlay provides controls for:

- Starting the music
- Stopping the music
- Adjusting volume
- Viewing the current genre
- Viewing BPM
- Viewing mood
- Viewing intensity
- Viewing the current music segment

---

# 🌐 Production Backend

The production music engine is deployed using Render.

### Backend

```text
https://terminalvibes.onrender.com
```

### WebSocket

```text
wss://terminalvibes.onrender.com/ws/music
```

The production extension connects to the WebSocket endpoint to receive generated music segments and real-time music parameters.

---

# 🔄 Real-Time Music Pipeline

Each coding activity update follows this pipeline:

```text
Keystroke
   ↓
ActivityTracker
   ↓
WPM Calculation
   ↓
ActivityStateDetector
   ↓
LanguageDetector
   ↓
ActivityMapper
   ↓
Genre / BPM / Mood / Intensity
   ↓
MusicSession
   ↓
MusicGenerator
   ↓
Melody + Rhythm + Bass
   ↓
MIDI Generation
   ↓
Audio Synthesis
   ↓
WAV Segment
   ↓
WebSocket
   ↓
Chrome AudioContext
   ↓
🎵 Playback
```

Generated audio segments are streamed to the extension and temporary files are cleaned up after transmission.

---

# 🎹 Music Generation

TerminalVibes generates music in short continuous segments rather than generating one long track.

Each segment is influenced by the current coding activity.

```text
Coding Activity
      │
      ├── Typing Speed ──→ BPM
      │
      ├── Language ──────→ Genre
      │
      ├── Pause ─────────→ Mood
      │
      └── Activity ──────→ Intensity
                              │
                              ▼
                       Music Generator
                              │
                 ┌────────────┼────────────┐
                 ▼            ▼            ▼
              Melody       Rhythm        Bass
                 │            │            │
                 └────────────┼────────────┘
                              ▼
                       Audio Synthesis
```

Melody information from previous segments is retained to improve continuity between generated segments.

---

# 🌐 Supported Websites

Currently supported:

- [LeetCode](https://leetcode.com/)
- [GitHub](https://github.com/)

---

# ⚙️ Development

## Backend

The backend is responsible for:

- Receiving coding activity
- Mapping activity to music parameters
- Managing the music session
- Generating MIDI
- Synthesizing audio
- Streaming generated audio through WebSockets

## Extension

The extension is responsible for:

- Detecting coding activity
- Calculating typing speed
- Detecting coding state
- Detecting programming language
- Maintaining the WebSocket connection
- Playing generated audio
- Displaying the live overlay

---

# 🔮 Future Improvements

- Support for more programming languages
- More genres and musical styles
- More sophisticated activity-to-music mapping
- Improved musical variation
- Playlist and session sharing
- Machine-learning based activity → music mapping
- Chrome Web Store release

---

# 👨‍💻 Author

**Avnish Singh**

TerminalVibes was built to explore the combination of browser extensions, real-time activity detection, procedural music generation, WebSockets, and audio synthesis.

---

# 📄 License

This project is licensed under the MIT License.
