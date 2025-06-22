'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Calendar,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Trash2,
  Loader2
} from 'lucide-react'

// Client-safe time formatting to prevent hydration errors
function formatTimeClientSafe(date: string | Date): string {
  if (typeof window === 'undefined') {
    return '--:--' // Server-side fallback
  }
  
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleTimeString('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  })
}

interface Transaction {
  id: string
  amount: number
  description: string
  date: string | Date
  type: 'INCOME' | 'EXPENSE'
  category?: {
    id: string
    name: string
    color?: string
  }
  merchant?: string
  status?: string
  source?: string
}

interface EnhancedTransactionListProps {
  year: number
  month?: number
  searchTerm?: string
  selectedCategory?: string
  selectedType?: string
  dateRange?: { from?: Date; to?: Date }
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
  onAddTransaction?: () => void
  onTransactionUpdated?: () => void
  onTransactionDeleted?: () => void
}

export function EnhancedTransactionList({
  year,
  month,
  searchTerm = '',
  selectedCategory = 'all',
  selectedType = 'all',
  dateRange = {},
  sortBy = 'date',
  sortOrder = 'desc',
  onAddTransaction,
  onTransactionUpdated,
  onTransactionDeleted
}: EnhancedTransactionListProps) {
  const [mounted, setMounted] = useState(false)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    fetchTransactions()
  }, [year, month, searchTerm, selectedCategory, selectedType, dateRange, sortBy, sortOrder])

  const fetchTransactions = async () => {
    try {
      setLoading(true)
      setError(null)

      const params = new URLSearchParams()
      if (year) params.append('year', year.toString())
      if (month) params.append('month', month.toString())
      if (searchTerm) params.append('search', searchTerm)
      if (selectedCategory !== 'all') params.append('categoryId', selectedCategory)
      if (selectedType !== 'all') params.append('type', selectedType)
      if (dateRange.from) params.append('startDate', dateRange.from.toISOString())
      if (dateRange.to) params.append('endDate', dateRange.to.toISOString())
      params.append('limit', '100')

      console.log('Fetching transactions with params:', params.toString())

      const response = await fetch(`/api/transactions?${params}`)
      if (!response.ok) {
        throw new Error(`Failed to fetch transactions: ${response.status}`)
      }

      const data = await response.json()
      console.log('Fetched transactions:', data)
      
      setTransactions(data.transactions || [])
    } catch (error) {
      console.error('Error fetching transactions:', error)
      setError(error instanceof Error ? error.message : 'Failed to fetch transactions')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (transactionId: string) => {
    if (!confirm("Are you sure you want to delete this transaction?")) {
      return
    }

    try {
      const response = await fetch(`/api/transactions?id=${transactionId}`, {
        method: "DELETE"
      })

      if (!response.ok) {
        throw new Error("Failed to delete transaction")
      }

      // Refresh the transactions list
      fetchTransactions()
      onTransactionDeleted?.()
    } catch (error) {
      console.error("Error deleting transaction:", error)
      alert("Failed to delete transaction")
    }
  }

  const formatAmount = (amount: number, type: 'INCOME' | 'EXPENSE') => {
    const prefix = type === 'INCOME' ? '+' : '-'
    return `${prefix}₹${Math.abs(amount).toLocaleString()}`
  }

  const formatDate = (date: string | Date) => {
    const d = typeof date === 'string' ? new Date(date) : date
    return d.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    })
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2">Loading transactions...</span>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <p className="text-red-600">Error: {error}</p>
          <Button onClick={fetchTransactions} className="mt-4">
            Retry
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <DollarSign className="h-5 w-5" />
          Transactions ({transactions.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <AnimatePresence>
            {transactions.map((transaction) => (
              <motion.div
                key={transaction.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="p-4 border rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 flex-1">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      transaction.type === 'INCOME' 
                        ? 'bg-green-100 text-green-600' 
                        : 'bg-red-100 text-red-600'
                    }`}>
                      {transaction.type === 'INCOME' ? (
                        <TrendingUp className="h-5 w-5" />
                      ) : (
                        <TrendingDown className="h-5 w-5" />
                      )}
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-medium text-gray-900">
                          {transaction.description}
                        </h3>
                        {transaction.category && (
                          <Badge 
                            variant="outline"
                            style={{ 
                              backgroundColor: transaction.category.color || '#gray',
                              color: 'white',
                              borderColor: transaction.category.color || '#gray'
                            }}
                          >
                            {transaction.category.name}
                          </Badge>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {formatDate(transaction.date)}
                        </span>
                        {mounted && (
                          <span>
                            {formatTimeClientSafe(transaction.date)}
                          </span>
                        )}
                        {transaction.merchant && (
                          <span>Merchant: {transaction.merchant}</span>
                        )}
                        {transaction.source && (
                          <Badge variant="outline" className="text-xs">
                            {transaction.source}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className={`text-lg font-semibold ${
                      transaction.type === 'INCOME' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {formatAmount(transaction.amount, transaction.type)}
                    </div>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(transaction.id)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      title="Delete transaction"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {transactions.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <DollarSign className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No transactions found</p>
            <p className="text-sm">Try adding some transactions or adjusting your filters</p>
            {onAddTransaction && (
              <Button onClick={onAddTransaction} className="mt-4">
                Add Transaction
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
