
'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { AssetAllocation, PlatformAllocation } from '@/lib/types'
import { formatCurrency } from '@/lib/currency'
import dynamic from 'next/dynamic'
import { motion } from 'framer-motion'

const Pie = dynamic(() => import('react-chartjs-2').then(mod => mod.Pie), {
  ssr: false,
  loading: () => <div className="h-64 flex items-center justify-center">Loading chart...</div>
})

import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  ChartOptions
} from 'chart.js'

ChartJS.register(ArcElement, Tooltip, Legend)

interface AssetAllocationChartProps {
  assetAllocation: AssetAllocation[]
  platformAllocation: PlatformAllocation[]
}

const assetClassColors: { [key: string]: string } = {
  STOCKS: '#3B82F6',
  MUTUAL_FUNDS: '#10B981',
  CRYPTO: '#8B5CF6',
  REAL_ESTATE: '#F59E0B',
  GOLD: '#EAB308',
  BONDS: '#6366F1',
  PPF: '#059669',
  EPF: '#0D9488',
  NSC: '#0891B2',
  ELSS: '#84CC16',
  FD: '#F97316',
  RD: '#EC4899',
  ETF: '#7C3AED',
  OTHER: '#6B7280'
}

const platformColors: { [key: string]: string } = {
  ZERODHA: '#FF6B35',
  GROWW: '#00D09C',
  ANGEL_ONE: '#1E40AF',
  UPSTOX: '#7C3AED',
  PAYTM_MONEY: '#0EA5E9',
  KUVERA: '#059669',
  COIN_DCBBANK: '#DC2626',
  HDFC_SECURITIES: '#0891B2',
  ICICI_DIRECT: '#EA580C',
  KOTAK_SECURITIES: '#BE123C',
  SBI_SECURITIES: '#1D4ED8',
  BANK_BRANCH: '#16A34A',
  POST_OFFICE: '#CA8A04',
  OTHER: '#6B7280'
}

export default function AssetAllocationChart({ 
  assetAllocation, 
  platformAllocation 
}: AssetAllocationChartProps) {
  const assetChartData = {
    labels: assetAllocation.map(asset => asset.assetClass.replace('_', ' ')),
    datasets: [
      {
        data: assetAllocation.map(asset => asset.value),
        backgroundColor: assetAllocation.map(asset => assetClassColors[asset.assetClass] || '#6B7280'),
        borderWidth: 2,
        borderColor: '#ffffff'
      }
    ]
  }

  const platformChartData = {
    labels: platformAllocation.map(platform => platform.platform.replace('_', ' ')),
    datasets: [
      {
        data: platformAllocation.map(platform => platform.value),
        backgroundColor: platformAllocation.map(platform => platformColors[platform.platform] || '#6B7280'),
        borderWidth: 2,
        borderColor: '#ffffff'
      }
    ]
  }

  const chartOptions: ChartOptions<'pie'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          padding: 20,
          usePointStyle: true,
          font: {
            size: 12
          }
        }
      },
      tooltip: {
        callbacks: {
          label: function(context: any) {
            const label = context.label || ''
            const value = context.parsed || 0
            const percentage = ((value / context.dataset.data.reduce((a: number, b: number) => a + b, 0)) * 100).toFixed(1)
            return `${label}: ${formatCurrency(value)} (${percentage}%)`
          }
        }
      }
    }
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-900">
              Asset Allocation
            </CardTitle>
          </CardHeader>
          <CardContent>
            {assetAllocation.length > 0 ? (
              <>
                <div className="h-64 mb-4">
                  <Pie data={assetChartData} options={chartOptions} />
                </div>
                <div className="space-y-2">
                  {assetAllocation.map((asset, index) => (
                    <div key={asset.assetClass} className="flex justify-between items-center text-sm">
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: assetClassColors[asset.assetClass] }}
                        />
                        <span>{asset.assetClass.replace('_', ' ')}</span>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">{formatCurrency(asset.value)}</div>
                        <div className="text-gray-500">{asset.percentage.toFixed(1)}%</div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="h-64 flex items-center justify-center text-gray-500">
                No asset allocation data available
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-900">
              Platform Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            {platformAllocation.length > 0 ? (
              <>
                <div className="h-64 mb-4">
                  <Pie data={platformChartData} options={chartOptions} />
                </div>
                <div className="space-y-2">
                  {platformAllocation.map((platform, index) => (
                    <div key={platform.platform} className="flex justify-between items-center text-sm">
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: platformColors[platform.platform] }}
                        />
                        <span>{platform.platform.replace('_', ' ')}</span>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">{formatCurrency(platform.value)}</div>
                        <div className="text-gray-500">
                          {platform.investmentCount} investment{platform.investmentCount !== 1 ? 's' : ''}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="h-64 flex items-center justify-center text-gray-500">
                No platform distribution data available
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </>
  )
}
