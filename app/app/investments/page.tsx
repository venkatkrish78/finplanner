
'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  TrendingUp, 
  Plus, 
  DollarSign, 
  Percent,
  PieChart,
  BarChart3,
  Calculator,
  Repeat
} from 'lucide-react'
import { formatCurrency } from '@/lib/currency'
import AddInvestmentDialog from '@/components/add-investment-dialog'
import InvestmentList from '@/components/investment-list'

interface InvestmentsData {
  investments: any[]
  portfolio: {
    totalInvestments: number
    totalInvested: number
    currentValue: number
    totalGainLoss: number
    totalGainLossPercentage: number
  }
}

export default function InvestmentsPage() {
  const [data, setData] = useState<InvestmentsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [showAddDialog, setShowAddDialog] = useState(false)

  useEffect(() => {
    fetchInvestmentsData()
  }, [])

  const fetchInvestmentsData = async () => {
    try {
      setLoading(true)
      
      const [investmentsRes, portfolioRes] = await Promise.all([
        fetch('/api/investments?includeGoals=true'),
        fetch('/api/investments/portfolio')
      ])

      const investments = investmentsRes.ok ? await investmentsRes.json() : []
      const portfolioData = portfolioRes.ok ? await portfolioRes.json() : null
      const portfolio = portfolioData ? portfolioData.stats : {
        totalInvestments: 0,
        totalInvested: 0,
        currentValue: 0,
        totalGainLoss: 0,
        totalGainLossPercentage: 0
      }

      setData({
        investments,
        portfolio
      })
    } catch (error) {
      console.error('Error fetching investments data:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-slate-200 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-slate-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-slate-900">Error loading investments</h1>
          <p className="text-slate-600 mt-2">Please try refreshing the page</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-8"
      >
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-professional-blue to-professional-blue-light rounded-lg">
                <TrendingUp className="h-6 w-6 text-white" />
              </div>
              Investment Portfolio
            </h1>
            <p className="text-slate-600 mt-1">
              Track your investments and monitor portfolio performance
            </p>
          </div>
          <div className="flex gap-2">
            <Button 
              className="bg-professional-blue hover:bg-professional-blue-dark text-white"
              onClick={() => setShowAddDialog(true)}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Investment
            </Button>
            <Button
              variant="outline"
              className="border-emerald-600 text-emerald-600 hover:bg-emerald-50"
            >
              <Repeat className="h-4 w-4 mr-2" />
              Start SIP
            </Button>
          </div>
        </div>

        {/* Portfolio Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <Card className="professional-card hover-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-slate-600">
                  Total Investments
                </CardTitle>
                <div className="p-2 bg-blue-100 rounded-lg">
                  <TrendingUp className="h-4 w-4 text-professional-blue" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-professional-blue">
                  {data.portfolio.totalInvestments}
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Active investments
                </p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Card className="professional-card hover-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-slate-600">
                  Invested Value
                </CardTitle>
                <div className="p-2 bg-slate-100 rounded-lg">
                  <DollarSign className="h-4 w-4 text-slate-600" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-slate-600">
                  {formatCurrency(data.portfolio.totalInvested)}
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Total invested
                </p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <Card className="professional-card hover-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-slate-600">
                  Current Value
                </CardTitle>
                <div className="p-2 bg-emerald-100 rounded-lg">
                  <TrendingUp className="h-4 w-4 text-emerald-600" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-emerald-600">
                  {formatCurrency(data.portfolio.currentValue)}
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Market value
                </p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <Card className="professional-card hover-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-slate-600">
                  Gain/Loss
                </CardTitle>
                <div className={`p-2 rounded-lg ${data.portfolio.totalGainLoss >= 0 ? 'bg-emerald-100' : 'bg-red-100'}`}>
                  <Percent className={`h-4 w-4 ${data.portfolio.totalGainLoss >= 0 ? 'text-emerald-600' : 'text-red-600'}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${data.portfolio.totalGainLoss >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                  {data.portfolio.totalGainLoss >= 0 ? '+' : ''}{formatCurrency(data.portfolio.totalGainLoss)}
                </div>
                <p className={`text-xs mt-1 ${data.portfolio.totalGainLoss >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                  {data.portfolio.totalGainLoss >= 0 ? '+' : ''}{data.portfolio.totalGainLossPercentage.toFixed(2)}%
                </p>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Investments List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          <InvestmentList investments={data.investments} onInvestmentUpdated={fetchInvestmentsData} />
        </motion.div>
      </motion.div>

      {/* Add Investment Dialog */}
      <AddInvestmentDialog
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
        onInvestmentAdded={() => {
          setShowAddDialog(false)
          fetchInvestmentsData()
        }}
      />
    </div>
  )
}
