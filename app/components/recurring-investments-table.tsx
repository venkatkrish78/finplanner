'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { 
  Play, 
  Pause, 
  Trash2, 
  TrendingUp,
  Calendar,
  DollarSign,
  Repeat
} from 'lucide-react'
import { formatCurrency } from '@/lib/currency'
import { toast } from 'sonner'

interface RecurringInvestment {
  id: string
  name: string
  amount: number
  frequency: string
  startDate: string
  nextDate: string
  status: string
  installmentsPaid: number
  investment: {
    id: string
    name: string
    assetClass: string
    quantity: number
    currentValue: number
    totalInvested: number
  }
}

interface RecurringInvestmentsTableProps {
  sips: RecurringInvestment[]
  onRefresh: () => void
}

export default function RecurringInvestmentsTable({ sips, onRefresh }: RecurringInvestmentsTableProps) {
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'PAUSED':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'COMPLETED':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'CANCELLED':
        return 'bg-red-100 text-red-800 border-red-200'
      default:
        return 'bg-slate-100 text-slate-800 border-slate-200'
    }
  }

  const getFrequencyLabel = (frequency: string) => {
    switch (frequency) {
      case 'MONTHLY':
        return 'Monthly'
      case 'QUARTERLY':
        return 'Quarterly'
      case 'YEARLY':
        return 'Yearly'
      case 'WEEKLY':
        return 'Weekly'
      default:
        return frequency
    }
  }

  const handleToggleStatus = async (sipId: string, currentStatus: string) => {
    try {
      setActionLoading(sipId)
      const newStatus = currentStatus === 'ACTIVE' ? 'PAUSED' : 'ACTIVE'
      
      const response = await fetch(`/api/investments/sips/${sipId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      })

      if (response.ok) {
        toast.success(`SIP ${newStatus === 'ACTIVE' ? 'resumed' : 'paused'} successfully`)
        onRefresh()
      } else {
        toast.error('Failed to update SIP status')
      }
    } catch (error) {
      console.error('Error updating SIP:', error)
      toast.error('Failed to update SIP status')
    } finally {
      setActionLoading(null)
    }
  }

  const handleDelete = async (sipId: string, sipName: string) => {
    if (!confirm(`Are you sure you want to delete "${sipName}"? This will not delete the investment itself.`)) {
      return
    }

    try {
      setActionLoading(sipId)
      
      const response = await fetch(`/api/investments/sips/${sipId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        toast.success('SIP deleted successfully')
        onRefresh()
      } else {
        toast.error('Failed to delete SIP')
      }
    } catch (error) {
      console.error('Error deleting SIP:', error)
      toast.error('Failed to delete SIP')
    } finally {
      setActionLoading(null)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    })
  }

  // Calculate summary stats
  const totalSIPs = sips.length
  const activeSIPs = sips.filter(s => s.status === 'ACTIVE').length
  const totalMonthlyInvestment = sips
    .filter(s => s.status === 'ACTIVE' && s.frequency === 'MONTHLY')
    .reduce((sum, sip) => sum + sip.amount, 0)
  const totalValue = sips.reduce((sum, sip) => sum + (sip.investment?.currentValue || 0), 0)

  if (sips.length === 0) {
    return (
      <Card className="professional-card">
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Repeat className="h-12 w-12 text-slate-300 mb-4" />
          <h3 className="text-lg font-semibold text-slate-900 mb-2">No Recurring Investments</h3>
          <p className="text-slate-600 text-center">
            Get started by creating your first SIP or recurring investment
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="professional-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Total SIPs</p>
                <p className="text-2xl font-bold text-slate-900">{totalSIPs}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <Repeat className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="professional-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Active SIPs</p>
                <p className="text-2xl font-bold text-emerald-600">{activeSIPs}</p>
              </div>
              <div className="p-3 bg-emerald-100 rounded-lg">
                <Play className="h-6 w-6 text-emerald-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="professional-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Monthly Investment</p>
                <p className="text-2xl font-bold text-slate-900">{formatCurrency(totalMonthlyInvestment)}</p>
              </div>
              <div className="p-3 bg-purple-100 rounded-lg">
                <DollarSign className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="professional-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Total Value</p>
                <p className="text-2xl font-bold text-slate-900">{formatCurrency(totalValue)}</p>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* SIPs Table */}
      <Card className="professional-card">
        <CardHeader>
          <CardTitle>Recurring Investments</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Instrument Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Frequency</TableHead>
                  <TableHead>Units</TableHead>
                  <TableHead>Current Value</TableHead>
                  <TableHead>Next Due</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sips.map((sip) => (
                  <TableRow key={sip.id}>
                    <TableCell className="font-medium">
                      <div>
                        <p className="font-semibold">{sip.investment?.name || sip.name}</p>
                        <p className="text-xs text-slate-500">{sip.installmentsPaid} installments paid</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="font-normal">
                        {sip.investment?.assetClass || 'N/A'}
                      </Badge>
                    </TableCell>
                    <TableCell>{formatCurrency(sip.amount)}</TableCell>
                    <TableCell>{getFrequencyLabel(sip.frequency)}</TableCell>
                    <TableCell>
                      {sip.investment?.quantity 
                        ? sip.investment.quantity.toFixed(3)
                        : '0.000'}
                    </TableCell>
                    <TableCell className="font-semibold">
                      {formatCurrency(sip.investment?.currentValue || 0)}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-sm">
                        <Calendar className="h-3 w-3 text-slate-500" />
                        {formatDate(sip.nextDate)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(sip.status)}>
                        {sip.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        {(sip.status === 'ACTIVE' || sip.status === 'PAUSED') && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleToggleStatus(sip.id, sip.status)}
                            disabled={actionLoading === sip.id}
                          >
                            {sip.status === 'ACTIVE' ? (
                              <Pause className="h-3 w-3" />
                            ) : (
                              <Play className="h-3 w-3" />
                            )}
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-red-600 hover:bg-red-50"
                          onClick={() => handleDelete(sip.id, sip.investment?.name || sip.name)}
                          disabled={actionLoading === sip.id}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
