import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Volume2, VolumeX, Settings, Send, Loader2 } from 'lucide-react';
import { AudioManager, EncouragementEngine, AudioPreferences } from '@/lib/audio-utils';

interface Message {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: Date;
  isEncouraging?: boolean;
  shouldCelebrate?: boolean;
}

export default function AIChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [audioManager] = useState(() => new AudioManager());
  const [audioEnabled, setAudioEnabled] = useState(false);
  const [showAudioSettings, setShowAudioSettings] = useState(false);
  const [audioPrefs, setAudioPrefs] = useState(AudioPreferences.load());
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (audioPrefs.enabled) {
      audioManager.enable();
      setAudioEnabled(true);
    }
  }, []);

  const toggleAudio = () => {
    const newEnabled = !audioEnabled;
    setAudioEnabled(newEnabled);
    
    if (newEnabled) {
      audioManager.enable();
    } else {
      audioManager.disable();
    }

    const newPrefs = { ...audioPrefs, enabled: newEnabled };
    setAudioPrefs(newPrefs);
    AudioPreferences.save(newPrefs);
  };

  const speakMessage = (message: Message) => {
    if (!audioManager.isSupported()) {
      alert('Text-to-speech is not supported in your browser');
      return;
    }

    audioManager.speak(message.content, {
      rate: audioPrefs.rate,
      pitch: audioPrefs.pitch,
      volume: audioPrefs.volume,
      isEncouraging: message.isEncouraging
    });
  };

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: input,
      isUser: true,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: input })
      });

      if (!response.ok) throw new Error('Failed to get response');

      const data = await response.json();
      
      // Enhance response with encouraging elements
      const enhanced = EncouragementEngine.enhanceResponse(data.response);
      
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: enhanced.text,
        isUser: false,
        timestamp: new Date(),
        isEncouraging: enhanced.isEncouraging,
        shouldCelebrate: enhanced.shouldCelebrate
      };

      setMessages(prev => [...prev, aiMessage]);

      // Auto-speak if enabled
      if (audioEnabled && audioPrefs.autoSpeak) {
        setTimeout(() => speakMessage(aiMessage), 500);
      }

    } catch (error) {
      console.error('Error:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: 'Sorry, I encountered an error. Please try again.',
        isUser: false,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <Card className="h-[600px] flex flex-col">
      <CardContent className="flex-1 flex flex-col p-4">
        {/* Header with Audio Controls */}
        <div className="flex items-center justify-between mb-4 pb-2 border-b">
          <h3 className="font-semibold text-lg">AI Financial Coach</h3>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={toggleAudio}
              className={audioEnabled ? 'bg-green-50 border-green-200' : ''}
            >
              {audioEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
              {audioEnabled ? 'Audio On' : 'Audio Off'}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowAudioSettings(!showAudioSettings)}
            >
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Audio Settings Panel */}
        {showAudioSettings && (
          <div className="mb-4 p-3 bg-gray-50 rounded-lg border">
            <h4 className="font-medium mb-2">Audio Settings</h4>
            <div className="space-y-2">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={audioPrefs.autoSpeak}
                  onChange={(e) => {
                    const newPrefs = { ...audioPrefs, autoSpeak: e.target.checked };
                    setAudioPrefs(newPrefs);
                    AudioPreferences.save(newPrefs);
                  }}
                />
                <span className="text-sm">Auto-speak responses</span>
              </label>
              <div className="grid grid-cols-3 gap-2 text-xs">
                <label>
                  Speed: {audioPrefs.rate}
                  <input
                    type="range"
                    min="0.5"
                    max="2"
                    step="0.1"
                    value={audioPrefs.rate}
                    onChange={(e) => {
                      const newPrefs = { ...audioPrefs, rate: parseFloat(e.target.value) };
                      setAudioPrefs(newPrefs);
                      AudioPreferences.save(newPrefs);
                    }}
                    className="w-full"
                  />
                </label>
                <label>
                  Pitch: {audioPrefs.pitch}
                  <input
                    type="range"
                    min="0.5"
                    max="2"
                    step="0.1"
                    value={audioPrefs.pitch}
                    onChange={(e) => {
                      const newPrefs = { ...audioPrefs, pitch: parseFloat(e.target.value) };
                      setAudioPrefs(newPrefs);
                      AudioPreferences.save(newPrefs);
                    }}
                    className="w-full"
                  />
                </label>
                <label>
                  Volume: {audioPrefs.volume}
                  <input
                    type="range"
                    min="0.1"
                    max="1"
                    step="0.1"
                    value={audioPrefs.volume}
                    onChange={(e) => {
                      const newPrefs = { ...audioPrefs, volume: parseFloat(e.target.value) };
                      setAudioPrefs(newPrefs);
                      AudioPreferences.save(newPrefs);
                    }}
                    className="w-full"
                  />
                </label>
              </div>
            </div>
          </div>
        )}

        {/* Messages */}
        <ScrollArea className="flex-1 mb-4">
          <div className="space-y-4">
            {messages.length === 0 && (
              <div className="text-center text-gray-500 py-8">
                <p>👋 Hi! I'm your AI financial coach.</p>
                <p className="text-sm mt-1">Ask me anything about your finances!</p>
              </div>
            )}
            
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] p-3 rounded-lg ${
                    message.isUser
                      ? 'bg-blue-500 text-white'
                      : message.shouldCelebrate
                      ? 'bg-green-50 border border-green-200'
                      : 'bg-gray-100'
                  }`}
                >
                  <p className="text-sm">{message.content}</p>
                  {!message.isUser && (
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-xs text-gray-500">
                        {message.timestamp.toLocaleTimeString()}
                      </span>
                      {audioManager.isSupported() && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => speakMessage(message)}
                          className="h-6 w-6 p-0"
                        >
                          <Volume2 className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
            
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-gray-100 p-3 rounded-lg">
                  <Loader2 className="h-4 w-4 animate-spin" />
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        {/* Input */}
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask about your finances..."
            disabled={isLoading}
            className="flex-1"
          />
          <Button onClick={sendMessage} disabled={isLoading || !input.trim()}>
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
