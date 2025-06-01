
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { formatCurrency } from '@/lib/currency';
import { Loan, LoanPaymentType } from '@/lib/types';

interface AddLoanPaymentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  loan: Loan;
  onPaymentAdded: () => void;
}

export function AddLoanPaymentDialog({ 
  open, 
  onOpenChange, 
  loan, 
  onPaymentAdded 
}: AddLoanPaymentDialogProps) {
  const [formData, setFormData] = useState({
    amount: loan.emiAmount.toString(),
    paymentType: LoanPaymentType.EMI,
    note: '',
    createTransaction: true
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/loans/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          loanId: loan.id,
          ...formData
        })
      });

      if (response.ok) {
        onPaymentAdded();
        setFormData({
          amount: loan.emiAmount.toString(),
          paymentType: LoanPaymentType.EMI,
          note: '',
          createTransaction: true
        });
      }
    } catch (error) {
      console.error('Error adding payment:', error);
    } finally {
      setLoading(false);
    }
  };

  // Calculate interest and principal breakdown
  const calculateBreakdown = () => {
    const paymentAmount = parseFloat(formData.amount) || 0;
    const monthlyRate = loan.interestRate / 100 / 12;
    const interestPortion = loan.currentBalance * monthlyRate;
    const principalPortion = Math.max(0, paymentAmount - interestPortion);

    return {
      interest: Math.min(interestPortion, paymentAmount),
      principal: principalPortion
    };
  };

  const breakdown = calculateBreakdown();

  const paymentTypeOptions = [
    { value: LoanPaymentType.EMI, label: 'Regular EMI' },
    { value: LoanPaymentType.PREPAYMENT, label: 'Prepayment' },
    { value: LoanPaymentType.PARTIAL_PAYMENT, label: 'Partial Payment' },
    { value: LoanPaymentType.INTEREST_ONLY, label: 'Interest Only' }
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add Payment for {loan.name}</DialogTitle>
        </DialogHeader>

        <div className="bg-red-50 p-4 rounded-lg mb-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-600">Outstanding Balance</p>
              <p className="font-semibold text-red-600">
                {formatCurrency(loan.currentBalance)}
              </p>
            </div>
            <div>
              <p className="text-gray-600">Regular EMI</p>
              <p className="font-semibold text-blue-600">
                {formatCurrency(loan.emiAmount)}
              </p>
            </div>
            <div>
              <p className="text-gray-600">Interest Rate</p>
              <p className="font-semibold text-purple-600">
                {loan.interestRate}% p.a.
              </p>
            </div>
            <div>
              <p className="text-gray-600">Loan Type</p>
              <p className="font-semibold text-gray-600">
                {loan.loanType.replace('_', ' ')}
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="paymentType">Payment Type</Label>
            <Select
              value={formData.paymentType}
              onValueChange={(value: LoanPaymentType) => setFormData({ ...formData, paymentType: value })}
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="Select payment type" />
              </SelectTrigger>
              <SelectContent>
                {paymentTypeOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount">Payment Amount (₹)</Label>
            <Input
              id="amount"
              type="number"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              placeholder="25000"
              min="1"
              required
            />
          </div>

          {parseFloat(formData.amount) > 0 && (
            <div className="bg-blue-50 p-3 rounded-lg">
              <h4 className="font-semibold text-blue-900 mb-2">Payment Breakdown</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-blue-600">Principal</p>
                  <p className="font-semibold text-blue-800">
                    {formatCurrency(breakdown.principal)}
                  </p>
                </div>
                <div>
                  <p className="text-blue-600">Interest</p>
                  <p className="font-semibold text-blue-800">
                    {formatCurrency(breakdown.interest)}
                  </p>
                </div>
              </div>
              <p className="text-xs text-blue-600 mt-2">
                Remaining balance after payment: {formatCurrency(Math.max(0, loan.currentBalance - breakdown.principal))}
              </p>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="note">Note (Optional)</Label>
            <Textarea
              id="note"
              value={formData.note}
              onChange={(e) => setFormData({ ...formData, note: e.target.value })}
              placeholder="EMI for January 2024, prepayment from bonus, etc."
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
              Create a transaction record for this payment
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
              {loading ? 'Processing...' : 'Add Payment'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
