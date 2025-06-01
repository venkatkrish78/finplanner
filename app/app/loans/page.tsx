
'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Calculator, 
  Plus, 
  DollarSign, 
  Percent,
  Calendar,
  TrendingDown,
  BarChart3,
  CreditCard
} from 'lucide-react'
import { formatCurrency } from '@/lib/currency'
import { AddLoanDialog } from '@/components/add-loan-dialog'

interface LoansData {
  loans: any[]
  stats: {
    totalLoans: number
    totalBalance: number
    monthlyEMI: number
    averageInterest: number
    totalPaid: number
    remainingAmount: number
  }
}

export default function LoansPage() {
  const [data, setData] = useState<LoansData | null>(null)
  const [loading, setLoading] = useState(true)
  const [showAddDialog, setShowAddDialog] = useState(false)

  useEffect(() => {
    fetchLoansData()
  }, [])

  const fetchLoansData = async () => {
    try {
      setLoading(true)
      
      const response = await fetch('/api/loans')
      if (response.ok) {
        const loans = await response.json()
        
        // Calculate stats
        const totalLoans = loans?.length || 0
        const totalBalance = loans?.reduce((sum: number, l: any) => sum + l.currentBalance, 0) || 0
        const monthlyEMI = loans?.reduce((sum: number, l: any) => sum + l.emiAmount, 0) || 0
        const averageInterest = totalLoans > 0 
          ? loans.reduce((sum: number, l: any) => sum + l.interestRate, 0) / totalLoans 
          : 0
        const totalPaid = loans?.reduce((sum: number, l: any) => sum + (l.principalAmount - l.currentBalance), 0) || 0
        const remainingAmount = totalBalance

        setData({
          loans: loans || [],
          stats: {
            totalLoans,
            totalBalance,
            monthlyEMI,
            averageInterest,
            totalPaid,
            remainingAmount
          }
        })
      }
    } catch (error) {
      console.error('Error fetching loans data:', error)
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
          <h1 className="text-2xl font-bold text-slate-900">Error loading loans</h1>
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
                <Calculator className="h-6 w-6 text-white" />
              </div>
              Loan Management
            </h1>
            <p className="text-slate-600 mt-1">
              Track your loans and manage EMI payments
            </p>
          </div>
          <Button 
            className="bg-professional-blue hover:bg-professional-blue-dark text-white"
            onClick={() => setShowAddDialog(true)}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Loan
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <Card className="professional-card hover-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-slate-600">
                  Total Loans
                </CardTitle>
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Calculator className="h-4 w-4 text-professional-blue" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-professional-blue">
                  {data.stats.totalLoans}
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Active loans
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
                  Monthly EMI
                </CardTitle>
                <div className="p-2 bg-red-100 rounded-lg">
                  <DollarSign className="h-4 w-4 text-red-600" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">
                  {formatCurrency(data.stats.monthlyEMI)}
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Total monthly payment
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
                  Avg. Interest
                </CardTitle>
                <div className="p-2 bg-orange-100 rounded-lg">
                  <Percent className="h-4 w-4 text-orange-600" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">
                  {data.stats.averageInterest.toFixed(1)}%
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Average rate
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
                  Outstanding Balance
                </CardTitle>
                <div className="p-2 bg-red-100 rounded-lg">
                  <TrendingDown className="h-4 w-4 text-red-600" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">
                  {formatCurrency(data.stats.totalBalance)}
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Remaining amount
                </p>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Loans List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          <Card className="professional-card">
            <CardHeader>
              <CardTitle className="text-slate-900">Loans ({data.loans.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {data.loans.length === 0 ? (
                <div className="text-center py-8">
                  <Calculator className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">No loans found</h3>
                  <p className="text-slate-600 mb-4">Start by adding your first loan</p>
                  <Button 
                    className="bg-professional-blue hover:bg-professional-blue-dark text-white"
                    onClick={() => setShowAddDialog(true)}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Loan
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {data.loans.map((loan: any) => (
                    <div key={loan.id} className="flex items-center justify-between p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
                      <div className="flex items-center space-x-4">
                        <div className="p-2 rounded-full bg-slate-100">
                          <Calculator className="h-4 w-4 text-professional-blue" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-slate-900">{loan.name}</h3>
                          <p className="text-sm text-slate-600">{loan.loanType} • {loan.interestRate}% interest</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-red-600">
                          {formatCurrency(loan.currentBalance)}
                        </div>
                        <p className="text-sm text-slate-600">
                          EMI: {formatCurrency(loan.emiAmount)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>

      {/* Add Loan Dialog */}
      <AddLoanDialog
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
        onLoanAdded={() => {
          setShowAddDialog(false)
          fetchLoansData()
        }}
      />
    </div>
  )
}
