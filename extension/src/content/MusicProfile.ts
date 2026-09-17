import type { ProgrammingLanguage } from "./LanguageDetector";

export interface MusicProfile {
  genre: string;
  baseBPM: number;
}

export function getMusicProfile(
  language: ProgrammingLanguage
): MusicProfile {

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

    default:
      return {
        genre: "ambient",
        baseBPM: 90,
      };
  }
}