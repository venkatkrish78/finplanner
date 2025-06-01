
'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { AlertTriangle, Clock, Check, Calendar } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { BillInstance, BillStatus } from '@/lib/types'
import { formatCurrency } from '@/lib/currency'

interface BillRemindersProps {
  refreshTrigger: number
}

export default function BillReminders({ refreshTrigger }: BillRemindersProps) {
  const [upcomingBills, setUpcomingBills] = useState<BillInstance[]>([])
  const [overdueBills, setOverdueBills] = useState<BillInstance[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchReminders()
  }, [refreshTrigger])

  const fetchReminders = async () => {
    try {
      // Fetch upcoming bills (next 7 days)
      const upcomingResponse = await fetch('/api/bills/instances?upcoming=true')
      if (upcomingResponse.ok) {
        const upcomingData = await upcomingResponse.json()
        setUpcomingBills(upcomingData)
      }

      // Fetch overdue bills
      const overdueResponse = await fetch('/api/bills/instances?overdue=true')
      if (overdueResponse.ok) {
        const overdueData = await overdueResponse.json()
        setOverdueBills(overdueData)
      }
    } catch (error) {
      console.error('Error fetching reminders:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleMarkAsPaid = async (instance: BillInstance) => {
    try {
      const response = await fetch(`/api/bills/instances/${instance.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          status: 'PAID',
          createTransaction: true
        })
      })

      if (response.ok) {
        toast.success('Bill marked as paid')
        fetchReminders()
      } else {
        toast.error('Failed to update bill')
      }
    } catch (error) {
      console.error('Error updating bill:', error)
      toast.error('Failed to update bill')
    }
  }

  const getDaysUntilDue = (dueDate: Date) => {
    const today = new Date()
    const due = new Date(dueDate)
    const diffTime = due.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffDays < 0) return `${Math.abs(diffDays)} days overdue`
    if (diffDays === 0) return 'Due today'
    if (diffDays === 1) return 'Due tomorrow'
    return `Due in ${diffDays} days`
  }

  if (loading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[...Array(2)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <div className="h-5 bg-gray-200 rounded w-1/2" />
              <div className="h-4 bg-gray-200 rounded w-3/4" />
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[...Array(3)].map((_, j) => (
                  <div key={j} className="h-16 bg-gray-200 rounded" />
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (upcomingBills.length === 0 && overdueBills.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center py-8"
      >
        <Calendar className="w-16 h-16 text-green-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">All caught up!</h3>
        <p className="text-gray-600">No upcoming or overdue bills at the moment</p>
      </motion.div>
    )
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Overdue Bills */}
      {overdueBills.length > 0 && (
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <Card className="bg-red-50/80 backdrop-blur-sm border-red-200 shadow-lg">
            <CardHeader>
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-red-600" />
                <CardTitle className="text-red-900">Overdue Bills</CardTitle>
              </div>
              <CardDescription className="text-red-700">
                {overdueBills.length} bill{overdueBills.length !== 1 ? 's' : ''} past due date
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {overdueBills.slice(0, 5).map((bill, index) => (
                  <motion.div
                    key={bill.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center justify-between p-3 bg-white rounded-lg border border-red-200"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium text-gray-900">{bill.bill.name}</h4>
                        <Badge variant="destructive" className="text-xs">
                          {getDaysUntilDue(bill.dueDate)}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600">
                        {formatCurrency(bill.amount)} • {bill.bill.category.name}
                      </p>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => handleMarkAsPaid(bill)}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <Check className="w-4 h-4 mr-1" />
                      Pay
                    </Button>
                  </motion.div>
                ))}
                {overdueBills.length > 5 && (
                  <p className="text-sm text-red-600 text-center">
                    +{overdueBills.length - 5} more overdue bills
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Upcoming Bills */}
      {upcomingBills.length > 0 && (
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: overdueBills.length > 0 ? 0.2 : 0 }}
        >
          <Card className="bg-yellow-50/80 backdrop-blur-sm border-yellow-200 shadow-lg">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-yellow-600" />
                <CardTitle className="text-yellow-900">Upcoming Bills</CardTitle>
              </div>
              <CardDescription className="text-yellow-700">
                {upcomingBills.length} bill{upcomingBills.length !== 1 ? 's' : ''} due in the next 7 days
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {upcomingBills.slice(0, 5).map((bill, index) => (
                  <motion.div
                    key={bill.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center justify-between p-3 bg-white rounded-lg border border-yellow-200"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium text-gray-900">{bill.bill.name}</h4>
                        <Badge variant="secondary" className="text-xs bg-yellow-100 text-yellow-800">
                          {getDaysUntilDue(bill.dueDate)}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600">
                        {formatCurrency(bill.amount)} • {bill.bill.category.name}
                      </p>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleMarkAsPaid(bill)}
                      className="border-green-200 text-green-700 hover:bg-green-50"
                    >
                      <Check className="w-4 h-4 mr-1" />
                      Pay
                    </Button>
                  </motion.div>
                ))}
                {upcomingBills.length > 5 && (
                  <p className="text-sm text-yellow-600 text-center">
                    +{upcomingBills.length - 5} more upcoming bills
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  )
}
