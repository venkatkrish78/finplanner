
'use client'

import { useState } from 'react'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Loan } from '@/lib/types'
import { formatCurrency } from '@/lib/currency'
import { toast } from 'sonner'

interface DeleteLoanDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  loan: Loan | null
  onLoanDeleted: () => void
}

const loanTypeLabels = {
  HOME_LOAN: 'Home Loan',
  PERSONAL_LOAN: 'Personal Loan',
  CAR_LOAN: 'Car Loan',
  EDUCATION_LOAN: 'Education Loan',
  CREDIT_CARD: 'Credit Card',
  BUSINESS_LOAN: 'Business Loan',
  GOLD_LOAN: 'Gold Loan',
  OTHER: 'Other'
}

export default function DeleteLoanDialog({
  open,
  onOpenChange,
  loan,
  onLoanDeleted
}: DeleteLoanDialogProps) {
  const [loading, setLoading] = useState(false)

  const handleDelete = async () => {
    if (!loan) return

    setLoading(true)

    try {
      const response = await fetch(`/api/loans/${loan.id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        toast.success('Loan deleted successfully!')
        onLoanDeleted()
        onOpenChange(false)
      } else {
        const error = await response.json()
        toast.error(error.error || 'Failed to delete loan')
      }
    } catch (error) {
      console.error('Error deleting loan:', error)
      toast.error('Failed to delete loan')
    } finally {
      setLoading(false)
    }
  }

  if (!loan) return null

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Loan</AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div className="space-y-3">
              <p>
                Are you sure you want to delete this loan? This action cannot be undone and will also delete all associated payment records.
              </p>
              
              <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                <h4 className="font-semibold text-red-900 mb-2">{loan.name}</h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-red-700">Loan Type:</span>
                    <span className="font-medium ml-2">{loanTypeLabels[loan.loanType as keyof typeof loanTypeLabels]}</span>
                  </div>
                  <div>
                    <span className="text-red-700">Outstanding:</span>
                    <span className="font-medium ml-2">{formatCurrency(loan.currentBalance)}</span>
                  </div>
                  <div>
                    <span className="text-red-700">Principal:</span>
                    <span className="font-medium ml-2">{formatCurrency(loan.principalAmount)}</span>
                  </div>
                  <div>
                    <span className="text-red-700">EMI:</span>
                    <span className="font-medium ml-2">{formatCurrency(loan.emiAmount)}</span>
                  </div>
                </div>
              </div>

              <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-200">
                <p className="text-yellow-800 text-sm font-medium">
                  ⚠️ All payment history and transactions related to this loan will also be permanently deleted.
                </p>
              </div>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={loading}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={loading}
            className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
          >
            {loading ? 'Deleting...' : 'Delete Loan'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
