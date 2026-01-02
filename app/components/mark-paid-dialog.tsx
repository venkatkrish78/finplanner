
'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { formatCurrency } from '@/lib/currency'
import { CheckCircle, Calendar, ArrowRight } from 'lucide-react'
import { calculateNextDueDate } from '@/lib/bill-utils'

interface Bill {
  id: string
  name: string
  amount: number
  frequency: string
  nextDueDate: Date | string
  provider?: string
  policyNumber?: string
}

interface MarkPaidDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  bill: Bill | null
  onSuccess: () => void
  view?: 'monthly' | 'yearly'
  year?: number
  month?: number
}

export default function MarkPaidDialog({ 
  open, 
  onOpenChange, 
  bill, 
  onSuccess,
  view,
  year,
  month
}: MarkPaidDialogProps) {
  const [loading, setLoading] = useState(false)
  const [referenceNumber, setReferenceNumber] = useState('')
  const [notes, setNotes] = useState('')
  const [amount, setAmount] = useState<number>(0)
  const [newDueDate, setNewDueDate] = useState<Date | null>(null)

  useEffect(() => {
    if (open && bill) {
      setAmount(bill.amount)
      setReferenceNumber('')
      setNotes('')
      
      // Calculate the new due date based on frequency
      if (bill.frequency !== 'ONE_TIME') {
        const currentDueDate = new Date(bill.nextDueDate)
        const nextDate = calculateNextDueDate(currentDueDate, bill.frequency)
        setNewDueDate(nextDate)
      } else {
        setNewDueDate(null)
      }
    }
  }, [open, bill])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!bill) return

    setLoading(true)

    try {
      const requestBody: any = {
        amount,
        referenceNumber,
        notes
      }

      if (view) {
        requestBody.view = view
        requestBody.year = year
        if (view === 'monthly' && month) {
          requestBody.month = month
        }
      }

      const response = await fetch(`/api/bills/${bill.id}/payment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
      })

      if (response.ok) {
        const data = await response.json()
        toast.success('Payment recorded successfully!', {
          description: bill.frequency !== 'ONE_TIME' && data.nextDueDate 
            ? `Next payment due: ${new Date(data.nextDueDate).toLocaleDateString()}` 
            : undefined
        })
        onSuccess()
        onOpenChange(false)
      } else {
        const error = await response.json()
        toast.error(error.error || 'Failed to mark bill as paid')
      }
    } catch (error) {
      console.error('Error marking bill as paid:', error)
      toast.error('Failed to mark bill as paid')
    } finally {
      setLoading(false)
    }
  }

  if (!bill) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            Mark Bill as Paid
          </DialogTitle>
          <DialogDescription>
            Record payment for "{bill.name}". This will create a transaction and {bill.frequency !== 'ONE_TIME' ? 'automatically update the due date.' : 'mark it as complete.'}
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Bill Information */}
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-slate-600">Bill Name:</span>
              <span className="font-semibold text-slate-900">{bill.name}</span>
            </div>
            {bill.provider && (
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-slate-600">Provider:</span>
                <span className="text-slate-900">{bill.provider}</span>
              </div>
            )}
            {bill.policyNumber && (
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-slate-600">Policy #:</span>
                <span className="text-slate-900">{bill.policyNumber}</span>
              </div>
            )}
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-slate-600">Frequency:</span>
              <Badge variant="secondary">{bill.frequency.replace('_', ' ')}</Badge>
            </div>
          </div>

          {/* Amount */}
          <div className="space-y-2">
            <Label htmlFor="amount">Payment Amount (₹) *</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              min="0"
              value={amount || ''}
              onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
              placeholder="0.00"
              required
            />
            <p className="text-xs text-slate-500">Default: {formatCurrency(bill.amount)}</p>
          </div>

          {/* Reference Number */}
          <div className="space-y-2">
            <Label htmlFor="referenceNumber">Payment Reference Number</Label>
            <Input
              id="referenceNumber"
              value={referenceNumber}
              onChange={(e) => setReferenceNumber(e.target.value)}
              placeholder="e.g., TXN123456, CHQ789"
            />
            <p className="text-xs text-slate-500">Optional: Bank transaction ID or check number</p>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Optional notes about this payment"
              rows={3}
            />
          </div>

          {/* Due Date Update Info */}
          {bill.frequency !== 'ONE_TIME' && newDueDate && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4 text-blue-600" />
                <span className="font-medium text-blue-900">Automatic Due Date Update</span>
              </div>
              <div className="mt-2 flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <span className="text-slate-600">Current:</span>
                  <span className="font-semibold text-slate-900">
                    {new Date(bill.nextDueDate).toLocaleDateString()}
                  </span>
                </div>
                <ArrowRight className="h-4 w-4 text-blue-600" />
                <div className="flex items-center gap-2">
                  <span className="text-slate-600">New:</span>
                  <span className="font-semibold text-blue-900">
                    {newDueDate.toLocaleDateString()}
                  </span>
                </div>
              </div>
              <p className="text-xs text-blue-700 mt-2">
                The next due date will be automatically calculated based on the {bill.frequency.toLowerCase().replace('_', '-')} frequency.
              </p>
            </div>
          )}

          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={loading || amount <= 0}
              className="bg-green-600 hover:bg-green-700"
            >
              {loading ? 'Recording...' : 'Record Payment'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
