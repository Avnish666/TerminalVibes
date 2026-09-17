# 🎵 TerminalVibes

> Real-time adaptive music generated from your coding activity.

TerminalVibes is a browser extension that turns your coding activity into a continuously generated soundtrack.

As you code, TerminalVibes analyzes your typing activity, detects your programming language and coding state, and dynamically generates music that adapts to what you're doing.

---

## ✨ Features

- 🎹 Real-time procedural music generation
- ⌨️ Coding activity detection
- 🧠 Activity state detection
- 🌐 Programming language detection
- 🎼 Genre-based music generation
- 🔥 Dynamic music intensity
- 🎵 Continuous music segments
- 🔄 Melody and chord continuity between segments
- 🎧 Crossfaded audio playback
- ▶️ Start / Stop controls
- 🔊 Volume control
- 🔌 Automatic WebSocket reconnection
- 📊 Live music information overlay

---

## 🎯 How It Works

TerminalVibes continuously observes coding activity and converts it into musical parameters.

```text
                    Coding Activity
                          │
                          ▼
                  ActivityTracker
                          │
                          ▼
              ActivityStateDetector
                          │
                          ▼
                  LanguageDetector
                          │
                          ▼
                  ActivityMapper
                          │
             ┌────────────┼────────────┐
             ▼            ▼            ▼
           Genre         BPM          Mood
             │            │            │
             └────────────┼────────────┘
                          ▼
                      Intensity
                          │
                          ▼
                    MusicSession
                          │
                          ▼
                   MusicGenerator
                    /    |    \
                   /     |     \
              Melody  Rhythm   Bass
                   \     |     /
                    \    |    /
                       Chords
                          │
                          ▼
                    MIDI / WAV
                          │
                          ▼
                    FastAPI Server
                          │
                       WebSocket
                          │
                          ▼
                 Browser Audio Engine
                          │
                          ▼
                    🎧 Soundtrack