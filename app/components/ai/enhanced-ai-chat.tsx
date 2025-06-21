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
    <Card className="h-[600px] flex flex-col">
      <CardContent className="flex-1 flex flex-col p-4">
        {/* Quick Actions */}
        <div className="mb-4">
          <p className="text-sm text-gray-600 mb-2">Quick actions:</p>
          <div className="flex flex-wrap gap-2">
            {quickActions.map((action, index) => (
              <Button
                key={index}
                variant="outline"
                size="sm"
                className={`${action.color} border-0`}
                onClick={() => handleQuickAction(action.prompt)}
              >
                {action.icon}
                <span className="ml-1">{action.label}</span>
              </Button>
            ))}
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto space-y-4 mb-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-lg p-3 ${
                  message.isUser
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-900'
                }`}
              >
                <div className="flex items-start space-x-2">
                  {!message.isUser && (
                    <Bot className="h-5 w-5 mt-0.5 text-blue-600" />
                  )}
                  {message.isUser && (
                    <User className="h-5 w-5 mt-0.5 text-white" />
                  )}
                  <div className="flex-1">
                    <p className="text-sm">{message.content}</p>
                    <ActionFeedback message={message} />
                    {message.error && (
                      <div className="flex items-center space-x-1 mt-2">
                        <AlertCircle className="h-4 w-4 text-red-500" />
                        <span className="text-xs text-red-600">{message.error}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-gray-100 rounded-lg p-3">
                <div className="flex items-center space-x-2">
                  <Bot className="h-5 w-5 text-blue-600" />
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="flex space-x-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message or use voice input..."
            onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
            disabled={isLoading}
            className="flex-1"
          />
          <Button
            type="button"
            variant={isListening ? "destructive" : "outline"}
            size="sm"
            onClick={isListening ? stopVoiceInput : startVoiceInput}
            disabled={isLoading}
          >
            {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
          </Button>
          <Button 
            onClick={() => sendMessage()} 
            disabled={!input.trim() || isLoading}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>

        {/* Voice indicator */}
        {isListening && (
          <div className="mt-2 flex items-center justify-center space-x-2 text-red-600">
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
            <span className="text-sm">Listening...</span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
