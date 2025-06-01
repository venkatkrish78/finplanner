
'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { ChevronLeft, ChevronRight, Check, Clock, AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { toast } from 'sonner'
import { BillInstance, BillStatus } from '@/lib/types'
import { formatCurrency } from '@/lib/currency'

interface BillCalendarProps {
  refreshTrigger: number
  onBillUpdated: () => void
}

export default function BillCalendar({ refreshTrigger, onBillUpdated }: BillCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [billInstances, setBillInstances] = useState<BillInstance[]>([])
  const [selectedDay, setSelectedDay] = useState<Date | null>(null)
  const [selectedDayBills, setSelectedDayBills] = useState<BillInstance[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchBillInstances()
  }, [currentDate, refreshTrigger])

  const fetchBillInstances = async () => {
    try {
      const month = currentDate.getMonth() + 1
      const year = currentDate.getFullYear()
      
      const response = await fetch(`/api/bills/instances?month=${month}&year=${year}`)
      if (response.ok) {
        const data = await response.json()
        setBillInstances(data)
      }
    } catch (error) {
      console.error('Error fetching bill instances:', error)
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
        fetchBillInstances()
        onBillUpdated()
      } else {
        toast.error('Failed to update bill')
      }
    } catch (error) {
      console.error('Error updating bill:', error)
      toast.error('Failed to update bill')
    }
  }

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
  }

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay()
  }

  const getBillsForDay = (day: number) => {
    const dayDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day)
    return billInstances.filter(instance => {
      const instanceDate = new Date(instance.dueDate)
      return instanceDate.getDate() === day &&
             instanceDate.getMonth() === dayDate.getMonth() &&
             instanceDate.getFullYear() === dayDate.getFullYear()
    })
  }

  const getStatusColor = (status: BillStatus) => {
    switch (status) {
      case BillStatus.PAID:
        return 'bg-green-500'
      case BillStatus.PENDING:
        return 'bg-yellow-500'
      case BillStatus.OVERDUE:
        return 'bg-red-500'
      default:
        return 'bg-gray-500'
    }
  }

  const getStatusIcon = (status: BillStatus) => {
    switch (status) {
      case BillStatus.PAID:
        return <Check className="w-3 h-3" />
      case BillStatus.PENDING:
        return <Clock className="w-3 h-3" />
      case BillStatus.OVERDUE:
        return <AlertTriangle className="w-3 h-3" />
      default:
        return null
    }
  }

  const handleDayClick = (day: number) => {
    const dayDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day)
    const dayBills = getBillsForDay(day)
    
    if (dayBills.length > 0) {
      setSelectedDay(dayDate)
      setSelectedDayBills(dayBills)
    }
  }

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev)
      if (direction === 'prev') {
        newDate.setMonth(prev.getMonth() - 1)
      } else {
        newDate.setMonth(prev.getMonth() + 1)
      }
      return newDate
    })
  }

  const daysInMonth = getDaysInMonth(currentDate)
  const firstDay = getFirstDayOfMonth(currentDate)
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1)
  const emptyDays = Array.from({ length: firstDay }, (_, i) => i)

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ]

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

  if (loading) {
    return (
      <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
        <CardHeader>
          <div className="h-6 bg-gray-200 rounded w-1/3 animate-pulse" />
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-2">
            {[...Array(35)].map((_, i) => (
              <div key={i} className="h-20 bg-gray-200 rounded animate-pulse" />
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl font-semibold text-gray-900">
              {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
            </CardTitle>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigateMonth('prev')}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigateMonth('next')}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-2 mb-4">
            {dayNames.map(day => (
              <div key={day} className="text-center text-sm font-medium text-gray-600 py-2">
                {day}
              </div>
            ))}
          </div>
          
          <div className="grid grid-cols-7 gap-2">
            {emptyDays.map(day => (
              <div key={`empty-${day}`} className="h-20" />
            ))}
            
            {days.map(day => {
              const dayBills = getBillsForDay(day)
              const isToday = new Date().toDateString() === new Date(currentDate.getFullYear(), currentDate.getMonth(), day).toDateString()
              
              return (
                <motion.div
                  key={day}
                  whileHover={{ scale: 1.02 }}
                  className={`h-20 p-2 border rounded-lg cursor-pointer transition-all duration-200 ${
                    isToday 
                      ? 'bg-blue-50 border-blue-200' 
                      : dayBills.length > 0 
                        ? 'bg-gray-50 border-gray-200 hover:bg-gray-100' 
                        : 'bg-white border-gray-100 hover:bg-gray-50'
                  }`}
                  onClick={() => handleDayClick(day)}
                >
                  <div className="text-sm font-medium text-gray-900 mb-1">
                    {day}
                  </div>
                  <div className="space-y-1">
                    {dayBills.slice(0, 2).map(bill => (
                      <div
                        key={bill.id}
                        className={`text-xs px-1 py-0.5 rounded text-white truncate ${getStatusColor(bill.status)}`}
                        title={`${bill.bill.name} - ${formatCurrency(bill.amount)}`}
                      >
                        {bill.bill.name}
                      </div>
                    ))}
                    {dayBills.length > 2 && (
                      <div className="text-xs text-gray-500">
                        +{dayBills.length - 2} more
                      </div>
                    )}
                  </div>
                </motion.div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      <Dialog open={!!selectedDay} onOpenChange={(open) => !open && setSelectedDay(null)}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              Bills for {selectedDay?.toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </DialogTitle>
            <DialogDescription>
              {selectedDayBills.length} bill{selectedDayBills.length !== 1 ? 's' : ''} due on this day
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {selectedDayBills.map(bill => (
              <motion.div
                key={bill.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-medium text-gray-900">{bill.bill.name}</h4>
                    <Badge 
                      variant="secondary"
                      className={`text-white ${getStatusColor(bill.status)}`}
                    >
                      <div className="flex items-center gap-1">
                        {getStatusIcon(bill.status)}
                        {bill.status}
                      </div>
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600 mb-1">
                    {formatCurrency(bill.amount)}
                  </p>
                  <p className="text-xs text-gray-500">
                    Category: {bill.bill.category.name}
                  </p>
                  {bill.notes && (
                    <p className="text-xs text-gray-500 mt-1">
                      Notes: {bill.notes}
                    </p>
                  )}
                </div>
                
                {bill.status === BillStatus.PENDING && (
                  <Button
                    size="sm"
                    onClick={() => handleMarkAsPaid(bill)}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <Check className="w-4 h-4 mr-1" />
                    Mark Paid
                  </Button>
                )}
              </motion.div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
