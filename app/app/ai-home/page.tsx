'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import UltimateAIChat from "@/components/ai/ultimate-ai-chat"
import AIInsights from '@/components/ai/ai-insights'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Brain, MessageSquare, TrendingUp, Zap } from 'lucide-react'

export default function AIHomePage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin')
    }
  }, [status, router])

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (status === 'unauthenticated') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <div className="p-3 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl shadow-lg">
              <Brain className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              AI Financial Assistant
            </h1>
          </div>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Manage your finances with natural language. Add transactions, create goals, track bills, and get personalized insights.
          </p>
        </div>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-blue-100">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center space-x-2 text-blue-700">
                <MessageSquare className="h-5 w-5" />
                <span>Natural Language</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-blue-600">
                Just say "Add ₹500 grocery expense" or "I want to save ₹50000 for vacation"
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-green-100">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center space-x-2 text-green-700">
                <Zap className="h-5 w-5" />
                <span>Voice Commands</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-green-600">
                Use voice input to quickly add expenses and manage your finances hands-free
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 to-purple-100">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center space-x-2 text-purple-700">
                <TrendingUp className="h-5 w-5" />
                <span>Smart Insights</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-purple-600">
                Get personalized financial insights and recommendations based on your data
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* AI Chat */}
          <div>
            <div className="mb-4">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">AI Financial Assistant</h2>
              <p className="text-gray-600">
                Chat with your AI assistant to manage your finances naturally
              </p>
            </div>
            <UltimateAIChat />
          </div>

          {/* AI Insights */}
          <div>
            <div className="mb-4">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">AI Insights</h2>
              <p className="text-gray-600">
                Personalized insights and recommendations for your financial health
              </p>
            </div>
            <AIInsights />
          </div>
        </div>

        {/* Examples Section */}
        <div className="mt-12">
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="text-center">Try These Examples</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h4 className="font-semibold text-gray-900">💰 Transactions</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• "Add ₹1,200 grocery expense from yesterday"</li>
                    <li>• "I received my salary of ₹75,000 today"</li>
                    <li>• "Spent ₹150 on coffee this morning"</li>
                  </ul>
                </div>
                <div className="space-y-2">
                  <h4 className="font-semibold text-gray-900">🎯 Goals & Bills</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• "I want to save ₹2 lakhs for a car by next year"</li>
                    <li>• "My electricity bill is ₹2,400 due on 25th"</li>
                    <li>• "Add ₹10,000 to my vacation savings goal"</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
