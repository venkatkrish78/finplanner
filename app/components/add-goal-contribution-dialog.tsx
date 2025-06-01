
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { formatCurrency } from '@/lib/currency';
import { FinancialGoal } from '@/lib/types';

interface AddGoalContributionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  goal: FinancialGoal;
  onContributionAdded: () => void;
}

export function AddGoalContributionDialog({ 
  open, 
  onOpenChange, 
  goal, 
  onContributionAdded 
}: AddGoalContributionDialogProps) {
  const [formData, setFormData] = useState({
    amount: '',
    note: '',
    createTransaction: true
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/goals/contributions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          goalId: goal.id,
          ...formData
        })
      });

      if (response.ok) {
        onContributionAdded();
        setFormData({
          amount: '',
          note: '',
          createTransaction: true
        });
      }
    } catch (error) {
      console.error('Error adding contribution:', error);
    } finally {
      setLoading(false);
    }
  };

  const remainingAmount = Math.max(0, goal.targetAmount - goal.currentAmount);
  const progress = goal.targetAmount > 0 ? (goal.currentAmount / goal.targetAmount) * 100 : 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add Contribution to {goal.name}</DialogTitle>
        </DialogHeader>

        <div className="bg-blue-50 p-4 rounded-lg mb-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-600">Current Amount</p>
              <p className="font-semibold text-green-600">
                {formatCurrency(goal.currentAmount)}
              </p>
            </div>
            <div>
              <p className="text-gray-600">Target Amount</p>
              <p className="font-semibold text-blue-600">
                {formatCurrency(goal.targetAmount)}
              </p>
            </div>
            <div>
              <p className="text-gray-600">Remaining</p>
              <p className="font-semibold text-orange-600">
                {formatCurrency(remainingAmount)}
              </p>
            </div>
            <div>
              <p className="text-gray-600">Progress</p>
              <p className="font-semibold text-purple-600">
                {Math.min(progress, 100).toFixed(1)}%
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="amount">Contribution Amount (₹)</Label>
            <Input
              id="amount"
              type="number"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              placeholder="5000"
              min="1"
              required
            />
            {parseFloat(formData.amount) > remainingAmount && remainingAmount > 0 && (
              <p className="text-sm text-orange-600">
                This amount exceeds the remaining target by {formatCurrency(parseFloat(formData.amount) - remainingAmount)}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="note">Note (Optional)</Label>
            <Textarea
              id="note"
              value={formData.note}
              onChange={(e) => setFormData({ ...formData, note: e.target.value })}
              placeholder="Monthly savings, bonus, etc."
              rows={3}
            />
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="createTransaction"
              checked={formData.createTransaction}
              onCheckedChange={(checked) => 
                setFormData({ ...formData, createTransaction: checked as boolean })
              }
            />
            <Label htmlFor="createTransaction" className="text-sm">
              Create a transaction record for this contribution
            </Label>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Adding...' : 'Add Contribution'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
