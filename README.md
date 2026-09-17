# 🎵 TerminalVibes

> Real-time music generated from your coding activity.

TerminalVibes is a Chrome extension + Python music engine that turns your coding activity into a dynamic soundtrack.

It analyzes things like **typing speed, programming language, coding state, and pauses** to dynamically control the genre, BPM, mood, and intensity of the music while you code.

---

## 📸 Preview

![TerminalVibes Overlay](./docs/terminalvibes-overlay.png)

The overlay displays the current:

- 🎵 Genre
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
- 💻 Programming-language based genres
- 🔄 Continuous music generation
- 🌐 WebSocket-based real-time communication
- 🎛️ Live overlay with music controls
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
