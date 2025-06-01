
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
  CreditCard, 
  Calendar, 
  DollarSign, 
  Edit, 
  Trash2, 
  Building2,
  Hash,
  FileText,
  Tag,
  ArrowUpRight,
  ArrowDownRight,
  ArrowLeftRight,
  CheckCircle,
  Clock,
  XCircle,
  Smartphone,
  Mail,
  FileSpreadsheet,
  User
} from 'lucide-react'
import { formatCurrency } from '@/lib/currency'
import { Transaction, TransactionType, TransactionStatus, TransactionSource } from '@/lib/types'
import { toast } from 'sonner'
import { AddTransactionDialog } from './add-transaction-dialog'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog'

interface TransactionDetailModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  transactionId: string | null
  onTransactionUpdated: () => void
}

interface TransactionWithDetails extends Transaction {
  // Add any additional fields that might be included in detailed view
}

export default function TransactionDetailModal({ 
  open, 
  onOpenChange, 
  transactionId, 
  onTransactionUpdated 
}: TransactionDetailModalProps) {
  const [transaction, setTransaction] = useState<TransactionWithDetails | null>(null)
  const [loading, setLoading] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)

  useEffect(() => {
    if (open && transactionId) {
      fetchTransactionDetails()
    }
  }, [open, transactionId])

  const fetchTransactionDetails = async () => {
    if (!transactionId) return
    
    try {
      setLoading(true)
      const response = await fetch(`/api/transactions/${transactionId}`)
      if (response.ok) {
        const data = await response.json()
        setTransaction(data)
      } else {
        toast.error('Failed to fetch transaction details')
        onOpenChange(false)
      }
    } catch (error) {
      console.error('Error fetching transaction details:', error)
      toast.error('Failed to fetch transaction details')
      onOpenChange(false)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteTransaction = async () => {
    if (!transaction) return

    try {
      const response = await fetch(`/api/transactions/${transaction.id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        toast.success('Transaction deleted successfully')
        onTransactionUpdated()
        onOpenChange(false)
      } else {
        toast.error('Failed to delete transaction')
      }
    } catch (error) {
      console.error('Error deleting transaction:', error)
      toast.error('Failed to delete transaction')
    } finally {
      setDeleteDialogOpen(false)
    }
  }

  const getTransactionIcon = (type: TransactionType) => {
    switch (type) {
      case TransactionType.INCOME:
        return <ArrowDownRight className="h-6 w-6 text-emerald-600" />
      case TransactionType.EXPENSE:
        return <ArrowUpRight className="h-6 w-6 text-red-600" />
      case TransactionType.TRANSFER:
        return <ArrowLeftRight className="h-6 w-6 text-blue-600" />
      default:
        return <CreditCard className="h-6 w-6 text-professional-blue" />
    }
  }

  const getTransactionColor = (type: TransactionType) => {
    switch (type) {
      case TransactionType.INCOME:
        return 'text-emerald-600'
      case TransactionType.EXPENSE:
        return 'text-red-600'
      case TransactionType.TRANSFER:
        return 'text-blue-600'
      default:
        return 'text-professional-blue'
    }
  }

  const getAmountDisplay = (transaction: Transaction) => {
    const amount = formatCurrency(transaction.amount)
    switch (transaction.type) {
      case TransactionType.INCOME:
        return `+${amount}`
      case TransactionType.EXPENSE:
        return `-${amount}`
      default:
        return amount
    }
  }

  const getStatusBadge = (status: TransactionStatus) => {
    switch (status) {
      case TransactionStatus.SUCCESS:
        return <Badge className="bg-emerald-100 text-emerald-800"><CheckCircle className="w-3 h-3 mr-1" />Success</Badge>
      case TransactionStatus.PENDING:
        return <Badge variant="outline" className="text-orange-600 border-orange-200"><Clock className="w-3 h-3 mr-1" />Pending</Badge>
      case TransactionStatus.FAILED:
        return <Badge className="bg-red-100 text-red-800"><XCircle className="w-3 h-3 mr-1" />Failed</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const getSourceIcon = (source: TransactionSource) => {
    switch (source) {
      case TransactionSource.SMS:
        return <Smartphone className="w-4 h-4" />
      case TransactionSource.EMAIL:
        return <Mail className="w-4 h-4" />
      case TransactionSource.BANK_STATEMENT:
        return <FileSpreadsheet className="w-4 h-4" />
      case TransactionSource.MANUAL:
        return <User className="w-4 h-4" />
      default:
        return <FileText className="w-4 h-4" />
    }
  }

  const getSourceLabel = (source: TransactionSource) => {
    switch (source) {
      case TransactionSource.SMS:
        return 'SMS Import'
      case TransactionSource.EMAIL:
        return 'Email Import'
      case TransactionSource.BANK_STATEMENT:
        return 'Bank Statement'
      case TransactionSource.MANUAL:
        return 'Manual Entry'
      default:
        return source
    }
  }

  const getTypeLabel = (type: TransactionType) => {
    switch (type) {
      case TransactionType.INCOME:
        return 'Income'
      case TransactionType.EXPENSE:
        return 'Expense'
      case TransactionType.TRANSFER:
        return 'Transfer'
      default:
        return type
    }
  }

  if (!open) return null

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-professional-blue" />
              Transaction Details
            </DialogTitle>
          </DialogHeader>

          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-professional-blue"></div>
            </div>
          ) : transaction ? (
            <ScrollArea className="max-h-[calc(90vh-120px)]">
              <div className="space-y-6 pr-4">
                {/* Transaction Header */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-start justify-between"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-2 rounded-full bg-slate-100">
                        {getTransactionIcon(transaction.type)}
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold text-gray-900">
                          {transaction.description || 'No description'}
                        </h2>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge className="bg-blue-100 text-blue-800">
                            {getTypeLabel(transaction.type)}
                          </Badge>
                          {transaction.category && (
                            <div className="flex items-center gap-1">
                              <div 
                                className="w-3 h-3 rounded-full"
                                style={{ backgroundColor: transaction.category.color }}
                              />
                              <span className="text-sm text-gray-600">{transaction.category.name}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className={`text-3xl font-bold mb-2 ${getTransactionColor(transaction.type)}`}>
                      {getAmountDisplay(transaction)}
                    </div>
                    
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 mr-1" />
                        {new Date(transaction.date).toLocaleDateString('en-US', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </div>
                      <div className="flex items-center">
                        <Clock className="w-4 h-4 mr-1" />
                        {new Date(transaction.date).toLocaleTimeString('en-US', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setEditDialogOpen(true)}
                      className="text-professional-blue border-blue-200 hover:bg-blue-50"
                    >
                      <Edit className="w-4 h-4 mr-1" />
                      Edit
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

                {/* Transaction Information */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <FileText className="h-5 w-5" />
                        Transaction Information
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm font-medium text-gray-600">Amount</label>
                          <p className="text-lg font-semibold text-gray-900">{formatCurrency(transaction.amount)}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-600">Type</label>
                          <p className="text-lg font-semibold text-gray-900">{getTypeLabel(transaction.type)}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-600">Status</label>
                          <div className="mt-1">
                            {getStatusBadge(transaction.status)}
                          </div>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-600">Source</label>
                          <div className="flex items-center gap-2 mt-1">
                            {getSourceIcon(transaction.source)}
                            <span className="text-lg font-semibold text-gray-900">
                              {getSourceLabel(transaction.source)}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      {transaction.merchant && (
                        <div>
                          <label className="text-sm font-medium text-gray-600">Merchant</label>
                          <p className="text-lg font-semibold text-gray-900 mt-1">{transaction.merchant}</p>
                        </div>
                      )}

                      {transaction.description && (
                        <div>
                          <label className="text-sm font-medium text-gray-600">Description</label>
                          <p className="text-gray-900 mt-1">{transaction.description}</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>

                {/* Technical Details */}
                {(transaction.accountNumber || transaction.transactionId || transaction.balance !== null) && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                          <Hash className="h-5 w-5" />
                          Technical Details
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          {transaction.accountNumber && (
                            <div>
                              <label className="text-sm font-medium text-gray-600">Account Number</label>
                              <p className="text-lg font-semibold text-gray-900 font-mono">
                                ****{transaction.accountNumber}
                              </p>
                            </div>
                          )}
                          {transaction.transactionId && (
                            <div>
                              <label className="text-sm font-medium text-gray-600">Transaction ID</label>
                              <p className="text-lg font-semibold text-gray-900 font-mono">
                                {transaction.transactionId}
                              </p>
                            </div>
                          )}
                          {transaction.balance !== null && transaction.balance !== undefined && (
                            <div>
                              <label className="text-sm font-medium text-gray-600">Account Balance</label>
                              <p className="text-lg font-semibold text-gray-900">
                                {formatCurrency(transaction.balance)}
                              </p>
                            </div>
                          )}
                          <div>
                            <label className="text-sm font-medium text-gray-600">Created</label>
                            <p className="text-lg font-semibold text-gray-900">
                              {new Date(transaction.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                )}

                {/* Raw Message (for imported transactions) */}
                {transaction.rawMessage && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                          <FileText className="h-5 w-5" />
                          Original Message
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="bg-gray-50 p-3 rounded-lg">
                          <p className="text-sm text-gray-700 font-mono whitespace-pre-wrap">
                            {transaction.rawMessage}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                )}
              </div>
            </ScrollArea>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-600">Transaction not found</p>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <AddTransactionDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        onTransactionAdded={() => {
          setEditDialogOpen(false)
          onTransactionUpdated()
          fetchTransactionDetails()
        }}
        editingTransaction={transaction}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Transaction</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this transaction? This action cannot be undone and will remove the transaction from all reports and calculations.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteTransaction} className="bg-red-600 hover:bg-red-700">
              Delete Transaction
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
