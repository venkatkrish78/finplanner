'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Target, TrendingUp } from 'lucide-react'
import { formatCurrency } from '@/lib/currency'
import { Investment, GoalType } from '@/lib/types'
import { toast } from 'sonner'

interface GoalSelectionDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  investment: Investment | null
  onInvestmentLinked: () => void
}

interface Goal {
  id: string
  name: string
  goalType: GoalType
  targetAmount: number
  currentAmount: number
}

const goalTypeColors = {
  [GoalType.SAVINGS]: 'bg-green-100 text-green-800',
  [GoalType.DEBT_PAYOFF]: 'bg-red-100 text-red-800',
  [GoalType.INVESTMENT]: 'bg-blue-100 text-blue-800',
  [GoalType.EMERGENCY_FUND]: 'bg-orange-100 text-orange-800',
  [GoalType.EDUCATION]: 'bg-purple-100 text-purple-800',
  [GoalType.HOUSE]: 'bg-indigo-100 text-indigo-800',
  [GoalType.VACATION]: 'bg-pink-100 text-pink-800',
  [GoalType.RETIREMENT]: 'bg-gray-100 text-gray-800',
  [GoalType.OTHER]: 'bg-yellow-100 text-yellow-800'
}

export function GoalSelectionDialog({ open, onOpenChange, investment, onInvestmentLinked }: GoalSelectionDialogProps) {
  const [goals, setGoals] = useState<Goal[]>([])
  const [selectedGoalId, setSelectedGoalId] = useState('')
  const [allocation, setAllocation] = useState('100')
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (open) {
      fetchAvailableGoals()
      setSelectedGoalId('')
      setAllocation('100')
      setNotes('')
    }
  }, [open, investment?.id])

  const fetchAvailableGoals = async () => {
    try {
      const response = await fetch('/api/goals')
      if (response.ok) {
        const data = await response.json()
        setGoals(Array.isArray(data) ? data : [])
      } else {
        toast.error('Failed to fetch goals')
        setGoals([])
      }
    } catch (error) {
      console.error('Error fetching goals:', error)
      toast.error('Failed to fetch goals')
      setGoals([])
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedGoalId || selectedGoalId === 'no-goals' || !investment) {
      toast.error('Please select a goal')
      return
    }

    const allocationValue = parseFloat(allocation)
    if (isNaN(allocationValue) || allocationValue <= 0 || allocationValue > 100) {
      toast.error('Please enter a valid allocation between 1 and 100')
      return
    }

    setLoading(true)

    try {
      const response = await fetch(`/api/goals/${selectedGoalId}/investments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          investmentId: investment.id,
          allocation: allocationValue,
          notes: notes || undefined
        })
      })

      if (response.ok) {
        toast.success('Investment linked to goal successfully!')
        onInvestmentLinked()
        onOpenChange(false)
      } else {
        const error = await response.json()
        toast.error(error.error || 'Failed to link investment to goal')
      }
    } catch (error) {
      console.error('Error linking investment to goal:', error)
      toast.error('Failed to link investment to goal')
    } finally {
      setLoading(false)
    }
  }

  const selectedGoal = goals.find(goal => goal.id === selectedGoalId && selectedGoalId !== 'no-goals')
  const allocatedValue = investment ? (investment.currentValue * (parseFloat(allocation) / 100)) : 0

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Link Investment to Goal</DialogTitle>
        </DialogHeader>
        
        {investment && (
          <div className="p-4 bg-slate-50 rounded-lg mb-4">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-medium">{investment.name}</h4>
              <div className="text-right">
                <div className="font-semibold">{formatCurrency(investment.currentValue)}</div>
                <div className="text-sm text-slate-600">{investment.assetClass.replace('_', ' ')}</div>
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="goal">Select Goal</Label>
            <Select
              value={selectedGoalId}
              onValueChange={setSelectedGoalId}
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="Choose a goal" />
              </SelectTrigger>
              <SelectContent>
                {goals.length === 0 ? (
                  <SelectItem value="no-goals" disabled>
                    <div className="p-2 text-center text-sm text-slate-500">
                      No available goals
                    </div>
                  </SelectItem>
                ) : (
                  goals.map((goal) => (
                    <SelectItem key={goal.id} value={goal.id}>
                      <div className="flex items-center justify-between w-full">
                        <div className="flex items-center gap-2">
                          <Target className="h-4 w-4" />
                          <span>{goal.name}</span>
                        </div>
                        <div className="text-right text-sm">
                          <div className="font-medium">{formatCurrency(goal.targetAmount)}</div>
                          <Badge className={goalTypeColors[goal.goalType]} variant="secondary">
                            {goal.goalType.replace('_', ' ')}
                          </Badge>
                        </div>
                      </div>
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>

          {selectedGoal && (
            <div className="p-4 bg-blue-50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium">{selectedGoal.name}</h4>
                <Badge className={goalTypeColors[selectedGoal.goalType]}>
                  {selectedGoal.goalType.replace('_', ' ')}
                </Badge>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-slate-600">Target Amount</p>
                  <p className="font-semibold">{formatCurrency(selectedGoal.targetAmount)}</p>
                </div>
                <div>
                  <p className="text-slate-600">Current Amount</p>
                  <p className="font-semibold">{formatCurrency(selectedGoal.currentAmount)}</p>
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
            {investment && (
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
            <Button type="submit" disabled={loading || !selectedGoalId || selectedGoalId === 'no-goals'}>
              {loading ? 'Linking...' : 'Link to Goal'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
