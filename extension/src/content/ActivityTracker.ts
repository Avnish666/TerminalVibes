export interface ActivityMetrics {
    keystrokes: number;
    wpm: number;
    elapsedSeconds: number;
    lastKeyTime: number;
    pauseDuration: number;
  }
  
  export class ActivityTracker {
    private keystrokes = 0;
  
    private startTime: number | null = null;

    private lastKeyTime: number | null = null;
  
    recordKeystroke(): ActivityMetrics {
      const now = Date.now();
  
      if (this.startTime === null) {
        this.startTime = now;
      }
  
      this.keystrokes++;
  
      let elapsedSeconds = (now - this.startTime) / 1000;
  
      if (elapsedSeconds < 1) {
        elapsedSeconds = 1;
      }
  
      const words = this.keystrokes / 5;
  
      const minutes = elapsedSeconds / 60;
  
      const wpm = words / minutes;
      
  
      let pauseDuration = 0;
  
      if (this.lastKeyTime !== null) {
        pauseDuration = (now - this.lastKeyTime) / 1000;
      }
  
      this.lastKeyTime = now;
  
      return {
        keystrokes: this.keystrokes,
        wpm,
        elapsedSeconds,
        lastKeyTime: now,
        pauseDuration,
      };
    }
  }