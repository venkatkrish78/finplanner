
'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import { 
  Building2, 
  Calendar, 
  DollarSign, 
  Edit, 
  Trash2, 
  Clock,
  CheckCircle,
  AlertTriangle,
  FileText,
  Tag,
  Power,
  PowerOff,
  History
} from 'lucide-react'
import { formatCurrency } from '@/lib/currency'
import { Bill, BillFrequency, BillStatus } from '@/lib/types'
import { toast } from 'sonner'
import AddBillDialog from './add-bill-dialog'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog'

interface BillDetailModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  billId: string | null
  onBillUpdated: () => void
}

interface BillWithDetails extends Bill {
  instances: Array<{
    id: string
    dueDate: string
    amount: number
    status: BillStatus
    paidDate?: string
    notes?: string
  }>
}

export default function BillDetailModal({ 
  open, 
  onOpenChange, 
  billId, 
  onBillUpdated 
}: BillDetailModalProps) {
  const [bill, setBill] = useState<BillWithDetails | null>(null)
  const [loading, setLoading] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)

  useEffect(() => {
    if (open && billId) {
      fetchBillDetails()
    }
  }, [open, billId])

  const fetchBillDetails = async () => {
    if (!billId) return
    
    try {
      setLoading(true)
      const response = await fetch(`/api/bills/${billId}`)
      if (response.ok) {
        const data = await response.json()
        setBill(data)
      } else {
        toast.error('Failed to fetch bill details')
        onOpenChange(false)
      }
    } catch (error) {
      console.error('Error fetching bill details:', error)
      toast.error('Failed to fetch bill details')
      onOpenChange(false)
    } finally {
      setLoading(false)
    }
  }

  const handleToggleActive = async () => {
    if (!bill) return

    try {
      const response = await fetch(`/api/bills/${bill.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...bill, isActive: !bill.isActive })
      })

      if (response.ok) {
        toast.success(`Bill ${bill.isActive ? 'deactivated' : 'activated'} successfully`)
        onBillUpdated()
        fetchBillDetails()
      } else {
        toast.error('Failed to update bill')
      }
    } catch (error) {
      console.error('Error updating bill:', error)
      toast.error('Failed to update bill')
    }
  }

  const handleDeleteBill = async () => {
    if (!bill) return

    try {
      const response = await fetch(`/api/bills/${bill.id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        toast.success('Bill deleted successfully')
        onBillUpdated()
        onOpenChange(false)
      } else {
        toast.error('Failed to delete bill')
      }
    } catch (error) {
      console.error('Error deleting bill:', error)
      toast.error('Failed to delete bill')
    } finally {
      setDeleteDialogOpen(false)
    }
  }

  const getFrequencyLabel = (frequency: BillFrequency) => {
    switch (frequency) {
      case BillFrequency.WEEKLY: return 'Weekly'
      case BillFrequency.MONTHLY: return 'Monthly'
      case BillFrequency.QUARTERLY: return 'Quarterly'
      case BillFrequency.HALF_YEARLY: return 'Half-yearly'
      case BillFrequency.YEARLY: return 'Yearly'
      case BillFrequency.ONE_TIME: return 'One-time'
      default: return frequency
    }
  }

  const getStatusBadge = (status: BillStatus) => {
    switch (status) {
      case BillStatus.PAID:
        return <Badge className="bg-emerald-100 text-emerald-800"><CheckCircle className="w-3 h-3 mr-1" />Paid</Badge>
      case BillStatus.PENDING:
        return <Badge variant="outline" className="text-orange-600 border-orange-200"><Clock className="w-3 h-3 mr-1" />Pending</Badge>
      case BillStatus.OVERDUE:
        return <Badge className="bg-red-100 text-red-800"><AlertTriangle className="w-3 h-3 mr-1" />Overdue</Badge>
      case BillStatus.CANCELLED:
        return <Badge variant="outline" className="text-gray-600 border-gray-200">Cancelled</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
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

  if (!open) return null

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-blue-600" />
              Bill Details
            </DialogTitle>
          </DialogHeader>

          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : bill ? (
            <ScrollArea className="max-h-[calc(90vh-120px)]">
              <div className="space-y-6 pr-4">
                {/* Bill Header */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-start justify-between"
                >
                  <div className="flex-1">
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">{bill.name}</h2>
                    <div className="flex items-center gap-3 mb-3">
                      <Badge 
                        className="bg-blue-100 text-blue-800"
                      >
                        {getFrequencyLabel(bill.frequency)}
                      </Badge>
                      <div className="flex items-center gap-1">
                        <div 
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: bill.category.color }}
                        />
                        <span className="text-sm text-gray-600">{bill.category.name}</span>
                      </div>
                      {!bill.isActive && (
                        <Badge variant="outline" className="text-gray-600">
                          Inactive
                        </Badge>
                      )}
                    </div>
                    <div className="text-3xl font-bold text-blue-600 mb-2">
                      {formatCurrency(bill.amount)}
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <Calendar className="w-4 h-4 mr-1" />
                      {getNextDueDays(bill.nextDueDate)}
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setEditDialogOpen(true)}
                      className="text-blue-600 border-blue-200 hover:bg-blue-50"
                    >
                      <Edit className="w-4 h-4 mr-1" />
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleToggleActive}
                      className={bill.isActive ? "text-orange-600 border-orange-200 hover:bg-orange-50" : "text-green-600 border-green-200 hover:bg-green-50"}
                    >
                      {bill.isActive ? (
                        <>
                          <PowerOff className="w-4 h-4 mr-1" />
                          Deactivate
                        </>
                      ) : (
                        <>
                          <Power className="w-4 h-4 mr-1" />
                          Activate
                        </>
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setDeleteDialogOpen(true)}
                      className="text-red-600 border-red-200 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4 mr-1" />
                      Delete
                    </Button>
                  </div>
                </motion.div>

                <Separator />

                {/* Bill Information */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <FileText className="h-5 w-5" />
                        Bill Information
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm font-medium text-gray-600">Amount</label>
                          <p className="text-lg font-semibold text-gray-900">{formatCurrency(bill.amount)}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-600">Frequency</label>
                          <p className="text-lg font-semibold text-gray-900">{getFrequencyLabel(bill.frequency)}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-600">Next Due Date</label>
                          <p className="text-lg font-semibold text-gray-900">
                            {new Date(bill.nextDueDate).toLocaleDateString()}
                          </p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-600">Status</label>
                          <p className="text-lg font-semibold text-gray-900">
                            {bill.isActive ? 'Active' : 'Inactive'}
                          </p>
                        </div>
                      </div>
                      
                      {bill.description && (
                        <div>
                          <label className="text-sm font-medium text-gray-600">Description</label>
                          <p className="text-gray-900 mt-1">{bill.description}</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>

                {/* Payment History */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <History className="h-5 w-5" />
                        Payment History ({bill.instances?.length || 0})
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {bill.instances && bill.instances.length > 0 ? (
                        <div className="space-y-3">
                          {bill.instances.slice(0, 10).map((instance) => (
                            <div key={instance.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                              <div className="flex items-center gap-3">
                                <div>
                                  <p className="font-medium text-gray-900">
                                    {formatCurrency(instance.amount)}
                                  </p>
                                  <p className="text-sm text-gray-600">
                                    Due: {new Date(instance.dueDate).toLocaleDateString()}
                                  </p>
                                  {instance.paidDate && (
                                    <p className="text-sm text-green-600">
                                      Paid: {new Date(instance.paidDate).toLocaleDateString()}
                                    </p>
                                  )}
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                {getStatusBadge(instance.status)}
                              </div>
                            </div>
                          ))}
                          {bill.instances.length > 10 && (
                            <p className="text-sm text-gray-600 text-center py-2">
                              Showing latest 10 payments
                            </p>
                          )}
                        </div>
                      ) : (
                        <div className="text-center py-6">
                          <History className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                          <p className="text-gray-600">No payment history available</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              </div>
            </ScrollArea>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-600">Bill not found</p>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <AddBillDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        onBillAdded={() => {
          setEditDialogOpen(false)
          onBillUpdated()
          fetchBillDetails()
        }}
        editingBill={bill}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Bill</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{bill?.name}"? This action cannot be undone and will also delete all associated bill instances and payment history.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteBill} className="bg-red-600 hover:bg-red-700">
              Delete Bill
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
