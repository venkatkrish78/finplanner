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
  Receipt
} from 'lucide-react'


interface Message {
  id: string
  content: string
  isUser: boolean
  actionPerformed?: boolean
  action?: string
  data?: any
  extractedData?: any
  error?: string
  timestamp: Date
}

interface QuickAction {
  label: string
  prompt: string
  icon: React.ReactNode
  color: string
}

const quickActions: QuickAction[] = [
  {
    label: "Add Expense",
    prompt: "I spent ₹",
    icon: <DollarSign className="h-4 w-4" />,
    color: "bg-red-50 text-red-700 hover:bg-red-100"
  },
  {
    label: "Add Income",
    prompt: "I received ₹",
    icon: <Plus className="h-4 w-4" />,
    color: "bg-green-50 text-green-700 hover:bg-green-100"
  },
  {
    label: "Add Bill",
    prompt: "My bill is ₹",
    icon: <Receipt className="h-4 w-4" />,
    color: "bg-orange-50 text-orange-700 hover:bg-orange-100"
  },
  {
    label: "Create Goal",
    prompt: "I want to save ₹",
    icon: <Target className="h-4 w-4" />,
    color: "bg-blue-50 text-blue-700 hover:bg-blue-100"
  }
]

export default function EnhancedAIChat() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: "Hi! I'm your AI financial assistant. I can help you add transactions, bills, goals, and more using natural language. Try saying something like 'Add ₹500 grocery expense' or 'I want to save ₹50000 for vacation'!",
      isUser: false,
      timestamp: new Date()
    }
  ])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [recognition, setRecognition] = useState<SpeechRecognition | null>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

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
        actionPerformed: data.actionPerformed,
        action: data.action,
        data: data.data,
        extractedData: data.extractedData,
        error: data.error,
        timestamp: new Date()
      }

      setMessages(prev => [...prev, aiMessage])
    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: 'Sorry, there was an error processing your request. Please try again.',
        isUser: false,
        error: 'Network error',
        timestamp: new Date()
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const startVoiceInput = () => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
      const recognition = new SpeechRecognition()
      
      recognition.continuous = false
      recognition.interimResults = false
      recognition.lang = 'en-US'

      recognition.onstart = () => setIsListening(true)
      
      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript
        setInput(transcript)
        setIsListening(false)
      }

      recognition.onerror = () => setIsListening(false)
      recognition.onend = () => setIsListening(false)

      recognition.start()
      setRecognition(recognition)
    }
  }

  const stopVoiceInput = () => {
    if (recognition) {
      recognition.stop()
    }
    setIsListening(false)
  }

  const handleQuickAction = (prompt: string) => {
    setInput(prompt)
  }

  const ActionFeedback = ({ message }: { message: Message }) => {
    if (!message.actionPerformed) return null

    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-3 mt-2">
        <div className="flex items-center space-x-2">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <span className="text-sm font-medium text-green-800">
            ✅ {message.action?.replace('_', ' ').toLowerCase()} completed
          </span>
        </div>
        {message.extractedData && (
          <div className="mt-2 text-xs text-green-700">
            <div className="flex flex-wrap gap-1">
              {message.extractedData.amount && (
                <Badge variant="secondary" className="text-xs">
                  ₹{message.extractedData.amount}
                </Badge>
              )}
              {message.extractedData.description && (
                <Badge variant="secondary" className="text-xs">
                  {message.extractedData.description}
                </Badge>
              )}
              {message.extractedData.category && (
                <Badge variant="secondary" className="text-xs">
                  {message.extractedData.category}
                </Badge>
              )}
              {message.extractedData.date && (
                <Badge variant="secondary" className="text-xs">
                  {new Date(message.extractedData.date).toLocaleDateString()}
                </Badge>
              )}
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <Card className="shadow-xl border-0 bg-gradient-to-br from-white to-gray-50">
      <CardContent className="p-0">
        <div className="h-[650px] flex flex-col">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-4 text-white flex-shrink-0 rounded-t-lg">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-full">
                <Sparkles className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-semibold">AI Financial Assistant</h3>
                <p className="text-sm text-blue-100">Natural language financial management</p>
              </div>
            </div>
          </div>

          <div className="p-4 bg-gray-50 border-b flex-shrink-0">
            <p className="text-sm text-gray-600 mb-2">Quick actions:</p>
            <div className="flex flex-wrap gap-2">
              {quickActions.map((action, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  className={`${action.color} border-0 text-xs`}
                  onClick={() => handleQuickAction(action.prompt)}
                >
                  {action.icon}
                  <span className="ml-1">{action.label}</span>
                </Button>
              ))}
            </div>
          </div>

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
                      <ActionFeedback message={message} />
                      {message.error && (
                        <div className="flex items-center space-x-1 mt-2">
                          <AlertCircle className="h-4 w-4 text-red-500" />
                          <span className="text-xs text-red-600">{message.error}</span>
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
                      <Bot className="h-4 w-4 text-blue-600" />
                    </div>
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-green-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

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
                disabled={isLoading}
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
