
'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'
import { Bill, BillFrequency, BillFormData } from '@/lib/types'

interface Category {
  id: string
  name: string
  color: string
}

interface Investment {
  id: string
  name: string
  assetClass: string
}

interface Loan {
  id: string
  name: string
  loanType: string
}

interface AddBillDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onBillAdded: () => void
  editingBill?: Bill | null
}

export default function AddBillDialog({ open, onOpenChange, onBillAdded, editingBill }: AddBillDialogProps) {
  const [categories, setCategories] = useState<Category[]>([])
  const [investments, setInvestments] = useState<Investment[]>([])
  const [loans, setLoans] = useState<Loan[]>([])
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState<BillFormData>({
    name: '',
    amount: 0,
    frequency: BillFrequency.MONTHLY,
    description: '',
    categoryId: '',
    nextDueDate: '',
    provider: '',
    policyNumber: '',
    reminderDays: '30,7,1',
    linkedInvestmentId: '',
    linkedLoanId: ''
  })

  useEffect(() => {
    if (open) {
      fetchCategories()
      fetchInvestments()
      fetchLoans()
      if (editingBill) {
        setFormData({
          name: editingBill.name,
          amount: editingBill.amount,
          frequency: editingBill.frequency,
          description: editingBill.description || '',
          categoryId: editingBill.categoryId,
          nextDueDate: new Date(editingBill.nextDueDate).toISOString().split('T')[0],
          provider: editingBill.provider || '',
          policyNumber: editingBill.policyNumber || '',
          reminderDays: editingBill.reminderDays || '30,7,1',
          linkedInvestmentId: (editingBill as any).linkedInvestmentId || '',
          linkedLoanId: (editingBill as any).linkedLoanId || ''
        })
      } else {
        // Reset form for new bill
        const tomorrow = new Date()
        tomorrow.setDate(tomorrow.getDate() + 1)
        setFormData({
          name: '',
          amount: 0,
          frequency: BillFrequency.MONTHLY,
          description: '',
          categoryId: '',
          nextDueDate: tomorrow.toISOString().split('T')[0],
          provider: '',
          policyNumber: '',
          reminderDays: '30,7,1',
          linkedInvestmentId: '',
          linkedLoanId: ''
        })
      }
    }
  }, [open, editingBill])

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories')
      if (response.ok) {
        const data = await response.json()
        setCategories(data)
      }
    } catch (error) {
      console.error('Error fetching categories:', error)
    }
  }

  const fetchInvestments = async () => {
    try {
      const response = await fetch('/api/investments')
      if (response.ok) {
        const data = await response.json()
        setInvestments(data)
      }
    } catch (error) {
      console.error('Error fetching investments:', error)
    }
  }

  const fetchLoans = async () => {
    try {
      const response = await fetch('/api/loans')
      if (response.ok) {
        const data = await response.json()
        setLoans(data)
      }
    } catch (error) {
      console.error('Error fetching loans:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name || !formData.amount || !formData.categoryId || !formData.nextDueDate) {
      toast.error('Please fill in all required fields')
      return
    }

    setLoading(true)

    try {
      const url = editingBill ? `/api/bills/${editingBill.id}` : '/api/bills'
      const method = editingBill ? 'PUT' : 'POST'
      
      const requestBody = {
        ...formData,
        amount: parseFloat(formData.amount.toString())
      }
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
      })

      if (response.ok) {
        toast.success(`Bill ${editingBill ? 'updated' : 'created'} successfully`)
        onBillAdded()
        onOpenChange(false)
      } else {
        const error = await response.json()
        toast.error(error.error || `Failed to ${editingBill ? 'update' : 'create'} bill`)
      }
    } catch (error) {
      console.error('Error saving bill:', error)
      toast.error(`Failed to ${editingBill ? 'update' : 'create'} bill`)
    } finally {
      setLoading(false)
    }
  }

  const frequencyOptions = [
    { value: BillFrequency.ONE_TIME, label: 'One-time' },
    { value: BillFrequency.WEEKLY, label: 'Weekly' },
    { value: BillFrequency.MONTHLY, label: 'Monthly' },
    { value: BillFrequency.QUARTERLY, label: 'Quarterly' },
    { value: BillFrequency.HALF_YEARLY, label: 'Half-yearly' },
    { value: BillFrequency.YEARLY, label: 'Yearly' }
  ]

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{editingBill ? 'Edit Bill' : 'Add New Bill'}</DialogTitle>
          <DialogDescription>
            {editingBill ? 'Update the bill details below.' : 'Create a new recurring bill to track your regular payments.'}
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Bill Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g., Electricity Bill, Rent, Netflix"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="amount">Amount (₹) *</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                min="0"
                value={formData.amount || ''}
                onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })}
                placeholder="0.00"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="frequency">Frequency *</Label>
              <Select
                value={formData.frequency}
                onValueChange={(value) => setFormData({ ...formData, frequency: value as BillFrequency })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {frequencyOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Category *</Label>
            <Select
              value={formData.categoryId}
              onValueChange={(value) => setFormData({ ...formData, categoryId: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a category" />
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
            <Label htmlFor="nextDueDate">Next Due Date *</Label>
            <Input
              id="nextDueDate"
              type="date"
              value={formData.nextDueDate}
              onChange={(e) => setFormData({ ...formData, nextDueDate: e.target.value })}
              min={new Date().toISOString().split('T')[0]}
              max="2099-12-31"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="provider">Provider/Vendor</Label>
              <Input
                id="provider"
                value={formData.provider}
                onChange={(e) => setFormData({ ...formData, provider: e.target.value })}
                placeholder="e.g., ICICI, Airtel"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="policyNumber">Policy/Reference #</Label>
              <Input
                id="policyNumber"
                value={formData.policyNumber}
                onChange={(e) => setFormData({ ...formData, policyNumber: e.target.value })}
                placeholder="e.g., POL123456"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="reminderDays">Reminder Days Before Due</Label>
            <div className="flex gap-2">
              <Select
                value={formData.reminderDays}
                onValueChange={(value) => setFormData({ ...formData, reminderDays: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="30,7,1">30, 7, and 1 day before</SelectItem>
                  <SelectItem value="30,7">30 and 7 days before</SelectItem>
                  <SelectItem value="7,1">7 and 1 day before</SelectItem>
                  <SelectItem value="7">7 days before</SelectItem>
                  <SelectItem value="1">1 day before</SelectItem>
                  <SelectItem value="none">No reminders</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="linkedInvestmentId">Link to Investment (Optional)</Label>
            <Select
              value={formData.linkedInvestmentId || 'none'}
              onValueChange={(value) => setFormData({ ...formData, linkedInvestmentId: value === 'none' ? '' : value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select an investment" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No investment linked</SelectItem>
                {investments.map((investment) => (
                  <SelectItem key={investment.id} value={investment.id}>
                    {investment.name} ({investment.assetClass})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-slate-500">When this bill is paid, the investment amount will increase</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="linkedLoanId">Link to Loan (Optional)</Label>
            <Select
              value={formData.linkedLoanId || 'none'}
              onValueChange={(value) => setFormData({ ...formData, linkedLoanId: value === 'none' ? '' : value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a loan" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No loan linked</SelectItem>
                {loans.map((loan) => (
                  <SelectItem key={loan.id} value={loan.id}>
                    {loan.name} ({loan.loanType})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-slate-500">When this bill is paid, the loan balance will decrease</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Optional description or notes"
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Saving...' : editingBill ? 'Update Bill' : 'Create Bill'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
