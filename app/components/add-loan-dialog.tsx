
'use client';

import { useState, useEffect } from 'react';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { LoanType } from '@/lib/types';
import { toast } from 'sonner';

interface AddLoanDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onLoanAdded: () => void;
}

interface Category {
  id: string;
  name: string;
  color: string;
}

export function AddLoanDialog({ open, onOpenChange, onLoanAdded }: AddLoanDialogProps) {
  const [formData, setFormData] = useState({
    name: '',
    loanType: '' as LoanType,
    principalAmount: '',
    interestRate: '',
    tenure: '',
    startDate: '',
    description: '',
    categoryId: ''
  });
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      fetchCategories();
      // Set default start date to today
      setFormData(prev => ({
        ...prev,
        startDate: new Date().toISOString().split('T')[0]
      }));
    }
  }, [open]);

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories');
      if (response.ok) {
        const data = await response.json();
        setCategories(data);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.loanType || !formData.principalAmount || !formData.interestRate || !formData.tenure || !formData.startDate) {
      toast.error('Please fill in all required fields');
      return;
    }

    setLoading(true);

    try {
      const requestBody = {
        ...formData,
        principalAmount: parseFloat(formData.principalAmount),
        interestRate: parseFloat(formData.interestRate),
        tenure: parseInt(formData.tenure),
        categoryId: formData.categoryId || null
      };

      const response = await fetch('/api/loans', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
      });

      if (response.ok) {
        toast.success('Loan created successfully!');
        onLoanAdded();
        onOpenChange(false);
        setFormData({
          name: '',
          loanType: '' as LoanType,
          principalAmount: '',
          interestRate: '',
          tenure: '',
          startDate: '',
          description: '',
          categoryId: ''
        });
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to create loan');
      }
    } catch (error) {
      console.error('Error creating loan:', error);
      toast.error('Failed to create loan');
    } finally {
      setLoading(false);
    }
  };

  const loanTypeOptions = [
    { value: LoanType.HOME_LOAN, label: 'Home Loan' },
    { value: LoanType.PERSONAL_LOAN, label: 'Personal Loan' },
    { value: LoanType.CAR_LOAN, label: 'Car Loan' },
    { value: LoanType.EDUCATION_LOAN, label: 'Education Loan' },
    { value: LoanType.CREDIT_CARD, label: 'Credit Card' },
    { value: LoanType.BUSINESS_LOAN, label: 'Business Loan' },
    { value: LoanType.GOLD_LOAN, label: 'Gold Loan' },
    { value: LoanType.OTHER, label: 'Other' }
  ];

  // Calculate EMI preview
  const calculateEMI = () => {
    const P = parseFloat(formData.principalAmount);
    const R = parseFloat(formData.interestRate) / 100 / 12;
    const N = parseInt(formData.tenure);

    if (P && R && N) {
      const emi = R > 0 
        ? (P * R * Math.pow(1 + R, N)) / (Math.pow(1 + R, N) - 1)
        : P / N;
      return emi;
    }
    return 0;
  };

  const emiPreview = calculateEMI();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Loan</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Loan Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Home Loan - SBI"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="loanType">Loan Type</Label>
              <Select
                value={formData.loanType}
                onValueChange={(value: LoanType) => setFormData({ ...formData, loanType: value })}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select loan type" />
                </SelectTrigger>
                <SelectContent>
                  {loanTypeOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="principalAmount">Principal Amount (₹)</Label>
              <Input
                id="principalAmount"
                type="number"
                value={formData.principalAmount}
                onChange={(e) => setFormData({ ...formData, principalAmount: e.target.value })}
                placeholder="1000000"
                min="1"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="interestRate">Interest Rate (% p.a.)</Label>
              <Input
                id="interestRate"
                type="number"
                step="0.01"
                value={formData.interestRate}
                onChange={(e) => setFormData({ ...formData, interestRate: e.target.value })}
                placeholder="8.5"
                min="0"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="tenure">Tenure (months)</Label>
              <Input
                id="tenure"
                type="number"
                value={formData.tenure}
                onChange={(e) => setFormData({ ...formData, tenure: e.target.value })}
                placeholder="240"
                min="1"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="startDate">Start Date</Label>
              <Input
                id="startDate"
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="categoryId">Category (Optional)</Label>
            <Select
              value={formData.categoryId}
              onValueChange={(value) => setFormData({ ...formData, categoryId: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description (Optional)</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Additional details about the loan..."
              rows={3}
            />
          </div>

          {emiPreview > 0 && (
            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-semibold text-blue-900 mb-2">EMI Preview</h4>
              <p className="text-2xl font-bold text-blue-600">
                ₹{emiPreview.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
              </p>
              <p className="text-sm text-blue-700">Monthly EMI amount</p>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Creating...' : 'Create Loan'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
