import type { ProgrammingLanguage } from "./LanguageDetector";
import { ActivityState } from "./ActivityState";
import type { MusicParameters } from "./MusicParameter";

export class MusicMapper {

  private getBaseProfile(
    language: ProgrammingLanguage
  ): {
    genre: string;
    baseBPM: number;
  } {

    switch (language) {

      case "python":
        return {
          genre: "lo-fi",
          baseBPM: 85,
        };

      case "java":
        return {
          genre: "synthwave",
          baseBPM: 110,
        };

      case "javascript":
        return {
          genre: "edm",
          baseBPM: 125,
        };

      case "typescript":
        return {
          genre: "electronic",
          baseBPM: 120,
        };

      case "cpp":
        return {
          genre: "cyberpunk",
          baseBPM: 115,
        };

      case "rust":
        return {
          genre: "dark-electronic",
          baseBPM: 105,
        };

      case "go":
        return {
          genre: "chillstep",
          baseBPM: 95,
        };

      case "c":
        return {
          genre: "industrial",
          baseBPM: 100,
        };

      default:
        return {
          genre: "ambient",
          baseBPM: 90,
        };
    }
  }

  map(
    language: ProgrammingLanguage,
    wpm: number,
    state: ActivityState
  ): MusicParameters {

    const profile = this.getBaseProfile(language);

    let bpm = profile.baseBPM;
    let mood = "calm";
    let intensity = 0.5;

    // --------------------------------
    // WPM → Tempo
    // --------------------------------

    if (wpm >= 90) {
      bpm += 20;
    } else if (wpm >= 60) {
      bpm += 10;
    } else if (wpm < 30) {
      bpm -= 15;
    }

    // Keep BPM within sensible boundaries
    bpm = Math.max(60, Math.min(160, bpm));


    // --------------------------------
    // Activity State → Mood
    // --------------------------------

    switch (state) {

      case ActivityState.ACTIVE:
        mood = "energetic";
        intensity = 0.8;
        break;

      case ActivityState.THINKING:
        mood = "thoughtful";
        intensity = 0.45;
        break;

      case ActivityState.IDLE:
        mood = "ambient";
        intensity = 0.15;
        break;
    }


    // --------------------------------
    // Very fast typing → more intensity
    // --------------------------------

    if (wpm >= 100) {
      intensity += 0.1;
    }

    intensity = Math.min(1, intensity);


    return {
      genre: profile.genre,
      bpm,
      mood,
      intensity,
    };
  }
}