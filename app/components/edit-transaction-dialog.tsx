
'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { CalendarIcon, Loader2, Edit } from 'lucide-react'
import { format } from 'date-fns'
import { cn } from '@/lib/utils'
import { useToast } from '@/hooks/use-toast'
import { Transaction, Category } from '@/lib/types'

interface EditTransactionDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onTransactionUpdated: () => void
  transaction: Transaction | null
}

export function EditTransactionDialog({ 
  open, 
  onOpenChange, 
  onTransactionUpdated, 
  transaction 
}: EditTransactionDialogProps) {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(false)
  const [date, setDate] = useState<Date>(new Date())
  const [formData, setFormData] = useState({
    amount: '',
    type: 'EXPENSE',
    description: '',
    merchant: '',
    categoryId: '',
    accountNumber: '',
    transactionId: ''
  })
  const { toast } = useToast()

  useEffect(() => {
    if (open) {
      fetchCategories()
      if (transaction) {
        populateForm()
      }
    }
  }, [open, transaction])

  const populateForm = () => {
    if (!transaction) return
    
    setFormData({
      amount: transaction.amount.toString(),
      type: transaction.type,
      description: transaction.description || '',
      merchant: transaction.merchant || '',
      categoryId: transaction.categoryId,
      accountNumber: transaction.accountNumber || '',
      transactionId: transaction.transactionId || ''
    })
    setDate(new Date(transaction.date))
  }

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories')
      if (response.ok) {
        const data = await response.json()
        setCategories(data)
      }
    } catch (error) {
      console.error('Error fetching categories:', error)
      toast({
        title: "Error",
        description: "Failed to load categories",
        variant: "destructive",
      })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!transaction) return

    // Validation
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      toast({
        title: "Error",
        description: "Please enter a valid amount",
        variant: "destructive",
      })
      return
    }

    if (!formData.categoryId) {
      toast({
        title: "Error",
        description: "Please select a category",
        variant: "destructive",
      })
      return
    }

    setLoading(true)

    try {
      const requestBody = {
        amount: parseFloat(formData.amount),
        type: formData.type,
        description: formData.description.trim() || null,
        merchant: formData.merchant.trim() || null,
        categoryId: formData.categoryId,
        date: date.toISOString()
      }

      const response = await fetch(`/api/transactions/${transaction.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: "Transaction updated successfully",
        })
        onTransactionUpdated()
        onOpenChange(false)
      } else {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to update transaction')
      }
    } catch (error) {
      console.error('Error updating transaction:', error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update transaction",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  if (!transaction) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-slate-900">
            <div className="p-2 bg-gradient-to-br from-professional-blue to-professional-blue-light rounded-lg">
              <Edit className="h-4 w-4 text-white" />
            </div>
            Edit Transaction
          </DialogTitle>
          <DialogDescription className="text-slate-600">
            Update the transaction details below.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="grid grid-cols-2 gap-4"
          >
            <div className="space-y-2">
              <Label htmlFor="amount" className="form-label">Amount *</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                min="0.01"
                placeholder="0.00"
                value={formData.amount}
                onChange={(e) => handleInputChange('amount', e.target.value)}
                className="form-input"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="type" className="form-label">Type *</Label>
              <Select value={formData.type} onValueChange={(value) => handleInputChange('type', value)}>
                <SelectTrigger className="form-input">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="INCOME">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                      <span>Income</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="EXPENSE">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 rounded-full bg-red-500"></div>
                      <span>Expense</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="TRANSFER">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                      <span>Transfer</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            className="space-y-2"
          >
            <Label htmlFor="category" className="form-label">Category *</Label>
            <Select value={formData.categoryId} onValueChange={(value) => handleInputChange('categoryId', value)}>
              <SelectTrigger className="form-input">
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    <div className="flex items-center space-x-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: category.color }}
                      />
                      <span>{category.name}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
            className="space-y-2"
          >
            <Label htmlFor="description" className="form-label">Description</Label>
            <Textarea
              id="description"
              placeholder="Enter transaction description..."
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              className="form-input"
              rows={3}
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.3 }}
            className="grid grid-cols-2 gap-4"
          >
            <div className="space-y-2">
              <Label htmlFor="merchant" className="form-label">Merchant</Label>
              <Input
                id="merchant"
                placeholder="Merchant name"
                value={formData.merchant}
                onChange={(e) => handleInputChange('merchant', e.target.value)}
                className="form-input"
              />
            </div>

            <div className="space-y-2">
              <Label className="form-label">Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal form-input",
                      !date && "text-slate-500"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? format(date, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={(date) => date && setDate(date)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </motion.div>

          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
              className="professional-button-secondary"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={loading}
              className="bg-professional-blue hover:bg-professional-blue-dark text-white"
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Update Transaction
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
