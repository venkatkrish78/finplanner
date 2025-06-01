
'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Building2, 
  Plus, 
  Calendar, 
  DollarSign,
  Clock,
  AlertTriangle,
  CheckCircle,
  TrendingUp
} from 'lucide-react'
import { formatCurrency } from '@/lib/currency'
import AddBillDialog from '@/components/add-bill-dialog'

interface BillsData {
  bills: any[]
  stats: {
    totalBills: number
    monthlyAmount: number
    overdueBills: number
    paidThisMonth: number
  }
}

export default function BillsPage() {
  const [data, setData] = useState<BillsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [showAddDialog, setShowAddDialog] = useState(false)

  useEffect(() => {
    fetchBillsData()
  }, [])

  const fetchBillsData = async () => {
    try {
      setLoading(true)
      
      const [billsRes, statsRes] = await Promise.all([
        fetch('/api/bills'),
        fetch('/api/bills/stats')
      ])

      const bills = billsRes.ok ? await billsRes.json() : []
      const statsData = statsRes.ok ? await statsRes.json() : {
        totalMonthlyBills: 0,
        paidThisMonth: 0,
        pendingThisMonth: 0,
        overdueCount: 0,
        upcomingWeek: 0
      }

      // Calculate monthly amount from bills
      const monthlyAmount = bills.reduce((sum: number, bill: any) => {
        if (bill.frequency === 'MONTHLY') {
          return sum + bill.amount
        } else if (bill.frequency === 'WEEKLY') {
          return sum + (bill.amount * 4.33) // Average weeks per month
        } else if (bill.frequency === 'QUARTERLY') {
          return sum + (bill.amount / 3)
        } else if (bill.frequency === 'HALF_YEARLY') {
          return sum + (bill.amount / 6)
        } else if (bill.frequency === 'YEARLY') {
          return sum + (bill.amount / 12)
        }
        return sum
      }, 0)

      const stats = {
        totalBills: statsData.totalMonthlyBills,
        monthlyAmount,
        overdueBills: statsData.overdueCount,
        paidThisMonth: statsData.paidThisMonth
      }

      setData({
        bills,
        stats
      })
    } catch (error) {
      console.error('Error fetching bills data:', error)
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
          <h1 className="text-2xl font-bold text-slate-900">Error loading bills</h1>
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
                <Building2 className="h-6 w-6 text-white" />
              </div>
              Bills & Utilities
            </h1>
            <p className="text-slate-600 mt-1">
              Manage your recurring bills and track payments
            </p>
          </div>
          <Button 
            className="bg-professional-blue hover:bg-professional-blue-dark text-white"
            onClick={() => setShowAddDialog(true)}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Bill
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
                  Total Bills
                </CardTitle>
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Building2 className="h-4 w-4 text-professional-blue" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-professional-blue">
                  {data.stats.totalBills}
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Active bills
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
                  Monthly Amount
                </CardTitle>
                <div className="p-2 bg-emerald-100 rounded-lg">
                  <DollarSign className="h-4 w-4 text-emerald-600" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-emerald-600">
                  {formatCurrency(data.stats.monthlyAmount)}
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Average monthly
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
                  Overdue Bills
                </CardTitle>
                <div className="p-2 bg-red-100 rounded-lg">
                  <AlertTriangle className="h-4 w-4 text-red-600" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">
                  {data.stats.overdueBills}
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Need attention
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
                  Paid This Month
                </CardTitle>
                <div className="p-2 bg-emerald-100 rounded-lg">
                  <CheckCircle className="h-4 w-4 text-emerald-600" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-emerald-600">
                  {data.stats.paidThisMonth}
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Completed payments
                </p>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Bills List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          <Card className="professional-card">
            <CardHeader>
              <CardTitle className="text-slate-900">Bills ({data.bills.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {data.bills.length === 0 ? (
                <div className="text-center py-8">
                  <Building2 className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">No bills found</h3>
                  <p className="text-slate-600 mb-4">Start by adding your first bill</p>
                  <Button 
                    className="bg-professional-blue hover:bg-professional-blue-dark text-white"
                    onClick={() => setShowAddDialog(true)}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Bill
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {data.bills.map((bill: any) => (
                    <div key={bill.id} className="flex items-center justify-between p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
                      <div className="flex items-center space-x-4">
                        <div className="p-2 rounded-full bg-slate-100">
                          <Building2 className="h-4 w-4 text-professional-blue" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-slate-900">{bill.name}</h3>
                          <p className="text-sm text-slate-600">{bill.frequency}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-professional-blue">
                          {formatCurrency(bill.amount)}
                        </div>
                        <Badge variant={bill.isActive ? 'default' : 'secondary'}>
                          {bill.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>

      {/* Add Bill Dialog */}
      <AddBillDialog
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
        onBillAdded={() => {
          setShowAddDialog(false)
          fetchBillsData()
        }}
      />
    </div>
  )
}
