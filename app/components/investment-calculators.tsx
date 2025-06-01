
'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Calculator, TrendingUp, Target } from 'lucide-react'
import { formatCurrency } from '@/lib/currency'
import { motion } from 'framer-motion'
import dynamic from 'next/dynamic'

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

interface SIPResult {
  monthlyInvestment: number
  totalInvestment: number
  maturityAmount: number
  totalReturns: number
  schedule: Array<{
    month: number
    investment: number
    value: number
    returns: number
  }>
}

interface GrowthResult {
  futureValue: number
  totalReturns: number
  cagr: number
  projectedGrowth: Array<{
    year: number
    value: number
    returns: number
  }>
}

export default function InvestmentCalculators() {
  const [sipData, setSipData] = useState({
    monthlyInvestment: '',
    annualReturn: '',
    years: ''
  })
  const [growthData, setGrowthData] = useState({
    initialAmount: '',
    annualReturn: '',
    years: '',
    monthlyAddition: ''
  })
  const [sipResult, setSipResult] = useState<SIPResult | null>(null)
  const [growthResult, setGrowthResult] = useState<GrowthResult | null>(null)
  const [loading, setLoading] = useState(false)

  const calculateSIP = async () => {
    if (!sipData.monthlyInvestment || !sipData.annualReturn || !sipData.years) return

    setLoading(true)
    try {
      const response = await fetch('/api/investments/calculators/sip', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          monthlyInvestment: parseFloat(sipData.monthlyInvestment),
          annualReturn: parseFloat(sipData.annualReturn),
          years: parseInt(sipData.years)
        }),
      })

      if (response.ok) {
        const result = await response.json()
        setSipResult(result)
      }
    } catch (error) {
      console.error('Error calculating SIP:', error)
    } finally {
      setLoading(false)
    }
  }

  const calculateGrowth = async () => {
    if (!growthData.initialAmount || !growthData.annualReturn || !growthData.years) return

    setLoading(true)
    try {
      const response = await fetch('/api/investments/calculators/growth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          initialAmount: parseFloat(growthData.initialAmount),
          annualReturn: parseFloat(growthData.annualReturn),
          years: parseInt(growthData.years),
          monthlyAddition: growthData.monthlyAddition ? parseFloat(growthData.monthlyAddition) : 0
        }),
      })

      if (response.ok) {
        const result = await response.json()
        setGrowthResult(result)
      }
    } catch (error) {
      console.error('Error calculating growth:', error)
    } finally {
      setLoading(false)
    }
  }

  const sipChartData = sipResult ? {
    labels: sipResult.schedule.map(item => `Year ${Math.ceil(item.month / 12)}`),
    datasets: [
      {
        label: 'Total Investment',
        data: sipResult.schedule.map(item => item.investment),
        borderColor: '#3B82F6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4
      },
      {
        label: 'Maturity Value',
        data: sipResult.schedule.map(item => item.value),
        borderColor: '#10B981',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        tension: 0.4
      }
    ]
  } : null

  const growthChartData = growthResult ? {
    labels: growthResult.projectedGrowth.map(item => `Year ${item.year}`),
    datasets: [
      {
        label: 'Investment Value',
        data: growthResult.projectedGrowth.map(item => item.value),
        borderColor: '#10B981',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        tension: 0.4
      }
    ]
  } : null

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

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Calculator className="h-6 w-6 text-blue-600" />
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Investment Calculators</h2>
          <p className="text-gray-600">Plan your investments with our calculation tools</p>
        </div>
      </div>

      <Tabs defaultValue="sip" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="sip" className="flex items-center gap-2">
            <Target className="h-4 w-4" />
            SIP Calculator
          </TabsTrigger>
          <TabsTrigger value="growth" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Growth Calculator
          </TabsTrigger>
        </TabsList>

        <TabsContent value="sip" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg font-semibold text-blue-600">
                    SIP Calculator
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="monthlyInvestment">Monthly Investment (₹)</Label>
                    <Input
                      id="monthlyInvestment"
                      type="number"
                      value={sipData.monthlyInvestment}
                      onChange={(e) => setSipData({ ...sipData, monthlyInvestment: e.target.value })}
                      placeholder="5000"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="annualReturn">Expected Annual Return (%)</Label>
                    <Input
                      id="annualReturn"
                      type="number"
                      step="0.1"
                      value={sipData.annualReturn}
                      onChange={(e) => setSipData({ ...sipData, annualReturn: e.target.value })}
                      placeholder="12"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="years">Investment Period (Years)</Label>
                    <Input
                      id="years"
                      type="number"
                      value={sipData.years}
                      onChange={(e) => setSipData({ ...sipData, years: e.target.value })}
                      placeholder="10"
                    />
                  </div>

                  <Button 
                    onClick={calculateSIP} 
                    disabled={loading}
                    className="w-full bg-blue-600 hover:bg-blue-700"
                  >
                    {loading ? 'Calculating...' : 'Calculate SIP'}
                  </Button>
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
                  <CardTitle className="text-lg font-semibold text-green-600">
                    SIP Results
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {sipResult ? (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-blue-50 p-3 rounded-lg">
                          <p className="text-sm text-blue-600">Total Investment</p>
                          <p className="text-lg font-bold text-blue-800">
                            {formatCurrency(sipResult.totalInvestment)}
                          </p>
                        </div>
                        <div className="bg-green-50 p-3 rounded-lg">
                          <p className="text-sm text-green-600">Maturity Amount</p>
                          <p className="text-lg font-bold text-green-800">
                            {formatCurrency(sipResult.maturityAmount)}
                          </p>
                        </div>
                      </div>
                      <div className="bg-purple-50 p-3 rounded-lg">
                        <p className="text-sm text-purple-600">Total Returns</p>
                        <p className="text-lg font-bold text-purple-800">
                          {formatCurrency(sipResult.totalReturns)}
                        </p>
                      </div>
                      {sipChartData && (
                        <div className="h-64">
                          <Line data={sipChartData} options={chartOptions} />
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-64 text-gray-500">
                      Enter values and click calculate to see results
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </TabsContent>

        <TabsContent value="growth" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg font-semibold text-green-600">
                    Investment Growth Calculator
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="initialAmount">Initial Investment (₹)</Label>
                    <Input
                      id="initialAmount"
                      type="number"
                      value={growthData.initialAmount}
                      onChange={(e) => setGrowthData({ ...growthData, initialAmount: e.target.value })}
                      placeholder="100000"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="monthlyAddition">Monthly Addition (₹) - Optional</Label>
                    <Input
                      id="monthlyAddition"
                      type="number"
                      value={growthData.monthlyAddition}
                      onChange={(e) => setGrowthData({ ...growthData, monthlyAddition: e.target.value })}
                      placeholder="5000"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="growthAnnualReturn">Expected Annual Return (%)</Label>
                    <Input
                      id="growthAnnualReturn"
                      type="number"
                      step="0.1"
                      value={growthData.annualReturn}
                      onChange={(e) => setGrowthData({ ...growthData, annualReturn: e.target.value })}
                      placeholder="12"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="growthYears">Investment Period (Years)</Label>
                    <Input
                      id="growthYears"
                      type="number"
                      value={growthData.years}
                      onChange={(e) => setGrowthData({ ...growthData, years: e.target.value })}
                      placeholder="10"
                    />
                  </div>

                  <Button 
                    onClick={calculateGrowth} 
                    disabled={loading}
                    className="w-full bg-green-600 hover:bg-green-700"
                  >
                    {loading ? 'Calculating...' : 'Calculate Growth'}
                  </Button>
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
                  <CardTitle className="text-lg font-semibold text-green-600">
                    Growth Results
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {growthResult ? (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 gap-4">
                        <div className="bg-green-50 p-3 rounded-lg">
                          <p className="text-sm text-green-600">Future Value</p>
                          <p className="text-lg font-bold text-green-800">
                            {formatCurrency(growthResult.futureValue)}
                          </p>
                        </div>
                        <div className="bg-blue-50 p-3 rounded-lg">
                          <p className="text-sm text-blue-600">Total Returns</p>
                          <p className="text-lg font-bold text-blue-800">
                            {formatCurrency(growthResult.totalReturns)}
                          </p>
                        </div>
                        <div className="bg-purple-50 p-3 rounded-lg">
                          <p className="text-sm text-purple-600">CAGR</p>
                          <p className="text-lg font-bold text-purple-800">
                            {growthResult.cagr}%
                          </p>
                        </div>
                      </div>
                      {growthChartData && (
                        <div className="h-64">
                          <Line data={growthChartData} options={chartOptions} />
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-64 text-gray-500">
                      Enter values and click calculate to see results
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
