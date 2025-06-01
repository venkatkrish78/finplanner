
'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { TrendingUp, TrendingDown, Target, PieChart, ArrowRight } from 'lucide-react'
import { PortfolioStats } from '@/lib/types'
import { formatCurrency } from '@/lib/currency'
import { motion } from 'framer-motion'
import Link from 'next/link'

export default function InvestmentsSummary() {
  const [portfolioStats, setPortfolioStats] = useState<PortfolioStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchPortfolioStats()
  }, [])

  const fetchPortfolioStats = async () => {
    try {
      const response = await fetch('/api/investments/portfolio')
      if (response.ok) {
        const data = await response.json()
        setPortfolioStats(data.stats)
      }
    } catch (error) {
      console.error('Error fetching portfolio stats:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-green-600">Investment Portfolio</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!portfolioStats || portfolioStats.totalInvestments === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="hover:shadow-lg transition-shadow duration-200">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-green-600 flex items-center gap-2">
              <Target className="h-5 w-5" />
              Investment Portfolio
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-6">
              <PieChart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Start Your Investment Journey</h3>
              <p className="text-gray-600 mb-4">
                Build wealth by investing in stocks, mutual funds, and other assets
              </p>
              <Link href="/investments">
                <Button className="bg-green-600 hover:bg-green-700">
                  <Target className="h-4 w-4 mr-2" />
                  Add Investment
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    )
  }

  const getGainLossColor = (value: number) => {
    if (value > 0) return 'text-green-600'
    if (value < 0) return 'text-red-600'
    return 'text-gray-600'
  }

  const getGainLossIcon = (value: number) => {
    if (value > 0) return <TrendingUp className="h-4 w-4" />
    if (value < 0) return <TrendingDown className="h-4 w-4" />
    return null
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="hover:shadow-lg transition-shadow duration-200">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="text-lg font-semibold text-green-600 flex items-center gap-2">
              <Target className="h-5 w-5" />
              Investment Portfolio
            </CardTitle>
            <Link href="/investments">
              <Button variant="ghost" size="sm" className="text-green-600 hover:text-green-700">
                View All
                <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-green-50 p-3 rounded-lg">
              <p className="text-sm text-green-600 mb-1">Total Investments</p>
              <p className="text-xl font-bold text-green-800">{portfolioStats.totalInvestments}</p>
            </div>
            <div className="bg-blue-50 p-3 rounded-lg">
              <p className="text-sm text-blue-600 mb-1">Total Invested</p>
              <p className="text-xl font-bold text-blue-800">
                {formatCurrency(portfolioStats.totalInvested)}
              </p>
            </div>
          </div>

          <div className="bg-gray-50 p-3 rounded-lg">
            <p className="text-sm text-gray-600 mb-1">Current Value</p>
            <p className="text-2xl font-bold text-gray-900">
              {formatCurrency(portfolioStats.currentValue)}
            </p>
          </div>

          <div className="flex justify-between items-center p-3 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg">
            <div>
              <p className="text-sm text-gray-600">Total Gain/Loss</p>
              <div className={`flex items-center gap-1 font-bold ${getGainLossColor(portfolioStats.totalGainLoss)}`}>
                {getGainLossIcon(portfolioStats.totalGainLoss)}
                <span>{formatCurrency(Math.abs(portfolioStats.totalGainLoss))}</span>
              </div>
            </div>
            <div className={`text-right ${getGainLossColor(portfolioStats.totalGainLoss)}`}>
              <p className="text-sm font-medium">
                {portfolioStats.totalGainLossPercentage > 0 ? '+' : ''}
                {portfolioStats.totalGainLossPercentage.toFixed(2)}%
              </p>
            </div>
          </div>

          <div className="pt-2">
            <Link href="/investments">
              <Button className="w-full bg-green-600 hover:bg-green-700">
                <PieChart className="h-4 w-4 mr-2" />
                Manage Portfolio
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
