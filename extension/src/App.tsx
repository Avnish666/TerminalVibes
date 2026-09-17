import { useEffect, useState } from "react";
import "./App.css";

interface MusicData {
  genre: string;
  bpm: number;
  mood: string;
}

interface MusicParametersMessage {
  type: string;
  music?: MusicData;
  segment?: number;
}

function App() {
  const [playing, setPlaying] = useState(false);
  const [volume, setVolume] = useState(15);

  const [music, setMusic] = useState<MusicData>({
    genre: "Waiting...",
    bpm: 0,
    mood: "Waiting...",
  });

  const [segment, setSegment] = useState(0);

  const [message, setMessage] = useState("");

  // Listen for live music parameters
  useEffect(() => {
    const handleMessage = (
      message: MusicParametersMessage
    ) => {
      console.log("🎵 Popup received:", message);

      if (
        message.type === "MUSIC_PARAMETERS" &&
        message.music
      ) {
        setMusic({
          genre: message.music.genre,
          bpm: message.music.bpm,
          mood: message.music.mood,
        });

        if (message.segment !== undefined) {
          setSegment(message.segment);
        }

        setPlaying(true);
      }
    };

    chrome.runtime.onMessage.addListener(handleMessage);

    return () => {
      chrome.runtime.onMessage.removeListener(handleMessage);
    };
  }, []);

  const sendMessage = async (message: any) => {
    const tabs = await chrome.tabs.query({
      active: true,
      currentWindow: true,
    });

    const tab = tabs[0];

    if (!tab.id) {
      setMessage("No active tab");
      return;
    }

    try {
      const response = await chrome.tabs.sendMessage(
        tab.id,
        message
      );

      console.log("📩 Response:", response);
    } catch (error) {
      console.error(
        "❌ Failed to send message:",
        error
      );

      setMessage(
        "Open LeetCode or GitHub to control TerminalVibes."
      );
    }
  };

  const handleStart = async () => {
    await sendMessage({
      type: "START_MUSIC",
    });

    setPlaying(true);
    setMessage("");
  };

  const handleStop = async () => {
    await sendMessage({
      type: "STOP_MUSIC",
    });

    setPlaying(false);
    setMessage("");
  };

  const handleVolume = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const newVolume = Number(event.target.value);

    setVolume(newVolume);

    await sendMessage({
      type: "SET_VOLUME",
      volume: newVolume / 100,
    });
  };

  return (
    <div className="terminal-vibes">

      {/* HEADER */}
      <div className="header">
        <div>
          <h1>TerminalVibes</h1>
          <p>Your coding soundtrack</p>
        </div>

        <div
          className={`status-dot ${
            playing ? "playing" : "stopped"
          }`}
        />
      </div>

      {/* NOW PLAYING */}
      <div className="now-playing">
        <span className="music-icon">
          🎵
        </span>

        <div className="music-info">
          <span className="label">
            {playing
              ? "NOW PLAYING"
              : "STOPPED"}
          </span>

          <h2>
            {playing
              ? music.genre
              : "Start your soundtrack"}
          </h2>

          <p>
            {playing
              ? `${music.bpm} BPM • ${music.mood}`
              : "Let your code control the music"}
          </p>
        </div>
      </div>

      {/* MUSIC DETAILS */}
      {playing && (
        <div className="music-details">

          <div className="detail-card">
            <span className="detail-label">
              GENRE
            </span>

            <strong>
              {music.genre}
            </strong>
          </div>

          <div className="detail-card">
            <span className="detail-label">
              BPM
            </span>

            <strong>
              {music.bpm}
            </strong>
          </div>

          <div className="detail-card">
            <span className="detail-label">
              MOOD
            </span>

            <strong>
              {music.mood}
            </strong>
          </div>

        </div>
      )}

      {/* SEGMENT */}
      {playing && (
        <div className="segment">
          🎼 Segment {segment}
        </div>
      )}

      {/* VOLUME */}
      <div className="volume-section">

        <div className="volume-header">
          <span>🔊 Volume</span>

          <span>
            {volume}%
          </span>
        </div>

        <input
          type="range"
          min="0"
          max="100"
          value={volume}
          onChange={handleVolume}
        />

      </div>

      {/* CONTROLS */}
      <div className="controls">

        <button
          className="start-button"
          onClick={handleStart}
        >
          ▶ Start
        </button>

        <button
          className="stop-button"
          onClick={handleStop}
        >
          ■ Stop
        </button>

      </div>

      {/* ERROR */}
      {message && (
        <div className="message">
          {message}
        </div>
      )}

      {/* FOOTER */}
      <div className="footer">
        <span>⚡ Real-time</span>
        <span>•</span>
        <span>🎧 Adaptive music</span>
      </div>

    </div>
  );
}

export default App;