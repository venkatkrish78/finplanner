
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
import { Investment } from '@/lib/types'
import { formatCurrency } from '@/lib/currency'
import { toast } from 'sonner'

interface DeleteInvestmentDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  investment: Investment | null
  onInvestmentDeleted: () => void
}

export default function DeleteInvestmentDialog({
  open,
  onOpenChange,
  investment,
  onInvestmentDeleted
}: DeleteInvestmentDialogProps) {
  const [loading, setLoading] = useState(false)

  const handleDelete = async () => {
    if (!investment) return

    setLoading(true)

    try {
      const response = await fetch(`/api/investments/${investment.id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        toast.success('Investment deleted successfully!')
        onInvestmentDeleted()
        onOpenChange(false)
      } else {
        const error = await response.json()
        toast.error(error.error || 'Failed to delete investment')
      }
    } catch (error) {
      console.error('Error deleting investment:', error)
      toast.error('Failed to delete investment')
    } finally {
      setLoading(false)
    }
  }

  if (!investment) return null

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Investment</AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div className="space-y-3">
              <p>
                Are you sure you want to delete this investment? This action cannot be undone.
              </p>
              
              <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                <h4 className="font-semibold text-red-900 mb-2">{investment.name}</h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-red-700">Current Value:</span>
                    <span className="font-medium ml-2">{formatCurrency(investment.currentValue)}</span>
                  </div>
                  <div>
                    <span className="text-red-700">Total Invested:</span>
                    <span className="font-medium ml-2">{formatCurrency(investment.totalInvested)}</span>
                  </div>
                  <div>
                    <span className="text-red-700">Asset Class:</span>
                    <span className="font-medium ml-2">{investment.assetClass.replace('_', ' ')}</span>
                  </div>
                  <div>
                    <span className="text-red-700">Platform:</span>
                    <span className="font-medium ml-2">{investment.platform}</span>
                  </div>
                </div>
              </div>

              {((investment as any).linkedGoals?.length > 0 || investment.goal) && (
                <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-200">
                  <p className="text-yellow-800 text-sm font-medium">
                    ⚠️ This investment is linked to goals. Deleting it will remove these links.
                  </p>
                </div>
              )}
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
            {loading ? 'Deleting...' : 'Delete Investment'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
