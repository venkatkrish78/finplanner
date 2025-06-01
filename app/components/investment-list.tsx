
'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  MoreHorizontal, 
  TrendingUp, 
  TrendingDown, 
  Edit, 
  Trash2,
  Plus,
  Target
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Investment, AssetClass, InvestmentPlatform } from '@/lib/types'
import { formatCurrency } from '@/lib/currency'
import { motion } from 'framer-motion'

interface InvestmentListProps {
  investments: Investment[]
  onInvestmentUpdated: () => void
}

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

export default function InvestmentList({ investments, onInvestmentUpdated }: InvestmentListProps) {
  const [selectedInvestment, setSelectedInvestment] = useState<Investment | null>(null)

  const handleDelete = async (investmentId: string) => {
    if (!confirm('Are you sure you want to delete this investment?')) return

    try {
      const response = await fetch(`/api/investments/${investmentId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        onInvestmentUpdated()
      }
    } catch (error) {
      console.error('Error deleting investment:', error)
    }
  }

  const getGainLossColor = (gainLoss: number) => {
    if (gainLoss > 0) return 'text-green-600'
    if (gainLoss < 0) return 'text-red-600'
    return 'text-gray-600'
  }

  const getGainLossIcon = (gainLoss: number) => {
    if (gainLoss > 0) return <TrendingUp className="h-4 w-4" />
    if (gainLoss < 0) return <TrendingDown className="h-4 w-4" />
    return null
  }

  if (investments.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Target className="h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No investments yet</h3>
          <p className="text-gray-600 text-center mb-4">
            Start building your investment portfolio by adding your first investment
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-900">Your Investments</h2>
        <span className="text-sm text-gray-600">{investments.length} investments</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {investments.map((investment, index) => {
          const gainLoss = investment.currentValue - investment.totalInvested
          const gainLossPercentage = investment.totalInvested > 0 
            ? (gainLoss / investment.totalInvested) * 100 
            : 0

          return (
            <motion.div
              key={investment.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <Card className="hover:shadow-lg transition-shadow duration-200">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <CardTitle className="text-lg font-semibold text-gray-900 mb-1">
                        {investment.name}
                      </CardTitle>
                      {investment.symbol && (
                        <p className="text-sm text-gray-600 mb-2">{investment.symbol}</p>
                      )}
                      <div className="flex gap-2 mb-2">
                        <Badge className={assetClassColors[investment.assetClass]}>
                          {investment.assetClass.replace('_', ' ')}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {platformNames[investment.platform]}
                        </Badge>
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Plus className="h-4 w-4 mr-2" />
                          Add Transaction
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          className="text-red-600"
                          onClick={() => handleDelete(investment.id)}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Quantity</span>
                      <span className="font-medium">{investment.quantity.toLocaleString()}</span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Avg. Price</span>
                      <span className="font-medium">{formatCurrency(investment.averagePrice)}</span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Current Price</span>
                      <span className="font-medium">{formatCurrency(investment.currentPrice)}</span>
                    </div>
                    
                    <div className="border-t pt-3">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm text-gray-600">Invested</span>
                        <span className="font-medium">{formatCurrency(investment.totalInvested)}</span>
                      </div>
                      
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm text-gray-600">Current Value</span>
                        <span className="font-semibold">{formatCurrency(investment.currentValue)}</span>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Gain/Loss</span>
                        <div className={`flex items-center gap-1 font-semibold ${getGainLossColor(gainLoss)}`}>
                          {getGainLossIcon(gainLoss)}
                          <span>{formatCurrency(Math.abs(gainLoss))}</span>
                          <span className="text-xs">
                            ({gainLossPercentage > 0 ? '+' : ''}{gainLossPercentage.toFixed(2)}%)
                          </span>
                        </div>
                      </div>
                    </div>

                    {investment.goal && (
                      <div className="bg-blue-50 p-2 rounded-lg">
                        <div className="flex items-center gap-2">
                          <Target className="h-4 w-4 text-blue-600" />
                          <span className="text-sm text-blue-800">
                            Linked to: {investment.goal.name}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
