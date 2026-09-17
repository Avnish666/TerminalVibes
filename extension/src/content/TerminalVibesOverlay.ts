import { startMusic, stopMusic, setMusicVolume } from "../musicSocket";

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
        <span class="tv-logo">
          <i></i><i></i><i></i><i></i>
        </span>

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
      <div class="tv-genre">
        Waiting...
      </div>

      <div class="tv-details">
        <span class="tv-bpm">0 BPM</span>
        <span class="tv-sep">•</span>
        <span class="tv-mood">Waiting...</span>
      </div>

      <div class="tv-intensity-section">
        <div class="tv-section-header">
          <span>Intensity</span>
          <span class="tv-intensity-value">0%</span>
        </div>

        <div class="tv-intensity-bar">
          <div class="tv-intensity-fill"></div>
        </div>
      </div>
    </div>

    <div class="tv-volume-section">
      <div class="tv-section-header">
        <span>Volume</span>
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
        Play
      </button>

      <button class="tv-stop-button">
        Stop
      </button>
    </div>

    <div class="tv-footer">
      <span>Segment <span class="tv-segment">0</span></span>
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
      --tv-panel: #1c1b1e;
      --tv-panel-low: #131215;
      --tv-screen: #0c0b0d;
      --tv-line: #302e33;
      --tv-ink: #ece7df;
      --tv-muted: #8a8590;
      --tv-lamp: #f0913a;
      --tv-lamp-hi: #ffce8a;

      position: fixed;
      top: 90px;
      right: 20px;

      width: 268px;

      padding: 14px 14px 12px;

      box-sizing: border-box;

      background:
        linear-gradient(180deg, var(--tv-panel) 0%, var(--tv-panel-low) 100%);

      color: var(--tv-ink);

      border: 1px solid #000000;

      border-radius: 8px;

      box-shadow:
        inset 0 1px 0 rgba(255, 255, 255, 0.07),
        inset 0 -1px 0 rgba(0, 0, 0, 0.5),
        0 18px 40px rgba(0, 0, 0, 0.5);

      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
        Helvetica, Arial, sans-serif;

      font-size: 12px;

      line-height: 1.35;

      z-index: 2147483647;

      user-select: none;
    }

    #terminalvibes-overlay * {
      box-sizing: border-box;
    }

    #terminalvibes-overlay :focus-visible {
      outline: 2px solid var(--tv-lamp);
      outline-offset: 2px;
    }

    .tv-header {
      display: flex;

      align-items: center;

      justify-content: space-between;

      padding-bottom: 11px;

      margin-bottom: 11px;

      border-bottom: 1px solid var(--tv-line);
    }

    .tv-title {
      display: flex;

      align-items: center;

      gap: 10px;
    }

    /* Four bars, like a level meter on the front of a deck */
    .tv-logo {
      display: flex;

      align-items: flex-end;

      gap: 2px;

      width: 20px;

      height: 18px;
    }

    .tv-logo i {
      flex: 1;

      background: #4a464e;

      border-radius: 1px;
    }

    .tv-logo i:nth-child(1) { height: 45%; }
    .tv-logo i:nth-child(2) { height: 100%; }
    .tv-logo i:nth-child(3) { height: 65%; }
    .tv-logo i:nth-child(4) { height: 30%; }

    #terminalvibes-overlay.tv-on .tv-logo i {
      background: var(--tv-lamp);
    }

    .tv-name {
      font-size: 13px;

      font-weight: 600;

      letter-spacing: -0.01em;
    }

    .tv-subtitle {
      margin-top: 1px;

      color: var(--tv-muted);

      font-size: 10px;
    }

    .tv-status {
      display: flex;

      align-items: center;

      gap: 6px;

      color: var(--tv-muted);

      font-size: 10px;
    }

    /* Logic still writes PLAYING / STOPPED; this just renders it quietly */
    .tv-status-text {
      text-transform: lowercase;

      font-variant: small-caps;

      letter-spacing: 0.02em;
    }

    .tv-status-dot {
      width: 6px;

      height: 6px;

      border-radius: 50%;

      background: #3d3940;

      box-shadow: inset 0 0 0 1px rgba(0, 0, 0, 0.6);
    }

    .tv-status-dot.playing {
      background: var(--tv-lamp);

      box-shadow:
        inset 0 0 0 1px rgba(0, 0, 0, 0.35),
        0 0 7px rgba(240, 145, 58, 0.75);
    }

    /* The readout — recessed, lit, the one loud thing in the panel */
    .tv-now-playing {
      padding: 12px 12px 13px;

      margin-bottom: 13px;

      border-radius: 5px;

      background: var(--tv-screen);

      box-shadow:
        inset 0 1px 3px rgba(0, 0, 0, 0.9),
        0 1px 0 rgba(255, 255, 255, 0.05);
    }

    .tv-genre {
      color: var(--tv-lamp-hi);

      font-size: 21px;

      font-weight: 600;

      letter-spacing: -0.02em;

      line-height: 1.1;

      text-transform: capitalize;

      text-shadow: 0 0 14px rgba(240, 145, 58, 0.35);
    }

    .tv-details {
      display: flex;

      align-items: center;

      gap: 7px;

      margin-top: 5px;

      color: var(--tv-muted);

      font-size: 11px;

      text-transform: lowercase;
    }

    .tv-sep {
      width: 1px;

      height: 9px;

      overflow: hidden;

      background: #3a363d;

      text-indent: -20px;
    }

    .tv-intensity-section {
      margin-top: 12px;
    }

    .tv-volume-section {
      margin-bottom: 12px;
    }

    .tv-section-header {
      display: flex;

      justify-content: space-between;

      margin-bottom: 6px;

      color: var(--tv-muted);

      font-size: 10px;
    }

    .tv-intensity-value,
    .tv-volume-value {
      color: #b4aeb8;

      font-variant-numeric: tabular-nums;
    }

    /* Segmented meter: solid fill, notched back out by the overlay */
    .tv-intensity-bar {
      position: relative;

      width: 100%;

      height: 8px;

      overflow: hidden;

      border-radius: 2px;

      background: #201e23;

      box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.8);
    }

    .tv-intensity-fill {
      width: 0%;

      height: 100%;

      background: linear-gradient(90deg, #d97a2a 0%, var(--tv-lamp-hi) 100%);

      transition: width 0.3s ease;
    }

    .tv-intensity-bar::after {
      content: "";

      position: absolute;

      inset: 0;

      background: repeating-linear-gradient(
        90deg,
        transparent 0 7px,
        var(--tv-screen) 7px 10px
      );

      pointer-events: none;
    }

    .tv-volume-slider {
      -webkit-appearance: none;

      appearance: none;

      width: 100%;

      height: 14px;

      background: transparent;

      cursor: pointer;
    }

    .tv-volume-slider::-webkit-slider-runnable-track {
      height: 3px;

      border-radius: 2px;

      background: #2a272d;

      box-shadow: inset 0 1px 1px rgba(0, 0, 0, 0.8);
    }

    .tv-volume-slider::-moz-range-track {
      height: 3px;

      border-radius: 2px;

      background: #2a272d;
    }

    /* Fader cap rather than a round dot */
    .tv-volume-slider::-webkit-slider-thumb {
      -webkit-appearance: none;

      width: 11px;

      height: 16px;

      margin-top: -6px;

      border: 1px solid #000000;

      border-radius: 2px;

      background:
        repeating-linear-gradient(
          180deg,
          #6e6874 0 1px,
          #565060 1px 3px
        );
    }

    .tv-volume-slider::-moz-range-thumb {
      width: 11px;

      height: 16px;

      border: 1px solid #000000;

      border-radius: 2px;

      background: #5f5968;
    }

    .tv-controls {
      display: flex;

      gap: 8px;
    }

    .tv-controls button {
      flex: 1;

      padding: 8px 6px;

      border: 1px solid #000000;

      border-radius: 4px;

      font-family: inherit;

      font-size: 11.5px;

      font-weight: 600;

      cursor: pointer;
    }

    .tv-start-button {
      color: #1a1207;

      background: linear-gradient(180deg, var(--tv-lamp-hi), #e08a33);

      box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.4);
    }

    .tv-start-button:hover {
      background: linear-gradient(180deg, #ffdca6, #ea9640);
    }

    .tv-stop-button {
      color: #cfc8d2;

      background: linear-gradient(180deg, #34313a, #26242b);

      box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.07);
    }

    .tv-stop-button:hover {
      color: var(--tv-ink);

      background: linear-gradient(180deg, #3c3944, #2c2932);
    }

    .tv-controls button:active {
      box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.5);

      transform: translateY(1px);
    }

    .tv-footer {
      margin-top: 10px;

      color: #6a6570;

      font-size: 10px;

      font-variant-numeric: tabular-nums;
    }

    @media (prefers-reduced-motion: reduce) {
      #terminalvibes-overlay * {
        transition: none !important;
      }
    }
  `;

  document.head.appendChild(style);
}

function setupControls() {
  if (!overlay) {
    return;
  }

  const startButton = overlay.querySelector<HTMLButtonElement>(".tv-start-button");

  const stopButton = overlay.querySelector<HTMLButtonElement>(".tv-stop-button");

  const volumeSlider = overlay.querySelector<HTMLInputElement>(".tv-volume-slider");

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

    const target = event.target as HTMLInputElement;

    const volume = Number(target.value);

    setMusicVolume(volume / 100);

    const volumeText = overlay?.querySelector(".tv-volume-value");

    if (volumeText) {
      volumeText.textContent = `${volume}%`;
    }
  });
}

function updateUI() {
  if (!overlay) {
    return;
  }

  const statusDot = overlay.querySelector(".tv-status-dot");

  const statusText = overlay.querySelector(".tv-status-text");

  const genre = overlay.querySelector(".tv-genre");

  const bpm = overlay.querySelector(".tv-bpm");

  const mood = overlay.querySelector(".tv-mood");

  const intensityValue = overlay.querySelector(".tv-intensity-value");

  const intensityFill = overlay.querySelector(".tv-intensity-fill");

  const segment = overlay.querySelector(".tv-segment");

  if (isPlaying) {
    statusText!.textContent = "PLAYING";

    statusDot!.classList.add("playing");

    overlay.classList.add("tv-on");
  } else {
    statusText!.textContent = "STOPPED";

    statusDot!.classList.remove("playing");

    overlay.classList.remove("tv-on");
  }

  genre!.textContent = currentMusic.genre;

  bpm!.textContent = `${currentMusic.bpm} BPM`;

  mood!.textContent = currentMusic.mood;

  const intensityPercent = Math.round(currentIntensity * 100);

  intensityValue!.textContent = `${intensityPercent}%`;

  (intensityFill as HTMLElement).style.width = `${intensityPercent}%`;

  segment!.textContent = `${currentSegment}`;
}

function handleMusicParameters(event: Event) {
  const customEvent = event as CustomEvent<MusicParameters>;

  const data = customEvent.detail;

  if (data.type !== "music_parameters") {
    return;
  }

  if (data.music) {
    currentMusic = {
      genre: data.music.genre,

      bpm: data.music.bpm,

      mood: data.music.mood,
    };

    if (data.music.intensity !== undefined) {
      currentIntensity = Math.max(0, Math.min(1, data.music.intensity));
    }
  }

  if (data.segment !== undefined) {
    currentSegment = data.segment;
  }

  isPlaying = true;

  updateUI();
}

export function initializeTerminalVibesOverlay() {
  if (!document.body) {
    return;
  }

  createOverlay();

  window.addEventListener("terminalvibes:music", handleMusicParameters);
}