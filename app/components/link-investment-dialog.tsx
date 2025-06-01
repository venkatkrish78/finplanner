

'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { TrendingUp, Target } from 'lucide-react'
import { formatCurrency } from '@/lib/currency'
import { AssetClass } from '@/lib/types'
import { toast } from 'sonner'

interface LinkInvestmentDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  goalId: string
  onInvestmentLinked: () => void
}

interface Investment {
  id: string
  name: string
  assetClass: AssetClass
  currentValue: number
  totalInvested: number
  linkedGoals?: any[]
}

const assetClassColors: Record<AssetClass, string> = {
  STOCKS: 'bg-blue-100 text-blue-800',
  MUTUAL_FUNDS: 'bg-green-100 text-green-800',
  CRYPTO: 'bg-purple-100 text-purple-800',
  REAL_ESTATE: 'bg-orange-100 text-orange-800',
  GOLD: 'bg-yellow-100 text-yellow-800',
  BONDS: 'bg-indigo-100 text-indigo-800',
  PPF: 'bg-emerald-100 text-emerald-800',
  EPF: 'bg-teal-100 text-teal-800',
  NSC: 'bg-cyan-100 text-cyan-800',
  ELSS: 'bg-lime-100 text-lime-800',
  FD: 'bg-amber-100 text-amber-800',
  RD: 'bg-rose-100 text-rose-800',
  ETF: 'bg-violet-100 text-violet-800',
  OTHER: 'bg-gray-100 text-gray-800'
}

export function LinkInvestmentDialog({ open, onOpenChange, goalId, onInvestmentLinked }: LinkInvestmentDialogProps) {
  const [investments, setInvestments] = useState<Investment[]>([])
  const [selectedInvestmentId, setSelectedInvestmentId] = useState('')
  const [allocation, setAllocation] = useState('100')
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (open) {
      fetchAvailableInvestments()
      setSelectedInvestmentId('')
      setAllocation('100')
      setNotes('')
    }
  }, [open, goalId])

  const fetchAvailableInvestments = async () => {
    try {
      const response = await fetch('/api/investments?includeGoals=true')
      if (response.ok) {
        const data = await response.json()
        // Filter out investments that are already linked to this goal
        const availableInvestments = data.filter((investment: Investment) => {
          const isAlreadyLinked = investment.linkedGoals?.some(
            (goal: any) => goal.id === goalId
          )
          return !isAlreadyLinked
        })
        setInvestments(availableInvestments)
      } else {
        toast.error('Failed to fetch investments')
      }
    } catch (error) {
      console.error('Error fetching investments:', error)
      toast.error('Failed to fetch investments')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedInvestmentId) {
      toast.error('Please select an investment')
      return
    }

    const allocationValue = parseFloat(allocation)
    if (isNaN(allocationValue) || allocationValue <= 0 || allocationValue > 100) {
      toast.error('Please enter a valid allocation between 1 and 100')
      return
    }

    setLoading(true)

    try {
      const response = await fetch(`/api/goals/${goalId}/investments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          investmentId: selectedInvestmentId,
          allocation: allocationValue,
          notes: notes || undefined
        })
      })

      if (response.ok) {
        toast.success('Investment linked successfully!')
        onInvestmentLinked()
        onOpenChange(false)
      } else {
        const error = await response.json()
        toast.error(error.error || 'Failed to link investment')
      }
    } catch (error) {
      console.error('Error linking investment:', error)
      toast.error('Failed to link investment')
    } finally {
      setLoading(false)
    }
  }

  const selectedInvestment = investments.find(inv => inv.id === selectedInvestmentId)
  const allocatedValue = selectedInvestment ? (selectedInvestment.currentValue * (parseFloat(allocation) / 100)) : 0

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Link Investment to Goal</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="investment">Select Investment</Label>
            <Select
              value={selectedInvestmentId}
              onValueChange={setSelectedInvestmentId}
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="Choose an investment" />
              </SelectTrigger>
              <SelectContent>
                {investments.length === 0 ? (
                  <SelectItem value="" disabled>
                    No available investments
                  </SelectItem>
                ) : (
                  investments.map((investment) => (
                    <SelectItem key={investment.id} value={investment.id}>
                      <div className="flex items-center justify-between w-full">
                        <div className="flex items-center gap-2">
                          <TrendingUp className="h-4 w-4" />
                          <span>{investment.name}</span>
                        </div>
                        <div className="text-right text-sm">
                          <div className="font-medium">{formatCurrency(investment.currentValue)}</div>
                          <Badge className={assetClassColors[investment.assetClass]} variant="secondary">
                            {investment.assetClass.replace('_', ' ')}
                          </Badge>
                        </div>
                      </div>
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>

          {selectedInvestment && (
            <div className="p-4 bg-slate-50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium">{selectedInvestment.name}</h4>
                <Badge className={assetClassColors[selectedInvestment.assetClass]}>
                  {selectedInvestment.assetClass.replace('_', ' ')}
                </Badge>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-slate-600">Current Value</p>
                  <p className="font-semibold">{formatCurrency(selectedInvestment.currentValue)}</p>
                </div>
                <div>
                  <p className="text-slate-600">Total Invested</p>
                  <p className="font-semibold">{formatCurrency(selectedInvestment.totalInvested)}</p>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="allocation">Allocation Percentage</Label>
            <div className="flex items-center gap-2">
              <Input
                id="allocation"
                type="number"
                min="1"
                max="100"
                step="1"
                value={allocation}
                onChange={(e) => setAllocation(e.target.value)}
                placeholder="100"
                required
              />
              <span className="text-sm text-slate-600">%</span>
            </div>
            <p className="text-xs text-slate-500">
              What percentage of this investment should count towards this goal?
            </p>
            {selectedInvestment && (
              <div className="text-sm">
                <span className="text-slate-600">Allocated Value: </span>
                <span className="font-semibold text-green-600">
                  {formatCurrency(allocatedValue)}
                </span>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add any notes about this investment link"
              rows={3}
            />
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading || !selectedInvestmentId}>
              {loading ? 'Linking...' : 'Link Investment'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

