export type ProgrammingLanguage =
  | "java"
  | "python"
  | "javascript"
  | "typescript"
  | "cpp"
  | "c"
  | "go"
  | "rust"
  | "unknown";

export class LanguageDetector {

  private readonly languageMap: Record<string, ProgrammingLanguage> = {
    java: "java",

    python: "python",
    python3: "python",

    javascript: "javascript",
    js: "javascript",

    typescript: "typescript",
    ts: "typescript",

    "c++": "cpp",
    cpp: "cpp",

    c: "c",

    go: "go",

    rust: "rust",
  };

  detect(): ProgrammingLanguage {

    // Look through buttons and comboboxes.
    const elements = document.querySelectorAll(
      'button, [role="button"], [role="combobox"]'
    );

    for (const element of elements) {
      const text = element.textContent
        ?.trim()
        .toLowerCase();

      if (!text) {
        continue;
      }

      const normalized = text.replace(/\s+/g, " ");

      if (this.languageMap[normalized]) {
        return this.languageMap[normalized];
      }
    }

    return "unknown";
  }
}