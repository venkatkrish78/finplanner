'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { AssetClass, InvestmentPlatform, FinancialGoal } from '@/lib/types'
import { toast } from 'sonner'

interface AddRecurringInvestmentDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onInvestmentAdded: () => void
}

const assetClassOptions = [
  { value: 'MUTUAL_FUNDS', label: 'Mutual Fund SIP' },
  { value: 'ELSS', label: 'ELSS SIP' },
  { value: 'RD', label: 'Recurring Deposit' },
  { value: 'PPF', label: 'PPF' },
  { value: 'EPF', label: 'EPF' },
  { value: 'ETF', label: 'ETF SIP' },
  { value: 'STOCKS', label: 'Stock SIP' },
  { value: 'OTHER', label: 'Other' }
]

const platformOptions = [
  { value: 'ZERODHA', label: 'Zerodha' },
  { value: 'GROWW', label: 'Groww' },
  { value: 'ANGEL_ONE', label: 'Angel One' },
  { value: 'UPSTOX', label: 'Upstox' },
  { value: 'PAYTM_MONEY', label: 'Paytm Money' },
  { value: 'KUVERA', label: 'Kuvera' },
  { value: 'COIN_DCBBANK', label: 'Coin by Zerodha' },
  { value: 'HDFC_SECURITIES', label: 'HDFC Securities' },
  { value: 'ICICI_DIRECT', label: 'ICICI Direct' },
  { value: 'KOTAK_SECURITIES', label: 'Kotak Securities' },
  { value: 'SBI_SECURITIES', label: 'SBI Securities' },
  { value: 'BANK_BRANCH', label: 'Bank Branch' },
  { value: 'POST_OFFICE', label: 'Post Office' },
  { value: 'OTHER', label: 'Other' }
]

const frequencyOptions = [
  { value: 'MONTHLY', label: 'Monthly' },
  { value: 'QUARTERLY', label: 'Quarterly' },
  { value: 'YEARLY', label: 'Yearly' }
]

