
'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Edit, Trash2, Calendar, DollarSign, MoreVertical, Power, PowerOff } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog'
import { toast } from 'sonner'
import { Bill, BillFrequency } from '@/lib/types'
import { formatCurrency } from '@/lib/currency'
import AddBillDialog from './add-bill-dialog'

interface BillListProps {
  refreshTrigger: number
  onBillUpdated: () => void
}

export default function BillList({ refreshTrigger, onBillUpdated }: BillListProps) {
  const [bills, setBills] = useState<Bill[]>([])
  const [loading, setLoading] = useState(true)
  const [editingBill, setEditingBill] = useState<Bill | null>(null)
  const [deletingBill, setDeletingBill] = useState<Bill | null>(null)

  useEffect(() => {
    fetchBills()
  }, [refreshTrigger])

  const fetchBills = async () => {
    try {
      const response = await fetch('/api/bills')
      if (response.ok) {
        const data = await response.json()
        setBills(data)
      }
    } catch (error) {
      console.error('Error fetching bills:', error)
      toast.error('Failed to fetch bills')
    } finally {
      setLoading(false)
    }
  }

  const handleToggleActive = async (bill: Bill) => {
    try {
      const response = await fetch(`/api/bills/${bill.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...bill, isActive: !bill.isActive })
      })

      if (response.ok) {
        toast.success(`Bill ${bill.isActive ? 'deactivated' : 'activated'} successfully`)
        onBillUpdated()
      } else {
        toast.error('Failed to update bill')
      }
    } catch (error) {
      console.error('Error updating bill:', error)
      toast.error('Failed to update bill')
    }
  }

  const handleDeleteBill = async () => {
    if (!deletingBill) return

    try {
      const response = await fetch(`/api/bills/${deletingBill.id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        toast.success('Bill deleted successfully')
        onBillUpdated()
      } else {
        toast.error('Failed to delete bill')
      }
    } catch (error) {
      console.error('Error deleting bill:', error)
      toast.error('Failed to delete bill')
    } finally {
      setDeletingBill(null)
    }
  }

  const getFrequencyLabel = (frequency: BillFrequency) => {
    switch (frequency) {
      case BillFrequency.WEEKLY:
        return 'Weekly'
      case BillFrequency.MONTHLY:
        return 'Monthly'
      case BillFrequency.QUARTERLY:
        return 'Quarterly'
      case BillFrequency.HALF_YEARLY:
        return 'Half-yearly'
      case BillFrequency.YEARLY:
        return 'Yearly'
      default:
        return frequency
    }
  }

  const getNextDueDays = (nextDueDate: Date) => {
    const today = new Date()
    const due = new Date(nextDueDate)
    const diffTime = due.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffDays < 0) return `${Math.abs(diffDays)} days overdue`
    if (diffDays === 0) return 'Due today'
    if (diffDays === 1) return 'Due tomorrow'
    return `Due in ${diffDays} days`
  }

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <div className="h-4 bg-gray-200 rounded w-3/4" />
              <div className="h-3 bg-gray-200 rounded w-1/2" />
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-gray-200 rounded w-1/3 mb-4" />
              <div className="h-3 bg-gray-200 rounded w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {bills.map((bill, index) => (
          <motion.div
            key={bill.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className={`bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 ${!bill.isActive ? 'opacity-60' : ''}`}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg font-semibold text-gray-900 mb-1">
                      {bill.name}
                    </CardTitle>
                    <CardDescription className="text-sm text-gray-600">
                      {bill.description || 'No description'}
                    </CardDescription>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => setEditingBill(bill)}>
                        <Edit className="w-4 h-4 mr-2" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleToggleActive(bill)}>
                        {bill.isActive ? (
                          <>
                            <PowerOff className="w-4 h-4 mr-2" />
                            Deactivate
                          </>
                        ) : (
                          <>
                            <Power className="w-4 h-4 mr-2" />
                            Activate
                          </>
                        )}
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => setDeletingBill(bill)}
                        className="text-red-600"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center text-2xl font-bold text-gray-900">
                      <DollarSign className="w-5 h-5 mr-1" />
                      {formatCurrency(bill.amount)}
                    </div>
                    <Badge 
                      variant="secondary" 
                      className="bg-blue-100 text-blue-800 border-blue-200"
                    >
                      {getFrequencyLabel(bill.frequency)}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center text-gray-600">
                      <Calendar className="w-4 h-4 mr-1" />
                      {getNextDueDays(bill.nextDueDate)}
                    </div>
                    <div 
                      className="w-4 h-4 rounded-full border-2 border-white shadow-sm"
                      style={{ backgroundColor: bill.category.color }}
                      title={bill.category.name}
                    />
                  </div>
                  
                  <div className="text-xs text-gray-500">
                    Category: {bill.category.name}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {bills.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12"
        >
          <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No bills found</h3>
          <p className="text-gray-600">Start by adding your first recurring bill</p>
        </motion.div>
      )}

      <AddBillDialog
        open={!!editingBill}
        onOpenChange={(open) => !open && setEditingBill(null)}
        onBillAdded={() => {
          onBillUpdated()
          setEditingBill(null)
        }}
        editingBill={editingBill}
      />

      <AlertDialog open={!!deletingBill} onOpenChange={(open) => !open && setDeletingBill(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Bill</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{deletingBill?.name}"? This action cannot be undone and will also delete all associated bill instances.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteBill} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
