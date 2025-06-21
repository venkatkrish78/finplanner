'use client'

import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Send, 
  Bot, 
  User, 
  CheckCircle, 
  AlertCircle,
  Mic,
  MicOff,
  Sparkles,
  Plus,
  DollarSign,
  Target,
  Receipt,
  Volume2,
  VolumeX,
  Settings,
  Loader2
} from 'lucide-react'
import { AudioManager, EncouragementEngine, AudioPreferences } from '@/lib/audio-utils'

interface Message {
  id: string
  content: string
  isUser: boolean
  timestamp: Date
  type?: 'success' | 'error' | 'info'
  isEncouraging?: boolean
  shouldCelebrate?: boolean
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean
  interimResults: boolean
  lang: string
  start(): void
  stop(): void
  abort(): void
  onresult: (event: SpeechRecognitionEvent) => void
  onerror: (event: SpeechRecognitionErrorEvent) => void
  onstart: () => void
  onend: () => void
}

interface SpeechRecognitionEvent {
  results: SpeechRecognitionResultList
  resultIndex: number
}

interface SpeechRecognitionResultList {
  length: number
  item(index: number): SpeechRecognitionResult
  [index: number]: SpeechRecognitionResult
}

interface SpeechRecognitionResult {
  length: number
  item(index: number): SpeechRecognitionAlternative
  [index: number]: SpeechRecognitionAlternative
  isFinal: boolean
}

interface SpeechRecognitionAlternative {
  transcript: string
  confidence: number
}

interface SpeechRecognitionErrorEvent {
  error: string
  message: string
}

declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognition
    webkitSpeechRecognition: new () => SpeechRecognition
  }
}

