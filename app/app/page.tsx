
'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  CreditCard,
  Target,
  Building2,
  Calculator,
  PlusCircle,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  Wallet,
  PiggyBank,
  BarChart3
} from 'lucide-react'
import { DashboardStats } from '@/components/dashboard-stats'
import { formatCurrency } from '@/lib/currency'
import Link from 'next/link'

interface DashboardData {
  totalIncome: number
  totalExpenses: number
  netBalance: number
  transactionCount: number
  recentTransactions: any[]
  upcomingBills: any[]
  activeGoals: any[]
  totalLoans: number
  totalInvestments: number
  investmentGain: number
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      
      // Fetch all required data
      const [
        transactionsRes,
        billsRes,
        goalsRes,
        loansRes,
        investmentsRes
      ] = await Promise.all([
        fetch('/api/transactions'),
        fetch('/api/bills'),
        fetch('/api/goals'),
        fetch('/api/loans'),
        fetch('/api/investments')
      ])

      const transactions = transactionsRes.ok ? (await transactionsRes.json()).transactions || [] : []
      const bills = billsRes.ok ? (await billsRes.json()).bills || [] : []
      const goals = goalsRes.ok ? (await goalsRes.json()).goals || [] : []
      const loans = loansRes.ok ? (await loansRes.json()).loans || [] : []
      const investments = investmentsRes.ok ? (await investmentsRes.json()).investments || [] : []

      // Calculate dashboard metrics
      const totalIncome = transactions
        .filter((t: any) => t.type === 'INCOME')
        .reduce((sum: number, t: any) => sum + t.amount, 0)

      const totalExpenses = transactions
        .filter((t: any) => t.type === 'EXPENSE')
        .reduce((sum: number, t: any) => sum + t.amount, 0)

      const netBalance = totalIncome - totalExpenses

      const totalLoans = loans.reduce((sum: number, loan: any) => sum + loan.currentBalance, 0)
      
      const totalInvestments = investments.reduce((sum: number, inv: any) => sum + inv.currentValue, 0)
      const totalInvested = investments.reduce((sum: number, inv: any) => sum + inv.totalInvested, 0)
      const investmentGain = totalInvestments - totalInvested

