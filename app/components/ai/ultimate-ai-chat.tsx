/// <reference path="../../types/speech-recognition.d.ts" />
/// <reference path="../../types/speech-recognition.d.ts" />
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


export default function UltimateAIChat() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const [recognition, setRecognition] = useState<SpeechRecognition | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
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
        setIsListening(false)
      }
      
      recognitionInstance.onerror = () => setIsListening(false)
      recognitionInstance.onend = () => setIsListening(false)
      
      setRecognition(recognitionInstance)
    }
  }, [])

  const sendMessage = async (messageText: string = input) => {
    if (!messageText.trim() || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      content: messageText.trim(),
      isUser: true,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsLoading(true)

    try {
      const response = await fetch('/api/ai/chat-actions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: messageText.trim() })
      })

      const data = await response.json()

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: data.response || 'Sorry, I couldn\'t process that request.',
        isUser: false,
        timestamp: new Date(),
        type: data.actionPerformed ? 'success' : 'info',
        isEncouraging: data.isEncouraging,
        shouldCelebrate: data.shouldCelebrate
      }

      setMessages(prev => [...prev, aiMessage])

      // Handle audio feedback
      if (audioEnabled && data.actionPerformed) {
        AudioManager.playSuccess()
        if (data.isEncouraging) {
          setTimeout(() => {
            AudioManager.playEncouragement(EncouragementEngine.getRandomEncouragement())
          }, 500)
        }
      }

    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: 'Sorry, there was an error processing your request. Please try again.',
        isUser: false,
        timestamp: new Date(),
        type: 'error'
      }
      setMessages(prev => [...prev, errorMessage])
      
      if (audioEnabled) {
        AudioManager.playError()
      }
    } finally {
      setIsLoading(false)
    }
  }

  const startVoiceInput = () => {
    if (recognition) {
      setIsListening(true)
      recognition.start()
    }
  }

  const stopVoiceInput = () => {
    if (recognition) {
      recognition.stop()
    }
    setIsListening(false)
  }

  return (
    <Card className="shadow-xl border-0 bg-gradient-to-br from-white to-gray-50">
      <CardContent className="p-0">
        <div className="h-[650px] flex flex-col">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-4 text-white flex-shrink-0 rounded-t-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/20 rounded-full">
                  <Sparkles className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-semibold">Ultimate AI Assistant</h3>
                  <p className="text-sm text-blue-100">Advanced financial management</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setAudioEnabled(!audioEnabled)}
                  className="text-white hover:bg-white/20"
                >
                  {audioEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowAudioSettings(!showAudioSettings)}
                  className="text-white hover:bg-white/20"
                >
                  <Settings className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 min-h-0 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-gray-50 to-white">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl p-4 shadow-md ${
                    message.isUser
                      ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-br-md'
                      : message.type === 'success'
                      ? 'bg-green-50 text-green-900 border border-green-200 rounded-bl-md'
                      : message.type === 'error'
                      ? 'bg-red-50 text-red-900 border border-red-200 rounded-bl-md'
                      : 'bg-white text-gray-900 border border-gray-100 rounded-bl-md'
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                      message.isUser ? 'bg-white/20' : 'bg-blue-100'
                    }`}>
                      {message.isUser ? (
                        <User className="h-4 w-4 text-white" />
                      ) : (
                        <Bot className="h-4 w-4 text-blue-600" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
                      {message.shouldCelebrate && (
                        <div className="mt-2 text-xs text-green-600 font-medium">
                          🎉 Great job! Keep it up!
                        </div>
                      )}
                      <p className="text-xs opacity-70 mt-2">
                        {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white rounded-2xl rounded-bl-md p-4 shadow-md border border-gray-100">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                      <Loader2 className="h-4 w-4 text-blue-600 animate-spin" />
                    </div>
                    <div className="text-sm text-gray-600">Processing...</div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="border-t bg-white p-4 flex-shrink-0 rounded-b-lg">
            <div className="flex space-x-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type your message or use voice input..."
                onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                disabled={isLoading}
                className="flex-1 border-2 border-gray-200 focus:border-blue-400 rounded-xl px-4 py-3"
              />
              <Button
                type="button"
                variant={isListening ? "destructive" : "outline"}
                size="sm"
                onClick={isListening ? stopVoiceInput : startVoiceInput}
                disabled={isLoading || !recognition}
                className="rounded-xl px-4"
              >
                {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
              </Button>
              <Button 
                onClick={() => sendMessage()} 
                disabled={!input.trim() || isLoading}
                className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 rounded-xl px-6 shadow-lg"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>

            {isListening && (
              <div className="mt-2 flex items-center justify-center space-x-2 text-red-600">
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                <span className="text-sm">Listening...</span>
              </div>
            )}
            
            <p className="text-xs text-gray-500 mt-2 text-center">
              Press Enter to send • Use voice input for hands-free interaction
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