export default function UltimateAIChat() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const [recognition, setRecognition] = useState<SpeechRecognition | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  
  // Audio output features
  const [audioManager] = useState(() => new AudioManager())
  const [audioEnabled, setAudioEnabled] = useState(false)
  const [showAudioSettings, setShowAudioSettings] = useState(false)
  const [audioPrefs, setAudioPrefs] = useState(AudioPreferences.load())

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    // Initialize speech recognition
    if (typeof window !== 'undefined' && ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
      const recognitionInstance = new SpeechRecognition()
      
      recognitionInstance.continuous = false
      recognitionInstance.interimResults = false
      recognitionInstance.lang = 'en-US'
      
      recognitionInstance.onresult = (event) => {
        const transcript = event.results[0][0].transcript
        setInput(transcript)
      }
      
      recognitionInstance.onerror = (event) => {
        console.error('Speech recognition error:', event.error)
        setIsListening(false)
      }
      
      recognitionInstance.onend = () => {
        setIsListening(false)
      }
      
      setRecognition(recognitionInstance)
    }

    // Initialize audio preferences
    if (audioPrefs.enabled) {
      audioManager.enable()
      setAudioEnabled(true)
    }
  }, [])

  const toggleListening = () => {
    if (!recognition) {
      alert('Speech recognition is not supported in your browser')
      return
    }

    if (isListening) {
      recognition.stop()
      setIsListening(false)
    } else {
      recognition.start()
      setIsListening(true)
    }
  }

  const toggleAudio = () => {
    const newEnabled = !audioEnabled
    setAudioEnabled(newEnabled)
    
    if (newEnabled) {
      audioManager.enable()
    } else {
      audioManager.disable()
    }

    const newPrefs = { ...audioPrefs, enabled: newEnabled }
    setAudioPrefs(newPrefs)
    AudioPreferences.save(newPrefs)
  }

  const speakMessage = (message: Message) => {
    if (!audioManager.isSupported()) {
      alert('Text-to-speech is not supported in your browser')
      return
    }

    audioManager.speak(message.content, {
      rate: audioPrefs.rate,
      pitch: audioPrefs.pitch,
      volume: audioPrefs.volume,
      isEncouraging: message.isEncouraging
    })
  }

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      content: input,
      isUser: true,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsLoading(true)

    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: input })
      })

      if (!response.ok) throw new Error('Failed to get response')

      const data = await response.json()
      
      // Enhance response with encouraging elements
      const enhanced = EncouragementEngine.enhanceResponse(data.response)
      
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: enhanced.text,
        isUser: false,
        timestamp: new Date(),
        type: enhanced.shouldCelebrate ? 'success' : 'info',
        isEncouraging: enhanced.isEncouraging,
        shouldCelebrate: enhanced.shouldCelebrate
      }

      setMessages(prev => [...prev, aiMessage])

      // Auto-speak if enabled
      if (audioEnabled && audioPrefs.autoSpeak) {
        setTimeout(() => speakMessage(aiMessage), 500)
      }

    } catch (error) {
      console.error('Error:', error)
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: 'Sorry, I encountered an error. Please try again.',
        isUser: false,
        timestamp: new Date(),
        type: 'error'
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const getMessageBadgeColor = (type?: string) => {
    switch (type) {
      case 'success': return 'bg-green-100 text-green-800 border-green-200'
      case 'error': return 'bg-red-100 text-red-800 border-red-200'
      case 'info': return 'bg-blue-100 text-blue-800 border-blue-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  return (
    <div className="w-full max-w-2xl mx-auto">
      <Card className="h-[600px] w-full flex flex-col bg-gradient-to-br from-blue-50 via-white to-purple-50 border-0 shadow-xl">
        <CardContent className="h-full flex flex-col p-4">
          {/* Enhanced Header with Both Audio Controls */}
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-gradient-to-r from-blue-200 to-purple-200 flex-shrink-0">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl shadow-lg">
                <Sparkles className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-lg bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  AI Financial Coach
                </h3>
                <p className="text-xs text-gray-600">Voice & Audio Enabled</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              {/* Voice Input Toggle */}
              <Button
                variant="outline"
                size="sm"
                onClick={toggleListening}
                className={`${isListening ? 'bg-red-50 border-red-200 text-red-700' : 'bg-blue-50 border-blue-200 text-blue-700'} transition-all duration-200`}
              >
                {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                {isListening ? 'Stop' : 'Voice'}
              </Button>
              
              {/* Audio Output Toggle */}
              <Button
                variant="outline"
                size="sm"
                onClick={toggleAudio}
                className={`${audioEnabled ? 'bg-green-50 border-green-200 text-green-700' : 'bg-gray-50 border-gray-200'} transition-all duration-200`}
              >
                {audioEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
                {audioEnabled ? 'Audio On' : 'Audio Off'}
              </Button>
              
              {/* Settings */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowAudioSettings(!showAudioSettings)}
                className="bg-purple-50 border-purple-200 text-purple-700"
              >
                <Settings className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Audio Settings Panel */}
          {showAudioSettings && (
            <div className="mb-3 p-3 bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl border border-purple-200 flex-shrink-0">
              <h4 className="font-semibold mb-2 text-purple-800 text-sm">Audio Settings</h4>
              <div className="space-y-2">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={audioPrefs.autoSpeak}
                    onChange={(e) => {
                      const newPrefs = { ...audioPrefs, autoSpeak: e.target.checked }
                      setAudioPrefs(newPrefs)
                      AudioPreferences.save(newPrefs)
                    }}
                    className="rounded border-purple-300"
                  />
                  <span className="text-xs text-purple-700">Auto-speak responses</span>
                </label>
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <label className="text-purple-700">
                    Speed: {audioPrefs.rate.toFixed(1)}
                    <input
                      type="range"
                      min="0.5"
                      max="2"
                      step="0.1"
                      value={audioPrefs.rate}
                      onChange={(e) => {
                        const newPrefs = { ...audioPrefs, rate: parseFloat(e.target.value) }
                        setAudioPrefs(newPrefs)
                        AudioPreferences.save(newPrefs)
                      }}
                      className="w-full mt-1"
                    />
                  </label>
                  <label className="text-purple-700">
                    Pitch: {audioPrefs.pitch.toFixed(1)}
                    <input
                      type="range"
                      min="0.5"
                      max="2"
                      step="0.1"
                      value={audioPrefs.pitch}
                      onChange={(e) => {
                        const newPrefs = { ...audioPrefs, pitch: parseFloat(e.target.value) }
                        setAudioPrefs(newPrefs)
                        AudioPreferences.save(newPrefs)
                      }}
                      className="w-full mt-1"
                    />
                  </label>
                  <label className="text-purple-700">
                    Volume: {audioPrefs.volume.toFixed(1)}
                    <input
                      type="range"
                      min="0.1"
                      max="1"
                      step="0.1"
                      value={audioPrefs.volume}
                      onChange={(e) => {
                        const newPrefs = { ...audioPrefs, volume: parseFloat(e.target.value) }
                        setAudioPrefs(newPrefs)
                        AudioPreferences.save(newPrefs)
                      }}
                      className="w-full mt-1"
                    />
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* Messages - Fixed Height Container */}
          <div className="flex-1 min-h-0 mb-3">
            <div className="h-full overflow-y-auto pr-2 space-y-3">
              {messages.length === 0 && (
                <div className="text-center py-8">
                  <div className="p-3 bg-gradient-to-r from-blue-100 to-purple-100 rounded-2xl inline-block mb-3">
                    <Bot className="h-8 w-8 text-blue-600 mx-auto" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">
                    👋 Hi! I'm your AI Financial Coach
                  </h3>
                  <p className="text-gray-600 mb-3 text-sm">
                    Ask me anything about your finances, or use voice input!
                  </p>
                  <div className="flex flex-wrap justify-center gap-2">
                    <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 text-xs">
                      <DollarSign className="h-3 w-3 mr-1" />
                      Expenses
                    </Badge>
                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 text-xs">
                      <Target className="h-3 w-3 mr-1" />
                      Goals
                    </Badge>
                    <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200 text-xs">
                      <Receipt className="h-3 w-3 mr-1" />
                      Bills
                    </Badge>
                  </div>
                </div>
              )}
              
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] ${
                      message.isUser
                        ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
                        : message.shouldCelebrate
                        ? 'bg-gradient-to-r from-green-50 to-green-100 border border-green-200'
                        : 'bg-white border border-gray-200'
                    } rounded-2xl p-3 shadow-lg`}
                  >
                    <div className="flex items-start space-x-2">
                      {!message.isUser && (
                        <div className={`p-1.5 rounded-xl ${message.shouldCelebrate ? 'bg-green-200' : 'bg-blue-100'} flex-shrink-0`}>
                          <Bot className={`h-3 w-3 ${message.shouldCelebrate ? 'text-green-700' : 'text-blue-600'}`} />
                        </div>
                      )}
                      {message.isUser && (
                        <div className="p-1.5 bg-white/20 rounded-xl flex-shrink-0">
                          <User className="h-3 w-3 text-white" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm leading-relaxed ${message.isUser ? 'text-white' : 'text-gray-800'}`}>
                          {message.content}
                        </p>
                        {message.type && !message.isUser && (
                          <Badge className={`mt-2 text-xs ${getMessageBadgeColor(message.type)}`}>
                            {message.type === 'success' && <CheckCircle className="h-3 w-3 mr-1" />}
                            {message.type === 'error' && <AlertCircle className="h-3 w-3 mr-1" />}
                            {message.type}
                          </Badge>
                        )}
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
                                className="h-6 w-6 p-0 hover:bg-blue-100"
                              >
                                <Volume2 className="h-3 w-3 text-blue-600" />
                              </Button>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-white border border-gray-200 rounded-2xl p-3 shadow-lg">
                    <div className="flex items-center space-x-2">
                      <div className="p-1.5 bg-blue-100 rounded-xl">
                        <Bot className="h-3 w-3 text-blue-600" />
                      </div>
                      <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
                      <span className="text-sm text-gray-600">Thinking...</span>
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* Enhanced Input - Fixed at Bottom */}
          <div className="flex gap-2 p-2 bg-white rounded-2xl border border-gray-200 shadow-lg flex-shrink-0">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={isListening ? "Listening..." : "Ask about your finances or use voice input..."}
              disabled={isLoading || isListening}
              className="flex-1 border-0 bg-transparent focus:ring-0 text-gray-800 placeholder-gray-500"
            />
            <div className="flex gap-1">
              <Button
                onClick={toggleListening}
                disabled={isLoading}
                variant="ghost"
                size="sm"
                className={`${isListening ? 'bg-red-100 text-red-600 hover:bg-red-200' : 'bg-blue-100 text-blue-600 hover:bg-blue-200'} transition-all duration-200`}
              >
                {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
              </Button>
              <Button 
                onClick={sendMessage} 
                disabled={isLoading || !input.trim()}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg"
                size="sm"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
