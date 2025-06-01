
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
import { AssetClass, InvestmentPlatform, Investment } from '@/lib/types'
import { toast } from 'sonner'

interface EditInvestmentDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  investment: Investment | null
  onInvestmentUpdated: () => void
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

export default function EditInvestmentDialog({ 
  open, 
  onOpenChange, 
  investment,
  onInvestmentUpdated 
}: EditInvestmentDialogProps) {
  const [formData, setFormData] = useState({
    name: '',
    symbol: '',
    assetClass: '' as AssetClass,
    platform: '' as InvestmentPlatform,
    currentPrice: '',
    description: '',
    isActive: true
  })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (open && investment) {
      setFormData({
        name: investment.name || '',
        symbol: investment.symbol || '',
        assetClass: investment.assetClass,
        platform: investment.platform,
        currentPrice: investment.currentPrice?.toString() || '',
        description: investment.description || '',
        isActive: investment.isActive ?? true
      })
    }
  }, [open, investment])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!investment || !formData.name || !formData.assetClass || !formData.platform) {
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
        currentPrice: formData.currentPrice ? parseFloat(formData.currentPrice) : undefined,
        description: formData.description || null,
        isActive: formData.isActive
      }

      const response = await fetch(`/api/investments/${investment.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      })

      if (response.ok) {
        toast.success('Investment updated successfully!')
        onInvestmentUpdated()
        onOpenChange(false)
      } else {
        const error = await response.json()
        toast.error(error.error || 'Failed to update investment')
      }
    } catch (error) {
      console.error('Error updating investment:', error)
      toast.error('Failed to update investment')
    } finally {
      setLoading(false)
    }
  }

  if (!investment) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Investment</DialogTitle>
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

          <div className="space-y-2">
            <Label htmlFor="currentPrice">Current Price</Label>
            <Input
              id="currentPrice"
              type="number"
              step="0.01"
              value={formData.currentPrice}
              onChange={(e) => setFormData({ ...formData, currentPrice: e.target.value })}
              placeholder="0.00"
            />
            <p className="text-xs text-gray-500">
              Update current price to recalculate current value
            </p>
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

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="isActive"
              checked={formData.isActive}
              onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
              className="rounded border-gray-300"
            />
            <Label htmlFor="isActive">Active Investment</Label>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-2">Current Investment Details</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-600">Quantity</p>
                <p className="font-medium">{investment.quantity?.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-gray-600">Purchase Price</p>
                <p className="font-medium">₹{investment.averagePrice?.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-gray-600">Total Invested</p>
                <p className="font-medium">₹{investment.totalInvested?.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-gray-600">Current Value</p>
                <p className="font-medium">₹{investment.currentValue?.toLocaleString()}</p>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="bg-blue-600 hover:bg-blue-700">
              {loading ? 'Updating...' : 'Update Investment'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
