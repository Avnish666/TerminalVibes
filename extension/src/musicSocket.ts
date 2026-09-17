const WS_URL = "ws://127.0.0.1:8000/ws/music";

const MAX_QUEUE_SIZE = 3;

const CROSSFADE_TIME = 0.12;

const SCHEDULE_AHEAD_TIME = 0.05;

const MASTER_VOLUME = 0.15;

const DEBUG = false;

let socket: WebSocket | null = null;

let audioContext: AudioContext | null = null;

let masterGain: GainNode | null = null;

let isPlaying = false;

let shouldReconnect = true;

let reconnectTimer: number | null = null;

const RECONNECT_DELAY = 3000;

const audioQueue: AudioBuffer[] = [];

let scheduledUntil = 0;

let previousGain: GainNode | null = null;


// Keep track of currently scheduled sources
const activeSources: AudioBufferSourceNode[] = [];


// ============================================================
// AUDIO CONTEXT
// ============================================================

function getAudioContext(): AudioContext {

  if (!audioContext) {

    audioContext = new AudioContext();

    masterGain =
      audioContext.createGain();

    masterGain.gain.value =
      MASTER_VOLUME;

    masterGain.connect(
      audioContext.destination
    );
  }

  return audioContext;
}


// ============================================================
// START AUDIO
// ============================================================

async function startAudio() {

  const context =
    getAudioContext();

  if (
    context.state === "suspended"
  ) {

    await context.resume();

  }

  isPlaying = true;

  scheduleQueuedAudio();
}


// ============================================================
// SCHEDULE ONE SEGMENT
// ============================================================

function scheduleSegment(
  audioBuffer: AudioBuffer,
  now: number
) {

  const context =
    getAudioContext();

  if (!masterGain) {
    return;
  }


  let startTime: number;

  let shouldCrossfade = false;


  // ----------------------------------------
  // First segment
  // ----------------------------------------

  if (
    scheduledUntil <=
    now + SCHEDULE_AHEAD_TIME
  ) {

    startTime =
      now + SCHEDULE_AHEAD_TIME;

  }

  // ----------------------------------------
  // Following segments
  // ----------------------------------------

  else {

    startTime =
      scheduledUntil -
      CROSSFADE_TIME;

    shouldCrossfade = true;

  }


  // ----------------------------------------
  // Create source
  // ----------------------------------------

  const source =
    context.createBufferSource();

  source.buffer =
    audioBuffer;


  // ----------------------------------------
  // Create gain
  // ----------------------------------------

  const segmentGain =
    context.createGain();


  segmentGain.gain.setValueAtTime(
    1,
    startTime
  );


  source.connect(
    segmentGain
  );

  segmentGain.connect(
    masterGain
  );


  // ----------------------------------------
  // Crossfade
  // ----------------------------------------

  if (
    shouldCrossfade &&
    previousGain !== null
  ) {

    const fadeStart =
      startTime;

    const fadeEnd =
      startTime +
      CROSSFADE_TIME;


    previousGain.gain
      .cancelScheduledValues(
        fadeStart
      );

    previousGain.gain.setValueAtTime(
      1,
      fadeStart
    );

    previousGain.gain
      .linearRampToValueAtTime(
        0,
        fadeEnd
      );


    segmentGain.gain.setValueAtTime(
      0,
      fadeStart
    );

    segmentGain.gain
      .linearRampToValueAtTime(
        1,
        fadeEnd
      );


      if (DEBUG) {
        console.log(
          "🔄 Crossfading segments"
        );
      }

  }


  // ----------------------------------------
  // Track source
  // ----------------------------------------

  activeSources.push(
    source
  );


  source.onended = () => {

    const index =
      activeSources.indexOf(
        source
      );

    if (index !== -1) {

      activeSources.splice(
        index,
        1
      );

    }

  };


  // ----------------------------------------
  // Start source
  // ----------------------------------------

  source.start(
    startTime
  );


  const endTime =
    startTime +
    audioBuffer.duration;


  scheduledUntil =
    endTime;

  previousGain =
    segmentGain;


    if (DEBUG) {
      console.log(
        "🎵 Segment scheduled:",
        startTime.toFixed(2),
        "→",
        endTime.toFixed(2)
      );
    }
}


// ============================================================
// SCHEDULE QUEUED AUDIO
// ============================================================

function scheduleQueuedAudio() {

  if (!isPlaying) {
    return;
  }


  const context =
    getAudioContext();

  const now =
    context.currentTime;


  while (
    audioQueue.length > 0
  ) {

    const audioBuffer =
      audioQueue.shift();

    if (!audioBuffer) {
      break;
    }

    scheduleSegment(
      audioBuffer,
      now
    );

  }
}


// ============================================================
// DECODE AUDIO
// ============================================================

