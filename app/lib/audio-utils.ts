export class AudioManager {
  private static enabled = false;

  static enable() {
    this.enabled = true;
    console.log('Audio enabled');
  }

  static disable() {
    this.enabled = false;
    console.log('Audio disabled');
  }

  static isSupported(): boolean {
    return 'speechSynthesis' in window;
  }

  static speak(text: string, options: { rate?: number; pitch?: number; volume?: number } = {}) {
    if (!this.enabled || !this.isSupported()) return;
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = options.rate || 1;
    utterance.pitch = options.pitch || 1;
    utterance.volume = options.volume || 1;
    
    window.speechSynthesis.speak(utterance);
  }

  static playSuccess() {
    console.log('Success sound played');
  }

  static playError() {
    console.log('Error sound played');
  }

  static playEncouragement(message: string) {
    console.log('Encouragement played:', message);
  }
}

export class EncouragementEngine {
  static getRandomEncouragement(): string {
    const encouragements = [
      "Great job!",
      "Keep it up!",
      "You're doing amazing!",
      "Fantastic work!",
      "Well done!"
    ];
    return encouragements[Math.floor(Math.random() * encouragements.length)];
  }

  static enhanceResponse(response: string): { content: string; isEncouraging: boolean; shouldCelebrate: boolean } {
    const isEncouraging = Math.random() > 0.7; // 30% chance of encouragement
    const shouldCelebrate = response.includes('successfully') || response.includes('added') || response.includes('created');
    
    return {
      content: response,
      isEncouraging,
      shouldCelebrate
    };
  }
}

export class AudioPreferences {
  enabled: boolean = false;
  volume: number = 0.5;
  autoSpeak: boolean = false;
  rate: number = 1;
  pitch: number = 1;

  static load(): AudioPreferences {
    const prefs = new AudioPreferences();
    try {
      const saved = localStorage.getItem('audioPreferences');
      if (saved) {
        Object.assign(prefs, JSON.parse(saved));
      }
    } catch (error) {
      console.warn('Failed to load audio preferences:', error);
    }
    return prefs;
  }

  static save(prefs: AudioPreferences) {
    try {
      localStorage.setItem('audioPreferences', JSON.stringify(prefs));
      console.log('Audio preferences saved:', prefs);
    } catch (error) {
      console.warn('Failed to save audio preferences:', error);
    }
  }
}
