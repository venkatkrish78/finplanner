'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  ArrowLeft,
  TrendingUp, 
  TrendingDown,
  Edit,
  Trash2,
  Target,
  Calendar,
  DollarSign,
  Percent,
  BarChart3
} from 'lucide-react'
import { formatCurrency } from '@/lib/currency'
import { Investment, AssetClass, InvestmentPlatform, GoalType } from '@/lib/types'
import { EditInvestmentDialog } from '@/components/edit-investment-dialog'
import DeleteInvestmentDialog from '@/components/delete-investment-dialog'
import { toast } from 'sonner'

const assetClassColors: Record<AssetClass, string> = {
  STOCKS: 'bg-blue-100 text-blue-800',
  MUTUAL_FUNDS: 'bg-green-100 text-green-800',
  CRYPTO: 'bg-purple-100 text-purple-800',
  REAL_ESTATE: 'bg-orange-100 text-orange-800',
  GOLD: 'bg-yellow-100 text-yellow-800',
  BONDS: 'bg-indigo-100 text-indigo-800',
  PPF: 'bg-emerald-100 text-emerald-800',
  EPF: 'bg-teal-100 text-teal-800',
  NSC: 'bg-cyan-100 text-cyan-800',
  ELSS: 'bg-lime-100 text-lime-800',
  FD: 'bg-amber-100 text-amber-800',
  RD: 'bg-rose-100 text-rose-800',
  ETF: 'bg-violet-100 text-violet-800',
  OTHER: 'bg-gray-100 text-gray-800'
}

const platformNames: Record<InvestmentPlatform, string> = {
  ZERODHA: 'Zerodha',
  GROWW: 'Groww',
  ANGEL_ONE: 'Angel One',
  UPSTOX: 'Upstox',
  PAYTM_MONEY: 'Paytm Money',
  KUVERA: 'Kuvera',
  COIN_DCBBANK: 'Coin by Zerodha',
  HDFC_SECURITIES: 'HDFC Securities',
  ICICI_DIRECT: 'ICICI Direct',
  KOTAK_SECURITIES: 'Kotak Securities',
  SBI_SECURITIES: 'SBI Securities',
  BANK_BRANCH: 'Bank Branch',
  POST_OFFICE: 'Post Office',
  OTHER: 'Other'
}

export default function InvestmentDetailPage() {
  const params = useParams()
  const router = useRouter()
  const investmentId = params.id as string

  const [investment, setInvestment] = useState<Investment | null>(null)
  const [loading, setLoading] = useState(true)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)

  useEffect(() => {
    if (investmentId) {
      fetchInvestmentDetails()
    }
  }, [investmentId])

  const fetchInvestmentDetails = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/investments/${investmentId}`)
      
      if (response.ok) {
        const data = await response.json()
        setInvestment(data)
      } else if (response.status === 404) {
        toast.error('Investment not found')
        router.push('/investments')
      } else {
        toast.error('Failed to load investment details')
      }
    } catch (error) {
      console.error('Error fetching investment details:', error)
      toast.error('Failed to load investment details')
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = () => {
    setEditDialogOpen(true)
  }

  const handleDelete = () => {
    setDeleteDialogOpen(true)
  }

  const handleInvestmentUpdated = () => {
    fetchInvestmentDetails()
  }

  const handleInvestmentDeleted = () => {
    router.push('/investments')
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-slate-200 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-32 bg-slate-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (!investment) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-slate-900">Investment not found</h1>
          <p className="text-slate-600 mt-2">The investment you're looking for doesn't exist</p>
          <Button onClick={() => router.push('/investments')} className="mt-4">
            Back to Investments
          </Button>
        </div>
      </div>
    )
  }

  const gainLoss = investment.currentValue - investment.totalInvested
  const gainLossPercentage = investment.totalInvested > 0 
    ? (gainLoss / investment.totalInvested) * 100 
    : 0

  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-8"
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push('/investments')}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Investments
            </Button>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleEdit}
              className="flex items-center gap-2"
            >
              <Edit className="h-4 w-4" />
              Edit
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleDelete}
              className="flex items-center gap-2 text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <Trash2 className="h-4 w-4" />
              Delete
            </Button>
          </div>
        </div>

        {/* Investment Header */}
        <div className="bg-white rounded-lg border p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 mb-2">
                {investment.name}
              </h1>
              {investment.symbol && (
                <p className="text-lg text-slate-600 mb-3">{investment.symbol}</p>
              )}
              <div className="flex gap-3">
                <Badge className={assetClassColors[investment.assetClass]}>
                  {investment.assetClass.replace('_', ' ')}
                </Badge>
                <Badge variant="outline">
                  {platformNames[investment.platform]}
                </Badge>
              </div>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-slate-900">
                {formatCurrency(investment.currentValue)}
              </div>
              <div className={`flex items-center gap-1 text-lg font-semibold ${gainLoss >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {gainLoss >= 0 ? <TrendingUp className="h-5 w-5" /> : <TrendingDown className="h-5 w-5" />}
                {formatCurrency(Math.abs(gainLoss))} ({gainLoss >= 0 ? '+' : ''}{gainLossPercentage.toFixed(2)}%)
              </div>
            </div>
          </div>
          
          {investment.description && (
            <p className="text-slate-600">{investment.description}</p>
          )}
        </div>

        {/* Investment Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">
                Quantity
              </CardTitle>
              <BarChart3 className="h-4 w-4 text-slate-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {investment.quantity.toLocaleString()}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">
                Average Price
              </CardTitle>
              <DollarSign className="h-4 w-4 text-slate-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(investment.averagePrice)}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">
                Current Price
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-slate-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(investment.currentPrice)}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">
                Total Invested
              </CardTitle>
              <Percent className="h-4 w-4 text-slate-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(investment.totalInvested)}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Linked Goals */}
        {((investment as any).linkedGoals?.length > 0) && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Linked Goals
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {(investment as any).linkedGoals.map((linkedGoal: any) => (
                  <div key={linkedGoal.id} className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Target className="h-5 w-5 text-blue-600" />
                      <div>
                        <h4 className="font-semibold text-blue-900">{linkedGoal.name}</h4>
                        <p className="text-sm text-blue-700">
                          {linkedGoal.goalType.replace('_', ' ')} • {linkedGoal.allocation}% allocation
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-blue-900">
                        {formatCurrency(investment.currentValue * (linkedGoal.allocation / 100))}
                      </div>
                      <p className="text-sm text-blue-700">Allocated Value</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Purchase Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Investment Details
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold text-slate-900 mb-2">Platform</h4>
                <p className="text-slate-600">{platformNames[investment.platform]}</p>
              </div>
              {investment.purchaseDate && (
                <div>
                  <h4 className="font-semibold text-slate-900 mb-2">Purchase Date</h4>
                  <p className="text-slate-600">
                    {new Date(investment.purchaseDate).toLocaleDateString()}
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Edit Investment Dialog */}
      <EditInvestmentDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        investment={investment}
        onInvestmentUpdated={handleInvestmentUpdated}
      />

      {/* Delete Investment Dialog */}
      <DeleteInvestmentDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        investment={investment}
        onInvestmentDeleted={handleInvestmentDeleted}
      />
    </div>
  )
}
