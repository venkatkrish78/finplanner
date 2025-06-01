
'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatCurrency } from '@/lib/currency'
import dynamic from 'next/dynamic'
import { motion } from 'framer-motion'

const Line = dynamic(() => import('react-chartjs-2').then(mod => mod.Line), {
  ssr: false,
  loading: () => <div className="h-64 flex items-center justify-center">Loading chart...</div>
})

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ChartOptions
} from 'chart.js'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
)

interface PerformanceData {
  monthlyPerformance: Array<{
    month: string
    invested: number
    value: number
    gainLoss: number
  }>
  topPerformers: Array<{
    investmentId: string
    name: string
    assetClass: string
    invested: number
    currentValue: number
    gainLoss: number
    gainLossPercentage: number
  }>
  worstPerformers: Array<{
    investmentId: string
    name: string
    assetClass: string
    invested: number
    currentValue: number
    gainLoss: number
    gainLossPercentage: number
  }>
}

export default function InvestmentPerformanceChart() {
  const [performanceData, setPerformanceData] = useState<PerformanceData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchPerformanceData()
  }, [])

  const fetchPerformanceData = async () => {
    try {
      const response = await fetch('/api/investments/analytics')
      if (response.ok) {
        const data = await response.json()
        setPerformanceData(data)
      }
    } catch (error) {
      console.error('Error fetching performance data:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  if (!performanceData) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <p className="text-gray-500">No performance data available</p>
        </CardContent>
      </Card>
    )
  }

  const chartData = {
    labels: performanceData.monthlyPerformance.map(item => item.month),
    datasets: [
      {
        label: 'Total Invested',
        data: performanceData.monthlyPerformance.map(item => item.invested),
        borderColor: '#3B82F6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4,
        fill: false
      },
      {
        label: 'Current Value',
        data: performanceData.monthlyPerformance.map(item => item.value),
        borderColor: '#10B981',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        tension: 0.4,
        fill: false
      }
    ]
  }

  const chartOptions: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      tooltip: {
        callbacks: {
          label: function(context: any) {
            return `${context.dataset.label}: ${formatCurrency(context.parsed.y)}`
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function(value: any) {
            return formatCurrency(value)
          }
        }
      }
    }
  }

  const getPerformanceColor = (percentage: number) => {
    if (percentage > 0) return 'text-green-600'
    if (percentage < 0) return 'text-red-600'
    return 'text-gray-600'
  }

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-900">
              Portfolio Performance Over Time
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <Line data={chartData} options={chartOptions} />
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-green-600">
                Top Performers
              </CardTitle>
            </CardHeader>
            <CardContent>
              {performanceData.topPerformers.length > 0 ? (
                <div className="space-y-3">
                  {performanceData.topPerformers.map((investment, index) => (
                    <div key={investment.investmentId} className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                      <div>
                        <div className="font-medium text-gray-900">{investment.name}</div>
                        <div className="text-sm text-gray-600">{investment.assetClass.replace('_', ' ')}</div>
                      </div>
                      <div className="text-right">
                        <div className={`font-semibold ${getPerformanceColor(investment.gainLossPercentage)}`}>
                          +{investment.gainLossPercentage.toFixed(2)}%
                        </div>
                        <div className="text-sm text-gray-600">
                          {formatCurrency(investment.gainLoss)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-4">No performance data available</p>
              )}
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-red-600">
                Worst Performers
              </CardTitle>
            </CardHeader>
            <CardContent>
              {performanceData.worstPerformers.length > 0 ? (
                <div className="space-y-3">
                  {performanceData.worstPerformers.map((investment, index) => (
                    <div key={investment.investmentId} className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
                      <div>
                        <div className="font-medium text-gray-900">{investment.name}</div>
                        <div className="text-sm text-gray-600">{investment.assetClass.replace('_', ' ')}</div>
                      </div>
                      <div className="text-right">
                        <div className={`font-semibold ${getPerformanceColor(investment.gainLossPercentage)}`}>
                          {investment.gainLossPercentage.toFixed(2)}%
                        </div>
                        <div className="text-sm text-gray-600">
                          {formatCurrency(investment.gainLoss)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-4">No performance data available</p>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
