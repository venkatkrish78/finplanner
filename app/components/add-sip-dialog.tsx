
'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Investment, SIPFrequency } from '@/lib/types'
import { toast } from 'sonner'

interface AddSIPDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSIPAdded: () => void
  investments: Investment[]
}

const frequencyOptions = [
  { value: 'MONTHLY', label: 'Monthly' },
  { value: 'QUARTERLY', label: 'Quarterly' },
  { value: 'WEEKLY', label: 'Weekly' },
  { value: 'YEARLY', label: 'Yearly' }
]

export default function AddSIPDialog({ 
  open, 
  onOpenChange, 
  onSIPAdded,
  investments 
}: AddSIPDialogProps) {
  const [formData, setFormData] = useState({
    investmentId: '',
    name: '',
    amount: '',
    frequency: '' as SIPFrequency,
    startDate: '',
    endDate: '',
    totalInstallments: ''
  })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch('/api/investments/sips', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          investmentId: formData.investmentId,
          name: formData.name,
          amount: parseFloat(formData.amount),
          frequency: formData.frequency,
          startDate: formData.startDate,
          endDate: formData.endDate || null,
          totalInstallments: formData.totalInstallments ? parseInt(formData.totalInstallments) : null
        }),
      })

      if (response.ok) {
        toast.success('SIP created successfully!')
        onSIPAdded()
        setFormData({
          investmentId: '',
          name: '',
          amount: '',
          frequency: '' as SIPFrequency,
          startDate: '',
          endDate: '',
          totalInstallments: ''
        })
      } else {
        toast.error('Failed to create SIP')
      }
    } catch (error) {
      console.error('Error creating SIP:', error)
      toast.error('Failed to create SIP')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Create New SIP</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="investmentId">Investment *</Label>
            <Select
              value={formData.investmentId}
              onValueChange={(value) => setFormData({ ...formData, investmentId: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select investment" />
              </SelectTrigger>
              <SelectContent>
                {investments.map((investment) => (
                  <SelectItem key={investment.id} value={investment.id}>
                    {investment.name} ({investment.assetClass.replace('_', ' ')})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="name">SIP Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g., Monthly SBI Bluechip SIP"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="amount">Amount *</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                placeholder="5000"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="frequency">Frequency *</Label>
              <Select
                value={formData.frequency}
                onValueChange={(value) => setFormData({ ...formData, frequency: value as SIPFrequency })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select frequency" />
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
            <Label htmlFor="startDate">Start Date *</Label>
            <Input
              id="startDate"
              type="date"
              value={formData.startDate}
              onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="endDate">End Date (Optional)</Label>
              <Input
                id="endDate"
                type="date"
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="totalInstallments">Total Installments (Optional)</Label>
              <Input
                id="totalInstallments"
                type="number"
                value={formData.totalInstallments}
                onChange={(e) => setFormData({ ...formData, totalInstallments: e.target.value })}
                placeholder="12"
              />
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
              {loading ? 'Creating...' : 'Create SIP'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
