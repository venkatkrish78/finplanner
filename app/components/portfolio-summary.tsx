
'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { TrendingUp, TrendingDown, Target, PieChart } from 'lucide-react'
import { PortfolioStats } from '@/lib/types'
import { formatCurrency } from '@/lib/currency'
import { motion } from 'framer-motion'

interface PortfolioSummaryProps {
  stats: PortfolioStats
}

export default function PortfolioSummary({ stats }: PortfolioSummaryProps) {
  const getGainLossColor = (value: number) => {
    if (value > 0) return 'text-green-600'
    if (value < 0) return 'text-red-600'
    return 'text-gray-600'
  }

  const getGainLossIcon = (value: number) => {
    if (value > 0) return <TrendingUp className="h-5 w-5" />
    if (value < 0) return <TrendingDown className="h-5 w-5" />
    return <PieChart className="h-5 w-5" />
  }

  const summaryCards = [
    {
      title: 'Total Investments',
      value: stats.totalInvestments.toString(),
      icon: <Target className="h-5 w-5 text-blue-600" />,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      title: 'Total Invested',
      value: formatCurrency(stats.totalInvested),
      icon: <PieChart className="h-5 w-5 text-purple-600" />,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50'
    },
    {
      title: 'Current Value',
      value: formatCurrency(stats.currentValue),
      icon: <TrendingUp className="h-5 w-5 text-green-600" />,
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      title: 'Total Gain/Loss',
      value: formatCurrency(Math.abs(stats.totalGainLoss)),
      subtitle: `${stats.totalGainLossPercentage > 0 ? '+' : ''}${stats.totalGainLossPercentage.toFixed(2)}%`,
      icon: getGainLossIcon(stats.totalGainLoss),
      color: getGainLossColor(stats.totalGainLoss),
      bgColor: stats.totalGainLoss >= 0 ? 'bg-green-50' : 'bg-red-50'
    }
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {summaryCards.map((card, index) => (
        <motion.div
          key={card.title}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: index * 0.1 }}
        >
          <Card className="hover:shadow-lg transition-shadow duration-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                {card.title}
              </CardTitle>
              <div className={`p-2 rounded-lg ${card.bgColor}`}>
                {card.icon}
              </div>
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${card.color} mb-1`}>
                {card.value}
              </div>
              {card.subtitle && (
                <p className={`text-sm ${card.color}`}>
                  {card.subtitle}
                </p>
              )}
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  )
}
