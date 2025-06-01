
'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  Building2, 
  Plus, 
  Calendar, 
  DollarSign,
  Clock,
  AlertTriangle,
  CheckCircle,
  TrendingUp,
  ChevronLeft,
  ChevronRight,
  Check,
  X
} from 'lucide-react'
import { formatCurrency } from '@/lib/currency'
import AddBillDialog from '@/components/add-bill-dialog'
import BillList from '@/components/bill-list'
import { toast } from 'sonner'

interface BillWithPaymentStatus {
  id: string
  name: string
  amount: number
  frequency: string
  description?: string
  isActive: boolean
  categoryId: string
  category: {
    id: string
    name: string
    color: string
  }
  nextDueDate: Date
  isPaid?: boolean
  paidDate?: Date | null
  viewPeriod?: string
  instances?: any[]
}

interface BillsData {
  bills: BillWithPaymentStatus[]
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
  const [activeView, setActiveView] = useState<'overview' | 'monthly' | 'yearly'>('overview')
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear())
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth() + 1)
  const [paymentLoading, setPaymentLoading] = useState<string | null>(null)

  useEffect(() => {
    fetchBillsData()
  }, [activeView, currentYear, currentMonth])

  const fetchBillsData = async () => {
    try {
      setLoading(true)
      
      let billsUrl = '/api/bills'
      if (activeView === 'monthly') {
        billsUrl = `/api/bills?view=monthly&year=${currentYear}&month=${currentMonth}`
      } else if (activeView === 'yearly') {
        billsUrl = `/api/bills?view=yearly&year=${currentYear}`
      }

      const [billsRes, statsRes] = await Promise.all([
        fetch(billsUrl),
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
        } else if (bill.frequency === 'ONE_TIME') {
          return sum // Don't include one-time bills in monthly calculation
        }
        return sum
      }, 0)

      const stats = {
        totalBills: bills.length,
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

  const handleMarkAsPaid = async (billId: string, amount?: number) => {
    try {
      setPaymentLoading(billId)
      
      const response = await fetch(`/api/bills/${billId}/payment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          view: activeView === 'monthly' ? 'monthly' : 'yearly',
          year: currentYear,
          month: activeView === 'monthly' ? currentMonth : undefined,
          amount
        })
      })

      if (response.ok) {
        toast.success('Bill marked as paid')
        fetchBillsData()
      } else {
        const error = await response.json()
        toast.error(error.error || 'Failed to mark bill as paid')
      }
    } catch (error) {
      console.error('Error marking bill as paid:', error)
      toast.error('Failed to mark bill as paid')
    } finally {
      setPaymentLoading(null)
    }
  }

  const handleMarkAsUnpaid = async (billId: string) => {
    try {
      setPaymentLoading(billId)
      
      const params = new URLSearchParams({
        view: activeView === 'monthly' ? 'monthly' : 'yearly',
        year: currentYear.toString(),
        ...(activeView === 'monthly' && { month: currentMonth.toString() })
      })

      const response = await fetch(`/api/bills/${billId}/payment?${params}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        toast.success('Bill marked as unpaid')
        fetchBillsData()
      } else {
        const error = await response.json()
        toast.error(error.error || 'Failed to mark bill as unpaid')
      }
    } catch (error) {
      console.error('Error marking bill as unpaid:', error)
      toast.error('Failed to mark bill as unpaid')
    } finally {
      setPaymentLoading(null)
    }
  }

  const navigateMonth = (direction: 'prev' | 'next') => {
    if (direction === 'prev') {
      if (currentMonth === 1) {
        setCurrentMonth(12)
        setCurrentYear(currentYear - 1)
      } else {
        setCurrentMonth(currentMonth - 1)
      }
    } else {
      if (currentMonth === 12) {
        setCurrentMonth(1)
        setCurrentYear(currentYear + 1)
      } else {
        setCurrentMonth(currentMonth + 1)
      }
    }
  }

  const navigateYear = (direction: 'prev' | 'next') => {
    setCurrentYear(currentYear + (direction === 'next' ? 1 : -1))
  }

  const getMonthName = (month: number) => {
    return new Date(2024, month - 1, 1).toLocaleString('default', { month: 'long' })
  }

  const getFrequencyBadgeColor = (frequency: string) => {
    switch (frequency) {
      case 'ONE_TIME': return 'bg-purple-100 text-purple-800'
      case 'WEEKLY': return 'bg-blue-100 text-blue-800'
      case 'MONTHLY': return 'bg-green-100 text-green-800'
      case 'QUARTERLY': return 'bg-yellow-100 text-yellow-800'
      case 'HALF_YEARLY': return 'bg-orange-100 text-orange-800'
      case 'YEARLY': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getFrequencyLabel = (frequency: string) => {
    switch (frequency) {
      case 'ONE_TIME': return 'One-time'
      case 'WEEKLY': return 'Weekly'
      case 'MONTHLY': return 'Monthly'
      case 'QUARTERLY': return 'Quarterly'
      case 'HALF_YEARLY': return 'Half-yearly'
      case 'YEARLY': return 'Yearly'
      default: return frequency
    }
  }

  const renderBillItem = (bill: BillWithPaymentStatus) => (
    <div key={bill.id} className="flex items-center justify-between p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
      <div className="flex items-center space-x-4">
        <div className="p-2 rounded-full" style={{ backgroundColor: `${bill.category.color}20` }}>
          <Building2 className="h-4 w-4" style={{ color: bill.category.color }} />
        </div>
        <div>
          <h3 className="font-semibold text-slate-900">{bill.name}</h3>
          <div className="flex items-center gap-2 mt-1">
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getFrequencyBadgeColor(bill.frequency)}`}>
              {getFrequencyLabel(bill.frequency)}
            </span>
            <span className="text-sm text-slate-600">{bill.category.name}</span>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <div className="text-right">
          <div className="text-lg font-bold text-blue-600">
            {formatCurrency(bill.amount)}
          </div>
          {(activeView === 'monthly' || activeView === 'yearly') && (
            <div className="flex items-center gap-1 mt-1">
              {bill.isPaid ? (
                <Badge className="bg-emerald-100 text-emerald-800">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Paid
                </Badge>
              ) : (
                <Badge variant="outline" className="text-orange-600 border-orange-200">
                  <Clock className="h-3 w-3 mr-1" />
                  Pending
                </Badge>
              )}
            </div>
          )}
        </div>
        {(activeView === 'monthly' || activeView === 'yearly') && (
          <div className="flex gap-2">
            {bill.isPaid ? (
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleMarkAsUnpaid(bill.id)}
                disabled={paymentLoading === bill.id}
                className="text-red-600 border-red-200 hover:bg-red-50"
              >
                <X className="h-3 w-3 mr-1" />
                Unmark
              </Button>
            ) : (
              <Button
                size="sm"
                onClick={() => handleMarkAsPaid(bill.id)}
                disabled={paymentLoading === bill.id}
                className="bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                <Check className="h-3 w-3 mr-1" />
                Mark Paid
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  )

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
              <div className="p-2 bg-gradient-to-br from-blue-700 to-blue-500 rounded-lg">
                <Building2 className="h-6 w-6 text-white" />
              </div>
              Bills & Utilities
            </h1>
            <p className="text-slate-600 mt-1">
              Manage your recurring bills and track payments
            </p>
          </div>
          <Button 
            className="bg-blue-600 hover:bg-blue-700 text-white"
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
                  <Building2 className="h-4 w-4 text-blue-600" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">
                  {data.stats.totalBills}
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  {activeView === 'overview' ? 'Active bills' : 
                   activeView === 'monthly' ? `Bills for ${getMonthName(currentMonth)}` :
                   `Bills for ${currentYear}`}
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
                  {activeView === 'yearly' ? 'Yearly Amount' : 'Monthly Amount'}
                </CardTitle>
                <div className="p-2 bg-emerald-100 rounded-lg">
                  <DollarSign className="h-4 w-4 text-emerald-600" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-emerald-600">
                  {formatCurrency(activeView === 'yearly' ? data.stats.monthlyAmount * 12 : data.stats.monthlyAmount)}
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  {activeView === 'yearly' ? 'Total for year' : 'Average monthly'}
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
                  Paid Bills
                </CardTitle>
                <div className="p-2 bg-emerald-100 rounded-lg">
                  <CheckCircle className="h-4 w-4 text-emerald-600" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-emerald-600">
                  {data.bills.filter(bill => bill.isPaid).length}
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  {activeView === 'overview' ? 'This month' : 
                   activeView === 'monthly' ? `In ${getMonthName(currentMonth)}` :
                   `In ${currentYear}`}
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
                  Pending Bills
                </CardTitle>
                <div className="p-2 bg-orange-100 rounded-lg">
                  <Clock className="h-4 w-4 text-orange-600" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">
                  {data.bills.filter(bill => !bill.isPaid).length}
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Need payment
                </p>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* View Tabs and Navigation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          <Tabs value={activeView} onValueChange={(value) => setActiveView(value as any)} className="w-full">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
              <TabsList className="grid w-full sm:w-auto grid-cols-3">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="monthly">Monthly View</TabsTrigger>
                <TabsTrigger value="yearly">Yearly View</TabsTrigger>
              </TabsList>

              {/* Period Navigation */}
              {activeView === 'monthly' && (
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigateMonth('prev')}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <span className="text-sm font-medium px-4 py-2 bg-slate-100 rounded-lg">
                    {getMonthName(currentMonth)} {currentYear}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigateMonth('next')}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              )}

              {activeView === 'yearly' && (
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigateYear('prev')}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <span className="text-sm font-medium px-4 py-2 bg-slate-100 rounded-lg">
                    {currentYear}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigateYear('next')}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>

            <TabsContent value="overview" className="space-y-6">
              <BillList refreshTrigger={0} onBillUpdated={fetchBillsData} />
            </TabsContent>

            <TabsContent value="monthly" className="space-y-6">
              <Card className="professional-card">
                <CardHeader>
                  <CardTitle className="text-slate-900">
                    Bills for {getMonthName(currentMonth)} {currentYear} ({data.bills.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {data.bills.length === 0 ? (
                    <div className="text-center py-8">
                      <Calendar className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-slate-900 mb-2">No bills for this month</h3>
                      <p className="text-slate-600 mb-4">No bills are due in {getMonthName(currentMonth)} {currentYear}</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {data.bills.map(renderBillItem)}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="yearly" className="space-y-6">
              <Card className="professional-card">
                <CardHeader>
                  <CardTitle className="text-slate-900">
                    Bills for {currentYear} ({data.bills.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {data.bills.length === 0 ? (
                    <div className="text-center py-8">
                      <Calendar className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-slate-900 mb-2">No bills for this year</h3>
                      <p className="text-slate-600 mb-4">No bills are due in {currentYear}</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {data.bills.map(renderBillItem)}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
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
