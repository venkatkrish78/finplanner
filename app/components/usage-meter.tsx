'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { MessageCircle, Brain, Crown, ArrowRight } from 'lucide-react'
import { PremiumBadge } from './premium-badge'

interface UsageData {
  usage: {
    aiChat: number
    aiInsights: number
    isPremium: boolean
    premiumUntil?: string
  }
  limits: {
    aiChat: number
    aiInsights: number
  }
  canUseAIChat: boolean
  canUseAIInsights: boolean
}

export function UsageMeter() {
  const [usageData, setUsageData] = useState<UsageData | null>(null)

  useEffect(() => {
    fetchUsage()
  }, [])

  const fetchUsage = async () => {
    try {
      const response = await fetch('/api/usage')
      const data = await response.json()
      setUsageData(data)
    } catch (error) {
      console.error('Failed to fetch usage:', error)
    }
  }

  if (!usageData) return null

  const { usage, limits } = usageData
  const isPremium = usage.isPremium

  return (
    <Card className="mb-6 border-2 border-dashed border-gray-200">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-lg">Your Plan</span>
            <PremiumBadge isPremium={isPremium} variant="header" />
          </div>
          {!isPremium && (
            <Button size="sm" className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700">
              <Crown className="h-4 w-4 mr-1" />
              Upgrade to Premium
              <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          )}
        </CardTitle>
      </CardHeader>

      <CardContent className="pt-0">
        {isPremium ? (
          <div className="text-center py-4">
            <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg p-4 border border-yellow-200">
              <Crown className="h-8 w-8 text-yellow-500 mx-auto mb-2" />
              <p className="text-lg font-semibold text-yellow-700 mb-1">Premium Active!</p>
              <p className="text-sm text-yellow-600">✨ Unlimited AI features • Priority support • Advanced analytics</p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {/* AI Chat Usage */}
            <div className="flex items-center gap-3">
              <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <MessageCircle className="h-5 w-5 text-blue-600" />
              </div>
              <div className="flex-1">
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-medium">AI Chat Messages</span>
                  <span className={`font-mono ${usage.aiChat >= limits.aiChat ? 'text-red-600' : 'text-gray-600'}`}>
                    {usage.aiChat}/{limits.aiChat}
                  </span>
                </div>
                <Progress 
                  value={(usage.aiChat / limits.aiChat) * 100} 
                  className="h-2"
                />
              </div>
            </div>

            {/* AI Insights Usage */}
            <div className="flex items-center gap-3">
              <div className="flex-shrink-0 w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                <Brain className="h-5 w-5 text-purple-600" />
              </div>
              <div className="flex-1">
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-medium">AI Insights</span>
                  <span className={`font-mono ${usage.aiInsights >= limits.aiInsights ? 'text-red-600' : 'text-gray-600'}`}>
                    {usage.aiInsights}/{limits.aiInsights}
                  </span>
                </div>
                <Progress 
                  value={(usage.aiInsights / limits.aiInsights) * 100} 
                  className="h-2"
                />
              </div>
            </div>

            {/* Upgrade Prompt */}
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4 border border-blue-200 mt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-blue-900 mb-1">Want unlimited access?</p>
                  <p className="text-sm text-blue-700">Get unlimited AI chat, insights, and premium features</p>
                </div>
                <Button size="sm" className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 ml-4">
                  <Crown className="h-4 w-4 mr-1" />
                  $9.99/mo
                </Button>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
