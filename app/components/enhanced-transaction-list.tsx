'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  Search, 
  Filter, 
  ArrowUpDown, 
  Calendar,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Eye,
  Edit,
  Trash2
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
  account?: {
    id: string
    name: string
    type: string
  }
  merchant?: string
  location?: string
  notes?: string
  tags?: string[]
  reference?: string
}

interface EnhancedTransactionListProps {
  transactions: Transaction[]
  onTransactionClick?: (transaction: Transaction) => void
  onTransactionEdit?: (transaction: Transaction) => void
  onTransactionDelete?: (transactionId: string) => void
  showFilters?: boolean
  showSearch?: boolean
  showPagination?: boolean
  itemsPerPage?: number
}

export function EnhancedTransactionList({
  transactions = [],
  onTransactionClick,
  onTransactionEdit,
  onTransactionDelete,
  showFilters = true,
  showSearch = true,
  showPagination = true,
  itemsPerPage = 10
}: EnhancedTransactionListProps) {
  const [mounted, setMounted] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState<'ALL' | 'INCOME' | 'EXPENSE'>('ALL')
  const [filterCategory, setFilterCategory] = useState<string>('ALL')
  const [sortBy, setSortBy] = useState<'date' | 'amount' | 'description'>('date')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [currentPage, setCurrentPage] = useState(1)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Get unique categories for filter
  const categories = Array.from(
    new Set(
      transactions
        .filter(t => t.category)
        .map(t => t.category!.name)
    )
  )

  // Filter and sort transactions
  const filteredTransactions = transactions
    .filter(transaction => {
      const matchesSearch = transaction.description
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
        transaction.merchant?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        transaction.category?.name.toLowerCase().includes(searchTerm.toLowerCase())
      
      const matchesType = filterType === 'ALL' || transaction.type === filterType
      const matchesCategory = filterCategory === 'ALL' || transaction.category?.name === filterCategory
      
      return matchesSearch && matchesType && matchesCategory
    })
    .sort((a, b) => {
      let comparison = 0
      
      switch (sortBy) {
        case 'date':
          comparison = new Date(a.date).getTime() - new Date(b.date).getTime()
          break
        case 'amount':
          comparison = Math.abs(a.amount) - Math.abs(b.amount)
          break
        case 'description':
          comparison = a.description.localeCompare(b.description)
          break
      }
      
      return sortOrder === 'asc' ? comparison : -comparison
    })

  // Pagination
  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedTransactions = showPagination 
    ? filteredTransactions.slice(startIndex, startIndex + itemsPerPage)
    : filteredTransactions

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

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <DollarSign className="h-5 w-5" />
          Transactions ({filteredTransactions.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Search and Filters */}
        {(showSearch || showFilters) && (
          <div className="flex flex-col sm:flex-row gap-4">
            {showSearch && (
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search transactions..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
            )}
            
            {showFilters && (
              <div className="flex gap-2">
                <Select value={filterType} onValueChange={(value: any) => setFilterType(value)}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">All Types</SelectItem>
                    <SelectItem value="INCOME">Income</SelectItem>
                    <SelectItem value="EXPENSE">Expense</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={filterCategory} onValueChange={setFilterCategory}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">All Categories</SelectItem>
                    {categories.map(category => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="date">Date</SelectItem>
                    <SelectItem value="amount">Amount</SelectItem>
                    <SelectItem value="description">Description</SelectItem>
                  </SelectContent>
                </Select>

                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                >
                  <ArrowUpDown className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Transaction List */}
        <div className="space-y-2">
          <AnimatePresence>
            {paginatedTransactions.map((transaction) => (
              <motion.div
                key={transaction.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="p-4 border rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                onClick={() => onTransactionClick?.(transaction)}
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
                          <span>{transaction.merchant}</span>
                        )}
                        {transaction.account && (
                          <span>{transaction.account.name}</span>
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
                    
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          onTransactionClick?.(transaction)
                        }}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      
                      {onTransactionEdit && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation()
                            onTransactionEdit(transaction)
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      )}
                      
                      {onTransactionDelete && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation()
                            onTransactionDelete(transaction.id)
                          }}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Empty State */}
        {filteredTransactions.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <DollarSign className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No transactions found</p>
            {searchTerm && (
              <p className="text-sm">Try adjusting your search or filters</p>
            )}
          </div>
        )}

        {/* Pagination */}
        {showPagination && totalPages > 1 && (
          <div className="flex items-center justify-between pt-4">
            <div className="text-sm text-gray-500">
              Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredTransactions.length)} of {filteredTransactions.length} transactions
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
              >
                Previous
              </Button>
              
              <span className="text-sm">
                Page {currentPage} of {totalPages}
              </span>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
