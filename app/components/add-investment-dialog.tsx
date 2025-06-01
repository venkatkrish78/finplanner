
'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
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

interface AddInvestmentDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onInvestmentAdded: () => void
}

const assetClassOptions = [
  { value: 'STOCKS', label: 'Stocks' },
  { value: 'MUTUAL_FUNDS', label: 'Mutual Funds' },
  { value: 'CRYPTO', label: 'Cryptocurrency' },
  { value: 'REAL_ESTATE', label: 'Real Estate' },
  { value: 'GOLD', label: 'Gold' },
  { value: 'BONDS', label: 'Bonds' },
  { value: 'PPF', label: 'PPF' },
  { value: 'EPF', label: 'EPF' },
  { value: 'NSC', label: 'NSC' },
  { value: 'ELSS', label: 'ELSS' },
  { value: 'FD', label: 'Fixed Deposit' },
  { value: 'RD', label: 'Recurring Deposit' },
  { value: 'ETF', label: 'ETF' },
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

export default function AddInvestmentDialog({ 
  open, 
  onOpenChange, 
  onInvestmentAdded 
}: AddInvestmentDialogProps) {
  const [formData, setFormData] = useState({
    name: '',
    symbol: '',
    assetClass: '' as AssetClass,
    platform: '' as InvestmentPlatform,
    quantity: '',
    purchasePrice: '',
    currentPrice: '',
    purchaseDate: '',
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
    }
  }, [open])

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
    
    if (!formData.name || !formData.assetClass || !formData.platform || !formData.quantity || !formData.purchasePrice || !formData.currentPrice) {
      toast.error('Please fill in all required fields')
      return
    }

    setLoading(true)

    try {
      const requestBody = {
        name: formData.name,
        symbol: formData.symbol || null,
        assetClass: formData.assetClass,
        platform: formData.platform,
        quantity: parseFloat(formData.quantity),
        purchasePrice: parseFloat(formData.purchasePrice),
        currentPrice: parseFloat(formData.currentPrice),
        purchaseDate: formData.purchaseDate || null,
        description: formData.description || null,
        goalId: formData.goalId && formData.goalId !== 'no_goal' ? formData.goalId : null,
        categoryId: formData.categoryId && formData.categoryId !== 'no_category' ? formData.categoryId : null
      }

      const response = await fetch('/api/investments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      })

      if (response.ok) {
        toast.success('Investment added successfully!')
        onInvestmentAdded()
        onOpenChange(false)
        setFormData({
          name: '',
          symbol: '',
          assetClass: '' as AssetClass,
          platform: '' as InvestmentPlatform,
          quantity: '',
          purchasePrice: '',
          currentPrice: '',
          purchaseDate: '',
          description: '',
          goalId: '',
          categoryId: ''
        })
      } else {
        const error = await response.json()
        toast.error(error.error || 'Failed to add investment')
      }
    } catch (error) {
      console.error('Error adding investment:', error)
      toast.error('Failed to add investment')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Investment</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Investment Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Reliance Industries, SBI Bluechip Fund"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="symbol">Symbol/Code</Label>
              <Input
                id="symbol"
                value={formData.symbol}
                onChange={(e) => setFormData({ ...formData, symbol: e.target.value })}
                placeholder="e.g., RELIANCE, 120503"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="assetClass">Asset Class *</Label>
              <Select
                value={formData.assetClass}
                onValueChange={(value) => setFormData({ ...formData, assetClass: value as AssetClass })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select asset class" />
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

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="quantity">Quantity *</Label>
              <Input
                id="quantity"
                type="number"
                step="0.001"
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                placeholder="0"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="purchasePrice">Purchase Price *</Label>
              <Input
                id="purchasePrice"
                type="number"
                step="0.01"
                value={formData.purchasePrice}
                onChange={(e) => setFormData({ ...formData, purchasePrice: e.target.value })}
                placeholder="0.00"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="currentPrice">Current Price *</Label>
              <Input
                id="currentPrice"
                type="number"
                step="0.01"
                value={formData.currentPrice}
                onChange={(e) => setFormData({ ...formData, currentPrice: e.target.value })}
                placeholder="0.00"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="purchaseDate">Purchase Date</Label>
            <Input
              id="purchaseDate"
              type="date"
              value={formData.purchaseDate}
              onChange={(e) => setFormData({ ...formData, purchaseDate: e.target.value })}
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
              placeholder="Additional notes about this investment"
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
            <Button type="submit" disabled={loading} className="bg-green-600 hover:bg-green-700">
              {loading ? 'Adding...' : 'Add Investment'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
