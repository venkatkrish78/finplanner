
'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Progress } from '@/components/ui/progress'
import { 
  CreditCard, 
  Calendar, 
  DollarSign, 
  Edit, 
  Trash2, 
  Percent,
  TrendingDown,
  FileText,
  History,
  Plus,
  Calculator
} from 'lucide-react'
import { formatCurrency } from '@/lib/currency'
import { Loan, LoanType, LoanPaymentType } from '@/lib/types'
import { toast } from 'sonner'
import EditLoanDialog from './edit-loan-dialog'
import DeleteLoanDialog from './delete-loan-dialog'
import { AddLoanPaymentDialog } from './add-loan-payment-dialog'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog'

interface LoanDetailModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  loanId: string | null
  onLoanUpdated: () => void
}

interface LoanWithDetails extends Omit<Loan, 'payments'> {
  payments: Array<{
    id: string
    loanId: string
    amount: number
    paymentType: LoanPaymentType
    principalPaid: number
    interestPaid: number
    paymentDate: string
    note?: string
    createdAt: string
    transaction?: {
      id: string
      description?: string
    }
  }>
}

const loanTypeLabels = {
  [LoanType.HOME_LOAN]: 'Home Loan',
  [LoanType.PERSONAL_LOAN]: 'Personal Loan',
  [LoanType.CAR_LOAN]: 'Car Loan',
  [LoanType.EDUCATION_LOAN]: 'Education Loan',
  [LoanType.CREDIT_CARD]: 'Credit Card',
  [LoanType.BUSINESS_LOAN]: 'Business Loan',
  [LoanType.GOLD_LOAN]: 'Gold Loan',
  [LoanType.OTHER]: 'Other'
}

const paymentTypeLabels = {
  [LoanPaymentType.EMI]: 'EMI',
  [LoanPaymentType.PREPAYMENT]: 'Prepayment',
  [LoanPaymentType.PARTIAL_PAYMENT]: 'Partial Payment',
  [LoanPaymentType.INTEREST_ONLY]: 'Interest Only'
}

