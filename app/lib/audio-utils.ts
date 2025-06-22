// Audio utility functions for TTS and encouraging responses
export class AudioManager {
  private synth: SpeechSynthesis;
  private isEnabled: boolean = false;
  private voice: SpeechSynthesisVoice | null = null;

  constructor() {
    this.synth = window.speechSynthesis;
    this.initializeVoices();
  }

  private initializeVoices() {
    // Wait for voices to load
    if (this.synth.getVoices().length === 0) {
      this.synth.addEventListener('voiceschanged', () => {
        this.selectBestVoice();
      });
    } else {
      this.selectBestVoice();
    }
  }

  private selectBestVoice() {
    const voices = this.synth.getVoices();
    // Prefer female voices for encouraging tone, English voices
    this.voice = voices.find(voice => 
      voice.lang.startsWith('en') && voice.name.includes('Female')
    ) || voices.find(voice => 
      voice.lang.startsWith('en')
    ) || voices[0];
  }

  public enable() {
    this.isEnabled = true;
  }

  public disable() {
    this.isEnabled = false;
    this.stop();
  }

  public toggle() {
    this.isEnabled = !this.isEnabled;
    if (!this.isEnabled) this.stop();
  }

  public speak(text: string, options: { 
    rate?: number, 
    pitch?: number, 
    volume?: number,
    isEncouraging?: boolean 
  } = {}) {
    if (!this.isEnabled) return;

    this.stop(); // Stop any current speech

    const utterance = new SpeechSynthesisUtterance(text);
    
    if (this.voice) {
      utterance.voice = this.voice;
    }

    // Adjust tone for encouraging messages
    if (options.isEncouraging) {
      utterance.rate = options.rate || 0.9; // Slightly slower for emphasis
      utterance.pitch = options.pitch || 1.1; // Slightly higher for positivity
      utterance.volume = options.volume || 0.8;
    } else {
      utterance.rate = options.rate || 1.0;
      utterance.pitch = options.pitch || 1.0;
      utterance.volume = options.volume || 0.7;
    }

    this.synth.speak(utterance);
  }

  public stop() {
    this.synth.cancel();
  }

  public isSupported(): boolean {
    return 'speechSynthesis' in window;
  }

  public isCurrentlyEnabled(): boolean {
    return this.isEnabled;
  }
}

// Encouraging message enhancer
export class EncouragementEngine {
  private static encouragingPhrases = [
    "Great question!",
    "You're on the right track!",
    "That's a smart financial move!",
    "Excellent thinking!",
    "You're making great progress!",
    "Keep up the good work!",
    "That's a wise decision!",
    "You're building great financial habits!"
  ];

  private static celebrationTriggers = [
    'goal', 'achieved', 'completed', 'success', 'saved', 'milestone',
    'target', 'reached', 'accomplished', 'progress', 'improved'
  ];

  public static enhanceResponse(response: string): {
    text: string;
    isEncouraging: boolean;
    shouldCelebrate: boolean;
  } {
    const lowerResponse = response.toLowerCase();
    
    // Check if response contains celebration triggers
    const shouldCelebrate = this.celebrationTriggers.some(trigger => 
      lowerResponse.includes(trigger)
    );

    // Check if response is naturally encouraging
    const isNaturallyEncouraging = lowerResponse.includes('great') || 
      lowerResponse.includes('excellent') || 
      lowerResponse.includes('good job') ||
      lowerResponse.includes('well done');

    // Add encouraging prefix for positive financial advice
    let enhancedText = response;
    if (shouldCelebrate && !isNaturallyEncouraging) {
      const randomPhrase = this.encouragingPhrases[
        Math.floor(Math.random() * this.encouragingPhrases.length)
      ];
      enhancedText = `${randomPhrase} ${response}`;
    }

    return {
      text: enhancedText,
      isEncouraging: shouldCelebrate || isNaturallyEncouraging,
      shouldCelebrate
    };
  }
}

// Audio preferences manager
export class AudioPreferences {
  private static STORAGE_KEY = 'finplanner_audio_prefs';

  public static save(prefs: {
    enabled: boolean;
    autoSpeak: boolean;
    rate: number;
    pitch: number;
    volume: number;
  }) {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(prefs));
  }

  public static load() {
    const stored = localStorage.getItem(this.STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
    return {
      enabled: false,
      autoSpeak: false,
      rate: 1.0,
      pitch: 1.0,
      volume: 0.7
    };
  }
}
