import { ActivityTracker } from "./ActivityTracker";
import { ActivityStateDetector } from "./ActivityStateDetector";
import { ActivityState } from "./ActivityState";
import { LanguageDetector } from "./LanguageDetector";
import {
  initializeTerminalVibesOverlay
} from "./TerminalVibesOverlay";

import {
  connectMusicSocket,
  sendMusicActivity,
  stopMusic,
  startMusic,
  setMusicVolume
} from "../musicSocket";


const tracker = new ActivityTracker();

const stateDetector = new ActivityStateDetector();

const languageDetector = new LanguageDetector();

connectMusicSocket();
initializeTerminalVibesOverlay();


let idleTimer: number | null = null;

let currentState: ActivityState = ActivityState.IDLE;


let lastMetrics = {
  wpm: 0,
  pauseDuration: 0,
};


let lastLanguage = "unknown";

let lastSentTime = 0;

const SEND_INTERVAL = 2000;
const DEBUG = false;

console.log(
  "🔥🔥🔥 TERMINALVIBES V7 LOADED 🔥🔥🔥"
);


// ============================================================
// STATE CHANGE
// ============================================================

function changeState(
  newState: ActivityState
) {

  if (currentState === newState) {
    return;
  }

  console.log(
    "🎵 State changed:",
    {
      from: currentState,
      to: newState,
    }
  );

  currentState = newState;
}


// ============================================================
// SEND ACTIVITY TO MUSIC ENGINE
// ============================================================

function sendCurrentActivity(
  wpm: number,
  pauseDuration: number,
  language: string
) {

  sendMusicActivity({

    wpm,

    language,

    state: currentState,

    pauseDuration,

  });
}


// ============================================================
// IDLE STATE
// ============================================================

function handleIdleState() {

  changeState(
    ActivityState.IDLE
  );

  console.log(
    "💤 TerminalVibes became IDLE"
  );

  sendCurrentActivity(

    lastMetrics.wpm,

    8,

    lastLanguage

  );
}


// ============================================================
// KEYBOARD ACTIVITY
// ============================================================

document.addEventListener(
  "keydown",
  (event) => {

    // ----------------------------------------
    // Ignore modifier keys
    // ----------------------------------------

    if (
      event.key === "Shift" ||
      event.key === "Control" ||
      event.key === "Alt" ||
      event.key === "Meta" ||
      event.key === "CapsLock"
    ) {

      return;

    }


    // ----------------------------------------
    // Record keystroke
    // ----------------------------------------

    const metrics =
      tracker.recordKeystroke();


    // ----------------------------------------
    // Detect state
    // ----------------------------------------

    const detectedState =
      stateDetector.detect(
        metrics.pauseDuration
      );


    changeState(
      detectedState
    );


    // ----------------------------------------
    // Detect language
    // ----------------------------------------

    const language =
      languageDetector.detect();


    // ----------------------------------------
    // Save latest metrics
    // ----------------------------------------

    lastMetrics = {

      wpm: metrics.wpm,

      pauseDuration:
        metrics.pauseDuration,

    };


    lastLanguage =
      language;


    // ----------------------------------------
    // Send activity every 2 seconds
    // ----------------------------------------

    const now =
      Date.now();


    if (
      now - lastSentTime >=
      SEND_INTERVAL
    ) {

      lastSentTime = now;


      sendCurrentActivity(

        metrics.wpm,

        metrics.pauseDuration,

        language

      );

    }


    // ----------------------------------------
    // Debug information
    // ----------------------------------------

    if (DEBUG) {
      console.log(
        "🎵 TerminalVibes Activity:",
        {
          keystrokes:
            metrics.keystrokes,
    
          wpm:
            metrics.wpm.toFixed(1),
    
          elapsedSeconds:
            metrics.elapsedSeconds.toFixed(1),
    
          pauseDuration:
            metrics.pauseDuration.toFixed(1),
    
          state:
            currentState,
    
          language,
        }
      );
    }


    // ----------------------------------------
    // Reset idle timer
    // ----------------------------------------

    if (
      idleTimer !== null
    ) {

      window.clearTimeout(
        idleTimer
      );

    }


    idleTimer =
      window.setTimeout(
        () => {

          handleIdleState();

        },
        8000
      );

  }
);

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  console.log("📩 TerminalVibes message:", message);

  if (message.type === "START_MUSIC") {
    startMusic();

    sendResponse({
      success: true
    });

    return true;
  }

  if (message.type === "STOP_MUSIC") {
    stopMusic();

    sendResponse({
      success: true
    });

    return true;
  }

  if (message.type === "SET_VOLUME") {
    setMusicVolume(message.volume);

    sendResponse({
      success: true
    });

    return true;
  }

  return false;
});