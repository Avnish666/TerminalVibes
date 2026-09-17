import {
    startMusic,
    stopMusic,
    setMusicVolume,
  } from "../musicSocket";
  
  interface MusicData {
    genre: string;
    bpm: number;
    mood: string;
  }
  
  interface MusicParameters {
    type: string;
    music?: MusicData & {
      intensity?: number;
    };
    segment?: number;
  }
  
  let overlay: HTMLDivElement | null = null;
  
  let isPlaying = false;
  
  let currentMusic: MusicData = {
    genre: "Waiting...",
    bpm: 0,
    mood: "Waiting...",
  };
  
  let currentIntensity = 0;
  
  let currentSegment = 0;
  
  function createOverlay() {
    // Prevent duplicate overlays
    if (document.getElementById("terminalvibes-overlay")) {
      return;
    }
  
    overlay = document.createElement("div");
  
    overlay.id = "terminalvibes-overlay";
  
    overlay.innerHTML = `
      <div class="tv-header">
        <div class="tv-title">
          <span class="tv-logo">🎵</span>
  
          <div>
            <div class="tv-name">TerminalVibes</div>
            <div class="tv-subtitle">Coding soundtrack</div>
          </div>
        </div>
  
        <div class="tv-status">
          <span class="tv-status-dot"></span>
          <span class="tv-status-text">STOPPED</span>
        </div>
      </div>
  
      <div class="tv-now-playing">
        <div class="tv-label">NOW PLAYING</div>
  
        <div class="tv-genre">
          Waiting...
        </div>
  
        <div class="tv-details">
          <span class="tv-bpm">0 BPM</span>
          <span>•</span>
          <span class="tv-mood">Waiting...</span>
        </div>
      </div>
  
      <div class="tv-intensity-section">
        <div class="tv-section-header">
          <span>⚡ Intensity</span>
          <span class="tv-intensity-value">0%</span>
        </div>
  
        <div class="tv-intensity-bar">
          <div class="tv-intensity-fill"></div>
        </div>
      </div>
  
      <div class="tv-volume-section">
        <div class="tv-section-header">
          <span>🔊 Volume</span>
          <span class="tv-volume-value">15%</span>
        </div>
  
        <input
          class="tv-volume-slider"
          type="range"
          min="0"
          max="100"
          value="15"
        />
      </div>
  
      <div class="tv-controls">
        <button class="tv-start-button">
          ▶ Start
        </button>
  
        <button class="tv-stop-button">
          ■ Stop
        </button>
      </div>
  
      <div class="tv-footer">
        <span>Segment <span class="tv-segment">0</span></span>
        <span>•</span>
        <span>Real-time</span>
      </div>
    `;
  
    document.body.appendChild(overlay);
  
    addStyles();
  
    setupControls();
  
    updateUI();
  }
  
  function addStyles() {
    if (document.getElementById("terminalvibes-overlay-styles")) {
      return;
    }
  
    const style = document.createElement("style");
  
    style.id = "terminalvibes-overlay-styles";
  
    style.textContent = `
      #terminalvibes-overlay {
        position: fixed;
        top: 90px;
        right: 20px;
  
        width: 280px;
  
        padding: 16px;
  
        box-sizing: border-box;
  
        background: #111827;
  
        color: #ffffff;
  
        border: 1px solid #374151;
  
        border-radius: 14px;
  
        box-shadow:
          0 10px 30px rgba(0, 0, 0, 0.35);
  
        font-family:
          Arial,
          Helvetica,
          sans-serif;
  
        z-index: 2147483647;
  
        user-select: none;
      }
  
      #terminalvibes-overlay * {
        box-sizing: border-box;
      }
  
      .tv-header {
        display: flex;
  
        align-items: center;
  
        justify-content: space-between;
  
        margin-bottom: 14px;
      }
  
      .tv-title {
        display: flex;
  
        align-items: center;
  
        gap: 9px;
      }
  
      .tv-logo {
        font-size: 22px;
      }
  
      .tv-name {
        font-size: 15px;
  
        font-weight: 700;
      }
  
      .tv-subtitle {
        margin-top: 2px;
  
        color: #9ca3af;
  
        font-size: 10px;
      }
  
      .tv-status {
        display: flex;
  
        align-items: center;
  
        gap: 5px;
  
        font-size: 8px;
  
        font-weight: 700;
  
        color: #9ca3af;
      }
  
      .tv-status-dot {
        width: 7px;
  
        height: 7px;
  
        border-radius: 50%;
  
        background: #6b7280;
      }
  
      .tv-status-dot.playing {
        background: #22c55e;
  
        box-shadow:
          0 0 8px #22c55e;
      }
  
      .tv-now-playing {
        padding: 13px;
  
        margin-bottom: 14px;
  
        border-radius: 10px;
  
        background: #1f2937;
      }
  
      .tv-label {
        margin-bottom: 5px;
  
        color: #22c55e;
  
        font-size: 8px;
  
        font-weight: 700;
  
        letter-spacing: 1px;
      }
  
      .tv-genre {
        margin-bottom: 4px;
  
        font-size: 19px;
  
        font-weight: 700;
  
        text-transform: capitalize;
      }
  
      .tv-details {
        display: flex;
  
        gap: 5px;
  
        color: #9ca3af;
  
        font-size: 10px;
  
        text-transform: capitalize;
      }
  
      .tv-intensity-section,
      .tv-volume-section {
        margin-bottom: 14px;
      }
  
      .tv-section-header {
        display: flex;
  
        justify-content: space-between;
  
        margin-bottom: 7px;
  
        color: #d1d5db;
  
        font-size: 10px;
      }
  
      .tv-intensity-bar {
        width: 100%;
  
        height: 7px;
  
        overflow: hidden;
  
        border-radius: 10px;
  
        background: #374151;
      }
  
      .tv-intensity-fill {
        width: 0%;
  
        height: 100%;
  
        border-radius: 10px;
  
        background: #22c55e;
  
        transition: width 0.3s ease;
      }
  
      .tv-volume-slider {
        width: 100%;
  
        height: 4px;
  
        cursor: pointer;
      }
  
      .tv-controls {
        display: flex;
  
        gap: 8px;
  
        margin-top: 4px;
      }
  
      .tv-controls button {
        flex: 1;
  
        padding: 9px 6px;
  
        border: none;
  
        border-radius: 7px;
  
        color: #ffffff;
  
        font-size: 11px;
  
        font-weight: 700;
  
        cursor: pointer;
      }
  
      .tv-start-button {
        background: #16a34a;
      }
  
      .tv-start-button:hover {
        background: #15803d;
      }
  
      .tv-stop-button {
        background: #dc2626;
      }
  
      .tv-stop-button:hover {
        background: #b91c1c;
      }
  
      .tv-footer {
        display: flex;
  
        justify-content: center;
  
        gap: 5px;
  
        margin-top: 13px;
  
        color: #6b7280;
  
        font-size: 8px;
      }
    `;
  
    document.head.appendChild(style);
  }
  
  function setupControls() {
    if (!overlay) {
      return;
    }
  
    const startButton =
      overlay.querySelector<HTMLButtonElement>(
        ".tv-start-button"
      );
  
    const stopButton =
      overlay.querySelector<HTMLButtonElement>(
        ".tv-stop-button"
      );
  
    const volumeSlider =
      overlay.querySelector<HTMLInputElement>(
        ".tv-volume-slider"
      );
  
    startButton?.addEventListener("click", async (event) => {
      event.stopPropagation();
  
      await startMusic();
  
      isPlaying = true;
  
      updateUI();
    });
  
    stopButton?.addEventListener("click", (event) => {
      event.stopPropagation();
  
      stopMusic();
  
      isPlaying = false;
  
      updateUI();
    });
  
    volumeSlider?.addEventListener("input", (event) => {
      event.stopPropagation();
  
      const target =
        event.target as HTMLInputElement;
  
      const volume =
        Number(target.value);
  
      setMusicVolume(volume / 100);
  
      const volumeText =
        overlay?.querySelector(
          ".tv-volume-value"
        );
  
      if (volumeText) {
        volumeText.textContent =
          `${volume}%`;
      }
    });
  }
  
  function updateUI() {
    if (!overlay) {
      return;
    }
  
    const statusDot =
      overlay.querySelector(
        ".tv-status-dot"
      );
  
    const statusText =
      overlay.querySelector(
        ".tv-status-text"
      );
  
    const genre =
      overlay.querySelector(
        ".tv-genre"
      );
  
    const bpm =
      overlay.querySelector(
        ".tv-bpm"
      );
  
    const mood =
      overlay.querySelector(
        ".tv-mood"
      );
  
    const intensityValue =
      overlay.querySelector(
        ".tv-intensity-value"
      );
  
    const intensityFill =
      overlay.querySelector(
        ".tv-intensity-fill"
      );
  
    const segment =
      overlay.querySelector(
        ".tv-segment"
      );
  
    if (isPlaying) {
      statusText!.textContent =
        "PLAYING";
  
      statusDot!.classList.add(
        "playing"
      );
    } else {
      statusText!.textContent =
        "STOPPED";
  
      statusDot!.classList.remove(
        "playing"
      );
    }
  
    genre!.textContent =
      currentMusic.genre;
  
    bpm!.textContent =
      `${currentMusic.bpm} BPM`;
  
    mood!.textContent =
      currentMusic.mood;
  
    const intensityPercent =
      Math.round(
        currentIntensity * 100
      );
  
    intensityValue!.textContent =
      `${intensityPercent}%`;
  
    (
      intensityFill as HTMLElement
    ).style.width =
      `${intensityPercent}%`;
  
    segment!.textContent =
      `${currentSegment}`;
  }
  
  function handleMusicParameters(
    event: Event
  ) {
    const customEvent =
      event as CustomEvent<MusicParameters>;
  
    const data =
      customEvent.detail;
  
    if (
      data.type !==
      "music_parameters"
    ) {
      return;
    }
  
    if (data.music) {
      currentMusic = {
        genre:
          data.music.genre,
  
        bpm:
          data.music.bpm,
  
        mood:
          data.music.mood,
      };
  
      if (
        data.music.intensity !==
        undefined
      ) {
        currentIntensity =
          Math.max(
            0,
            Math.min(
              1,
              data.music.intensity
            )
          );
      }
    }
  
    if (
      data.segment !==
      undefined
    ) {
      currentSegment =
        data.segment;
    }
  
    isPlaying = true;
  
    updateUI();
  }
  
  export function initializeTerminalVibesOverlay() {
    if (!document.body) {
      return;
    }
  
    createOverlay();
  
    window.addEventListener(
      "terminalvibes:music",
      handleMusicParameters
    );
  }