'use client'

import { useState, useEffect, useRef } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { User, Bot, Send, Sparkles } from 'lucide-react'

interface Message {
  id: string
  content: string
  role: 'user' | 'assistant'
  timestamp: Date
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  })
}

export default function AIChat() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: 'Hello! I\'m your AI financial assistant. I can help you analyze your spending, suggest budgets, and provide personalized financial advice. What would you like to know? 💰',
      role: 'assistant',
      timestamp: new Date()
    }
  ])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [mounted, setMounted] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setMounted(true)
  }, [])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      content: input,
      role: 'user',
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsLoading(true)

    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: input }),
      })

      if (!response.ok) {
        throw new Error('Failed to send message')
      }

      const data = await response.json()

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: data.response,
        role: 'assistant',
        timestamp: new Date()
      }

      setMessages(prev => [...prev, assistantMessage])
    } catch (error) {
      console.error('Error sending message:', error)
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: 'Sorry, I encountered an error. Please try again. 😔',
        role: 'assistant',
        timestamp: new Date()
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

  return (
    <Card className="flex flex-col h-[700px] border-0 shadow-xl bg-gradient-to-br from-white to-gray-50 overflow-hidden">
      {/* Chat Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-4 text-white">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-white/20 rounded-full">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-semibold">AI Financial Assistant</h3>
            <p className="text-sm text-blue-100">Ask me anything about your finances</p>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-gradient-to-b from-gray-50 to-white">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex items-start space-x-4 ${
              message.role === 'user' ? 'flex-row-reverse space-x-reverse' : ''
            }`}
          >
            <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center shadow-lg ${
              message.role === 'user' 
                ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white' 
                : 'bg-gradient-to-r from-green-400 to-blue-500 text-white'
            }`}>
              {message.role === 'user' ? <User size={18} /> : <Bot size={18} />}
            </div>
            <div className={`flex-1 max-w-[80%] ${
              message.role === 'user' ? 'text-right' : ''
            }`}>
              <div className={`inline-block p-4 rounded-2xl shadow-md ${
                message.role === 'user'
                  ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-br-md'
                  : 'bg-white text-gray-800 border border-gray-100 rounded-bl-md'
              }`}>
                <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
              </div>
              <p className="text-xs text-gray-500 mt-2 px-2">
                {mounted ? formatTime(message.timestamp) : '--:--'}
              </p>
            </div>
          </div>
        ))}
        
        {isLoading && (
          <div className="flex items-start space-x-4">
            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-r from-green-400 to-blue-500 text-white flex items-center justify-center shadow-lg">
              <Bot size={18} />
            </div>
            <div className="flex-1">
              <div className="inline-block p-4 rounded-2xl rounded-bl-md bg-white border border-gray-100 shadow-md">
                <div className="flex space-x-2">
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
      
      {/* Input Area */}
      <div className="border-t bg-white p-4">
        <div className="flex space-x-3">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask me about your finances... 💬"
            disabled={isLoading}
            className="flex-1 border-2 border-gray-200 focus:border-blue-400 rounded-xl px-4 py-3 text-sm"
          />
          <Button 
            onClick={sendMessage} 
            disabled={isLoading || !input.trim()}
            className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 rounded-xl px-6 shadow-lg"
          >
            <Send size={18} />
          </Button>
        </div>
        <p className="text-xs text-gray-500 mt-2 text-center">
          Press Enter to send • AI responses are generated based on your financial data
        </p>
      </div>
    </Card>
  )
}