export default function LoanDetailModal({ 
  open, 
  onOpenChange, 
  loanId, 
  onLoanUpdated 
}: LoanDetailModalProps) {
  const [loan, setLoan] = useState<LoanWithDetails | null>(null)
  const [loading, setLoading] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false)

  useEffect(() => {
    if (open && loanId) {
      fetchLoanDetails()
    }
  }, [open, loanId])

  const fetchLoanDetails = async () => {
    if (!loanId) return
    
    try {
      setLoading(true)
      const response = await fetch(`/api/loans/${loanId}`)
      if (response.ok) {
        const data = await response.json()
        setLoan(data)
      } else {
        toast.error('Failed to fetch loan details')
        onOpenChange(false)
      }
    } catch (error) {
      console.error('Error fetching loan details:', error)
      toast.error('Failed to fetch loan details')
      onOpenChange(false)
    } finally {
      setLoading(false)
    }
  }

  const calculateProgress = () => {
    if (!loan) return 0
    const paidAmount = loan.principalAmount - loan.currentBalance
    return loan.principalAmount > 0 ? (paidAmount / loan.principalAmount) * 100 : 0
  }

  const calculateRemainingMonths = () => {
    if (!loan || !loan.endDate) return null
    const today = new Date()
    const endDate = new Date(loan.endDate)
    const diffTime = endDate.getTime() - today.getTime()
    const diffMonths = Math.ceil(diffTime / (1000 * 60 * 60 * 24 * 30))
    return diffMonths > 0 ? diffMonths : 0
  }

  const getTotalPaid = () => {
    if (!loan) return 0
    return loan.payments?.reduce((sum, payment) => sum + payment.amount, 0) || 0
  }

  const getTotalInterestPaid = () => {
    if (!loan) return 0
    return loan.payments?.reduce((sum, payment) => sum + payment.interestPaid, 0) || 0
  }

  if (!open) return null

  const progress = calculateProgress()
  const remainingMonths = calculateRemainingMonths()
  const totalPaid = getTotalPaid()
  const totalInterestPaid = getTotalInterestPaid()

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-red-600" />
              Loan Details
            </DialogTitle>
          </DialogHeader>

          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
            </div>
          ) : loan ? (
            <ScrollArea className="max-h-[calc(90vh-120px)]">
              <div className="space-y-6 pr-4">
                {/* Loan Header */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-start justify-between"
                >
                  <div className="flex-1">
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">{loan.name}</h2>
                    <div className="flex items-center gap-3 mb-3">
                      <Badge className="bg-red-100 text-red-800">
                        {loanTypeLabels[loan.loanType]}
                      </Badge>
                      <div className="flex items-center gap-1 text-sm text-gray-600">
                        <Percent className="w-3 h-3" />
                        {loan.interestRate}% p.a.
                      </div>
                    </div>
                    <div className="text-3xl font-bold text-red-600 mb-2">
                      {formatCurrency(loan.currentBalance)}
                    </div>
                    <p className="text-sm text-gray-600">Outstanding Balance</p>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPaymentDialogOpen(true)}
                      className="text-green-600 border-green-200 hover:bg-green-50"
                    >
                      <Plus className="w-4 h-4 mr-1" />
                      Payment
                    </Button>
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
                      onClick={() => setDeleteDialogOpen(true)}
                      className="text-red-600 border-red-200 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4 mr-1" />
                      Delete
                    </Button>
                  </div>
                </motion.div>

                <Separator />

                {/* Progress Section */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <TrendingDown className="h-5 w-5" />
                        Repayment Progress
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Progress</span>
                          <span className="font-medium">{progress.toFixed(1)}%</span>
                        </div>
                        <Progress value={progress} className="h-3" />
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <p className="text-gray-600">Principal Amount</p>
                          <p className="font-semibold text-blue-600">
                            {formatCurrency(loan.principalAmount)}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-600">Amount Paid</p>
                          <p className="font-semibold text-green-600">
                            {formatCurrency(loan.principalAmount - loan.currentBalance)}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-600">Monthly EMI</p>
                          <p className="font-semibold text-orange-600">
                            {formatCurrency(loan.emiAmount)}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-600">Remaining Months</p>
                          <p className="font-semibold text-purple-600">
                            {remainingMonths !== null ? `${remainingMonths} months` : 'N/A'}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>

                {/* Loan Information */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <FileText className="h-5 w-5" />
                        Loan Information
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm font-medium text-gray-600">Loan Type</label>
                          <p className="text-lg font-semibold text-gray-900">{loanTypeLabels[loan.loanType]}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-600">Interest Rate</label>
                          <p className="text-lg font-semibold text-gray-900">{loan.interestRate}% per annum</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-600">Tenure</label>
                          <p className="text-lg font-semibold text-gray-900">{loan.tenure} months</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-600">Start Date</label>
                          <p className="text-lg font-semibold text-gray-900">
                            {new Date(loan.startDate).toLocaleDateString()}
                          </p>
                        </div>
                        {loan.endDate && (
                          <div>
                            <label className="text-sm font-medium text-gray-600">End Date</label>
                            <p className="text-lg font-semibold text-gray-900">
                              {new Date(loan.endDate).toLocaleDateString()}
                            </p>
                          </div>
                        )}
                        <div>
                          <label className="text-sm font-medium text-gray-600">Total Interest Paid</label>
                          <p className="text-lg font-semibold text-red-600">
                            {formatCurrency(totalInterestPaid)}
                          </p>
                        </div>
                      </div>
                      
                      {loan.description && (
                        <div>
                          <label className="text-sm font-medium text-gray-600">Description</label>
                          <p className="text-gray-900 mt-1">{loan.description}</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>

                {/* Payment History */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <History className="h-5 w-5" />
                        Payment History ({loan.payments?.length || 0})
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {loan.payments && loan.payments.length > 0 ? (
                        <div className="space-y-3">
                          {loan.payments.slice(0, 10).map((payment) => (
                            <div key={payment.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                              <div className="flex items-center gap-3">
                                <div className="p-2 bg-green-100 rounded-lg">
                                  <DollarSign className="h-4 w-4 text-green-600" />
                                </div>
                                <div>
                                  <p className="font-medium text-gray-900">
                                    {formatCurrency(payment.amount)}
                                  </p>
                                  <p className="text-sm text-gray-600">
                                    {new Date(payment.paymentDate).toLocaleDateString()}
                                  </p>
                                  <div className="flex gap-2 text-xs text-gray-500">
                                    <span>Principal: {formatCurrency(payment.principalPaid)}</span>
                                    <span>Interest: {formatCurrency(payment.interestPaid)}</span>
                                  </div>
                                  {payment.note && (
                                    <p className="text-xs text-gray-500 mt-1">{payment.note}</p>
                                  )}
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <Badge variant="outline" className="text-xs">
                                  {paymentTypeLabels[payment.paymentType]}
                                </Badge>
                              </div>
                            </div>
                          ))}
                          {loan.payments.length > 10 && (
                            <p className="text-sm text-gray-600 text-center py-2">
                              Showing latest 10 payments
                            </p>
                          )}
                        </div>
                      ) : (
                        <div className="text-center py-6">
                          <History className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                          <p className="text-gray-600">No payment history available</p>
                          <Button
                            size="sm"
                            onClick={() => setPaymentDialogOpen(true)}
                            className="mt-3 bg-green-600 hover:bg-green-700 text-white"
                          >
                            <Plus className="w-4 h-4 mr-1" />
                            Make First Payment
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              </div>
            </ScrollArea>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-600">Loan not found</p>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <EditLoanDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        loan={loan as unknown as Loan}
        onLoanUpdated={() => {
          setEditDialogOpen(false)
          onLoanUpdated()
          fetchLoanDetails()
        }}
      />

      {/* Delete Dialog */}
      <DeleteLoanDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        loan={loan as unknown as Loan}
        onLoanDeleted={() => {
          setDeleteDialogOpen(false)
          onLoanUpdated()
          onOpenChange(false)
        }}
      />

      {/* Payment Dialog */}
      {loan && (
        <AddLoanPaymentDialog
          open={paymentDialogOpen}
          onOpenChange={setPaymentDialogOpen}
          loan={loan as unknown as Loan}
          onPaymentAdded={() => {
            setPaymentDialogOpen(false)
            onLoanUpdated()
            fetchLoanDetails()
          }}
        />
      )}
    </>
  )
}
