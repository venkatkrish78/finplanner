
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

interface AddBillDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onBillAdded: () => void
  editingBill?: Bill | null
}

export default function AddBillDialog({ open, onOpenChange, onBillAdded, editingBill }: AddBillDialogProps) {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState<BillFormData>({
    name: '',
    amount: 0,
    frequency: BillFrequency.MONTHLY,
    description: '',
    categoryId: '',
    nextDueDate: ''
  })

  useEffect(() => {
    if (open) {
      fetchCategories()
      if (editingBill) {
        setFormData({
          name: editingBill.name,
          amount: editingBill.amount,
          frequency: editingBill.frequency,
          description: editingBill.description || '',
          categoryId: editingBill.categoryId,
          nextDueDate: new Date(editingBill.nextDueDate).toISOString().split('T')[0]
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
          nextDueDate: tomorrow.toISOString().split('T')[0]
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
                    <div className="flex items-center">
                      <div 
                        className="w-3 h-3 rounded-full mr-2"
                        style={{ backgroundColor: category.color }}
                      />
                      {category.name}
                    </div>
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
              required
            />
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