      setData({
        totalIncome,
        totalExpenses,
        netBalance,
        transactionCount: transactions.length,
        recentTransactions: transactions.slice(0, 5),
        upcomingBills: bills.filter((bill: any) => bill.isActive).slice(0, 3),
        activeGoals: goals.filter((goal: any) => goal.status === 'ACTIVE').slice(0, 3),
        totalLoans,
        totalInvestments,
        investmentGain
      })
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-slate-200 rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-slate-200 rounded"></div>
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {[...Array(2)].map((_, i) => (
              <div key={i} className="h-64 bg-slate-200 rounded"></div>
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
          <h1 className="text-2xl font-bold text-slate-900">Error loading dashboard</h1>
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
                <BarChart3 className="h-6 w-6 text-white" />
              </div>
              Financial Dashboard
            </h1>
            <p className="text-slate-600 mt-1">
              Welcome to FinPlanner - Your comprehensive financial overview
            </p>
          </div>
          <div className="flex gap-2">
            <Link href="/transactions">
              <Button className="bg-professional-blue hover:bg-professional-blue-dark">
                <PlusCircle className="h-4 w-4 mr-2" />
                Add Transaction
              </Button>
            </Link>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <Card className="professional-card hover-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-slate-600">
                  Total Income
                </CardTitle>
                <div className="p-2 bg-emerald-100 rounded-lg">
                  <TrendingUp className="h-4 w-4 text-emerald-600" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-emerald-600">
                  {formatCurrency(data.totalIncome)}
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  All time earnings
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
                  Total Expenses
                </CardTitle>
                <div className="p-2 bg-red-100 rounded-lg">
                  <TrendingDown className="h-4 w-4 text-red-600" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">
                  {formatCurrency(data.totalExpenses)}
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  All time spending
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
                  Net Balance
                </CardTitle>
                <div className={`p-2 rounded-lg ${data.netBalance >= 0 ? 'bg-emerald-100' : 'bg-red-100'}`}>
                  <Wallet className={`h-4 w-4 ${data.netBalance >= 0 ? 'text-emerald-600' : 'text-red-600'}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${data.netBalance >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                  {formatCurrency(Math.abs(data.netBalance))}
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  {data.netBalance >= 0 ? 'Positive balance' : 'Negative balance'}
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
                  Transactions
                </CardTitle>
                <div className="p-2 bg-blue-100 rounded-lg">
                  <CreditCard className="h-4 w-4 text-professional-blue" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-professional-blue">
                  {data.transactionCount}
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Total recorded
                </p>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Portfolio Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.7 }}
          >
            <Card className="professional-card hover-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-slate-900">
                  <Target className="h-5 w-5 text-professional-blue" />
                  Financial Goals
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-600">Active Goals</span>
                    <Badge variant="secondary" className="bg-blue-100 text-professional-blue">
                      {data.activeGoals.length}
                    </Badge>
                  </div>
                  {data.activeGoals.length > 0 ? (
                    <div className="space-y-2">
                      {data.activeGoals.slice(0, 2).map((goal: any) => (
                        <div key={goal.id} className="text-sm">
                          <div className="flex justify-between">
                            <span className="text-slate-700">{goal.name}</span>
                            <span className="text-slate-500">
                              {Math.round((goal.currentAmount / goal.targetAmount) * 100)}%
                            </span>
                          </div>
                          <div className="w-full bg-slate-200 rounded-full h-1.5 mt-1">
                            <div 
                              className="bg-professional-blue h-1.5 rounded-full" 
                              style={{ width: `${Math.min((goal.currentAmount / goal.targetAmount) * 100, 100)}%` }}
                            ></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-slate-500">No active goals</p>
                  )}
                  <Link href="/goals">
                    <Button variant="outline" size="sm" className="w-full mt-3">
                      View All Goals
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.8 }}
          >
            <Card className="professional-card hover-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-slate-900">
                  <Calculator className="h-5 w-5 text-red-600" />
                  Loan Portfolio
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-red-600">
                      {formatCurrency(data.totalLoans)}
                    </div>
                    <p className="text-sm text-slate-600">Outstanding Balance</p>
                  </div>
                  <Link href="/loans">
                    <Button variant="outline" size="sm" className="w-full">
                      Manage Loans
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.9 }}
          >
            <Card className="professional-card hover-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-slate-900">
                  <TrendingUp className="h-5 w-5 text-emerald-600" />
                  Investment Portfolio
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-emerald-600">
                      {formatCurrency(data.totalInvestments)}
                    </div>
                    <p className="text-sm text-slate-600">Current Value</p>
                    <div className={`text-sm font-medium ${data.investmentGain >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                      {data.investmentGain >= 0 ? '+' : ''}{formatCurrency(data.investmentGain)} 
                      ({data.investmentGain >= 0 ? '+' : ''}{data.totalInvestments > 0 ? ((data.investmentGain / (data.totalInvestments - data.investmentGain)) * 100).toFixed(1) : '0.0'}%)
                    </div>
                  </div>
                  <Link href="/investments">
                    <Button variant="outline" size="sm" className="w-full">
                      View Portfolio
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 1.0 }}
        >
          <Card className="professional-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-slate-900">
                <CreditCard className="h-5 w-5 text-professional-blue" />
                Recent Transactions
              </CardTitle>
            </CardHeader>
            <CardContent>
              {data.recentTransactions.length > 0 ? (
                <div className="space-y-4">
                  {data.recentTransactions.map((transaction: any) => (
                    <div key={transaction.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className={`p-2 rounded-full ${transaction.type === 'INCOME' ? 'bg-emerald-100' : 'bg-red-100'}`}>
                          {transaction.type === 'INCOME' ? (
                            <ArrowDownRight className="h-4 w-4 text-emerald-600" />
                          ) : (
                            <ArrowUpRight className="h-4 w-4 text-red-600" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-slate-900">
                            {transaction.description || 'No description'}
                          </p>
                          <p className="text-sm text-slate-500 flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {new Date(transaction.date).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`font-bold ${transaction.type === 'INCOME' ? 'text-emerald-600' : 'text-red-600'}`}>
                          {transaction.type === 'INCOME' ? '+' : '-'}{formatCurrency(transaction.amount)}
                        </div>
                        <Badge 
                          variant="secondary" 
                          className="text-xs"
                          style={{ backgroundColor: transaction.category?.color + '20', color: transaction.category?.color }}
                        >
                          {transaction.category?.name}
                        </Badge>
                      </div>
                    </div>
                  ))}
                  <Link href="/transactions">
                    <Button variant="outline" className="w-full">
                      View All Transactions
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="text-center py-8">
                  <CreditCard className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">No transactions yet</h3>
                  <p className="text-slate-600 mb-4">Start by adding your first transaction</p>
                  <Link href="/transactions">
                    <Button className="bg-professional-blue hover:bg-professional-blue-dark">
                      <PlusCircle className="h-4 w-4 mr-2" />
                      Add Transaction
                    </Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </div>
  )
}