async function decodeAudio(
  data: Blob
): Promise<AudioBuffer> {

  const context =
    getAudioContext();

  const arrayBuffer =
    await data.arrayBuffer();

  return await context.decodeAudioData(
    arrayBuffer
  );
}


// ============================================================
// CONNECT WEBSOCKET
// ============================================================

export function connectMusicSocket() {
  shouldReconnect = true;

  if (
    socket &&
    (socket.readyState === WebSocket.OPEN ||
      socket.readyState === WebSocket.CONNECTING)
  ) {
    return;
  }

  console.log("🔌 Connecting to music WebSocket...");

  socket = new WebSocket(WS_URL);
  socket.binaryType = "blob";

  socket.onopen = async () => {
    console.log("🎵 Music WebSocket connected");

    if (reconnectTimer !== null) {
      window.clearTimeout(reconnectTimer);
      reconnectTimer = null;
    }

    await startAudio();
  };

  socket.onmessage = async (event) => {
    if (typeof event.data === "string") {
      try {
        const data = JSON.parse(event.data);
    
        console.log(
          "🎵 Music parameters:",
          data
        );
    
        window.dispatchEvent(
          new CustomEvent(
            "terminalvibes:music",
            {
              detail: data,
            }
          )
        );
    
      } catch (error) {
        console.error(
          "❌ Failed to parse music JSON:",
          error
        );
      }
    
      return;
    }
    if (event.data instanceof Blob) {
      try {
        if (DEBUG) {
          console.log(
            "🔊 Audio received:",
            event.data.size,
            "bytes"
          );
        }

        const audioBuffer = await decodeAudio(event.data);

        if (DEBUG) {
          console.log(
            "🎵 Audio decoded:",
            audioBuffer.duration.toFixed(2),
            "seconds"
          );
        }

        if (audioQueue.length >= MAX_QUEUE_SIZE) {
          audioQueue.shift();

          console.log(
            "⚠️ Audio queue full, dropping oldest segment"
          );
        }

        audioQueue.push(audioBuffer);

        if (DEBUG) {
          console.log(
            "🎵 Audio queued:",
            audioQueue.length,
            "segments"
          );
        }

        await startAudio();

      } catch (error) {
        console.error("❌ Failed to decode audio:", error);
      }
    }
  };

  socket.onerror = (error) => {
    console.error("❌ Music WebSocket error:", error);
  };

  socket.onclose = () => {
    console.log("🔌 Music WebSocket disconnected");

    socket = null;

    if (!shouldReconnect) {
      console.log("🛑 Reconnect disabled — TerminalVibes was stopped");
      return;
    }

    if (reconnectTimer !== null) {
      return;
    }

    console.log(
      `🔄 Reconnecting in ${RECONNECT_DELAY / 1000} seconds...`
    );

    reconnectTimer = window.setTimeout(() => {
      reconnectTimer = null;

      if (shouldReconnect) {
        connectMusicSocket();
      }
    }, RECONNECT_DELAY);
  };
}


// ============================================================
// SEND ACTIVITY
// ============================================================

export function sendMusicActivity(
  activity: {
    wpm: number;
    language: string;
    state: string;
    pauseDuration: number;
  }
) {

  if (
    !socket ||
    socket.readyState !==
    WebSocket.OPEN
  ) {

    console.warn(
      "⚠️ Music socket not connected"
    );

    return;
  }


  socket.send(
    JSON.stringify(
      activity
    )
  );


  if (DEBUG) {
    console.log(
      "📤 Music activity sent:",
      activity
    );
  }

}


// ============================================================
// STOP MUSIC
// ============================================================

export function stopMusic() {
  console.log("⏹️ Stopping TerminalVibes...");

  shouldReconnect = false;
  isPlaying = false;

  if (reconnectTimer !== null) {
    window.clearTimeout(reconnectTimer);
    reconnectTimer = null;
  }

  for (const source of activeSources) {
    try {
      source.stop();
    } catch {
      // Source may already have ended
    }
  }

  activeSources.length = 0;
  audioQueue.length = 0;

  scheduledUntil = 0;
  previousGain = null;

  if (socket) {
    socket.close();
    socket = null;
  }

  console.log("⏹️ TerminalVibes stopped");
}


// ============================================================
// START MUSIC
// ============================================================

export async function startMusic() {
  console.log("▶️ Starting TerminalVibes...");

  shouldReconnect = true;

  if (!socket) {
    connectMusicSocket();
  } else {
    await startAudio();
  }
}
// ============================================================
// SET VOLUME
// ============================================================
export function setMusicVolume(volume: number) {
  const clampedVolume = Math.max(0, Math.min(1, volume));

  if (masterGain) {
    masterGain.gain.value = clampedVolume;
  }

  console.log(
    "🔊 Music volume:",
    Math.round(clampedVolume * 100) + "%"
  );
}