export default function AddRecurringInvestmentDialog({ 
  open, 
  onOpenChange, 
  onInvestmentAdded 
}: AddRecurringInvestmentDialogProps) {
  const [formData, setFormData] = useState({
    name: '',
    symbol: '',
    assetClass: '' as AssetClass,
    platform: '' as InvestmentPlatform,
    amount: '',
    frequency: 'MONTHLY',
    unitPrice: '',
    units: '',
    currentValue: '',
    startDate: '',
    description: '',
    goalId: '',
    categoryId: ''
  })
  const [goals, setGoals] = useState<FinancialGoal[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (open) {
      fetchGoals()
      fetchCategories()
      // Set default start date to today
      const today = new Date().toISOString().split('T')[0]
      setFormData(prev => ({ ...prev, startDate: today }))
    }
  }, [open])

  // Auto-calculate units when amount and unit price change
  useEffect(() => {
    if (formData.amount && formData.unitPrice) {
      const calculatedUnits = parseFloat(formData.amount) / parseFloat(formData.unitPrice)
      setFormData(prev => ({ 
        ...prev, 
        units: calculatedUnits.toFixed(3),
        currentValue: formData.amount // Initially, current value = invested amount
      }))
    }
  }, [formData.amount, formData.unitPrice])

  const fetchGoals = async () => {
    try {
      const response = await fetch('/api/goals')
      if (response.ok) {
        const data = await response.json()
        setGoals(data.filter((goal: FinancialGoal) => goal.status === 'ACTIVE'))
      }
    } catch (error) {
      console.error('Error fetching goals:', error)
    }
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
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name || !formData.assetClass || !formData.platform || !formData.amount || !formData.frequency || !formData.startDate) {
      toast.error('Please fill in all required fields')
      return
    }

    setLoading(true)

    try {
      // Step 1: Create the Investment
      const investmentBody = {
        name: formData.name,
        symbol: formData.symbol || null,
        assetClass: formData.assetClass,
        platform: formData.platform,
        quantity: formData.units ? parseFloat(formData.units) : 0,
        purchasePrice: formData.unitPrice ? parseFloat(formData.unitPrice) : 0,
        currentPrice: formData.unitPrice ? parseFloat(formData.unitPrice) : 0,
        purchaseDate: formData.startDate,
        description: formData.description || null,
        goalId: formData.goalId && formData.goalId !== 'no_goal' ? formData.goalId : null,
        categoryId: formData.categoryId && formData.categoryId !== 'no_category' ? formData.categoryId : null
      }

      const investmentResponse = await fetch('/api/investments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(investmentBody),
      })

      if (!investmentResponse.ok) {
        const error = await investmentResponse.json()
        toast.error(error.error || 'Failed to create investment')
        setLoading(false)
        return
      }

      const investment = await investmentResponse.json()

      // Step 2: Create the SIP
      const sipBody = {
        investmentId: investment.id,
        name: `${formData.name} - SIP`,
        amount: parseFloat(formData.amount),
        frequency: formData.frequency,
        startDate: formData.startDate,
        endDate: null, // Optional: can add end date field
        totalInstallments: null // Optional: can add field for total installments
      }

      const sipResponse = await fetch('/api/investments/sips', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sipBody),
      })

      if (!sipResponse.ok) {
        const error = await sipResponse.json()
        toast.error(error.error || 'Failed to create SIP')
        // Note: Investment was created but SIP failed
        toast.info('Investment created but SIP setup failed. Please set up SIP manually.')
        onInvestmentAdded()
        onOpenChange(false)
        setLoading(false)
        return
      }

      toast.success('Recurring investment created successfully!')
      toast.info('A bill has been auto-generated for this SIP')
      onInvestmentAdded()
      onOpenChange(false)
      
      // Reset form
      setFormData({
        name: '',
        symbol: '',
        assetClass: '' as AssetClass,
        platform: '' as InvestmentPlatform,
        amount: '',
        frequency: 'MONTHLY',
        unitPrice: '',
        units: '',
        currentValue: '',
        startDate: '',
        description: '',
        goalId: '',
        categoryId: ''
      })
    } catch (error) {
      console.error('Error creating recurring investment:', error)
      toast.error('Failed to create recurring investment')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Recurring Investment (SIP)</DialogTitle>
          <DialogDescription>
            Set up a systematic investment plan. A bill will be auto-generated to track your recurring payments.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Instrument Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., SBI Bluechip Fund, HDFC Equity Fund"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="symbol">Symbol/Code</Label>
              <Input
                id="symbol"
                value={formData.symbol}
                onChange={(e) => setFormData({ ...formData, symbol: e.target.value })}
                placeholder="e.g., 120503"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="assetClass">Investment Type *</Label>
              <Select
                value={formData.assetClass}
                onValueChange={(value) => setFormData({ ...formData, assetClass: value as AssetClass })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  {assetClassOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="platform">Platform *</Label>
              <Select
                value={formData.platform}
                onValueChange={(value) => setFormData({ ...formData, platform: value as InvestmentPlatform })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select platform" />
                </SelectTrigger>
                <SelectContent>
                  {platformOptions.map((option) => (
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
              <Label htmlFor="amount">Amount per Installment (₹) *</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                min="0"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                placeholder="e.g., 5000"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="frequency">Frequency *</Label>
              <Select
                value={formData.frequency}
                onValueChange={(value) => setFormData({ ...formData, frequency: value })}
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

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="unitPrice">Unit Price/NAV (₹)</Label>
              <Input
                id="unitPrice"
                type="number"
                step="0.01"
                min="0"
                value={formData.unitPrice}
                onChange={(e) => setFormData({ ...formData, unitPrice: e.target.value })}
                placeholder="e.g., 150.50"
              />
              <p className="text-xs text-slate-500">Current NAV per unit</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="units">Units</Label>
              <Input
                id="units"
                type="number"
                step="0.001"
                value={formData.units}
                onChange={(e) => setFormData({ ...formData, units: e.target.value })}
                placeholder="Auto-calculated"
              />
              <p className="text-xs text-slate-500">Auto-calculated from amount</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="currentValue">Current Value (₹)</Label>
              <Input
                id="currentValue"
                type="number"
                step="0.01"
                value={formData.currentValue}
                readOnly
                placeholder="Auto-calculated"
                className="bg-slate-50"
              />
              <p className="text-xs text-slate-500">Initially equals amount</p>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="startDate">Start Date *</Label>
            <Input
              id="startDate"
              type="date"
              value={formData.startDate}
              onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="goalId">Link to Goal (Optional)</Label>
              <Select
                value={formData.goalId}
                onValueChange={(value) => setFormData({ ...formData, goalId: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a goal" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="no_goal">No goal</SelectItem>
                  {goals.map((goal) => (
                    <SelectItem key={goal.id} value={goal.id}>
                      {goal.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="categoryId">Category (Optional)</Label>
              <Select
                value={formData.categoryId}
                onValueChange={(value) => setFormData({ ...formData, categoryId: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="no_category">No category</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Additional notes about this recurring investment"
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="bg-emerald-600 hover:bg-emerald-700">
              {loading ? 'Creating...' : 'Create Recurring Investment'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
